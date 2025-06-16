import { ref, computed, markRaw } from 'vue';
import { useKonvaAnimation, createAnimationTarget, createAnimationStep } from './useKonvaAnimation';
import Konva from 'konva';

// Predefined easing presets for easier use - mark as raw for performance
export const EasingPresets = markRaw({
  // Basic
  linear: Konva.Easings.Linear,
  easeIn: Konva.Easings.EaseIn,
  easeOut: Konva.Easings.EaseOut,
  easeInOut: Konva.Easings.EaseInOut,
  
  // Bouncy
  bounceIn: Konva.Easings.BounceEaseIn,
  bounceOut: Konva.Easings.BounceEaseOut,
  bounceInOut: Konva.Easings.BounceEaseInOut,
  
  // Elastic
  elasticIn: Konva.Easings.ElasticEaseIn,
  elasticOut: Konva.Easings.ElasticEaseOut,
  elasticInOut: Konva.Easings.ElasticEaseInOut,
  
  // Back
  backIn: Konva.Easings.BackEaseIn,
  backOut: Konva.Easings.BackEaseOut,
  backInOut: Konva.Easings.BackEaseInOut,
  
  // Strong
  strongIn: Konva.Easings.StrongEaseIn,
  strongOut: Konva.Easings.StrongEaseOut,
  strongInOut: Konva.Easings.StrongEaseInOut,
} as const);

export type EasingPreset = keyof typeof EasingPresets;

// Animation properties with better defaults
export interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: EasingPreset | any;
}

// Target animation definition
export interface TargetAnimation {
  target: any;
  properties: Record<string, any>;
  options?: AnimationProps;
}

// Step builder class for fluent API
export class AnimationStepBuilder {
  private animations: TargetAnimation[] = [];
  
  // Add an animation for a target
  animate(target: any, properties: Record<string, any>, options?: AnimationProps): this {
    this.animations.push({
      target,
      properties,
      options: options || {}
    });
    return this;
  }
  
  // Convenience methods for common animations
  moveTo(target: any, x: number, y: number, options?: AnimationProps): this {
    return this.animate(target, { x, y }, options);
  }
  
  scaleTo(target: any, scale: number | { x: number; y: number }, options?: AnimationProps): this {
    if (typeof scale === 'number') {
      return this.animate(target, { scaleX: scale, scaleY: scale }, options);
    }
    return this.animate(target, { scaleX: scale.x, scaleY: scale.y }, options);
  }
  
  resizeTo(target: any, width: number, height: number, options?: AnimationProps): this {
    return this.animate(target, { width, height }, options);
  }
  
  rotateTo(target: any, rotation: number, options?: AnimationProps): this {
    return this.animate(target, { rotation }, options);
  }
  
  fadeTo(target: any, opacity: number, options?: AnimationProps): this {
    return this.animate(target, { opacity }, options);
  }
  
  // Hide/show convenience methods
  hide(target: any, options?: AnimationProps): this {
    return this.fadeTo(target, 0, options);
  }
  
  show(target: any, options?: AnimationProps): this {
    return this.fadeTo(target, 1, options);
  }
  
  // Build the step
  build(): TargetAnimation[] {
    return [...this.animations];
  }
}

// Main animation sequence builder
export class AnimationSequenceBuilder {
  private steps: TargetAnimation[][] = [];
  private allTargets = new Set<any>();
  
  // Add a step with a builder function
  step(builderFn: (builder: AnimationStepBuilder) => void): this {
    const builder = new AnimationStepBuilder();
    builderFn(builder);
    const animations = builder.build();
    
    // Track all targets
    animations.forEach(anim => this.allTargets.add(anim.target));
    
    this.steps.push(animations);
    return this;
  }
  
  // Quick step method for simple animations
  quickStep(animations: Record<any, Record<string, any>>, options?: AnimationProps): this {
    return this.step(builder => {
      Object.entries(animations).forEach(([target, properties]) => {
        builder.animate(target, properties, options);
      });
    });
  }
  
  // Convenience method for moving multiple targets
  moveStep(moves: Record<any, { x?: number; y?: number }>, options?: AnimationProps): this {
    return this.step(builder => {
      Object.entries(moves).forEach(([target, position]) => {
        if (position.x !== undefined && position.y !== undefined) {
          builder.moveTo(target, position.x, position.y, options);
        } else if (position.x !== undefined) {
          builder.animate(target, { x: position.x }, options);
        } else if (position.y !== undefined) {
          builder.animate(target, { y: position.y }, options);
        }
      });
    });
  }
  
