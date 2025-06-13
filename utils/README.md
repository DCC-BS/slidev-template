# Konva Shape Connector Utils

A comprehensive utility library for creating connections between shapes in Konva.js with support for different anchor points, connection types, and line styles.

## Features

- **Multiple Anchor Points**: Connect shapes from any side (left, right, top, bottom, center)
- **Connection Types**: Straight, curved, and orthogonal (right-angle) connections
- **Line Types**: Simple lines, arrows, and double arrows
- **Smart Connections**: Automatically choose optimal anchor points
- **Interactive Updates**: Update connections when shapes move
- **Highly Customizable**: Configure colors, stroke width, dash patterns, and more

## Quick Start

```typescript
import { createConnection, createSmartConnection } from '../utils/shapeConnector';

// Define your shapes
const shape1 = { x: 100, y: 100, width: 80, height: 60 };
const shape2 = { x: 300, y: 200, width: 100, height: 80 };

// Create a simple arrow connection
const arrow = createConnection({
  fromShape: shape1,
  toShape: shape2,
  fromAnchor: 'right',
  toAnchor: 'left',
  connectionType: 'straight',
  lineType: 'arrow',
  config: {
    stroke: 'red',
    strokeWidth: 2
  }
});

// Add to your Konva layer
layer.add(arrow);
```

## API Reference

### Types

```typescript
type AnchorPoint = 'left' | 'right' | 'top' | 'bottom' | 'center';
type ConnectionType = 'straight' | 'curved' | 'orthogonal';
type LineType = 'line' | 'arrow' | 'double-arrow';

interface Shape {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ConnectionConfig {
  stroke?: string;          // Line color
  strokeWidth?: number;     // Line thickness
  dash?: number[];          // Dash pattern [dash, gap]
  fill?: string;            // Arrow fill color
  pointerLength?: number;   // Arrow head length
  pointerWidth?: number;    // Arrow head width
  tension?: number;         // Curve tension (0-1)
  cornerRadius?: number;    // Orthogonal corner radius
}
```

### Core Functions

#### `createConnection(options: ConnectionOptions)`

Creates a connection between two shapes with full customization.

```typescript
const connection = createConnection({
  fromShape: shape1,
  toShape: shape2,
  fromAnchor: 'right',
  toAnchor: 'left',
  connectionType: 'curved',
  lineType: 'arrow',
  config: {
    stroke: 'blue',
    strokeWidth: 3,
    tension: 0.5,
    pointerLength: 15
  }
});
```

#### `createSmartConnection(fromShape, toShape, connectionType?, lineType?, config?)`

Automatically chooses the best anchor points based on shape positions.

```typescript
const smartArrow = createSmartConnection(
  shape1,
  shape2,
  'orthogonal',
  'double-arrow',
  { stroke: 'green', strokeWidth: 2 }
);
```

#### `updateConnection(connection, options)`

Updates an existing connection when shapes move (useful for interactive diagrams).

```typescript
// When a shape moves:
shape1.x = newX;
shape1.y = newY;

updateConnection(connection, {
  fromShape: shape1,
  toShape: shape2,
  fromAnchor: 'right',
  toAnchor: 'left',
  connectionType: 'straight',
  lineType: 'arrow'
});
```

#### `getAnchorPoint(shape, anchor)`

Get the coordinates of a specific anchor point on a shape.

```typescript
const rightAnchor = getAnchorPoint(shape, 'right');
// Returns: { x: number, y: number }
```

#### `getOptimalAnchorPoints(fromShape, toShape)`

Determine the best anchor points for connecting two shapes.

```typescript
const { fromAnchor, toAnchor } = getOptimalAnchorPoints(shape1, shape2);
```

## Connection Types

### Straight Connections
Direct line between anchor points.
```typescript
connectionType: 'straight'
```

### Curved Connections
Smooth bezier curves with configurable tension.
```typescript
connectionType: 'curved'
config: { tension: 0.5 } // 0 = straight, 1 = very curved
```

