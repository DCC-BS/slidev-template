<script lang="ts" setup>
import { computed, ref } from 'vue';
import { animate, step } from "slidev-addon-animations";

const transformScale = ref(1);
const transformOriginX = ref(0);
const transformOriginY = ref(0);

const iFrameStyle = computed(() => ({
    transform: `scale(${transformScale.value})`,
    transformOrigin: `${transformOriginX.value}% ${transformOriginY.value}%`,
}));

function* animation() {
    yield animate(transformScale, 1.5);

    yield animate(transformOriginX, 100);

    yield step(
        animate(transformOriginY, 50),
        animate(transformScale, 1),
    )
}
</script>


<template>
    <Animator :generator="animation" />
    <iframe src="https://textmate.uvk8sbswc19.cmp.bs.ch/" class="w-full h-[800px]" :style="iFrameStyle" />
</template>