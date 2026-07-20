import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: { useFsEvents: false, usePolling: true },
  },
  preview: {
    port: 3000,
    host: true,
  },
});
