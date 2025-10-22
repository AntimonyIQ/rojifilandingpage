import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: ["rojifiapp.onrender.com"]
  }
});
