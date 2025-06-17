import Konva from "konva";
import {
    createAnimationStep,
    createAnimationTarget,
    useKonvaAnimation,
} from "./useKonvaAnimation";

// Animation properties with better defaults
export interface AnimationProps {
    duration?: number;
    delay?: number;
    easing?: unknown;
}

// Step animation definition
export interface StepAnimation {
    target: unknown;
    properties: Record<string, unknown>;
    options?: AnimationProps;
}

// Single animation instruction that can be yielded directly
export interface AnimationInstruction {
    target: unknown;
    properties: Record<string, unknown>;
    options?: AnimationProps;
    type: 'animate';
}

// Step animation that can contain multiple target animations
export interface AnimationStep {
    animations: StepAnimation[];
    label?: string; // Optional label for debugging
}

// Type for things that can be yielded from generator
export type YieldableAnimation = AnimationContext | AnimationInstruction | AnimationInstruction[];

// Generator animation context with helper methods
export class AnimationContext {
    private _step: AnimationStep = { animations: [] };

    // Add an animation for a target in the current step
    animate(
        target: unknown,
        properties: Record<string, unknown>,
        options?: AnimationProps,
    ): this {
        this._step.animations.push({
            target,
            properties,
            options: options || {},
        });
        return this;
    }

    // Convenience methods for common animations
    moveTo(target: unknown, x: number, y: number, options?: AnimationProps): this {
        return this.animate(target, { x, y }, options);
    }

    scaleTo(
        target: unknown,
        scale: number | { x: number; y: number },
        options?: AnimationProps,
    ): this {
        if (typeof scale === "number") {
            return this.animate(
                target,
                { scaleX: scale, scaleY: scale },
                options,
            );
        }
        return this.animate(
            target,
            { scaleX: scale.x, scaleY: scale.y },
            options,
        );
    }

    resizeTo(
        target: unknown,
        width: number,
        height: number,
        options?: AnimationProps,
    ): this {
        return this.animate(target, { width, height }, options);
    }

    rotateTo(target: unknown, rotation: number, options?: AnimationProps): this {
        return this.animate(target, { rotation }, options);
    }

    fadeTo(target: unknown, opacity: number, options?: AnimationProps): this {
        return this.animate(target, { opacity }, options);
    }

    // Hide/show convenience methods
    hide(target: unknown, options?: AnimationProps): this {
        return this.fadeTo(target, 0, options);
    }

    show(target: unknown, options?: AnimationProps): this {
        return this.fadeTo(target, 1, options);
    }

    // Set a label for this step (for debugging)
    label(text: string): this {
        this._step.label = text;
        return this;
    }

    // Get the current step data
    getStep(): AnimationStep {
        return { ...this._step };
    }

    // Reset for next step
    reset(): void {
        this._step = { animations: [] };
    }
}

// Type for generator animation function
export type AnimationGeneratorFunction = Generator<YieldableAnimation, void, unknown>;

// Helper functions for creating animation instructions
export function animate(
    target: unknown,
    properties: Record<string, unknown>,
    options?: AnimationProps,
): AnimationInstruction {
    return {
        type: 'animate',
        target,
        properties,
        options: options || {},
    };
}

export function moveTo(target: unknown, x: number, y: number, options?: AnimationProps): AnimationInstruction {
    return animate(target, { x, y }, options);
}

export function scaleTo(
    target: unknown,
    scale: number | { x: number; y: number },
    options?: AnimationProps,
): AnimationInstruction {
    if (typeof scale === "number") {
        return animate(target, { scaleX: scale, scaleY: scale }, options);
    }
    return animate(target, { scaleX: scale.x, scaleY: scale.y }, options);
}

export function resizeTo(
    target: unknown,
    width: number,
    height: number,
    options?: AnimationProps,
): AnimationInstruction {
    return animate(target, { width, height }, options);
}

export function rotateTo(target: unknown, rotation: number, options?: AnimationProps): AnimationInstruction {
    return animate(target, { rotation }, options);
}

export function fadeTo(target: unknown, opacity: number, options?: AnimationProps): AnimationInstruction {
    return animate(target, { opacity }, options);
}

export function hide(target: unknown, options?: AnimationProps): AnimationInstruction {
    return fadeTo(target, 0, options);
}

