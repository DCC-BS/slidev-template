import { defineConfig } from "vite";

export default defineConfig({
    optimizeDeps: {
        include: ["konva", "vue-konva"],
    },
});
