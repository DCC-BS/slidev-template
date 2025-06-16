<script lang="ts" setup>
import { ref } from 'vue';
import { BlockConfig } from './Block.vue';
import Graphic from './Graphic.vue';
import EasyAnimator from './EasyAnimator.vue';

// Create multiple test blocks to stress-test performance
const blocks = ref<BlockConfig[]>([
  {
    height: 60,
    width: 100,
    x: 50,
    y: 50,
    text: 'A',
    rectConfig: { fill: '#ff6b6b' }
  },
  {
    height: 60,
    width: 100,
    x: 200,
    y: 50,
    text: 'B',
    rectConfig: { fill: '#4ecdc4' }
  },
  {
    height: 60,
    width: 100,
    x: 350,
    y: 50,
    text: 'C',
    rectConfig: { fill: '#45b7d1' }
  },
  {
    height: 60,
    width: 100,
    x: 500,
    y: 50,
    text: 'D',
    rectConfig: { fill: '#96ceb4' }
  },
  {
    height: 60,
    width: 100,
    x: 650,
    y: 50,
    text: 'E',
    rectConfig: { fill: '#feca57' }
  }
]);

// Performance test: animate many objects simultaneously
const definePerformanceTest = (builder) => {
  builder
    // Step 1: Move all blocks down simultaneously
    .step(step => {
      blocks.value.forEach((block, i) => {
        step.moveTo(block, block.x, 200, { 
          duration: 1000, 
          easing: 'easeOut',
          delay: i * 100 // Stagger slightly
        });
      });
    })
    
    // Step 2: Scale and rotate simultaneously 
    .step(step => {
      blocks.value.forEach((block, i) => {
        step
          .scaleTo(block, 1.5, { duration: 800, easing: 'elasticOut', delay: i * 50 })
          .animate(block, { rotation: 45 }, { duration: 600, easing: 'backOut', delay: i * 75 });
      });
    })
    
    // Step 3: Complex choreographed movement
    .step(step => {
      blocks.value.forEach((block, i) => {
        const angle = (i / blocks.value.length) * Math.PI * 2;
        const centerX = 400;
        const centerY = 300;
        const radius = 150;
        
        step.moveTo(block, 
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius,
          { 
            duration: 1200, 
            easing: 'elasticOut',
            delay: i * 80
          }
        );
      });
    })
    
    // Step 4: Finale with lots of simultaneous property changes
    .step(step => {
      blocks.value.forEach((block, i) => {
        step
          .animate(block, { 
            x: 100 + i * 120,
            y: 400,
            scaleX: 0.8,
            scaleY: 0.8,
            rotation: 0
          }, { 
            duration: 1000, 
            easing: 'bounceOut',
            delay: i * 60
          });
      });
    });
};
</script>

<template>
  <div class="absolute top-4 left-4 bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg text-sm max-w-xs z-10">
    <div class="font-bold text-green-800 mb-2">⚡ Performance Test</div>
    <div class="text-gray-700">
      <div>🎯 5 objects animating simultaneously</div>
      <div>🔄 Multiple properties per object</div>
      <div>⏱️ Optimized 30fps updates</div>
      <div>🚀 Batched reactive updates</div>
      <div>💾 Single RAF loop</div>
    </div>
  </div>

  <EasyAnimator 
    :sequence="definePerformanceTest"
    :skip-threshold="300"
    :default-duration="800"
    default-easing="easeInOut"
  >
    <template #default="{ currentStep, totalSteps, isAnimating }">
      <div class="absolute top-4 right-4 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg shadow text-sm z-10">
        <div class="font-semibold text-purple-800">Performance Monitor</div>
        <div class="text-gray-700">Step {{ currentStep }} of {{ totalSteps }}</div>
        <div v-if="isAnimating" class="text-purple-600 font-medium">🎬 Animating...</div>
        <div v-else class="text-green-600">✓ Smooth & Ready</div>
      </div>
    </template>
  </EasyAnimator>

  <!-- Render all blocks -->
  <Graphic :blocks="blocks" />
</template>

<style scoped>
.absolute {
  position: absolute;
}
</style>
