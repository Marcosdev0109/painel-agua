import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O site é publicado em https://marcosdev0109.github.io/painel-agua/
export default defineConfig({
  plugins: [react()],
  base: "/painel-agua/",
});
