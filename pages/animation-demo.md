---
layout: default
---

# Konva Animation System Demo

<div class="grid grid-cols-2 gap-8 h-full">

<div>

## Features

- 🎬 **PowerPoint-like morphing** between states
- 🎯 **Smart click integration** with Slidev
- ⚡ **Skip animations** when advancing quickly  
- ↩️ **Backward navigation** support
- 🎨 **Multiple easing functions** available
- 🔧 **Easy to use** API

<v-click>

### Simple Usage
```vue
<SimpleAnimator 
  :steps="animationSteps"
  :targets="[block1, block2]"
  :initial-states="initialStates"
/>
```

</v-click>

<v-click>

### Advanced Usage
```vue
const { currentStep, totalSteps } = useKonvaAnimation([
  createAnimationTarget(block, initialState, steps)
]);
```

</v-click>

</div>

<div>
  <AnimationDemo />
</div>

</div>

---

# Simple Animation Example

<SimpleAnimationExample />

---

# Original TextMate Architecture

<TextMateArchitecture />
