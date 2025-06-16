# Simplified Generator Animation System

This guide shows the new simplified syntax for the generator-based animation system, where you can yield animations directly without creating `AnimationContext` objects.

## Quick Start

```typescript
import { animate, moveTo, scaleTo, show, hide } from '../composables/useGeneratorAnimation';

function* myAnimation() {
    // Each yield creates a new animation step
    yield show(opacity, { duration: 500 });
    yield moveTo(position, 200, 100, { duration: 800 });
    yield scaleTo(size, 1.5, { duration: 600 });
    yield hide(opacity, { duration: 300 });
}
```

## Helper Functions

### Core Animation Function
```typescript
animate(target, properties, options)
```
**Example:**
```typescript
yield animate(myRef, { value: 100, x: 200 }, { duration: 1000 });
```

### Convenience Functions
```typescript
// Movement
yield moveTo(position, 200, 150, { duration: 800 });

// Scaling
yield scaleTo(scale, 1.5, { duration: 600 });           // Uniform scale
yield scaleTo(scale, { x: 1.2, y: 0.8 }, { duration: 600 }); // Non-uniform

// Resizing
yield resizeTo(size, 100, 80, { duration: 500 });

// Rotation
yield rotateTo(rotation, 180, { duration: 1000 });

// Opacity
yield fadeTo(opacity, 0.5, { duration: 400 });
yield show(opacity, { duration: 500 });                 // fadeTo(opacity, 1)
yield hide(opacity, { duration: 300 });                 // fadeTo(opacity, 0)
```

## Multiple Animations in One Step

Use the `step()` function to run multiple animations simultaneously:

```typescript
import { step, animate, moveTo } from '../composables/useGeneratorAnimation';

function* myAnimation() {
    // Multiple animations happen at the same time
    yield step(
        moveTo(position, 200, 100, { duration: 800 }),
        scaleTo(scale, 1.5, { duration: 800 }),
        animate(rotation, { value: 45 }, { duration: 800 })
    );
}
```

## Complete Example

```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { 
    animate, 
    moveTo, 
    scaleTo, 
    show, 
    hide, 
    step,
    EasingPresets 
} from '../composables/useGeneratorAnimation';
import GeneratorAnimator from './GeneratorAnimator.vue';

const position = ref({ x: 50, y: 50 });
const scale = ref(0.5);
const opacity = ref(0);
const rotation = ref(0);

function* complexAnimation() {
    // Step 1: Fade in
    yield show(opacity, { 
        duration: 600, 
        easing: EasingPresets.easeOut 
    });
    
    // Step 2: Scale up with bounce
    yield scaleTo(scale, 1, { 
        duration: 800, 
        easing: EasingPresets.bounceOut 
    });
    
    // Step 3: Move and rotate simultaneously
    yield step(
        moveTo(position, 200, 150, { 
            duration: 1200, 
            easing: EasingPresets.easeInOut 
        }),
        animate(rotation, { value: 360 }, { 
            duration: 1500, 
            easing: EasingPresets.easeInOut 
        })
    );
    
    // Step 4: Final effects
    yield step(
        scaleTo(scale, 1.2, { duration: 400 }),
        animate(rotation, { value: 0 }, { duration: 600 })
    );
    
    // Step 5: Fade out
    yield hide(opacity, { duration: 500 });
}
</script>

<template>
    <GeneratorAnimator :generator="complexAnimation" />
    <!-- Your content here -->
</template>
```

## Preset Animations

Use pre-built animation patterns:

```typescript
import { SimpleAnimationPresets } from '../composables/useGeneratorAnimation';

function* withPresets() {
    yield SimpleAnimationPresets.scaleIn(target, { duration: 600 });
    yield SimpleAnimationPresets.bounce(target, { duration: 400 });
    yield SimpleAnimationPresets.slideInFromLeft(target, 200, { duration: 800 });
    yield SimpleAnimationPresets.scaleOut(target, { duration: 300 });
}
```

### Available Presets
- `scaleIn(target, options)` - Scale from 0 to 1
- `scaleOut(target, options)` - Scale from current to 0
- `slideInFromLeft(target, finalX, options)` - Slide in from left
- `slideInFromRight(target, finalX, options)` - Slide in from right
- `bounce(target, options)` - Bounce effect (scale to 1.1)
- `pulse(target, options)` - Pulse effect (scale to 1.05)

## Animation Options

All functions accept optional animation properties:

```typescript
interface AnimationProps {
    duration?: number;    // Duration in milliseconds
    delay?: number;       // Delay before starting
    easing?: unknown;     // Easing function
}
```

### Easing Examples
```typescript
import { EasingPresets } from '../composables/useGeneratorAnimation';

yield animate(target, { x: 100 }, { 
    duration: 1000,
    easing: EasingPresets.bounceOut 
});

// Available easing presets:
EasingPresets.linear
EasingPresets.easeIn, easeOut, easeInOut
EasingPresets.bounceIn, bounceOut, bounceInOut
EasingPresets.elasticIn, elasticOut, elasticInOut
EasingPresets.backIn, backOut, backInOut
EasingPresets.strongIn, strongOut, strongInOut
```

## Migration Examples

### Before (Complex Context Creation)
```typescript
function* oldStyle() {
    const step1 = new AnimationContext();
    step1.animate(target, { x: 100 }, { duration: 500 });
    step1.scaleTo(scale, 1.5, { duration: 600 });
    yield step1;
    
    const step2 = new AnimationContext();
    step2.moveTo(position, 200, 100, { duration: 800 });
    yield step2;
}
```

### After (Simple Direct Yields)
```typescript
function* newStyle() {
    // Multiple animations in one step
    yield step(
        animate(target, { x: 100 }, { duration: 500 }),
        scaleTo(scale, 1.5, { duration: 600 })
    );
    
    // Single animation
    yield moveTo(position, 200, 100, { duration: 800 });
}
```

## Advanced Patterns

### Conditional Steps
```typescript
function* conditionalAnimation() {
    yield show(opacity);
    
    if (someCondition) {
        yield moveTo(position, 300, 200);
    } else {
        yield scaleTo(scale, 2);
    }
    
    yield hide(opacity);
}
```

### Loop Animations
```typescript
function* loopAnimation() {
    for (let i = 0; i < 5; i++) {
        yield moveTo(position, i * 50, i * 30, { duration: 300 });
        yield scaleTo(scale, 1 + i * 0.2, { duration: 200 });
    }
}
```

### Dynamic Animation Creation
```typescript
function* dynamicAnimation() {
    const animations = [];
    
    // Build animations dynamically
    for (const target of targets) {
        animations.push(show(target, { duration: 200 }));
    }
    
    // Yield all at once
    yield step(...animations);
}
```

This simplified syntax makes the generator-based animation system much more intuitive and concise while maintaining all the power and flexibility of the original system.
