import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwind(), tanstackStart(), react()],
  server: {
    host: "127.0.0.1",
    port: 43120,
    strictPort: true,
    proxy: { "/api": { target: "http://127.0.0.1:43121" } },
  },
});
