<script lang="ts" setup>
import { computed, onMounted, ref, shallowRef } from "vue";
import {
    type AnimationSequenceBuilder,
    useEasyAnimation,
} from "../composables/useEasyAnimation";

// Props interface - much simpler now!
interface Props {
    sequence?: (builder: AnimationSequenceBuilder) => void;
    skipThreshold?: number;
    defaultDuration?: number;
    defaultEasing?: string;
}

const props = withDefaults(defineProps<Props>(), {
    skipThreshold: 300,
    defaultDuration: 1000,
    defaultEasing: "easeInOut",
});

// Create the easy animation system once
const { createSequence, createAnimationFromSequence } = useEasyAnimation({
    skipThreshold: props.skipThreshold,
    defaultDuration: props.defaultDuration,
    defaultEasing: props.defaultEasing,
});

// Use shallowRef for better performance since we don't need deep reactivity
const animationSystem = shallowRef<any>(null);
const currentStep = ref(-1);
const totalSteps = ref(0);
const isAnimating = ref(false);

// Throttle the reactive updates to reduce overhead
let updateScheduled = false;
const scheduleUpdate = () => {
    if (updateScheduled) return;
    updateScheduled = true;

    // Use a microtask to batch updates
    Promise.resolve().then(() => {
        if (animationSystem.value) {
            currentStep.value = animationSystem.value.currentStep.value;
            totalSteps.value = animationSystem.value.totalSteps.value;
            isAnimating.value = animationSystem.value.isAnimating.value;
        }
        updateScheduled = false;
    });
};

// Initialize animation system once on mount
onMounted(() => {
    if (props.sequence) {
        const builder = createSequence();
        props.sequence(builder);
        const sequence = builder.build();

        // Create animation system once and cache it
        animationSystem.value = createAnimationFromSequence(sequence);

        // Set up throttled reactive updates
        const system = animationSystem.value;

        // Watch for changes but throttle the updates
        const originalCurrentStep = system.currentStep.value;
        const originalTotalSteps = system.totalSteps.value;
        const originalIsAnimating = system.isAnimating.value;

        // Set initial values
        currentStep.value = originalCurrentStep;
        totalSteps.value = originalTotalSteps;
        isAnimating.value = originalIsAnimating;

        // Set up a periodic check instead of reactive watching to reduce overhead
        const updateInterval = setInterval(() => {
            const newCurrentStep = system.currentStep.value;
            const newTotalSteps = system.totalSteps.value;
            const newIsAnimating = system.isAnimating.value;

            if (
                newCurrentStep !== currentStep.value ||
                newTotalSteps !== totalSteps.value ||
                newIsAnimating !== isAnimating.value
            ) {
                scheduleUpdate();
            }
        }, 50); // Check every 50ms instead of every frame

        // Cleanup on unmount
        onMounted(() => {
            return () => clearInterval(updateInterval);
        });
    }
});

// Expose values to parent component
defineExpose({
    currentStep: computed(() => currentStep.value),
    totalSteps: computed(() => totalSteps.value),
    isAnimating: computed(() => isAnimating.value),
});
</script>

<template>
    <!-- v-click components for each animation step -->
    <v-click v-for="step in totalSteps" :key="`step-${step}`">
        <div></div>
    </v-click>

    <!-- Optional slot for additional content -->
    <slot :current-step="Math.max(0, currentStep + 1)" :total-steps="totalSteps" :is-animating="isAnimating" />
</template>
