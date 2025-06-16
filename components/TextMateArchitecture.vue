<script lang="ts" setup>
import { ref, computed } from 'vue';
import { BlockConfig } from './Block.vue';
import Graphic from './Graphic.vue';
import { ConnectionOptions } from '../utils/shapeConnector';
import Konva from 'konva';
import { AnimationSequenceBuilder, AnimationStepBuilder } from '../composables/useEasyAnimation';

// Define our reactive data
const blocks = ref<BlockConfig[]>([
    {
        height: 120,
        width: 150,
        x: 100,
        y: 100,
        text: 'Block 1',
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
    },
    {
        height: 120,
        width: 150,
        x: 500,
        y: 100,
        text: 'Block 2',
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
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

const animations = (builder: AnimationSequenceBuilder) => {
    builder
        .step((step) => {
            step
                .moveTo(blocks.value[0], 200, 150, { duration: 800, easing: Konva.Easings.EaseOut })
                .moveTo(blocks.value[1], 300, 150, { duration: 1000, easing: Konva.Easings.BackEaseOut, delay: 200 });
        })
        .step((step) => {
            step
                .scaleTo(blocks.value[0], 1.2, { duration: 500, easing: Konva.Easings.ElasticEaseOut })
                .scaleTo(blocks.value[1], 1.2, { duration: 500, easing: Konva.Easings.ElasticEaseOut });
        })
        .step((step) => {
            step
                .fadeTo(blocks.value[0], 0.0, { duration: 300 })
                .scaleTo(blocks.value[1], 0.8, { duration: 300, easing: Konva.Easings.BackEaseIn });
        });
}

</script>

<template>
    <EasyAnimator :sequence="animations">
        <template #default="{ currentStep, totalSteps, isAnimating }">
            <div>Step {{ currentStep }} of {{ totalSteps }}</div>
        </template>
    </EasyAnimator>

    <Graphic :blocks="blocks" :connections="connections" />
</template>