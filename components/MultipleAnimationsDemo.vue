<script lang="ts" setup>
import { computed, ref } from "vue";
import {
    animate,
    moveTo,
    scaleTo,
    fadeTo,
    show,
    hide,
    step,
    EasingPresets
} from "../composables/useGeneratorAnimation";
import type { BlockConfig } from "./Block.vue";
import Graphic from "./Graphic.vue";
import GeneratorAnimator from "./GeneratorAnimator.vue";

const box1Position = ref({ x: 50, y: 50 });
const box2Position = ref({ x: 150, y: 50 });
const box3Position = ref({ x: 250, y: 50 });

const box1Scale = ref(0.5);
const box2Scale = ref(0.5);
const box3Scale = ref(0.5);

const box1Opacity = ref(0);
const box2Opacity = ref(0);
const box3Opacity = ref(0);

const rotation = ref(0);
const globalScale = ref(1);

const blocks = computed<BlockConfig[]>(() => [
    {
        height: 60,
        width: 60,
        x: box1Position.value.x,
        y: box1Position.value.y,
        text: "Box 1",
        scaleX: box1Scale.value * globalScale.value,
        scaleY: box1Scale.value * globalScale.value,
        rotation: rotation.value,
        opacity: box1Opacity.value,
    },
    {
        height: 60,
        width: 60,
        x: box2Position.value.x,
        y: box2Position.value.y,
        text: "Box 2",
        scaleX: box2Scale.value * globalScale.value,
        scaleY: box2Scale.value * globalScale.value,
        rotation: rotation.value,
        opacity: box2Opacity.value,
    },
    {
        height: 60,
        width: 60,
        x: box3Position.value.x,
        y: box3Position.value.y,
        text: "Box 3",
        scaleX: box3Scale.value * globalScale.value,
        scaleY: box3Scale.value * globalScale.value,
        rotation: rotation.value,
        opacity: box3Opacity.value,
    },
]);

// Demonstration of different ways to create multiple animations per step
function* multipleAnimationsDemo() {
    // Method 1: Using step() function (Recommended)
    // All animations in this step happen simultaneously
    yield step(
        show(box1Opacity, { duration: 500 }),
        show(box2Opacity, { duration: 500, delay: 100 }),
        show(box3Opacity, { duration: 500, delay: 200 })
    );

    // Method 2: Scale all boxes at once with different timings
    yield step(
        scaleTo(box1Scale, 1, { duration: 600, easing: EasingPresets.bounceOut }),
        scaleTo(box2Scale, 1, { duration: 600, delay: 150, easing: EasingPresets.bounceOut }),
        scaleTo(box3Scale, 1, { duration: 600, delay: 300, easing: EasingPresets.bounceOut })
    );

    // Method 3: Complex step with different animation types
    yield step(
        // Move all boxes
        moveTo(box1Position, 100, 150, { duration: 800 }),
        moveTo(box2Position, 200, 150, { duration: 800 }),
        moveTo(box3Position, 300, 150, { duration: 800 }),
        // Rotate everything
        animate(rotation, { value: 180 }, { duration: 1000, easing: EasingPresets.easeInOut }),
        // Scale the entire scene
        scaleTo(globalScale, 1.2, { duration: 800, delay: 200 })
    );

    // Method 4: Staggered effects in one step
    yield step(
        // Different effects with different delays to create staggered animation
        scaleTo(box1Scale, 1.5, { duration: 400, delay: 0 }),
        scaleTo(box2Scale, 1.5, { duration: 400, delay: 100 }),
        scaleTo(box3Scale, 1.5, { duration: 400, delay: 200 }),
        // Global effect that affects all
        animate(rotation, { value: 360 }, { duration: 1200, delay: 300 })
    );

    // Method 5: Reset everything in one coordinated step
    yield step(
        // Reset positions
        moveTo(box1Position, 50, 50, { duration: 600 }),
        moveTo(box2Position, 150, 50, { duration: 600 }),
        moveTo(box3Position, 250, 50, { duration: 600 }),
        // Reset scales
        scaleTo(box1Scale, 1, { duration: 500 }),
        scaleTo(box2Scale, 1, { duration: 500 }),
        scaleTo(box3Scale, 1, { duration: 500 }),
        scaleTo(globalScale, 1, { duration: 500 }),
        // Reset rotation
        animate(rotation, { value: 0 }, { duration: 800 })
    );

    // Method 6: Fade out with different timings
    yield step(
        hide(box1Opacity, { duration: 400, delay: 0 }),
        hide(box2Opacity, { duration: 400, delay: 150 }),
        hide(box3Opacity, { duration: 400, delay: 300 })
    );
}

