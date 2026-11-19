import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  root: "tests",
  optimizeDeps: {
    include: [
      "react",
      "react-dom/client",
      "radix-ui",
      "sonner",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  plugins: [react(), tailwindcss()],
  server: { host: "127.0.0.1", port: 43131, strictPort: true },
});
