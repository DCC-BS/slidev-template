# Konva Animation System for Slidev

This animation system provides PowerPoint-like morphing capabilities for Konva graphics in Slidev presentations. It automatically handles:

- ✅ Automatic v-click components for each animation step
- ✅ Skip animations when advancing quickly
- ✅ Smooth transitions with various easing functions
- ✅ Backward navigation support
- ✅ Integration with Slidev's click system

## Quick Start

### 1. Simple Animation with SimpleAnimator

```vue
<script setup>
import { ref } from 'vue';
import SimpleAnimator from './components/SimpleAnimator.vue';
import Graphic from './components/Graphic.vue';

const blocks = ref([
  { x: 100, y: 100, width: 150, height: 100, text: 'Block 1' },
  { x: 400, y: 100, width: 150, height: 100, text: 'Block 2' }
]);

const animationSteps = [
  {
    targets: [
      {
        index: 0, // blocks[0]
        properties: { x: 200, y: 150 },
        duration: 1000,
        easing: Konva.Easings.EaseOut
      }
    ]
  },
  {
    targets: [
      {
        index: 0,
        properties: { width: 200, height: 130 },
        duration: 800
      },
      {
        index: 1,
        properties: { x: 300, y: 150 },
        duration: 800,
        delay: 200
      }
    ]
  }
];

const initialStates = [
  { x: 100, y: 100, width: 150, height: 100 },
  { x: 400, y: 100, width: 150, height: 100 }
];
</script>

<template>
  <SimpleAnimator 
    :steps="animationSteps"
    :targets="[blocks[0], blocks[1]]"
    :initial-states="initialStates"
  />
  <Graphic :blocks="blocks" :connections="connections" />
</template>
```

### 2. Advanced Animation with useKonvaAnimation

```vue
<script setup>
import { ref } from 'vue';
import { useKonvaAnimation, createAnimationTarget, createAnimationStep } from '../composables/useKonvaAnimation';
import Konva from 'konva';

const blocks = ref([
  { x: 100, y: 100, width: 150, height: 100, text: 'Block 1' }
]);

const { currentStep, totalSteps, isAnimating } = useKonvaAnimation([
  createAnimationTarget(
    blocks.value[0], // Target object
    { x: 100, y: 100, width: 150, height: 100 }, // Initial state
    [
      // Animation steps
      createAnimationStep(
        { x: 300, y: 200 }, // Properties to animate
        { 
          duration: 1000, 
          easing: Konva.Easings.EaseInOut,
          delay: 200 
        }
      ),
      createAnimationStep(
        { width: 200, height: 150 },
        { duration: 800, easing: Konva.Easings.BackEaseOut }
      )
    ]
  )
], {
  skipThreshold: 300, // Skip if advancing within 300ms
  defaultDuration: 1000,
  defaultEasing: Konva.Easings.EaseInOut
});
</script>

<template>
  <!-- v-click components are automatically generated -->
  <v-click v-for="step in totalSteps" :key="step">
    <!-- Empty for Slidev integration -->
  </v-click>
  
  <Graphic :blocks="blocks" />
</template>
```

## Animation Properties

### Basic Properties
- `x`, `y` - Position
- `width`, `height` - Size
- `scaleX`, `scaleY` - Scale
- `rotation` - Rotation in degrees
- `opacity` - Transparency (0-1)

### Timing Properties
- `duration` - Animation duration in milliseconds (default: 1000)
- `delay` - Delay before animation starts in milliseconds (default: 0)
- `easing` - Easing function (default: `Konva.Easings.EaseInOut`)

### Available Easing Functions
```javascript
Konva.Easings.Linear
Konva.Easings.EaseIn
Konva.Easings.EaseOut
Konva.Easings.EaseInOut
Konva.Easings.BackEaseIn
Konva.Easings.BackEaseOut
Konva.Easings.BackEaseInOut
Konva.Easings.ElasticEaseIn
Konva.Easings.ElasticEaseOut
Konva.Easings.ElasticEaseInOut
Konva.Easings.BounceEaseIn
Konva.Easings.BounceEaseOut
Konva.Easings.BounceEaseInOut
Konva.Easings.StrongEaseIn
Konva.Easings.StrongEaseOut
Konva.Easings.StrongEaseInOut
```

## Features

### Automatic v-click Integration
The system automatically creates the necessary `<v-click>` components for Slidev integration. Each animation step gets its own click.

### Smart Animation Skipping
If you advance slides quickly (within the `skipThreshold` time), animations are skipped and the final state is applied immediately.

### Backward Navigation
When going backward in slides, the system instantly applies the correct state for that step.

### Multiple Target Animation
You can animate multiple objects simultaneously with different timings and easing functions.

## Configuration Options

### useKonvaAnimation Options
```typescript
{
  skipThreshold: 300,     // Time in ms to skip animations
  defaultDuration: 1000,  // Default animation duration
  defaultEasing: Konva.Easings.EaseInOut // Default easing function
}
```

### SimpleAnimator Props
```typescript
{
  steps: AnimationStep[],           // Array of animation steps
  targets: any[],                   // Array of reactive objects to animate
  initialStates: Record<string, any>[], // Initial state for each target
  skipThreshold?: number,           // Time threshold for skipping
  defaultDuration?: number          // Default duration for animations
}
```

## Examples

### Example 1: Simple Movement
```javascript
const steps = [
  {
    targets: [
      {
        index: 0,
        properties: { x: 300 },
        duration: 1000,
        easing: Konva.Easings.EaseOut
      }
    ]
  }
];
```

### Example 2: Complex Morphing
```javascript
const steps = [
  {
    targets: [
      {
        index: 0,
        properties: { x: 200, y: 150, width: 180 },
        duration: 800,
        easing: Konva.Easings.BackEaseOut
      },
      {
        index: 1,
        properties: { opacity: 0.5, scaleY: 0.8 },
        duration: 600,
        easing: Konva.Easings.EaseIn,
        delay: 200
      }
    ]
  }
];
```

### Example 3: Sequential Animations
```javascript
const steps = [
  // Step 1: Move first block
  {
    targets: [{ index: 0, properties: { x: 200 }, duration: 500 }]
  },
  // Step 2: Move second block (after first is done)
  {
    targets: [{ index: 1, properties: { x: 200 }, duration: 500 }]
  },
  // Step 3: Scale both
  {
    targets: [
      { index: 0, properties: { width: 200 }, duration: 400 },
      { index: 1, properties: { width: 200 }, duration: 400 }
    ]
  }
];
```

## Best Practices

1. **Use meaningful durations**: 300-1200ms work well for most animations
2. **Add delays for sequential effects**: Creates more professional-looking animations
3. **Choose appropriate easing**: `EaseInOut` for movement, `BackEaseOut` for emphasis
4. **Keep skipThreshold reasonable**: 300-500ms gives good user control
5. **Test backward navigation**: Ensure animations work smoothly in both directions
6. **Use consistent timing**: Similar animations should have similar durations

## Troubleshooting

### Animations not triggering
- Ensure `<v-click>` components are present
- Check that `totalSteps` matches your animation steps
- Verify Slidev is properly detecting clicks

### Performance issues
- Reduce animation complexity for large numbers of objects
- Use shorter durations for complex animations
- Consider using `opacity` instead of showing/hiding elements

### Easing function errors
- Use `Konva.Easings.*` functions, not custom easing functions
- Ensure Konva is properly imported

### Backward navigation issues
- Verify initial states are correctly defined
- Check that all animated properties have initial values