  // Build the animation sequence
  build(): {
    targets: any[];
    steps: TargetAnimation[][];
  } {
    return {
      targets: Array.from(this.allTargets),
      steps: this.steps
    };
  }
}

// Main composable for easy animations
export function useEasyAnimation(options: {
  skipThreshold?: number;
  defaultDuration?: number;
  defaultEasing?: EasingPreset | any;
} = {}) {
  const {
    skipThreshold = 300,
    defaultDuration = 1000,
    defaultEasing = 'easeInOut'
  } = options;
  
  // Convert built sequence to animation system format
  const createAnimationFromSequence = (sequence: { targets: any[]; steps: TargetAnimation[][] }) => {
    // Auto-capture initial states
    const captureInitialState = (target: any): Record<string, any> => {
      const state: Record<string, any> = {};
      const commonProps = ['x', 'y', 'width', 'height', 'scaleX', 'scaleY', 'rotation', 'opacity'];
      
      commonProps.forEach(prop => {
        if (target[prop] !== undefined) {
          state[prop] = target[prop];
        }
      });
      
      // Also capture properties from animation steps
      sequence.steps.forEach(stepAnimations => {
        stepAnimations.forEach(anim => {
          if (anim.target === target) {
            Object.keys(anim.properties).forEach(prop => {
              if (target[prop] !== undefined && state[prop] === undefined) {
                state[prop] = target[prop];
              }
            });
          }
        });
      });
      
      return state;
    };
    
    // Convert to animation targets
    const animationTargets = sequence.targets.map(target => {
      const steps = sequence.steps.map(stepAnimations => {
        // Find animation for this target in this step
        const targetAnimation = stepAnimations.find(anim => anim.target === target);
        
        if (targetAnimation) {
          const resolvedEasing = typeof targetAnimation.options?.easing === 'string' 
            ? EasingPresets[targetAnimation.options.easing as EasingPreset]
            : targetAnimation.options?.easing || 
              (typeof defaultEasing === 'string' ? EasingPresets[defaultEasing as EasingPreset] : defaultEasing);
          
          return createAnimationStep(
            targetAnimation.properties,
            {
              duration: targetAnimation.options?.duration || defaultDuration,
              delay: targetAnimation.options?.delay || 0,
              easing: resolvedEasing
            }
          );
        } else {
          // No animation for this target in this step
          return createAnimationStep({}, { duration: 100 });
        }
      });
      
      return createAnimationTarget(
        target,
        captureInitialState(target),
        steps
      );
    });
    
    return useKonvaAnimation(animationTargets, {
      skipThreshold,
      defaultDuration,
      defaultEasing: typeof defaultEasing === 'string' ? EasingPresets[defaultEasing as EasingPreset] : defaultEasing
    });
  };
  
  return {
    createSequence: () => new AnimationSequenceBuilder(),
    createStep: () => new AnimationStepBuilder(),
    createAnimationFromSequence,
    EasingPresets
  };
}

// Preset animation patterns
export const AnimationPresets = {
  // Slide in from directions
  slideInFromLeft: (target: any, finalX: number, options?: AnimationProps) => ({
    target,
    properties: { x: finalX },
    options: { ...options, easing: 'easeOut' as EasingPreset }
  }),
  
  slideInFromRight: (target: any, finalX: number, options?: AnimationProps) => ({
    target,
    properties: { x: finalX },
    options: { ...options, easing: 'easeOut' as EasingPreset }
  }),
  
  // Scale animations
  scaleIn: (target: any, options?: AnimationProps) => ({
    target,
    properties: { scaleX: 1, scaleY: 1 },
    options: { ...options, easing: 'backOut' as EasingPreset }
  }),
  
  scaleOut: (target: any, options?: AnimationProps) => ({
    target,
    properties: { scaleX: 0, scaleY: 0 },
    options: { ...options, easing: 'easeIn' as EasingPreset }
  }),
  
  // Bounce effect
  bounce: (target: any, options?: AnimationProps) => ({
    target,
    properties: { scaleX: 1.1, scaleY: 1.1 },
    options: { ...options, easing: 'bounceOut' as EasingPreset, duration: 300 }
  }),
  
  // Pulse effect
  pulse: (target: any, options?: AnimationProps) => ({
    target,
    properties: { scaleX: 1.05, scaleY: 1.05 },
    options: { ...options, easing: 'easeInOut' as EasingPreset, duration: 500 }
  })
};
