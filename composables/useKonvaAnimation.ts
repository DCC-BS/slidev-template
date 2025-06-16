import { ref, computed, watch, nextTick, Ref } from 'vue';
import { useSlideContext } from '@slidev/client';
import Konva from 'konva';

export interface AnimationStep {
  duration?: number;
  easing?: any; // Konva easing function (they have different signatures)
  delay?: number;
  properties: Record<string, any>;
}

export interface AnimationTarget {
  target: any; // The reactive object to animate
  steps: AnimationStep[];
  initialState: Record<string, any>;
}

export interface AnimationOptions {
  skipThreshold?: number; // Time in ms - if step is advanced before this, skip animation
  defaultDuration?: number;
  defaultEasing?: any; // Konva easing function
}

export function useKonvaAnimation(
  targets: AnimationTarget[],
  options: AnimationOptions = {}
) {
  const { $slidev } = useSlideContext();
  
  const {
    skipThreshold = 300,
    defaultDuration = 1000,
    defaultEasing = Konva.Easings.EaseInOut
  } = options;

  const isAnimating = ref(false);
  const currentStep = ref(-1); // Start at -1 to indicate initial state
  const stepStartTime = ref(0);
  const activeTweens = ref<Array<{ id: number | null; cancel: () => void }>>([]);
  
  // Total number of animation steps across all targets
  const totalSteps = computed(() => {
    return Math.max(...targets.map(target => target.steps.length), 0);
  });

  // Initialize all targets to their initial states
  const initializeTargets = () => {
    targets.forEach(target => {
      Object.assign(target.target, target.initialState);
    });
    currentStep.value = -1; // Reset to initial state
  };

  // Apply the end state of a specific step to all targets
  const applyStepEndState = (stepIndex: number) => {
    targets.forEach(target => {
      if (stepIndex < target.steps.length) {
        const step = target.steps[stepIndex];
        Object.assign(target.target, step.properties);
      }
    });
  };

  // Stop all active tweens
  const stopAllTweens = () => {
    activeTweens.value.forEach(animation => {
      if (animation && animation.cancel) {
        animation.cancel();
      }
    });
    activeTweens.value = [];
    isAnimating.value = false;
  };

  // Animate to a specific step
  const animateToStep = (stepIndex: number, forceSkip = false) => {
    if (stepIndex < 0 || stepIndex >= totalSteps.value) return;
    
    const now = Date.now();
    const timeSinceLastStep = now - stepStartTime.value;
    
    // Stop any currently running animations
    stopAllTweens();
    
    // If we're advancing quickly or forcing skip, just apply end states
    if (forceSkip || (timeSinceLastStep < skipThreshold && stepIndex > currentStep.value)) {
      // Apply all intermediate steps instantly
      for (let i = Math.max(0, currentStep.value + 1); i <= stepIndex; i++) {
        applyStepEndState(i);
      }
      currentStep.value = stepIndex;
      stepStartTime.value = now;
      return;
    }

    // If going backwards, apply the target step state immediately
    if (stepIndex < currentStep.value) {
      // Reset to initial state
      initializeTargets();
      // Apply all steps up to the target step instantly
      for (let i = 0; i <= stepIndex; i++) {
        applyStepEndState(i);
      }
      currentStep.value = stepIndex;
      stepStartTime.value = now;
      return;
    }

    // If we're already at this step, don't animate
    if (stepIndex <= currentStep.value) {
      currentStep.value = stepIndex;
      stepStartTime.value = now;
      return;
    }

    isAnimating.value = true;
    stepStartTime.value = now;
    
    // Create custom animations for each target that has this step
    const newAnimations: any[] = [];
    
    targets.forEach(target => {
      if (stepIndex < target.steps.length) {
        const step = target.steps[stepIndex];
        
        // Store starting values
        const startValues: Record<string, any> = {};
        const endValues: Record<string, any> = {};
        
        Object.keys(step.properties).forEach(key => {
          startValues[key] = target.target[key];
          endValues[key] = step.properties[key];
        });

        // Create custom animation using requestAnimationFrame
        let startTime: number | null = null;
        const duration = step.duration ?? defaultDuration;
        const delay = step.delay ?? 0;
        const easing = step.easing ?? defaultEasing;
        let animationId: number | null = null;
        
        const animate = (currentTime: number) => {
          if (!startTime) {
            startTime = currentTime + delay;
          }
          
          if (currentTime < startTime) {
            animationId = requestAnimationFrame(animate);
            return;
          }
          
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Apply easing function
          let easedProgress = progress;
          if (easing && typeof easing === 'function') {
            // Handle different Konva easing function signatures
            try {
              easedProgress = easing(progress, 0, 1, 1);
            } catch (e) {
              // Fallback to simple progress if easing fails
              easedProgress = progress;
            }
          }
          
          // Interpolate values
          Object.keys(step.properties).forEach(key => {
            const startVal = startValues[key];
            const endVal = endValues[key];
            target.target[key] = startVal + (endVal - startVal) * easedProgress;
          });
          
          if (progress < 1) {
            animationId = requestAnimationFrame(animate);
          } else {
            // Ensure final values are set exactly
            Object.assign(target.target, step.properties);
            
            // Remove this animation from active list
            const index = newAnimations.indexOf(animation);
            if (index > -1) {
              newAnimations.splice(index, 1);
            }
            
            // If this was the last animation, animation is complete
            if (newAnimations.length === 0) {
              isAnimating.value = false;
            }
          }
        };
        
        const animation = {
          id: null as number | null,
          cancel: () => {
            if (animationId) {
              cancelAnimationFrame(animationId);
            }
          }
        };
        
        newAnimations.push(animation);
        
        // Start the animation
        animationId = requestAnimationFrame(animate);
        animation.id = animationId;
      }
    });

    // Store active animations
    activeTweens.value = newAnimations;
    currentStep.value = stepIndex;
  };

  // Watch for click changes from Slidev
  watch(() => $slidev.nav.clicks, (newClicks, oldClicks) => {
    // Handle step indexing correctly:
    // clicks = 0 -> initial state (step -1, no animation)
    // clicks = 1 -> step 0 (first animation)
    // clicks = 2 -> step 1 (second animation)
    // clicks = 3 -> step 2 (third animation)
    
    if (newClicks === 0) {
      // Reset to initial state
      initializeTargets();
      currentStep.value = -1;
    } else {
      const targetStep = Math.min(newClicks - 1, totalSteps.value - 1);
      animateToStep(targetStep);
    }
  }, { immediate: true });

  // Reset when slide changes
  watch(() => $slidev.nav.currentPage, () => {
    stopAllTweens();
    initializeTargets();
  });

  return {
    currentStep: computed(() => currentStep.value),
    totalSteps,
    isAnimating: computed(() => isAnimating.value),
    animateToStep,
    initializeTargets,
    stopAllTweens
  };
}

// Helper function to create animation steps easily
export function createAnimationStep(
  properties: Record<string, any>,
  options: Partial<AnimationStep> = {}
): AnimationStep {
  return {
    properties,
    duration: options.duration,
    easing: options.easing,
    delay: options.delay
  };
}

// Helper to create a target with initial state and steps
export function createAnimationTarget(
  target: any,
  initialState: Record<string, any>,
  steps: AnimationStep[]
): AnimationTarget {
  return {
    target,
    initialState,
    steps
  };
}
