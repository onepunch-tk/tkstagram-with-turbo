import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { getQueryClient, TRPCProvider as NativeTRPCProvider, trpcClient } from "@/lib/trpc/client";

/**
 * tRPC + TanStack React Query Provider
 * - QueryClientProvider: TanStack React Query의 캐시 관리 컨텍스트 제공
 * - TRPCProvider: tRPC 클라이언트를 React 컨텍스트로 주입하여 하위 컴포넌트에서 사용 가능하게 함
 * - getQueryClient()로 SSR 안전한 QueryClient를 가져와 양쪽 Provider에 전달
 */
export default function TRPCProvider({ children }: PropsWithChildren) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<NativeTRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</NativeTRPCProvider>
		</QueryClientProvider>
	);
}