export function show(target: unknown, options?: AnimationProps): AnimationInstruction {
    return fadeTo(target, 1, options);
}

// Helper to create multiple animations in one step
export function step(...animations: AnimationInstruction[]): AnimationInstruction[] {
    return animations;
}

// Predefined easing presets for easier use
export const EasingPresets = {
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
} as const;

export type EasingPreset = keyof typeof EasingPresets;

// Main composable for generator-based animations
export function useGeneratorAnimation(
    options: {
        skipThreshold?: number;
        defaultDuration?: number;
        defaultEasing?: EasingPreset | unknown;
    } = {},
) {
    const {
        skipThreshold = 300,
        defaultDuration = 1000,
        defaultEasing = "easeInOut",
    } = options;

    // Execute a generator function to collect all animation steps
    const executeGeneratorFunction = (
        generatorFn: () => AnimationGeneratorFunction,
    ): AnimationStep[] => {
        const steps: AnimationStep[] = [];
        const generator = generatorFn();

        try {
            let result = generator.next();
            while (!result.done) {
                const yielded = result.value;

                // Convert yielded value to AnimationStep
                let animationStep: AnimationStep;

                if (yielded instanceof AnimationContext) {
                    // Old style: yielding AnimationContext
                    animationStep = yielded.getStep();
                } else if (Array.isArray(yielded)) {
                    // Yielding array of AnimationInstructions
                    animationStep = {
                        animations: yielded.map(instruction => ({
                            target: instruction.target,
                            properties: instruction.properties,
                            options: instruction.options || {},
                        })),
                    };
                } else if (yielded && typeof yielded === 'object' && 'type' in yielded) {
                    // Yielding single AnimationInstruction
                    const instruction = yielded as AnimationInstruction;
                    animationStep = {
                        animations: [{
                            target: instruction.target,
                            properties: instruction.properties,
                            options: instruction.options || {},
                        }],
                    };
                } else {
                    console.warn("Unknown yielded value:", yielded);
                    animationStep = { animations: [] };
                }

                if (animationStep.animations.length > 0) {
                    steps.push(animationStep);
                }

                // Continue with the generator
                result = generator.next();
            }
        } catch (error) {
            console.error("Error executing animation generator:", error);
        }

        return steps;
    };

    // Convert generator steps to animation system format
    const createAnimationFromGenerator = (
        generatorFn: () => AnimationGeneratorFunction,
    ) => {
        const steps = executeGeneratorFunction(generatorFn);

        // Collect all unique targets
        const allTargets = new Set<unknown>();
        for (const step of steps) {
            for (const anim of step.animations) {
                allTargets.add(anim.target);
            }
        }

        // Auto-capture initial states
        const captureInitialState = (target: unknown): Record<string, unknown> => {
            const state: Record<string, unknown> = {};
            const commonProps = [
                "x",
                "y",
                "width",
                "height",
                "scaleX",
                "scaleY",
                "rotation",
                "opacity",
            ];

            for (const prop of commonProps) {
                if ((target as Record<string, unknown>)[prop] !== undefined) {
                    state[prop] = (target as Record<string, unknown>)[prop];
                }
            }

            // Also capture properties from animation steps
            for (const step of steps) {
                for (const anim of step.animations) {
                    if (anim.target === target) {
                        for (const prop of Object.keys(anim.properties)) {
                            const targetObj = target as Record<string, unknown>;
                            if (
                                targetObj[prop] !== undefined &&
                                state[prop] === undefined
                            ) {
                                state[prop] = targetObj[prop];
                            }
                        }
                    }
                }
            }

            return state;
        };

        // Convert to animation targets
        const animationTargets = Array.from(allTargets).map((target) => {
            const animationSteps = steps.map((step) => {
                // Find animation for this target in this step
                const targetAnimation = step.animations.find(
                    (anim) => anim.target === target,
                );

                if (targetAnimation) {
                    const resolvedEasing =
                        typeof targetAnimation.options?.easing === "string"
                            ? EasingPresets[
                            targetAnimation.options.easing as EasingPreset
                            ]
                            : targetAnimation.options?.easing ||
                            (typeof defaultEasing === "string"
                                ? EasingPresets[defaultEasing as EasingPreset]
                                : defaultEasing);

                    return createAnimationStep(targetAnimation.properties, {
                        duration:
                            targetAnimation.options?.duration ||
                            defaultDuration,
                        delay: targetAnimation.options?.delay || 0,
                        easing: resolvedEasing,
                    });
                }
                // No animation for this target in this step
                return createAnimationStep({}, { duration: 100 });
            });

            return createAnimationTarget(
                target,
                captureInitialState(target),
                animationSteps,
            );
        });

        return useKonvaAnimation(animationTargets, {
            skipThreshold,
            defaultDuration,
            defaultEasing:
                typeof defaultEasing === "string"
                    ? EasingPresets[defaultEasing as EasingPreset]
                    : defaultEasing,
        });
    };

    return {
        createAnimationFromGenerator,
        EasingPresets,
        AnimationContext,
        // Export helper functions
        animate,
        moveTo,
        scaleTo,
        resizeTo,
        rotateTo,
        fadeTo,
        hide,
        show,
        step,
    };
}

