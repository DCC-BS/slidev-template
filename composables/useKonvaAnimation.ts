import { useSlideContext } from "@slidev/client";
import Konva from "konva";
import { Ref, computed, nextTick, ref, watch } from "vue";

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
    options: AnimationOptions = {},
) {
    const { $slidev } = useSlideContext();

    const {
        skipThreshold = 300,
        defaultDuration = 1000,
        defaultEasing = Konva.Easings.EaseInOut,
    } = options;

    const isAnimating = ref(false);
    const currentStep = ref(-1); // Start at -1 to indicate initial state
    const stepStartTime = ref(0);
    const activeTweens = ref<Array<{ id: number | null; cancel: () => void }>>(
        [],
    );

    // Total number of animation steps across all targets
    const totalSteps = computed(() => {
        return Math.max(...targets.map((target) => target.steps.length), 0);
    });

    // Initialize all targets to their initial states
    const initializeTargets = () => {
        targets.forEach((target) => {
            Object.assign(target.target, target.initialState);
        });
        currentStep.value = -1; // Reset to initial state
    };

    // Apply the end state of a specific step to all targets
    const applyStepEndState = (stepIndex: number) => {
        targets.forEach((target) => {
            if (stepIndex < target.steps.length) {
                const step = target.steps[stepIndex];
                Object.assign(target.target, step.properties);
            }
        });
    };

    // Stop all active tweens
    const stopAllTweens = () => {
        activeTweens.value.forEach((animation) => {
            if (animation && animation.cancel) {
                animation.cancel();
            }
        });
        activeTweens.value = [];
        isAnimating.value = false;
    };

    // Optimized animation system with batched updates and reduced reactive overhead
    const animateToStep = (stepIndex: number, forceSkip = false) => {
        if (stepIndex < 0 || stepIndex >= totalSteps.value) return;

        const now = Date.now();
        const timeSinceLastStep = now - stepStartTime.value;

        // Stop any currently running animations
        stopAllTweens();

        // If we're advancing quickly or forcing skip, just apply end states
        if (
            forceSkip ||
            (timeSinceLastStep < skipThreshold && stepIndex > currentStep.value)
        ) {
            // Apply all intermediate steps instantly
            for (
                let i = Math.max(0, currentStep.value + 1);
                i <= stepIndex;
                i++
            ) {
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

        // Collect all animations for this step
        const animations: Array<{
            target: any;
            keys: string[];
            startVals: number[];
            endVals: number[];
            diffs: number[];
            duration: number;
            delay: number;
            easing: any;
            completed: boolean;
        }> = [];

        targets.forEach((target) => {
            if (stepIndex < target.steps.length) {
                const step = target.steps[stepIndex];

                // Pre-calculate all values
                const keys = Object.keys(step.properties);
                const startVals = keys.map((key) => target.target[key]);
                const endVals = keys.map((key) => step.properties[key]);
                const diffs = keys.map((_, i) => endVals[i] - startVals[i]);

                animations.push({
                    target: target.target,
                    keys,
                    startVals,
                    endVals,
                    diffs,
                    duration: step.duration ?? defaultDuration,
                    delay: step.delay ?? 0,
                    easing: step.easing ?? defaultEasing,
                    completed: false,
                });
            }
        });

        if (animations.length === 0) {
            isAnimating.value = false;
            currentStep.value = stepIndex;
            return;
        }

        // Single RAF loop for all animations - much more efficient!
        let masterStartTime: number | null = null;
        let frameId: number | null = null;
        let lastUpdateTime = 0;
        const updateThreshold = 32; // ~30fps instead of 60fps for better performance

        const masterAnimate = (currentTime: number) => {
            if (!masterStartTime) {
                masterStartTime = currentTime;
            }

            // Throttle updates to reduce reactive overhead - 30fps is smooth enough
            if (currentTime - lastUpdateTime < updateThreshold) {
                frameId = requestAnimationFrame(masterAnimate);
                return;
            }
            lastUpdateTime = currentTime;

            let allCompleted = true;
            const batchUpdates: Array<{
                target: any;
                updates: Record<string, number>;
            }> = [];

            // Process all animations in a single loop
            for (const anim of animations) {
                if (anim.completed) continue;

                const elapsed = currentTime - masterStartTime - anim.delay;

                if (elapsed < 0) {
                    allCompleted = false;
                    continue;
                }

                const progress = Math.min(elapsed / anim.duration, 1);

                // Apply easing
                let easedProgress = progress;
                if (anim.easing && typeof anim.easing === "function") {
                    try {
                        easedProgress = anim.easing(progress, 0, 1, 1);
                    } catch (e) {
                        easedProgress = progress;
                    }
                }

                // Prepare batch update for this target
                const updates: Record<string, number> = {};
                for (let i = 0; i < anim.keys.length; i++) {
                    updates[anim.keys[i]] =
                        anim.startVals[i] + anim.diffs[i] * easedProgress;
                }

                // Add to batch
                batchUpdates.push({ target: anim.target, updates });

                if (progress >= 1) {
                    anim.completed = true;
                    // Ensure final values are exact
                    for (let i = 0; i < anim.keys.length; i++) {
                        updates[anim.keys[i]] = anim.endVals[i];
                    }
                } else {
                    allCompleted = false;
                }
            }

            // Apply all updates in a batch to minimize reactive triggers
            // Use a microtask to further batch the updates
            if (batchUpdates.length > 0) {
                Promise.resolve().then(() => {
                    batchUpdates.forEach(({ target, updates }) => {
                        Object.assign(target, updates);
                    });
                });
            }

            if (allCompleted) {
                isAnimating.value = false;
                if (frameId) {
                    cancelAnimationFrame(frameId);
                    frameId = null;
                }
            } else {
                frameId = requestAnimationFrame(masterAnimate);
            }
        };

        // Start the master animation loop
        frameId = requestAnimationFrame(masterAnimate);

        // Store cancellation function
        activeTweens.value = [
            {
                id: frameId,
                cancel: () => {
                    if (frameId) {
                        cancelAnimationFrame(frameId);
                        frameId = null;
                    }
                },
            },
        ];

        currentStep.value = stepIndex;
    };

    // Watch for click changes from Slidev
    watch(
        () => $slidev.nav.clicks,
        (newClicks, oldClicks) => {
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
                const targetStep = Math.min(
                    newClicks - 1,
                    totalSteps.value - 1,
                );
                animateToStep(targetStep);
            }
        },
        { immediate: true },
    );

    // Reset when slide changes
    watch(
        () => $slidev.nav.currentPage,
        () => {
            stopAllTweens();
            initializeTargets();
        },
    );

    return {
        currentStep: computed(() => currentStep.value),
        totalSteps,
        isAnimating: computed(() => isAnimating.value),
        animateToStep,
        initializeTargets,
        stopAllTweens,
    };
}

// Helper function to create animation steps easily
export function createAnimationStep(
    properties: Record<string, any>,
    options: Partial<AnimationStep> = {},
): AnimationStep {
    return {
        properties,
        duration: options.duration,
        easing: options.easing,
        delay: options.delay,
    };
}

// Helper to create a target with initial state and steps
export function createAnimationTarget(
    target: any,
    initialState: Record<string, any>,
    steps: AnimationStep[],
): AnimationTarget {
    return {
        target,
        initialState,
        steps,
    };
}
