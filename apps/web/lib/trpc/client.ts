import type { AppRouter } from "@repo/trpc/router";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

/**
 * tRPC + TanStack React Query 컨텍스트 생성
 * - AppRouter 타입을 전달하여 end-to-end 타입 안전성 확보
 * - TRPCProvider: React 컨텍스트 Provider 컴포넌트
 * - useTRPC: 컴포넌트에서 tRPC 쿼리/뮤테이션 옵션을 생성하는 훅
 * - useTRPCClient: tRPC 클라이언트 인스턴스에 직접 접근하는 훅
 */
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// 60초 동안은 동일 쿼리 재요청 시 캐시된 데이터를 사용
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

/**
 * SSR 환경에서 안전한 QueryClient 생성 함수
 * - 서버: 매 요청마다 새 QueryClient 생성 (사용자 간 캐시 데이터 공유/누수 방지)
 * - 브라우저: 싱글턴으로 한 번만 생성 후 앱이 살아있는 동안 재사용
 */
export function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

/**
 * tRPC 클라이언트 인스턴스
 * - httpBatchLink: tRPC 요청을 배치로 묶어 하나의 HTTP 요청으로 전송
 * - 상태(캐시)를 갖지 않으므로 모듈 스코프에 선언해도 SSR 데이터 누수 문제 없음
 */
export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "/api/trpc",
		}),
	],
});
