import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" hace los assets relativos: funciona en GitHub Pages (/volt-landing/)
// y en un dominio propio sin tocar nada.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
  },
});
