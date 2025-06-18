<script lang="ts" setup>

interface InputProps {
    flexLeft?: number;
    flexRight?: number;
    additionalClasses?: string;
}

const props = withDefaults(defineProps<InputProps>(),
    {
        flexLeft: 1,
        flexRight: 1,
        additionalClasses: '',
    })

</script>

<template>
    <div class="slidev-layout relative">
        <slot />
        <div class="flex justify-stretch gap-2" :class="props.additionalClasses">
            <div :style="{ flex: props.flexLeft }">
                <slot name="left" />
            </div>
            <div :style="{ flex: props.flexRight }">
                <slot name="right" />
            </div>
        </div>

        <div class="absolute right-0 right-1 bottom-20 z-0">
            <img src="/theme/image5.png" alt="Background Image" />
        </div>

        <div class="absolute bottom-10 right-10 z-10">
            <img class="w-15" src="/theme/DataBSLogo.svg">
        </div>
    </div>
</template>