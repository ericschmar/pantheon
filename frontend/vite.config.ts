import { defineConfig } from "vite";
import { cjsInterop } from "vite-plugin-cjs-interop";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cjsInterop({
      dependencies: ["@fluentui/react-components"],
    }),
  ],
  build: {
    outDir: "build",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@state": path.resolve(__dirname, "./src/state"),
    },
  },
});
