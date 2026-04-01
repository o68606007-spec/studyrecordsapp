import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import env from "vite-plugin-env-compatible";

export default defineConfig({
    plugins: [react(), env({ prefix: "VITE", mountedPath: "process.env" })],
    test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true
    }
});