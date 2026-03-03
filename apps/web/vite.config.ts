import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		port: 3000,
		open: true,
		// /api/* 요청을 백엔드 서버로 프록시 (CORS 우회)
		// vite.config.ts는 Node.js에서 실행되므로 VITE_ 접두사 없이 process.env 접근 가능
		proxy: {
			"/api": {
				target: process.env.API_URL || "http://localhost:3001",
				changeOrigin: true,
			},
		},
	},
});
