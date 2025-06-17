<script lang="ts" setup>

interface InputProps {
    image: string;
}

const props = defineProps<InputProps>();

</script>

<template>
    <div class="slidev-layout relative bg-white">
        <div class="flex justify-stretch gap-2">
            <div>
                <img :src="props.image" alt="Right Image" class="w-full h-auto object-cover" />
            </div>
            <div>
                <slot />
            </div>
        </div>
    </div>
</template>