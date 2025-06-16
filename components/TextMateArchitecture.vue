<script lang="ts" setup>
import Konva from "konva";
import { computed, ref } from "vue";
import {
    type AnimationSequenceBuilder,
    AnimationStepBuilder,
} from "../composables/useEasyAnimation";
import type { ConnectionOptions } from "../utils/shapeConnector";
import type { BlockConfig } from "./Block.vue";
import Graphic from "./Graphic.vue";

const clientHeight = ref(0);
const serverHeight = ref(0);

const frontendHeight = computed(() => {
    return clientHeight.value + serverHeight.value + 80;
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
        y: 270,
        text: "Server",
        opacity: serverHeight.value / 120,
    },
    {
        height: 120,
        width: 150,
        x: 500,
        y: 100,
        text: "Block 2",
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
    },
]);

const connections = computed<ConnectionOptions[]>(() => [
    {
        fromShape: blocks.value[2],
        toShape: blocks.value[3],
        fromAnchor: "right",
        toAnchor: "left",
        connectionType: "straight",
        lineType: "arrow",
        config: {
            stroke: "red",
            strokeWidth: 3,
            pointerLength: 15,
            pointerWidth: 12,
            opacity: serverHeight.value / 120,
        },
    },
]);

const animations = (builder: AnimationSequenceBuilder) =>
    builder
        .step((step) =>
            step.animate(
                clientHeight,
                {
                    value: 120,
                },
                {
                    duration: 500,
                    easing: Konva.Easings.BackEaseOut,
                }
            ).animate(
                serverHeight,
                {
                    value: 120,
                },
                {
                    duration: 500,
                    delay: 500,
                    easing: Konva.Easings.BackEaseOut,
                }
            ));
</script>

<template>
    <EasyAnimator :sequence="animations" />

    <Graphic :blocks="blocks" :connections="connections" />
</template>