### Orthogonal Connections
Right-angle connections like flowcharts.
```typescript
connectionType: 'orthogonal'
config: { cornerRadius: 10 } // Optional rounded corners
```

## Line Types

### Simple Line
```typescript
lineType: 'line'
```

### Arrow
Line with arrowhead at the end.
```typescript
lineType: 'arrow'
config: {
  pointerLength: 12,
  pointerWidth: 10
}
```

### Double Arrow
Line with arrowheads at both ends.
```typescript
lineType: 'double-arrow'
```

## Styling Options

### Basic Styling
```typescript
config: {
  stroke: 'red',           // Line color
  strokeWidth: 3,          // Line thickness
  fill: 'darkred'          // Arrow fill (defaults to stroke color)
}
```

### Dashed Lines
```typescript
config: {
  dash: [10, 5],           // 10px dash, 5px gap
  stroke: 'blue',
  strokeWidth: 2
}
```

### Custom Arrows
```typescript
config: {
  pointerLength: 20,       // Arrow head length
  pointerWidth: 15,        // Arrow head width
  stroke: 'green',
  fill: 'lightgreen'       // Different fill color
}
```

## Examples

### Interactive Diagram
```typescript
// Create connections that update when shapes move
const connections = [];

function createInteractiveConnection(from, to) {
  const connection = createConnection({
    fromShape: from,
    toShape: to,
    fromAnchor: 'right',
    toAnchor: 'left',
    connectionType: 'orthogonal',
    lineType: 'arrow'
  });
  
  connections.push({ connection, from, to });
  return connection;
}

function updateAllConnections() {
  connections.forEach(({ connection, from, to }) => {
    updateConnection(connection, {
      fromShape: from,
      toShape: to,
      fromAnchor: 'right',
      toAnchor: 'left',
      connectionType: 'orthogonal',
      lineType: 'arrow'
    });
  });
}
```

### Multiple Connection Styles
```typescript
const connections = [
  // Red straight arrow
  createConnection({
    fromShape: rect1,
    toShape: rect2,
    fromAnchor: 'right',
    toAnchor: 'left',
    connectionType: 'straight',
    lineType: 'arrow',
    config: { stroke: 'red', strokeWidth: 2 }
  }),
  
  // Blue curved line
  createConnection({
    fromShape: rect2,
    toShape: circle1,
    fromAnchor: 'bottom',
    toAnchor: 'top',
    connectionType: 'curved',
    lineType: 'line',
    config: { stroke: 'blue', tension: 0.4 }
  }),
  
  // Green orthogonal double arrow
  createConnection({
    fromShape: circle1,
    toShape: rect3,
    fromAnchor: 'right',
    toAnchor: 'bottom',
    connectionType: 'orthogonal',
    lineType: 'double-arrow',
    config: { stroke: 'green', dash: [5, 5] }
  })
];
```

## Best Practices

1. **Use Smart Connections** for automatic anchor point selection when you don't need precise control.

2. **Update Connections** when shapes move to maintain visual consistency.

3. **Choose Appropriate Connection Types**:
   - Use `straight` for simple direct connections
   - Use `curved` for organic, flowing diagrams
   - Use `orthogonal` for technical diagrams and flowcharts

4. **Group Related Connections** for easier management:
   ```typescript
   const diagramConnections = createMultipleConnections([
     { fromShape: a, toShape: b, ... },
     { fromShape: b, toShape: c, ... },
     // ...
   ]);
   ```

5. **Consistent Styling** across your diagram for better visual hierarchy.

## Vue.js Integration

The utility works seamlessly with vue-konva:

```vue
<template>
  <v-stage :config="stageConfig">
    <v-layer>
      <!-- Your shapes -->
      <v-rect v-for="shape in shapes" :key="shape.id" v-bind="shape" />
    </v-layer>
  </v-stage>
</template>

<script setup>
import { createConnection } from '../utils/shapeConnector';

onMounted(() => {
  const layer = stage.children[0];
  const connection = createConnection(/* options */);
  layer.add(connection);
  layer.draw();
});
</script>
```
