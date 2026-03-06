import { Request, Response } from "express";
import { session, user } from "./auth/schema";

/**
 * TRPC 프로시저에서 사용하는 컨텍스트 타입
 * - AppContext(create)에서 req/res가 설정되고
 * - AuthTRPCMiddleware에서 인증 후 user/session이 추가됨
 * - @Ctx() 데코레이터로 프로시저에서 타입 안전하게 접근 가능
 */
export interface AppContext {
	req: Request;
	res: Response;
	user: typeof user.$inferSelect;
	session: typeof session.$inferSelect;
}
