import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path" // 1. Import thư viện path

export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    proxy: {
      // Khi frontend gọi proxy bắt đầu bằng '/api', Vite sẽ tự chuyển hướng
      '/api': {
        // Port backend lấy từ .env (docs/API.md dùng 4000), fallback 4000
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }}},
  resolve: {
    alias: {
      // import.meta.dirname — tương thích ESM ("type": "module"), thay cho __dirname
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Tách thư viện nặng ra chunk riêng → cache được, load nhanh hơn
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
})
