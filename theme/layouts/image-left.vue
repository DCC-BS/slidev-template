<script lang="ts" setup>

interface InputProps {
    image: string;
}

const props = defineProps<InputProps>();

</script>

<template>
    <div class="slidev-layout relative">
        <div class="flex justify-stretch gap-2">
            <div>
                <img :src="props.image" alt="Right Image" class="w-full h-auto object-cover" />
            </div>
            <div>
                <slot />
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