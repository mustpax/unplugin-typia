import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnpluginTypia from "unplugin-typia/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    UnpluginTypia({}),
    react(),
  ],
});
