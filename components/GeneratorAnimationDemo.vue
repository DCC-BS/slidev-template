<script lang="ts" setup>
import Konva from "konva";
import { computed, ref } from "vue";
import { 
    AnimationContext, 
    EasingPresets,
    GeneratorAnimationPresets 
} from "../composables/useGeneratorAnimation";
import type { ConnectionOptions } from "../utils/shapeConnector";
import type { BlockConfig } from "./Block.vue";
import Graphic from "./Graphic.vue";
import GeneratorAnimator from "./GeneratorAnimator.vue";

const boxSize = ref(50);
const position = ref({ x: 100, y: 100 });
const rotation = ref(0);
const opacity = ref(0);
const scale = ref(0.1);

// Define our reactive data for a more complex animation demo
const blocks = computed<BlockConfig[]>(() => [
    {
        height: boxSize.value,
        width: boxSize.value,
        x: position.value.x,
        y: position.value.y,
        text: "Box 1",
        scaleX: scale.value,
        scaleY: scale.value,
        rotation: rotation.value,
        opacity: opacity.value,
    },
    {
        height: 80,
        width: 120,
        x: 300,
        y: 150,
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

// Complex generator-based animation with multiple steps and patterns
function* complexAnimationGenerator() {
    // Step 1: Fade in and scale up
    const step1 = new AnimationContext();
    step1
        .label("Fade In & Scale Up")
        .show(opacity, { duration: 600, easing: EasingPresets.easeOut })
        .scaleTo(scale, 1, { duration: 800, easing: EasingPresets.backOut });
    
    yield step1;
    
    // Step 2: Expand size with bounce
    const step2 = new AnimationContext();
    step2
        .label("Expand Size")
        .animate(boxSize, { value: 100 }, { 
            duration: 700, 
            easing: EasingPresets.bounceOut 
        });
    
    yield step2;
    
    // Step 3: Move to intermediate position
    const step3 = new AnimationContext();
    step3
        .label("Move to Center")
        .moveTo(position, 200, 120, { 
            duration: 1000, 
            easing: EasingPresets.easeInOut 
        });
    
    yield step3;
    
    // Step 4: Rotate and pulse
    const step4 = new AnimationContext();
    step4
        .label("Rotate & Pulse")
        .rotateTo(rotation, 360, { 
            duration: 1200, 
            easing: EasingPresets.easeInOut 
        });
    
    // Use a preset animation for pulsing effect
    GeneratorAnimationPresets.pulse(step4, scale, { duration: 400 });
    
    yield step4;
    
    // Step 5: Final positioning
    const step5 = new AnimationContext();
    step5
        .label("Final Position")
        .moveTo(position, 250, 100, { 
            duration: 800, 
            easing: EasingPresets.elasticOut 
        })
        .animate(boxSize, { value: 80 }, { 
            duration: 600, 
            easing: EasingPresets.easeInOut 
        })
        .rotateTo(rotation, 0, { 
            duration: 800, 
            easing: EasingPresets.backOut 
        });
    
    yield step5;
}
</script>

<template>
    <GeneratorAnimator :generator="complexAnimationGenerator" />

    <Graphic :blocks="blocks" :connections="connections" />
    
    <!-- Show current animation step info -->
    <div class="animation-info">
        <p>Generator Animation Demo</p>
        <p>Position: ({{ Math.round(position.x) }}, {{ Math.round(position.y) }})</p>
        <p>Size: {{ Math.round(boxSize) }}</p>
        <p>Rotation: {{ Math.round(rotation) }}°</p>
        <p>Scale: {{ scale.toFixed(2) }}</p>
        <p>Opacity: {{ opacity.toFixed(2) }}</p>
    </div>
</template>

<style scoped>
.animation-info {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
}

.animation-info p {
    margin: 2px 0;
}
</style>
