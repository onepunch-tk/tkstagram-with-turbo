import { index, layout, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	// 공개 라우트 - 인증 미들웨어 적용 안 됨
	route("signup", "routes/auth/pages/signup.tsx"),
	route("login", "routes/auth/pages/login.tsx"),

	// 보호 라우트 - auth.layout의 미들웨어가 세션 쿠키를 확인하여 미인증 시 /login으로 리다이렉트
	layout("routes/layouts/auth.layout.tsx", [index("routes/home/pages/home.tsx")]),
] satisfies RouteConfig;
