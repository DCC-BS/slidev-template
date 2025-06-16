import { useSlideContext } from "@slidev/client";
import Konva from "konva";
import { computed, markRaw, onUnmounted, ref, watch } from "vue";

// Global animation manager for better performance
class GlobalAnimationManager {
    private static instance: GlobalAnimationManager | null = null;
    private activeAnimations = new Map<string, any>();
    private frameId: number | null = null;
    private lastUpdateTime = 0;
    private readonly updateThreshold = 32; // ~30fps for smooth but efficient animation

    static getInstance(): GlobalAnimationManager {
        if (!GlobalAnimationManager.instance) {
            GlobalAnimationManager.instance = new GlobalAnimationManager();
        }
        return GlobalAnimationManager.instance;
    }

    addAnimation(id: string, animation: any) {
        this.activeAnimations.set(id, animation);
        this.startLoop();
    }

    removeAnimation(id: string) {
        this.activeAnimations.delete(id);
        if (this.activeAnimations.size === 0) {
            this.stopLoop();
        }
    }

    private startLoop() {
        if (this.frameId) return; // Already running

        const animate = (currentTime: number) => {
            // Throttle updates for better performance
            if (currentTime - this.lastUpdateTime < this.updateThreshold) {
                this.frameId = requestAnimationFrame(animate);
                return;
            }
            this.lastUpdateTime = currentTime;

            // Batch all updates from all animations
            const allUpdates: Array<{
                target: any;
                updates: Record<string, number>;
            }> = [];

            for (const [id, animation] of this.activeAnimations) {
                const updates = animation.update(currentTime);
                if (updates) {
                    allUpdates.push(...updates);
                }

                if (animation.isComplete()) {
                    this.activeAnimations.delete(id);
                }
            }

            // Apply all updates in a single microtask for maximum efficiency
            if (allUpdates.length > 0) {
                Promise.resolve().then(() => {
                    allUpdates.forEach(({ target, updates }) => {
                        Object.assign(target, updates);
                    });
                });
            }

            if (this.activeAnimations.size > 0) {
                this.frameId = requestAnimationFrame(animate);
            } else {
                this.frameId = null;
            }
        };

        this.frameId = requestAnimationFrame(animate);
    }

    private stopLoop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    stopAll() {
        this.activeAnimations.clear();
        this.stopLoop();
    }
}

