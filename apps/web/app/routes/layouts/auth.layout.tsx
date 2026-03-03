// 인증 보호 레이아웃 - 하위 라우트 접근 시 BetterAuth 세션 쿠키를 확인
// 쿠키 존재 여부만 확인하며, 실제 JWT 검증은 백엔드 AuthGuard에서 수행
// https://reactrouter.com/how-to/middleware
import { getSessionCookie } from "better-auth/cookies";
import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/auth.layout";

const authMiddleware = async ({ request }: { request: Request }, next: () => Promise<Response>) => {
	const sessionCookie = await getSessionCookie(request);

	if (!sessionCookie) {
		return redirect("/login");
	}

	return next();
};

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

// 클라이언트 내비게이션 시 .data 요청을 강제하여 서버 미들웨어가 항상 실행되도록 함
// 빈 loader가 없으면 자식 라우트에 loader가 없을 때 서버 미들웨어가 건너뛰어짐
// https://reactrouter.com/how-to/middleware#when-does-middleware-run
export const loader = () => {
	return null;
};

export default function AuthLayout() {
	return <Outlet />;
}
