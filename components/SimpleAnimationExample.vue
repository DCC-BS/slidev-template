<script lang="ts" setup>
import { ref } from 'vue';
import { BlockConfig } from './Block.vue';
import Graphic from './Graphic.vue';
import { ConnectionOptions } from '../utils/shapeConnector';
import SimpleAnimator from './SimpleAnimator.vue';
import Konva from 'konva';

// Define reactive blocks
const blocks = ref<BlockConfig[]>([
    {
        height: 100,
        width: 150,
        x: 100,
        y: 100,
        text: 'Start',
    },
    {
        height: 100,
        width: 150,
        x: 400,
        y: 100,
        text: 'End',
    }
]);

const connections = ref<ConnectionOptions[]>([
    {
        fromShape: blocks.value[0],
        toShape: blocks.value[1],
        fromAnchor: 'right',
        toAnchor: 'left',
        connectionType: 'straight',
        lineType: 'arrow',
        config: {
            stroke: '#3b82f6',
            strokeWidth: 3,
            pointerLength: 15,
            pointerWidth: 12
        }
    }
]);

// Define animation steps using the simple format
const animationSteps = [
    // Step 1: Move first block right
    {
        targets: [
            {
                index: 0, // blocks[0]
                properties: { x: 200, y: 150 },
                duration: 1000,
                easing: Konva.Easings.EaseOut
            }
        ]
    },
    // Step 2: Scale both blocks
    {
        targets: [
            {
                index: 0,
                properties: { width: 200, height: 130 },
                duration: 800,
                easing: Konva.Easings.BackEaseOut
            },
            {
                index: 1,
                properties: { width: 200, height: 130, y: 150 },
                duration: 800,
                easing: Konva.Easings.BackEaseOut,
                delay: 200
            }
        ]
    },
    // Step 3: Final positions
    {
        targets: [
            {
                index: 0,
                properties: { x: 150, y: 200 },
                duration: 1200,
                easing: Konva.Easings.ElasticEaseOut
            },
            {
                index: 1,
                properties: { x: 450, y: 200 },
                duration: 1200,
                easing: Konva.Easings.ElasticEaseOut,
                delay: 100
            }
        ]
    }
];

// Initial states are now automatically captured from targets!
// No need to manually specify them anymore
</script>

<template>
    <!-- Use SimpleAnimator with automatic initial state capture -->
    <SimpleAnimator 
        :steps="animationSteps" 
        :targets="[blocks[0], blocks[1]]"
        :skip-threshold="400" 
        :default-duration="1000"
    >
        <!-- Use the slot to show animation info -->
        <template #default="{ currentStep, totalSteps, isAnimating }">
            <div class="absolute top-4 right-4 bg-blue-100 p-3 rounded-lg shadow text-sm">
                <div class="font-semibold">Simple Animation</div>
                <div>Step {{ Math.max(0, currentStep + 1) }} of {{ totalSteps }}</div>
                <div v-if="isAnimating" class="text-blue-600">Animating...</div>
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
