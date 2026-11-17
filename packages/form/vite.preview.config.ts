import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  root: "tests",
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["react", "react-dom/client", "@tanstack/react-form"],
  },
  server: { host: "127.0.0.1", port: 43132, strictPort: true },
});
