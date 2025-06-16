# Generator-Based Animation System

This document explains how to use the new generator-based animation system that replaces the previous builder pattern.

## Overview

The generator-based animation system allows you to define animations using JavaScript generator functions, where each `yield` statement creates a new animation step. This provides a more intuitive and linear way to define complex animations.

## Key Components

### 1. `useGeneratorAnimation` Composable

The main composable that provides the animation system:

```typescript
import { useGeneratorAnimation } from '../composables/useGeneratorAnimation';

const { createAnimationFromGenerator, EasingPresets } = useGeneratorAnimation({
    skipThreshold: 300,
    defaultDuration: 1000,
    defaultEasing: "easeInOut",
});
```

### 2. `AnimationContext` Class

Each animation step uses an `AnimationContext` that provides fluent API methods:

```typescript
import { AnimationContext } from '../composables/useGeneratorAnimation';

const step = new AnimationContext();
step
    .animate(target, { x: 100, y: 50 }, { duration: 500 })
    .fadeTo(anotherTarget, 1, { easing: EasingPresets.bounceOut })
    .label("Step Description");
```

### 3. `GeneratorAnimator` Component

The component that executes generator-based animations:

```vue
<GeneratorAnimator :generator="myAnimationGenerator" />
```

## Basic Usage

### Simple Animation Generator

```typescript
function* simpleAnimation() {
    // Step 1: Fade in
    const step1 = new AnimationContext();
    step1.show(opacity, { duration: 500 });
    yield step1;
    
    // Step 2: Move
    const step2 = new AnimationContext();
    step2.moveTo(position, 200, 100, { duration: 800 });
    yield step2;
}
```

### Complex Multi-Step Animation

```typescript
function* complexAnimation() {
    // Step 1: Initialize
    const init = new AnimationContext();
    init
        .label("Initialize")
        .show(opacity, { duration: 600 })
        .scaleTo(scale, 1, { easing: EasingPresets.backOut });
    yield init;
    
    // Step 2: Transform
    const transform = new AnimationContext();
    transform
        .label("Transform")
        .moveTo(position, 300, 150, { duration: 1000 })
        .rotateTo(rotation, 180, { easing: EasingPresets.easeInOut });
    yield transform;
    
    // Step 3: Finalize
    const finalize = new AnimationContext();
    finalize
        .label("Finalize")
        .resizeTo(size, 100, 100, { duration: 500 })
        .hide(opacity, { delay: 200 });
    yield finalize;
}
```

## AnimationContext Methods

### Core Animation Method
- `animate(target, properties, options)` - Animate any properties on a target

### Convenience Methods
- `moveTo(target, x, y, options)` - Move to specific coordinates
- `scaleTo(target, scale, options)` - Scale to specific size (number or {x, y})
- `resizeTo(target, width, height, options)` - Resize to specific dimensions
- `rotateTo(target, rotation, options)` - Rotate to specific angle
- `fadeTo(target, opacity, options)` - Fade to specific opacity
- `show(target, options)` - Fade to opacity 1
- `hide(target, options)` - Fade to opacity 0
- `label(text)` - Add a debug label to the step

## Animation Options

```typescript
interface AnimationProps {
    duration?: number;        // Animation duration in milliseconds
    delay?: number;          // Delay before starting animation
    easing?: unknown;        // Easing function (use EasingPresets)
}
```

## Easing Presets

The system provides predefined easing functions:

```typescript
import { EasingPresets } from '../composables/useGeneratorAnimation';

// Basic easing
EasingPresets.linear
EasingPresets.easeIn
EasingPresets.easeOut
EasingPresets.easeInOut

// Bouncy effects
EasingPresets.bounceIn
EasingPresets.bounceOut
EasingPresets.bounceInOut

// Elastic effects
EasingPresets.elasticIn
EasingPresets.elasticOut
EasingPresets.elasticInOut

// Back effects (overshoot)
EasingPresets.backIn
EasingPresets.backOut
EasingPresets.backInOut

// Strong effects
EasingPresets.strongIn
EasingPresets.strongOut
EasingPresets.strongInOut
```

