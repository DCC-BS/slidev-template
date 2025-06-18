<script setup lang="ts">
interface InputProps {
    showDataBSLogo?: boolean;
}

const props = withDefaults(defineProps<InputProps>(), {
    showDataBSLogo: true,
});
</script>

<template>
    <div class="slidev-layout relative">
        <div class="my-auto">
            <slot />
        </div>

        <div v-if="props.showDataBSLogo" class="absolute bottom-10 right-10 z-10">
            <img class="w-15" src="/theme/DataBSLogo.svg">
        </div>
    </div>
</template>