import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: replace with your repo name
export default defineConfig({
  plugins: [react()],
  base: "/tb-citadel-calculator/",
});