## Generator Animation Presets

Pre-built animation patterns for common effects:

```typescript
import { GeneratorAnimationPresets } from '../composables/useGeneratorAnimation';

const step = new AnimationContext();

// Slide animations
GeneratorAnimationPresets.slideInFromLeft(step, target, 100, { duration: 500 });
GeneratorAnimationPresets.slideInFromRight(step, target, 200, { duration: 500 });

// Scale animations
GeneratorAnimationPresets.scaleIn(step, target, { easing: EasingPresets.backOut });
GeneratorAnimationPresets.scaleOut(step, target, { duration: 300 });

// Effect animations
GeneratorAnimationPresets.bounce(step, target, { duration: 400 });
GeneratorAnimationPresets.pulse(step, target, { duration: 600 });
```

## Complete Example

```vue
<script lang="ts" setup>
import { ref } from "vue";
import { AnimationContext, EasingPresets } from "../composables/useGeneratorAnimation";
import GeneratorAnimator from "./GeneratorAnimator.vue";

const position = ref({ x: 50, y: 50 });
const size = ref(30);
const opacity = ref(0);

function* myAnimation() {
    // Step 1: Appear
    const appear = new AnimationContext();
    appear
        .label("Appear")
        .show(opacity, { duration: 400 })
        .scaleTo(size, 1, { easing: EasingPresets.bounceOut });
    yield appear;
    
    // Step 2: Move around
    const move = new AnimationContext();
    move
        .label("Move")
        .moveTo(position, 200, 100, { 
            duration: 1000, 
            easing: EasingPresets.easeInOut 
        });
    yield move;
    
    // Step 3: Grow
    const grow = new AnimationContext();
    grow
        .label("Grow")
        .animate(size, { value: 80 }, { 
            duration: 600, 
            easing: EasingPresets.elasticOut 
        });
    yield grow;
}
</script>

<template>
    <GeneratorAnimator :generator="myAnimation" />
    <!-- Your content here -->
</template>
```

## Migration from Builder Pattern

### Before (Builder Pattern)
```typescript
const animations = (builder: AnimationSequenceBuilder) =>
    builder
        .step((step) =>
            step.animate(target, { x: 100 }, { duration: 500 })
                .animate(target2, { opacity: 1 }, { duration: 300 })
        )
        .step((step) =>
            step.moveTo(target, 200, 150, { duration: 800 })
        );
```

### After (Generator Pattern)
```typescript
function* animations() {
    // Step 1
    const step1 = new AnimationContext();
    step1
        .animate(target, { x: 100 }, { duration: 500 })
        .animate(target2, { opacity: 1 }, { duration: 300 });
    yield step1;
    
    // Step 2
    const step2 = new AnimationContext();
    step2.moveTo(target, 200, 150, { duration: 800 });
    yield step2;
}
```

## Benefits of Generator Pattern

1. **Linear Flow**: Code reads like a sequence of steps
2. **Step Isolation**: Each step is clearly separated
3. **Flexible Control**: Easy to add conditional logic between steps
4. **Debugging**: Each step can have a label for easier debugging
5. **Maintainable**: Easier to understand and modify complex animations
6. **Powerful**: Can use full JavaScript control flow (loops, conditions, etc.)

## Advanced Patterns

### Conditional Animation Steps
```typescript
function* conditionalAnimation() {
    const step1 = new AnimationContext();
    step1.show(opacity);
    yield step1;
    
    if (someCondition) {
        const conditionalStep = new AnimationContext();
        conditionalStep.moveTo(position, 300, 200);
        yield conditionalStep;
    }
    
    const finalStep = new AnimationContext();
    finalStep.hide(opacity);
    yield finalStep;
}
```

### Loop-Based Animations
```typescript
function* loopAnimation() {
    for (let i = 0; i < 3; i++) {
        const step = new AnimationContext();
        step
            .label(`Loop ${i + 1}`)
            .moveTo(position, 100 * i, 50 * i, { duration: 500 });
        yield step;
    }
}
```
