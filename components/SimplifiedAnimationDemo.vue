<script lang="ts" setup>
import Konva from "konva";
import { computed, ref } from "vue";
import { 
    animate, 
    moveTo, 
    scaleTo, 
    fadeTo, 
    show, 
    hide,
    step,
    EasingPresets,
    SimpleAnimationPresets 
} from "../composables/useGeneratorAnimation";
import type { ConnectionOptions } from "../utils/shapeConnector";
import type { BlockConfig } from "./Block.vue";
import Graphic from "./Graphic.vue";
import GeneratorAnimator from "./GeneratorAnimator.vue";

const boxSize = ref(50);
const position = ref({ x: 50, y: 50 });
const rotation = ref(0);
const opacity = ref(0);
const scale = ref(0.1);

// Define our reactive data for demonstration
const blocks = computed<BlockConfig[]>(() => [
    {
        height: boxSize.value,
        width: boxSize.value,
        x: position.value.x,
        y: position.value.y,
        text: "Box",
        scaleX: scale.value,
        scaleY: scale.value,
        rotation: rotation.value,
        opacity: opacity.value,
    },
    {
        height: 60,
        width: 100,
        x: 300,
        y: 100,
        text: "Target",
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
    },
]);

const connections = computed<ConnectionOptions[]>(() => [
    {
        fromShape: blocks.value[0],
        toShape: blocks.value[1],
        fromAnchor: "right",
        toAnchor: "left",
        connectionType: "straight",
        lineType: "arrow",
        config: {
            stroke: "blue",
            strokeWidth: 2,
            pointerLength: 10,
            pointerWidth: 8,
            opacity: opacity.value,
        },
    },
]);

// Simplified generator-based animation with multiple syntax options
function* simplifiedAnimationGenerator() {
    // Step 1: Simple animate call
    yield animate(opacity, { value: 1 }, { 
        duration: 600, 
        easing: EasingPresets.easeOut 
    });

    // Step 2: Use convenience function
    yield scaleTo(scale, 1, { 
        duration: 800, 
        easing: EasingPresets.backOut 
    });

    // Step 3: Multiple animations in one step using step()
    yield step(
        animate(boxSize, { value: 80 }, { duration: 700 }),
        moveTo(position, 150, 80, { duration: 700 })
    );

    // Step 4: Use preset animation
    yield SimpleAnimationPresets.bounce(scale, { duration: 400 });

    // Step 5: Complex step with multiple effects
    yield step(
        moveTo(position, 250, 100, { 
            duration: 1000, 
            easing: EasingPresets.elasticOut 
        }),
        animate(rotation, { value: 360 }, { 
            duration: 1200, 
            easing: EasingPresets.easeInOut 
        }),
        animate(boxSize, { value: 60 }, { 
            duration: 800, 
            delay: 200 
        })
    );

    // Step 6: Reset and hide
    yield step(
        animate(rotation, { value: 0 }, { duration: 500 }),
        hide(opacity, { duration: 400, delay: 300 })
    );
}

// Alternative: Even more concise for simple cases
function* ultraSimpleAnimation() {
    yield show(opacity, { duration: 500 });
    yield scaleTo(scale, 1.2, { duration: 300 });
    yield moveTo(position, 200, 120, { duration: 800 });
    yield hide(opacity, { duration: 300 });
}
</script>

<template>
    <GeneratorAnimator :generator="simplifiedAnimationGenerator" />

    <Graphic :blocks="blocks" :connections="connections" />
    
    <!-- Controls to switch between demos -->
    <div class="demo-controls">
        <h3>Simplified Generator Animation Demo</h3>
        <p>This demo shows the new simplified syntax where you can:</p>
        <ul>
            <li><code>yield animate(target, props, options)</code></li>
            <li><code>yield moveTo(target, x, y, options)</code></li>
            <li><code>yield scaleTo(target, scale, options)</code></li>
            <li><code>yield step(anim1, anim2, ...)</code> for multiple animations</li>
            <li>Use preset animations</li>
        </ul>
        
        <div class="current-values">
            <p><strong>Current Values:</strong></p>
            <p>Position: ({{ Math.round(position.x) }}, {{ Math.round(position.y) }})</p>
            <p>Size: {{ Math.round(boxSize) }}</p>
            <p>Rotation: {{ Math.round(rotation) }}°</p>
            <p>Scale: {{ scale.toFixed(2) }}</p>
            <p>Opacity: {{ opacity.toFixed(2) }}</p>
        </div>
    </div>
</template>

<style scoped>
.demo-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    max-width: 300px;
}

.demo-controls h3 {
    margin: 0 0 10px 0;
    color: #4CAF50;
}

.demo-controls ul {
    margin: 10px 0;
    padding-left: 20px;
}

.demo-controls li {
    margin: 5px 0;
}

.demo-controls code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
}

.current-values {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.current-values p {
    margin: 3px 0;
    font-family: monospace;
}
</style>
