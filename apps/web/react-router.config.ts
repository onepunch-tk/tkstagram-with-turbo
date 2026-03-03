import type { Config } from "@react-router/dev/config";

export default {
	ssr: true,
	future: {
		// 라우트 미들웨어 기능 활성화 (인증 체크 등에 사용)
		// https://reactrouter.com/how-to/middleware
		v8_middleware: true,
	},
} satisfies Config;
