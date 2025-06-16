<script lang="ts" setup>
import { ref } from 'vue';
import { BlockConfig } from './Block.vue';
import Graphic from './Graphic.vue';
import { ConnectionOptions } from '../utils/shapeConnector';
import EasyAnimator from './EasyAnimator.vue';

// Define reactive blocks
const block1 = ref<BlockConfig>({
  height: 100,
  width: 150,
  x: 100,
  y: 100,
  text: 'Block 1',
});

const block2 = ref<BlockConfig>({
  height: 100,
  width: 150,
  x: 400,
  y: 100,
  text: 'Block 2',
});

const block3 = ref<BlockConfig>({
  height: 80,
  width: 120,
  x: 250,
  y: 250,
  text: 'Block 3',
  rectConfig: {
    opacity: 0
  }
});

const connections = ref<ConnectionOptions[]>([
  {
    fromShape: block1.value,
    toShape: block2.value,
    fromAnchor: 'right',
    toAnchor: 'left',
    connectionType: 'straight',
    lineType: 'arrow',
    config: {
      stroke: '#3b82f6',
      strokeWidth: 2,
      pointerLength: 10,
      pointerWidth: 8
    }
  }
]);

// Super simple animation definition using the fluent API!
const defineAnimation = (builder) => {
  builder
    // Step 1: Move blocks with different easings
    .step(step => {
      step
        .moveTo(block1.value, 200, 150, { duration: 800, easing: 'easeOut' })
        .moveTo(block2.value, 300, 150, { duration: 1000, easing: 'backOut', delay: 200 });
    })
    
    // Step 2: Scale and highlight
    .step(step => {
      step
        .scaleTo(block1.value, 1.2, { duration: 600, easing: 'bounceOut' })
        .resizeTo(block2.value, 180, 120, { duration: 700, easing: 'elasticOut' })
        .show(block3.value, { duration: 500, easing: 'backOut', delay: 300 });
    })
    
    // Step 3: Final arrangement
    .step(step => {
      step
        .moveTo(block1.value, 150, 200, { duration: 1000, easing: 'elasticOut' })
        .moveTo(block2.value, 350, 200, { duration: 1000, easing: 'elasticOut', delay: 100 })
        .moveTo(block3.value, 250, 100, { duration: 800, easing: 'backOut', delay: 200 });
    })
    
    // Step 4: Cool finale
    .step(step => {
      step
        .scaleTo(block1.value, 0.8, { duration: 400, easing: 'bounceOut' })
        .scaleTo(block2.value, 0.8, { duration: 400, easing: 'bounceOut', delay: 100 })
        .scaleTo(block3.value, 1.3, { duration: 600, easing: 'elasticOut', delay: 200 });
    });
};

// Note: block3 starts hidden via rectConfig.opacity = 0
</script>

<template>
  <div class="absolute top-4 left-4 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg text-sm max-w-sm">
    <div class="font-bold text-purple-800 mb-2">🚀 Easy Animation API</div>
    <div class="text-gray-700">
      <div>✨ Fluent builder pattern</div>
      <div>🎯 Direct target references</div>
      <div>⚡ Auto initial state capture</div>
      <div>🎨 Preset easings</div>
      <div>🔧 Method chaining</div>
    </div>
  </div>

  <!-- Super simple usage! -->
  <EasyAnimator 
    :sequence="defineAnimation"
    :skip-threshold="400"
    :default-duration="800"
    default-easing="easeInOut"
  >
    <template #default="{ currentStep, totalSteps, isAnimating }">
      <div class="absolute top-4 right-4 bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-lg shadow text-sm">
        <div class="font-semibold text-blue-800">Easy Animation</div>
        <div class="text-gray-700">Step {{ currentStep }} of {{ totalSteps }}</div>
        <div v-if="isAnimating" class="text-blue-600 font-medium">🎬 Animating...</div>
        <div v-else class="text-green-600">✓ Ready</div>
      </div>
    </template>
  </EasyAnimator>

  <!-- Render the graphic -->
  <Graphic :blocks="[block1, block2, block3]" :connections="connections" />
</template>

<style scoped>
.absolute {
  position: absolute;
  z-index: 10;
}
</style>
