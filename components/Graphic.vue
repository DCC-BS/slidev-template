<script lang="ts" setup>
import { computed } from 'vue';
import { ConnectionOptions } from '../utils/shapeConnector';
import { BlockConfig } from './Block.vue';


interface GraphicProps {
    width?: number;
    height?: number;
    blocks?: BlockConfig[];
    connections?: ConnectionOptions[];
}

const props = withDefaults(defineProps<GraphicProps>(),
    {
        width: 1600,
        height: 900,
        blocks: () => [],
        connections: () => [],
    });

const stageConfig = computed(() => ({
    width: props.width,
    height: props.height,
} as GraphicProps));
</script>


<template>
    <v-stage :config="stageConfig">
        <v-layer>
            <Block v-for="(block, index) in props.blocks" :key="index" :config="block" />
            <Connection v-for="(connection, index) in props.connections" :key="index" :config="connection" />
        </v-layer>
    </v-stage>
</template>