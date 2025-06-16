<script lang="ts" setup>
import { ref, computed } from 'vue';
import { BlockConfig } from './Block.vue';
import Graphic from './Graphic.vue';
import { ConnectionOptions } from '../utils/shapeConnector';
import { useKonvaAnimation, createAnimationTarget, createAnimationStep } from '../composables/useKonvaAnimation';
import Konva from 'konva';
import SimpleAnimator, { AnimationStep } from './SimpleAnimator.vue';

// Define our reactive data
const blocks = ref<BlockConfig[]>([
    {
        height: 120,
        width: 150,
        x: 100,
        y: 100,
        text: 'Block 1',
    },
    {
        height: 120,
        width: 150,
        x: 500,
        y: 100,
        text: 'Block 2',
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
            stroke: 'red',
            strokeWidth: 3,
            pointerLength: 15,
            pointerWidth: 12
        }
    }
]);

const animationSteps = [
    {
        targets: [
            {
                index: 0, // blocks[0]
                properties: { x: 300, y: 150 },
                duration: 1000,
                easing: Konva.Easings.EaseOut
            }
        ]
    },
] as AnimationStep[];

</script>

<template>
    <SimpleAnimator :steps="animationSteps" :targets="[blocks[0], blocks[1]]"></SimpleAnimator>

    <Graphic :blocks="blocks" :connections="connections" />
</template>