// Helper function to create an animation generator
export function* createAnimationGenerator(): AnimationGeneratorFunction {
    // This is a base generator that can be extended
    yield new AnimationContext();
}

// Simplified preset animation patterns using helper functions
export const SimpleAnimationPresets = {
    // Slide in from directions
    slideInFromLeft: (target: unknown, finalX: number, options?: AnimationProps) =>
        animate(target, { x: finalX }, { ...options, easing: options?.easing || EasingPresets.easeOut }),

    slideInFromRight: (target: unknown, finalX: number, options?: AnimationProps) =>
        animate(target, { x: finalX }, { ...options, easing: options?.easing || EasingPresets.easeOut }),

    // Scale animations
    scaleIn: (target: unknown, options?: AnimationProps) =>
        scaleTo(target, 1, { ...options, easing: options?.easing || EasingPresets.backOut }),

    scaleOut: (target: unknown, options?: AnimationProps) =>
        scaleTo(target, 0, { ...options, easing: options?.easing || EasingPresets.easeIn }),

    // Effect animations
    bounce: (target: unknown, options?: AnimationProps) =>
        scaleTo(target, 1.1, { duration: 300, easing: EasingPresets.bounceOut, ...options }),

    pulse: (target: unknown, options?: AnimationProps) =>
        scaleTo(target, 1.05, { duration: 500, easing: EasingPresets.easeInOut, ...options }),
};

// Preset animation patterns for generator use
export const GeneratorAnimationPresets = {
    // Slide in from directions
    slideInFromLeft: (
        context: AnimationContext,
        target: unknown,
        finalX: number,
        options?: AnimationProps,
    ) => {
        context.animate(target, { x: finalX }, {
            ...options,
            easing: options?.easing || EasingPresets.easeOut
        });
    },

    slideInFromRight: (
        context: AnimationContext,
        target: unknown,
        finalX: number,
        options?: AnimationProps,
    ) => {
        context.animate(target, { x: finalX }, {
            ...options,
            easing: options?.easing || EasingPresets.easeOut
        });
    },

    // Scale animations
    scaleIn: (context: AnimationContext, target: unknown, options?: AnimationProps) => {
        context.animate(target, { scaleX: 1, scaleY: 1 }, {
            ...options,
            easing: options?.easing || EasingPresets.backOut
        });
    },

    scaleOut: (context: AnimationContext, target: unknown, options?: AnimationProps) => {
        context.animate(target, { scaleX: 0, scaleY: 0 }, {
            ...options,
            easing: options?.easing || EasingPresets.easeIn
        });
    },

    // Bounce effect
    bounce: (context: AnimationContext, target: unknown, options?: AnimationProps) => {
        context.animate(target, { scaleX: 1.1, scaleY: 1.1 }, {
            duration: 300,
            easing: EasingPresets.bounceOut,
            ...options,
        });
    },

    // Pulse effect
    pulse: (context: AnimationContext, target: unknown, options?: AnimationProps) => {
        context.animate(target, { scaleX: 1.05, scaleY: 1.05 }, {
            duration: 500,
            easing: EasingPresets.easeInOut,
            ...options,
        });
    },
};
