<script lang="ts" setup>
import Konva from "konva";
import { ref } from "vue";
import {
    createAnimationStep,
    createAnimationTarget,
    useKonvaAnimation,
} from "../composables/useKonvaAnimation";
import type { ConnectionOptions } from "../utils/shapeConnector";
import type { BlockConfig } from "./Block.vue";
import Graphic from "./Graphic.vue";

// Define our reactive data for a more complex diagram
const blocks = ref<BlockConfig[]>([
    {
        height: 100,
        width: 120,
        x: 50,
        y: 150,
        text: "Input",
    },
    {
        height: 80,
        width: 100,
        x: 250,
        y: 100,
        text: "Process A",
    },
    {
        height: 80,
        width: 100,
        x: 250,
        y: 200,
        text: "Process B",
    },
    {
        height: 100,
        width: 120,
        x: 450,
        y: 150,
        text: "Output",
    },
]);

const connections = ref<ConnectionOptions[]>([
    // Input to Process A
    {
        fromShape: blocks.value[0],
        toShape: blocks.value[1],
        fromAnchor: "right",
        toAnchor: "left",
        connectionType: "straight",
        lineType: "arrow",
        config: {
            stroke: "#3b82f6",
            strokeWidth: 2,
            pointerLength: 10,
            pointerWidth: 8,
        },
    },
    // Input to Process B
    {
        fromShape: blocks.value[0],
        toShape: blocks.value[2],
        fromAnchor: "right",
        toAnchor: "left",
        connectionType: "straight",
        lineType: "arrow",
        config: {
            stroke: "#3b82f6",
            strokeWidth: 2,
            pointerLength: 10,
            pointerWidth: 8,
        },
    },
    // Process A to Output
    {
        fromShape: blocks.value[1],
        toShape: blocks.value[3],
        fromAnchor: "right",
        toAnchor: "left",
        connectionType: "straight",
        lineType: "arrow",
        config: {
            stroke: "#10b981",
            strokeWidth: 2,
            pointerLength: 10,
            pointerWidth: 8,
        },
    },
    // Process B to Output
    {
        fromShape: blocks.value[2],
        toShape: blocks.value[3],
        fromAnchor: "right",
        toAnchor: "left",
        connectionType: "straight",
        lineType: "arrow",
        config: {
            stroke: "#10b981",
            strokeWidth: 2,
            pointerLength: 10,
            pointerWidth: 8,
        },
    },
]);

