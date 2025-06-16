<script lang="ts" setup>
import { ref } from "vue";
import type { ConnectionOptions } from "../utils/shapeConnector";
import type { BlockConfig } from "./Block.vue";
import Graphic from "./Graphic.vue";
import SimpleAnimator from "./SimpleAnimator.vue";

// Define reactive blocks
const blocks = ref<BlockConfig[]>([
    {
        height: 100,
        width: 150,
        x: 100,
        y: 100,
        text: "Test Block",
    },
]);

const connections = ref<ConnectionOptions[]>([]);

// Define simple animation steps
const animationSteps = [
    // Step 1: Move right
    {
        targets: [
            {
                index: 0, // blocks[0]
                properties: { x: 300 },
                duration: 1000,
            },
        ],
    },
    // Step 2: Move down and scale
    {
        targets: [
            {
                index: 0,
                properties: { y: 200, width: 200 },
                duration: 800,
            },
        ],
    },
];

// Initial states for each target
const initialStates = [{ x: 100, y: 100, width: 150, height: 100 }];
</script>

<template>
    <div class="absolute top-4 left-4 bg-green-100 p-3 rounded-lg text-sm">
        <div class="font-semibold">Simple Test</div>
        <div>Click to see animation</div>
    </div>

    <!-- Use SimpleAnimator for easy animation setup -->
    <SimpleAnimator 
        :steps="animationSteps"
        :targets="[blocks[0]]"
        :initial-states="initialStates"
        :skip-threshold="400"
        :default-duration="1000"
    >
        <!-- Use the slot to show animation info -->
        <template #default="{ currentStep, totalSteps, isAnimating }">
            <div class="absolute top-4 right-4 bg-blue-100 p-3 rounded-lg shadow text-sm">
                <div class="font-semibold">Animation Status</div>
                <div>Step {{ currentStep }} of {{ totalSteps }}</div>
                <div v-if="isAnimating" class="text-blue-600">🎬 Animating...</div>
                <div v-else class="text-green-600">✓ Ready</div>
            </div>
        </template>
    </SimpleAnimator>

    <!-- Render the graphic -->
    <Graphic :blocks="blocks" :connections="connections" />
</template>

<style scoped>
.absolute {
    position: absolute;
    z-index: 10;
}
</style>
