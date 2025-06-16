<script setup lang="ts">
import Konva from 'konva';
import { ref, onMounted } from 'vue';
import {
    createConnection,
    createSmartConnection,
    updateConnection,
    type Shape,
    type AnchorPoint,
    type ConnectionType,
    type LineType
} from '../utils/shapeConnector';

const stageConfig = {
    width: 1600,
    height: 900,
} as Konva.StageConfig;

const stageRef = ref<any>(null);
const connections = ref<any[]>([]);

// Define shapes for connection
const rect1: Shape = { x: 100, y: 100, width: 150, height: 120 };
const rect2: Shape = { x: 600, y: 400, width: 180, height: 100 };
const circle1: Shape = { x: 300, y: 400, width: 120, height: 120 }; // Circle as rect for anchor calculation
const rect3: Shape = { x: 1000, y: 200, width: 150, height: 80 };

onMounted(() => {
    if (stageRef.value) {
        const stage = stageRef.value.getNode();
        const layer = stage.children[0];

        // Create different types of connections
        const connections_list = [
            // Straight arrow from rect1 right to rect2 left
            createConnection({
                fromShape: rect1,
                toShape: rect2,
                fromAnchor: 'right',
                toAnchor: 'left',
                connectionType: 'straight',
                lineType: 'arrow',
                config: {
                    stroke: 'red',
                    strokeWidth: 3,
                    pointerLength: 15,
                    pointerWidth: 12
                }
            }),

            // Curved line from circle1 top to rect3 bottom
            createConnection({
                fromShape: circle1,
                toShape: rect3,
                fromAnchor: 'top',
                toAnchor: 'bottom',
                connectionType: 'curved',
                lineType: 'line',
                config: {
                    stroke: 'blue',
                    strokeWidth: 2,
                    tension: 0.5
                }
            }),

            // Orthogonal double arrow from rect2 top to rect3 left
            createConnection({
                fromShape: rect2,
                toShape: rect3,
                fromAnchor: 'top',
                toAnchor: 'left',
                connectionType: 'orthogonal',
                lineType: 'double-arrow',
                config: {
                    stroke: 'green',
                    strokeWidth: 2,
                    pointerLength: 10,
                    pointerWidth: 8
                }
            }),

            // Smart connection (automatically chooses best anchor points)
            createSmartConnection(
                rect1,
                circle1,
                'curved',
                'arrow',
                {
                    stroke: 'purple',
                    strokeWidth: 2,
                    dash: [5, 5],
                    tension: 0.3
                }
            )
        ];

        // Add all connections to the layer
        connections_list.forEach(connection => {
            layer.add(connection);
            connections.value.push(connection);
        });

        layer.draw();
    }
});

</script>

<template>
    <div>
        <h3 class="mb-4 text-lg font-semibold">Konva Shape Connector Demo</h3>
        <v-stage ref="stageRef" :config="stageConfig">
            <v-layer>
                <!-- Rectangle 1 -->
                <v-rect :x="100" :y="100" :width="150" :height="120" fill="red" stroke="black" strokeWidth="2" />
                <v-text :x="160" :y="155" text="Rect 1" fontSize="14" fill="white" />

                <!-- Rectangle 2 -->
                <v-rect :x="600" :y="400" :width="180" :height="100" fill="orange" stroke="black" strokeWidth="2" />
                <v-text :x="675" :y="445" text="Rect 2" fontSize="14" fill="white" />

                <!-- Circle -->
                <v-circle :x="360" :y="460" :radius="60" fill="blue" stroke="black" strokeWidth="2" />
                <v-text :x="340" :y="455" text="Circle" fontSize="14" fill="white" />

                <!-- Rectangle 3 -->
                <v-rect :x="1000" :y="200" :width="150" :height="80" fill="green" stroke="black" strokeWidth="2" />
                <v-text :x="1060" :y="235" text="Rect 3" fontSize="14" fill="white" />
            </v-layer>
        </v-stage>
    </div>
</template>