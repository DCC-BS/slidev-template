<script setup lang="ts">
import Konva from 'konva';
import { ref, onMounted } from 'vue';
import {
    createConnection,
    updateConnection,
    type Shape,
    type ConnectionOptions
} from '../utils/shapeConnector';

const stageConfig = {
    width: 800,
    height: 500,
} as Konva.StageConfig;

const stageRef = ref<any>(null);

// Reactive shape positions
const shapes = ref({
    rect1: { x: 100, y: 100, width: 80, height: 60 },
    rect2: { x: 400, y: 300, width: 100, height: 80 },
    circle1: { x: 200, y: 300, width: 80, height: 80 }
});

const connections = ref<{
    connection: any;
    options: ConnectionOptions;
}[]>([]);

onMounted(() => {
    if (stageRef.value) {
        const stage = stageRef.value.getNode();
        const layer = stage.children[0];

        // Create connections
        const connectionConfigs: ConnectionOptions[] = [
            {
                fromShape: shapes.value.rect1,
                toShape: shapes.value.rect2,
                fromAnchor: 'right',
                toAnchor: 'left',
                connectionType: 'orthogonal',
                lineType: 'arrow',
                config: {
                    stroke: 'red',
                    strokeWidth: 2,
                    pointerLength: 12,
                    pointerWidth: 10
                }
            },
            {
                fromShape: shapes.value.circle1,
                toShape: shapes.value.rect2,
                fromAnchor: 'top',
                toAnchor: 'bottom',
                connectionType: 'curved',
                lineType: 'double-arrow',
                config: {
                    stroke: 'blue',
                    strokeWidth: 2,
                    tension: 0.4,
                    pointerLength: 10,
                    pointerWidth: 8
                }
            },
            {
                fromShape: shapes.value.rect1,
                toShape: shapes.value.circle1,
                fromAnchor: 'bottom',
                toAnchor: 'left',
                connectionType: 'straight',
                lineType: 'line',
                config: {
                    stroke: 'green',
                    strokeWidth: 2,
                    dash: [10, 5]
                }
            }
        ];

        // Create and store connections
        connectionConfigs.forEach(options => {
            const connection = createConnection(options);
            layer.add(connection);
            connections.value.push({ connection, options });
        });

        layer.draw();
    }
});

// Update connections when shapes move
const updateConnections = () => {
    connections.value.forEach(({ connection, options }) => {
        // Update the shape references in options
        const updatedOptions = {
            ...options,
            fromShape: getShapeByRef(options.fromShape),
            toShape: getShapeByRef(options.toShape)
        };
        updateConnection(connection, updatedOptions);
    });

    if (stageRef.value) {
        const stage = stageRef.value.getNode();
        const layer = stage.children[0];
        layer.draw();
    }
};

// Helper to get current shape position
const getShapeByRef = (originalShape: Shape): Shape => {
    if (originalShape === shapes.value.rect1) return shapes.value.rect1;
    if (originalShape === shapes.value.rect2) return shapes.value.rect2;
    if (originalShape === shapes.value.circle1) return shapes.value.circle1;
    return originalShape;
};

// Handle shape drag
const handleDrag = (shapeKey: keyof typeof shapes.value, event: any) => {
    shapes.value[shapeKey].x = event.target.x();
    shapes.value[shapeKey].y = event.target.y();
    updateConnections();
};

</script>

<template>
    <div>
        <h3 class="mb-4 text-lg font-semibold">Interactive Konva Shape Connections</h3>
        <!-- <div class="mb-4 text-sm text-gray-600">
            <p><strong>Drag the shapes</strong> to see the connections update in real-time!</p>
            <p><strong>Red Arrow:</strong> Orthogonal connection</p>
            <p><strong>Blue Double Arrow:</strong> Curved connection</p>
            <p><strong>Green Dashed Line:</strong> Straight connection</p>
        </div> -->
        <v-stage ref="stageRef" class="bg-gray-100 border-2 border-gray-300 rounded" :config="stageConfig">
            <v-layer>
                <!-- Draggable Rectangle 1 -->
                <v-rect :x="shapes.rect1.x" :y="shapes.rect1.y" :width="shapes.rect1.width"
                    :height="shapes.rect1.height" fill="red" stroke="darkred" strokeWidth="2" draggable
                    @dragmove="handleDrag('rect1', $event)" />
                <v-text :x="shapes.rect1.x + 10" :y="shapes.rect1.y + 25" text="Drag Me!" fontSize="12" fill="white"
                    fontStyle="bold" />

                <!-- Draggable Rectangle 2 -->
                <v-rect :x="shapes.rect2.x" :y="shapes.rect2.y" :width="shapes.rect2.width"
                    :height="shapes.rect2.height" fill="orange" stroke="darkorange" strokeWidth="2" draggable
                    @dragmove="handleDrag('rect2', $event)" />
                <v-text :x="shapes.rect2.x + 20" :y="shapes.rect2.y + 35" text="Drag Me!" fontSize="12" fill="white"
                    fontStyle="bold" />

                <!-- Draggable Circle -->
                <v-circle :x="shapes.circle1.x + shapes.circle1.width / 2"
                    :y="shapes.circle1.y + shapes.circle1.height / 2" :radius="shapes.circle1.width / 2" fill="blue"
                    stroke="darkblue" strokeWidth="2" draggable @dragmove="(e) => {
                        shapes.circle1.x = e.target.x() - shapes.circle1.width / 2;
                        shapes.circle1.y = e.target.y() - shapes.circle1.height / 2;
                        updateConnections();
                    }" />
                <v-text :x="shapes.circle1.x + shapes.circle1.width / 2 - 25"
                    :y="shapes.circle1.y + shapes.circle1.height / 2 - 6" text="Drag Me!" fontSize="12" fill="white"
                    fontStyle="bold" />
            </v-layer>
        </v-stage>

        <!-- Controls for different connection types -->
        <div class="mt-4 p-4 bg-gray-50 rounded">
            <h4 class="font-semibold mb-2">Connection Types Available:</h4>
            <ul class="text-sm space-y-1">
                <li><strong>Straight:</strong> Direct line between anchor points</li>
                <li><strong>Curved:</strong> Smooth bezier curve with configurable tension</li>
                <li><strong>Orthogonal:</strong> Right-angle connections (like flowcharts)</li>
            </ul>

            <h4 class="font-semibold mb-2 mt-4">Line Types Available:</h4>
            <ul class="text-sm space-y-1">
                <li><strong>Line:</strong> Simple line without arrows</li>
                <li><strong>Arrow:</strong> Line with arrow at the end</li>
                <li><strong>Double Arrow:</strong> Line with arrows at both ends</li>
            </ul>

            <h4 class="font-semibold mb-2 mt-4">Anchor Points Available:</h4>
            <ul class="text-sm space-y-1">
                <li><strong>left, right, top, bottom, center</strong></li>
            </ul>
        </div>
    </div>
</template>


Clients: Interface between LLM-powered applications (like chatbots or IDEs) and MCP servers. They handle connections,
security, and translate requests.
