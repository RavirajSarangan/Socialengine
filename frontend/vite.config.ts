import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        strictPort: false,
    },
    // sockjs-client expects a Node-style `global`; map it to the browser global.
    define: { global: "globalThis" },
});
