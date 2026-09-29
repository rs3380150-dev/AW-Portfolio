const { defineConfig } = require("vite");
const reactPlugin = require("@vitejs/plugin-react");
const path = require("path");

const react = reactPlugin.default || reactPlugin;

module.exports = defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "REACT_APP_", "web3form_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    minify: "oxc",
    sourcemap: false,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](framer-motion|gsap|motion-dom|motion-utils)[\\/]/.test(id)) return "motion";
          return undefined;
        },
      },
    },
  },
});
