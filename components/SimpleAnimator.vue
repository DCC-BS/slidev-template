<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useKonvaAnimation, createAnimationTarget, createAnimationStep } from '../composables/useKonvaAnimation';
import Konva from 'konva';

export interface AnimationStep {
    targets: Array<{
        index: number; // Index of the target object in the targets array
        properties: Record<string, any>;
        duration?: number;
        easing?: any;
        delay?: number;
    }>;
}

// Props interface
interface Props {
    steps: AnimationStep[]; // Array of animation steps
    targets: any[]; // Array of reactive objects to animate
    initialStates?: Record<string, any>[]; // Optional initial states for each target (auto-captured if not provided)
    skipThreshold?: number;
    defaultDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
    skipThreshold: 300,
    defaultDuration: 1000
});

// Automatically capture initial states from targets at mount
const capturedInitialStates = ref<Record<string, any>[]>([]);

// Function to capture all animatable properties from a target
const captureInitialState = (target: any): Record<string, any> => {
    const state: Record<string, any> = {};
    
    // Common properties that are typically animated
    const commonProps = ['x', 'y', 'width', 'height', 'scaleX', 'scaleY', 'rotation', 'opacity'];
    
    // Capture common properties if they exist
    commonProps.forEach(prop => {
        if (target[prop] !== undefined) {
            state[prop] = target[prop];
        }
    });
    
    // Also capture any properties that appear in animation steps for this target
    const targetIndex = props.targets.indexOf(target);
    props.steps.forEach(step => {
        const targetConfig = step.targets.find(t => t.index === targetIndex);
        if (targetConfig) {
            Object.keys(targetConfig.properties).forEach(prop => {
                if (target[prop] !== undefined && state[prop] === undefined) {
                    state[prop] = target[prop];
                }
            });
        }
    });
    
    return state;
};

// Capture initial states immediately if not provided
if (!props.initialStates) {
    capturedInitialStates.value = props.targets.map(captureInitialState);
}

// Use provided initial states or captured ones
const effectiveInitialStates = props.initialStates || capturedInitialStates.value;

// Convert the simplified format to our animation system format
const animationTargets = props.targets.map((target, index) => {
    const steps = props.steps.map(step => {
        // Find the configuration for this target in this step
        const targetConfig = step.targets.find(t => t.index === index);

        if (targetConfig) {
            return createAnimationStep(
                targetConfig.properties,
                {
                    duration: targetConfig.duration,
                    easing: targetConfig.easing,
                    delay: targetConfig.delay
                }
            );
        } else {
            // If no configuration for this step, keep current state
            return createAnimationStep({}, { duration: 100 });
        }
    });

    return createAnimationTarget(
        target,
        effectiveInitialStates[index] || {},
        steps
    );
});

// Set up the animation system
const { currentStep, totalSteps, isAnimating } = useKonvaAnimation(
    animationTargets,
    {
        skipThreshold: props.skipThreshold,
        defaultDuration: props.defaultDuration,
        defaultEasing: Konva.Easings.EaseInOut
    }
);

// Expose values to parent component
defineExpose({
    currentStep,
    totalSteps,
    isAnimating
});
</script>

<template>
    <!-- v-click components for each animation step -->
    <v-click v-for="step in totalSteps" :key="`step-${step}`">
        <div></div>
        <!-- Empty v-click for Slidev integration -->
    </v-click>

    <!-- Optional slot for additional content -->
    <slot :current-step="currentStep" :total-steps="totalSteps" :is-animating="isAnimating" />
</template>
