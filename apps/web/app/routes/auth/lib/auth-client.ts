// BetterAuth React 클라이언트 - 백엔드의 BetterAuth API를 호출하는 SDK
// signUp, signIn, useSession 등 인증 관련 메서드와 훅을 제공
// basePath는 Vite proxy를 통해 백엔드 /api/auth/* 엔드포인트로 전달됨
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	basePath: "api/auth",
});
