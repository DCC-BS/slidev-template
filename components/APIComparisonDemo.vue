<script lang="ts" setup>
import { ref } from 'vue';
import { BlockConfig } from './Block.vue';
import Graphic from './Graphic.vue';

// Define a simple block for comparison
const block = ref<BlockConfig>({
  height: 100,
  width: 150,
  x: 100,
  y: 150,
  text: 'Demo Block',
});
</script>

<template>
  <div class="grid grid-cols-2 gap-8 p-6">
    <!-- OLD API (Complex) -->
    <div class="bg-red-50 p-4 rounded-lg">
      <h3 class="font-bold text-red-800 mb-3">❌ Old API (Complex)</h3>
      <pre class="text-xs bg-white p-3 rounded overflow-auto"><code>const animationSteps = [
  {
    targets: [
      {
        index: 0, // ← Remember indices!
        properties: { x: 300, y: 200 },
        duration: 1000,
        easing: Konva.Easings.EaseOut // ← Verbose
      }
    ]
  },
  {
    targets: [
      {
        index: 0, // ← More indices
        properties: { width: 200, height: 130 },
        duration: 800,
        easing: Konva.Easings.BackEaseOut
      }
    ]
  }
];

const initialStates = [
  { x: 100, y: 150, width: 150, height: 100 }
]; // ← Manual initial states

&lt;SimpleAnimator 
  :steps="animationSteps"
  :targets="[block]"
  :initial-states="initialStates"
/&gt;</code></pre>
    </div>

    <!-- NEW API (Simple) -->
    <div class="bg-green-50 p-4 rounded-lg">
      <h3 class="font-bold text-green-800 mb-3">✅ New API (Simple)</h3>
      <pre class="text-xs bg-white p-3 rounded overflow-auto"><code>const defineAnimation = (builder) => {
  builder
    .step(step => {
      step.moveTo(block.value, 300, 200, {
        duration: 1000,
        easing: 'easeOut' // ← Simple presets
      });
    })
    .step(step => {
      step.resizeTo(block.value, 200, 130, {
        duration: 800,
        easing: 'backOut'
      });
    });
};

// No initial states needed! Auto-captured

&lt;EasyAnimator 
  :sequence="defineAnimation"
/&gt;</code></pre>
    </div>
  </div>

  <!-- Benefits comparison -->
  <div class="mt-6 bg-blue-50 p-4 rounded-lg">
    <h3 class="font-bold text-blue-800 mb-3">🚀 Improvements</h3>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <h4 class="font-semibold text-blue-700">Developer Experience</h4>
        <ul class="text-blue-600 mt-1 space-y-1">
          <li>✨ Fluent/builder pattern</li>
          <li>🎯 Direct target references</li>
          <li>📝 Better TypeScript support</li>
          <li>🔧 Method chaining</li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold text-blue-700">Features</h4>
        <ul class="text-blue-600 mt-1 space-y-1">
          <li>⚡ Auto initial state capture</li>
          <li>🎨 Preset easings (20+ options)</li>
          <li>🎭 Animation presets</li>
          <li>🔄 Convenience methods</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Available convenience methods -->
  <div class="mt-4 bg-purple-50 p-4 rounded-lg">
    <h3 class="font-bold text-purple-800 mb-3">🛠️ Available Methods</h3>
    <div class="grid grid-cols-3 gap-4 text-xs">
      <div>
        <h4 class="font-semibold text-purple-700">Movement</h4>
        <ul class="text-purple-600 mt-1">
          <li>• moveTo(target, x, y)</li>
          <li>• animate(target, props)</li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold text-purple-700">Transformation</h4>
        <ul class="text-purple-600 mt-1">
          <li>• scaleTo(target, scale)</li>
          <li>• resizeTo(target, w, h)</li>
          <li>• rotateTo(target, angle)</li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold text-purple-700">Visibility</h4>
        <ul class="text-purple-600 mt-1">
          <li>• fadeTo(target, opacity)</li>
          <li>• show(target)</li>
          <li>• hide(target)</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Demo block -->
  <div class="mt-6">
    <Graphic :blocks="[block]" :connections="[]" />
  </div>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  font-size: 10px;
  line-height: 1.3;
}
</style>
