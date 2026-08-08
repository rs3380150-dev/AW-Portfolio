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
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion", "gsap"],
        },
      },
    },
  },
});
