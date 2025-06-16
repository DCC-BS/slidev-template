<script lang="ts" setup>
import { ref } from 'vue';
import { BlockConfig } from './Block.vue';
import Graphic from './Graphic.vue';
import { ConnectionOptions } from '../utils/shapeConnector';
import SimpleAnimator from './SimpleAnimator.vue';
import Konva from 'konva';

// Define reactive blocks with various initial values
const blocks = ref<BlockConfig[]>([
    {
        height: 80,
        width: 120,
        x: 50,
        y: 150,
        text: 'Auto 1',
    },
    {
        height: 100,
        width: 140,
        x: 300,
        y: 80,
        text: 'Auto 2',
    }
]);

const connections = ref<ConnectionOptions[]>([]);

// Define animation steps - initial states will be auto-captured!
const animationSteps = [
    // Step 1: Move both blocks
    {
        targets: [
            {
                index: 0,
                properties: { x: 200, y: 200 },
                duration: 800,
                easing: Konva.Easings.EaseOut
            },
            {
                index: 1,
                properties: { x: 400, y: 250 },
                duration: 1000,
                easing: Konva.Easings.EaseInOut,
                delay: 100
            }
        ]
    },
    // Step 2: Scale them
    {
        targets: [
            {
                index: 0,
                properties: { width: 180, height: 120 },
                duration: 600,
                easing: Konva.Easings.BackEaseOut
            },
            {
                index: 1,
                properties: { width: 200, height: 150 },
                duration: 700,
                easing: Konva.Easings.BounceEaseOut
            }
        ]
    }
];
</script>

<template>
    <div class="absolute top-4 left-4 bg-green-100 p-3 rounded-lg text-sm">
        <div class="font-semibold">🚀 Auto Initial States</div>
        <div>No manual initial state definition needed!</div>
    </div>

    <!-- SimpleAnimator automatically captures initial states from blocks -->
    <SimpleAnimator :steps="animationSteps" :targets="[blocks[0], blocks[1]]" :skip-threshold="300"
        :default-duration="800">
        <template #default="{ currentStep, totalSteps, isAnimating }">
            <div class="absolute top-4 right-4 bg-purple-100 p-3 rounded-lg shadow text-sm">
                <div class="font-semibold">Auto Animation</div>
                <div>Step {{ Math.max(0, currentStep + 1) }} of {{ totalSteps }}</div>
                <div v-if="isAnimating" class="text-purple-600">🎬 Animating...</div>
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