// Alternative: Method using array of animations (also works)
function* arrayMethodDemo() {
    // You can also yield an array of animation instructions
    yield [
        show(box1Opacity, { duration: 500 }),
        show(box2Opacity, { duration: 500 }),
        show(box3Opacity, { duration: 500 })
    ];

    yield [
        scaleTo(box1Scale, 1, { duration: 600 }),
        scaleTo(box2Scale, 1, { duration: 600 }),
        scaleTo(box3Scale, 1, { duration: 600 })
    ];

    yield [
        hide(box1Opacity, { duration: 400 }),
        hide(box2Opacity, { duration: 400 }),
        hide(box3Opacity, { duration: 400 })
    ];
}

// Dynamic method: Build animations programmatically
function* dynamicAnimationsDemo() {
    const positions = [box1Position, box2Position, box3Position];
    const scales = [box1Scale, box2Scale, box3Scale];
    const opacities = [box1Opacity, box2Opacity, box3Opacity];

    // Build show animations dynamically
    const showAnimations = opacities.map((opacity, index) =>
        show(opacity, { duration: 500, delay: index * 100 })
    );
    yield step(...showAnimations);

    // Build scale animations dynamically
    const scaleAnimations = scales.map((scale, index) =>
        scaleTo(scale, 1, { duration: 600, delay: index * 150 })
    );
    yield step(...scaleAnimations);

    // Build move animations dynamically
    const moveAnimations = positions.map((position, index) =>
        moveTo(position, 100 + index * 100, 200, { duration: 800 })
    );
    yield step(...moveAnimations);

    // Hide all
    const hideAnimations = opacities.map((opacity, index) =>
        hide(opacity, { duration: 400, delay: index * 100 })
    );
    yield step(...hideAnimations);
}
</script>

<template>
    <GeneratorAnimator :generator="multipleAnimationsDemo" />

    <Graphic :blocks="blocks" :connections="[]" />

    <div class="info-panel">
        <h3>Multiple Animations Per Step</h3>
        <p><strong>Current Demo:</strong> Multiple animations using step() function</p>

        <div class="methods">
            <h4>Available Methods:</h4>
            <ol>
                <li><strong>step() function:</strong> <code>yield step(anim1, anim2, anim3)</code></li>
                <li><strong>Array syntax:</strong> <code>yield [anim1, anim2, anim3]</code></li>
                <li><strong>Dynamic building:</strong> <code>yield step(...animations)</code></li>
            </ol>
        </div>

        <div class="current-values">
            <p><strong>Current Values:</strong></p>
            <p>Box 1: ({{ Math.round(box1Position.x) }}, {{ Math.round(box1Position.y) }}) scale: {{
                box1Scale.toFixed(2) }}</p>
            <p>Box 2: ({{ Math.round(box2Position.x) }}, {{ Math.round(box2Position.y) }}) scale: {{
                box2Scale.toFixed(2) }}</p>
            <p>Box 3: ({{ Math.round(box3Position.x) }}, {{ Math.round(box3Position.y) }}) scale: {{
                box3Scale.toFixed(2) }}</p>
            <p>Rotation: {{ Math.round(rotation) }}°</p>
            <p>Global Scale: {{ globalScale.toFixed(2) }}</p>
        </div>
    </div>
</template>

<style scoped>
.info-panel {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    max-width: 350px;
}

.info-panel h3 {
    margin: 0 0 10px 0;
    color: #4CAF50;
}

.info-panel h4 {
    margin: 15px 0 5px 0;
    color: #FFC107;
}

.methods ol {
    margin: 5px 0;
    padding-left: 20px;
}

.methods li {
    margin: 8px 0;
}

.info-panel code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 11px;
}

.current-values {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.current-values p {
    margin: 3px 0;
    font-family: monospace;
    font-size: 11px;
}
</style>
