import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  oxc: {
    // Loại bỏ console.log và debugger khi ở chế độ Production (Vite v8 / Oxc)
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
            if (id.includes("react-quill") || id.includes("quill")) return "vendor-editor";
            if (id.includes("mammoth")) return "vendor-docx";
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler"))
              return "vendor-react";
            return "vendor";
          }
        },
      },
    },
  },
}))
