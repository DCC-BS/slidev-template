<script lang="ts" setup>
import Konva from "konva";
import { computed, ref } from "vue";
import { animate, step } from "../composables/useGeneratorAnimation";
import type { ConnectionOptions } from "../utils/shapeConnector";
import type { BlockConfig } from "./Block.vue";
import Graphic from "./Graphic.vue";
import GeneratorAnimator from "./GeneratorAnimator.vue";

const clientHeight = ref(0);
const serverHeight = ref(0);

const apiHeight = ref(0);

const frontendHeight = computed(() => {
    return clientHeight.value + serverHeight.value + 100;
});

const backendHeight = computed(() => {
    return apiHeight.value + 60;
});

// Define our reactive data
const blocks = computed<BlockConfig[]>(() => [
    {
        height: frontendHeight.value,
        width: 150,
        x: 100,
        y: 100,
        text: "Frontend",
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        textConfig: {
            verticalAlign: "top",
            y: 10,
        }
    },
    {
        width: 130,
        height: clientHeight.value,
        x: 110,
        y: 140,
        text: "Client",
        opacity: clientHeight.value / 120,
    },
    {
        width: 130,
        height: serverHeight.value,
        x: 110,
        y: 290,
        text: "Server",
        opacity: serverHeight.value / 120,
    },
    {
        height: backendHeight.value,
        width: 150,
        x: 500,
        y: 100,
        text: "Backend",
        opacity: 1,
        textConfig: {
            y: 10,
            verticalAlign: "top"
        }
    },
    {
        width: 130,
        height: apiHeight.value,
        x: 510,
        y: 140,
        text: "API",
        opacity: apiHeight.value / 120,
    },
]);

const connections = computed<ConnectionOptions[]>(() => [
    {
        fromShape: blocks.value[1],
        toShape: blocks.value[2],
        fromAnchor: "bottom",
        toAnchor: "top",
        connectionType: "straight",
        lineType: "double-arrow",
        config: {
            opacity: serverHeight.value / 120
        }
    },
    {
        fromShape: blocks.value[2],
        toShape: blocks.value[4],
        fromAnchor: "right",
        toAnchor: "left",
        connectionType: "orthogonal",
        lineType: "double-arrow",
        config: {
            opacity: apiHeight.value / 120,
        },
    },
]);

// Simplified generator-based animation function
function* animationGenerator() {
    // Step 1: Multiple animations happening simultaneously
    yield step(
        animate(
            clientHeight,
            { value: 120 },
            {
                duration: 500,
                easing: Konva.Easings.BackEaseOut,
            }
        ),
        animate(
            serverHeight,
            { value: 120 },
            {
                duration: 500,
                delay: 500,
                easing: Konva.Easings.BackEaseOut,
            }
        )
    );

    // Step 2: Animate API height with a delay
    yield animate(
        apiHeight,
        { value: 120 },
        {
            duration: 500,
            delay: 1000,
            easing: Konva.Easings.BackEaseOut,
        }
    );
}
</script>

<template>
    <GeneratorAnimator :generator="animationGenerator" />
    <Graphic :blocks="blocks" :connections="connections" />
</template>