// Optimized animation class
class OptimizedAnimation {
    private startTime: number | null = null;
    private animations: Array<{
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

    constructor(
        targets: Array<{
            target: any;
            properties: Record<string, any>;
            duration: number;
            delay: number;
            easing: any;
        }>,
    ) {
        targets.forEach(({ target, properties, duration, delay, easing }) => {
            const keys = Object.keys(properties);
            const startVals = keys.map((key) => target[key]);
            const endVals = keys.map((key) => properties[key]);
            const diffs = keys.map((_, i) => endVals[i] - startVals[i]);

            this.animations.push({
                target,
                keys,
                startVals,
                endVals,
                diffs,
                duration,
                delay,
                easing,
                completed: false,
            });
        });
    }

    update(
        currentTime: number,
    ): Array<{ target: any; updates: Record<string, number> }> | null {
        if (!this.startTime) {
            this.startTime = currentTime;
        }

        const updates: Array<{ target: any; updates: Record<string, number> }> =
            [];

        for (const anim of this.animations) {
            if (anim.completed) continue;

            const elapsed = currentTime - this.startTime - anim.delay;

            if (elapsed < 0) continue;

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

            // Prepare updates
            const targetUpdates: Record<string, number> = {};
            for (let i = 0; i < anim.keys.length; i++) {
                targetUpdates[anim.keys[i]] =
                    anim.startVals[i] + anim.diffs[i] * easedProgress;
            }

            updates.push({ target: anim.target, updates: targetUpdates });

            if (progress >= 1) {
                anim.completed = true;
                // Ensure final values are exact
                for (let i = 0; i < anim.keys.length; i++) {
                    targetUpdates[anim.keys[i]] = anim.endVals[i];
                }
            }
        }

        return updates.length > 0 ? updates : null;
    }

    isComplete(): boolean {
        return this.animations.every((anim) => anim.completed);
    }

    cancel() {
        this.animations.forEach((anim) => (anim.completed = true));
    }
}

// High-performance animation composable
export function useOptimizedKonvaAnimation(
    targets: any[],
    steps: Array<Record<string, any>>,
    options: {
        skipThreshold?: number;
        defaultDuration?: number;
        defaultEasing?: any;
    } = {},
) {
    const { $slidev } = useSlideContext();
    const manager = GlobalAnimationManager.getInstance();

    const {
        skipThreshold = 300,
        defaultDuration = 1000,
        defaultEasing = Konva.Easings.EaseInOut,
    } = options;

    const isAnimating = ref(false);
    const currentStep = ref(-1);
    const stepStartTime = ref(0);
    const animationId = ref<string | null>(null);

    const totalSteps = computed(() => steps.length);

    // Initialize all targets to their initial states
    const initialStates = targets.map((target) => ({ ...target }));

    const initializeTargets = () => {
        targets.forEach((target, index) => {
            Object.assign(target, initialStates[index]);
        });
        currentStep.value = -1;
    };

    // Apply the end state of a specific step
    const applyStepEndState = (stepIndex: number) => {
        if (stepIndex < 0 || stepIndex >= steps.length) return;

        const step = steps[stepIndex];
        targets.forEach((target) => {
            if (step[target]) {
                Object.assign(target, step[target]);
            }
        });
    };

    // Stop current animation
    const stopAnimation = () => {
        if (animationId.value) {
            manager.removeAnimation(animationId.value);
            animationId.value = null;
        }
        isAnimating.value = false;
    };

    // Animate to a specific step
    const animateToStep = (stepIndex: number, forceSkip = false) => {
        if (stepIndex < 0 || stepIndex >= totalSteps.value) return;

        const now = Date.now();
        const timeSinceLastStep = now - stepStartTime.value;

        stopAnimation();

        // Handle quick navigation or force skip
        if (
            forceSkip ||
            (timeSinceLastStep < skipThreshold && stepIndex > currentStep.value)
        ) {
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

        // Handle backwards navigation
        if (stepIndex < currentStep.value) {
            initializeTargets();
            for (let i = 0; i <= stepIndex; i++) {
                applyStepEndState(i);
            }
            currentStep.value = stepIndex;
            stepStartTime.value = now;
            return;
        }

        if (stepIndex <= currentStep.value) {
            currentStep.value = stepIndex;
            stepStartTime.value = now;
            return;
        }

        const step = steps[stepIndex];
        const animationTargets: Array<{
            target: any;
            properties: Record<string, any>;
            duration: number;
            delay: number;
            easing: any;
        }> = [];

        targets.forEach((target) => {
            if (step[target]) {
                animationTargets.push({
                    target,
                    properties: step[target],
                    duration: defaultDuration,
                    delay: 0,
                    easing: defaultEasing,
                });
            }
        });

        if (animationTargets.length === 0) {
            currentStep.value = stepIndex;
            stepStartTime.value = now;
            return;
        }

        isAnimating.value = true;
        stepStartTime.value = now;
        currentStep.value = stepIndex;

        // Create optimized animation and add to global manager
        const animation = new OptimizedAnimation(animationTargets);
        animationId.value = `anim-${Date.now()}-${Math.random()}`;

        // Wrap animation to handle completion
        const wrappedAnimation = {
            update: (currentTime: number) => animation.update(currentTime),
            isComplete: () => {
                if (animation.isComplete()) {
                    isAnimating.value = false;
                    return true;
                }
                return false;
            },
        };

        manager.addAnimation(animationId.value, wrappedAnimation);
    };

    // Watch for Slidev navigation
    const unwatchClicks = $slidev
        ? watch(
              () => $slidev.nav.clicks,
              (clicks) => {
                  if (clicks === 0) {
                      initializeTargets();
                  } else {
                      const targetStep = Math.min(
                          clicks - 1,
                          totalSteps.value - 1,
                      );
                      animateToStep(targetStep);
                  }
              },
              { immediate: true },
          )
        : null;

    const unwatchPage = $slidev
        ? watch(
              () => $slidev.nav.currentPage,
              () => {
                  stopAnimation();
                  initializeTargets();
              },
          )
        : null;

    // Cleanup
    onUnmounted(() => {
        stopAnimation();
        if (unwatchClicks) unwatchClicks();
        if (unwatchPage) unwatchPage();
    });

    return {
        currentStep: computed(() => currentStep.value),
        totalSteps,
        isAnimating: computed(() => isAnimating.value),
        animateToStep,
        initializeTargets,
        stopAnimation,
    };
}
