import slidevClicks from "slidev-clicks/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [slidevClicks()],
    base: process.env.NODE_ENV === 'production' 
        ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1]}/`
        : '/',
});