// Set up complex animation sequence
const { currentStep, totalSteps, isAnimating } = useKonvaAnimation(
    [
        // Animate Input block
        createAnimationTarget(
            blocks.value[0],
            { x: 50, y: 150, width: 120, height: 100 },
            [
                // Step 1: Emphasize input (grow)
                createAnimationStep(
                    { width: 140, height: 120, x: 40, y: 140 },
                    { duration: 600, easing: Konva.Easings.BackEaseOut },
                ),
                // Step 2: Move towards center
                createAnimationStep(
                    { x: 100, y: 150 },
                    { duration: 800, easing: Konva.Easings.EaseInOut },
                ),
                // Step 3: Return to normal size but new position
                createAnimationStep(
                    { width: 120, height: 100, x: 80, y: 150 },
                    { duration: 500, easing: Konva.Easings.EaseOut },
                ),
                // Step 4: Final transformation - smaller and repositioned
                createAnimationStep(
                    { width: 80, height: 60, x: 20, y: 50 },
                    { duration: 1000, easing: Konva.Easings.ElasticEaseOut },
                ),
            ],
        ),

        // Animate Process A
        createAnimationTarget(
            blocks.value[1],
            { x: 250, y: 100, width: 100, height: 80 },
            [
                // Step 1: Wait (no change)
                createAnimationStep({ x: 250, y: 100 }, { duration: 100 }),
                // Step 2: Highlight and grow
                createAnimationStep(
                    { width: 120, height: 100, x: 240, y: 90 },
                    {
                        duration: 700,
                        easing: Konva.Easings.BounceEaseOut,
                        delay: 200,
                    },
                ),
                // Step 3: Move to center-left
                createAnimationStep(
                    { x: 180, y: 120 },
                    { duration: 900, easing: Konva.Easings.EaseInOut },
                ),
                // Step 4: Merge with Process B (move down and change size)
                createAnimationStep(
                    { x: 200, y: 180, width: 140, height: 120 },
                    { duration: 1200, easing: Konva.Easings.EaseInOut },
                ),
            ],
        ),

        // Animate Process B
        createAnimationTarget(
            blocks.value[2],
            { x: 250, y: 200, width: 100, height: 80 },
            [
                // Step 1: Wait
                createAnimationStep({ x: 250, y: 200 }, { duration: 100 }),
                // Step 2: Slide down
                createAnimationStep(
                    { y: 240, width: 120, height: 100 },
                    {
                        duration: 700,
                        easing: Konva.Easings.EaseOut,
                        delay: 400,
                    },
                ),
                // Step 3: Move towards center
                createAnimationStep(
                    { x: 180, y: 220 },
                    { duration: 900, easing: Konva.Easings.EaseInOut },
                ),
                // Step 4: Hide (merge with Process A by making very small)
                createAnimationStep(
                    { x: 200, y: 200, width: 0, height: 0 },
                    { duration: 800, easing: Konva.Easings.EaseIn },
                ),
            ],
        ),

        // Animate Output block
        createAnimationTarget(
            blocks.value[3],
            { x: 450, y: 150, width: 120, height: 100 },
            [
                // Step 1: Wait
                createAnimationStep({ x: 450, y: 150 }, { duration: 100 }),
                // Step 2: Pulse to show it's receiving input
                createAnimationStep(
                    { width: 140, height: 120, x: 440, y: 140 },
                    {
                        duration: 400,
                        easing: Konva.Easings.EaseOut,
                        delay: 600,
                    },
                ),
                // Step 3: Return to normal
                createAnimationStep(
                    { width: 120, height: 100, x: 450, y: 150 },
                    { duration: 300, easing: Konva.Easings.EaseIn },
                ),
                // Step 4: Final emphasis - grow and move right
                createAnimationStep(
                    { width: 160, height: 140, x: 480, y: 160 },
                    {
                        duration: 1000,
                        easing: Konva.Easings.BackEaseOut,
                        delay: 500,
                    },
                ),
            ],
        ),
    ],
    {
        skipThreshold: 400, // Give a bit more time before skipping
        defaultDuration: 800,
        defaultEasing: Konva.Easings.EaseInOut,
    },
);
</script>

<template>
    <!-- v-click components for each animation step -->
    <v-click v-for="step in totalSteps" :key="`step-${step}`">
        <!-- Empty v-click for Slidev integration -->
    </v-click>
    
    <!-- Animation controls and info -->
    <div class="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg text-sm">
        <div class="font-semibold mb-2">Animation Demo</div>
        <div>Step: {{ currentStep }} / {{ totalSteps }}</div>
        <div v-if="isAnimating" class="text-blue-600 font-medium">
            🎬 Animating...
        </div>
        <div v-else class="text-green-600">
            ✓ Ready
        </div>
    </div>

    <!-- Instructions -->
    <div class="absolute bottom-4 left-4 bg-gray-800 text-white p-3 rounded-lg text-sm max-w-md">
        <div class="font-semibold mb-1">Instructions:</div>
        <div>• Click to advance through {{ totalSteps }} animation steps</div>
        <div>• Click quickly to skip animations</div>
        <div>• Use arrow keys to go back and forth</div>
        <div>• Watch the PowerPoint-like morphing effects!</div>
    </div>

    <Graphic :blocks="blocks" :connections="connections" />
</template>

<style scoped>
/* Add some visual flair */
.absolute {
    position: absolute;
    z-index: 10;
}
</style>
