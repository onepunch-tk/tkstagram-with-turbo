import { Injectable } from "@nestjs/common";
import { AuthService } from "@thallesp/nestjs-better-auth";
import { Request, Response } from "express";
import { MiddlewareOptions, TRPCMiddleware } from "nestjs-trpc";

/**
 * TRPC 인증 미들웨어
 * - HTTP 라우트에는 전역 AuthGuard가 자동 적용되지만, TRPC 라우트에는 적용되지 않음
 * - 이 미들웨어를 @UseMiddlewares()로 라우터/프로시저에 적용하여 인증 처리
 * - Express 요청의 쿠키에서 BetterAuth JWT를 검증하고, 유효하면 user/session을 컨텍스트에 전달
 */
@Injectable()
export class AuthTRPCMiddleware implements TRPCMiddleware {
	constructor(private readonly authServcie: AuthService) {}

	async use(opts: MiddlewareOptions<{ req: Request; res: Response }>) {
		const { ctx, next } = opts;

		try {
			// BetterAuth API로 세션 쿠키 검증
			// Express IncomingHttpHeaders → 웹 표준 Headers로 변환 (string[] → string join)
			const session = await this.authServcie.api.getSession({
				headers: new Headers(
					Object.entries(ctx.req.headers).reduce(
						(acc, [key, value]) => {
							if (value !== undefined) {
								acc[key] = Array.isArray(value) ? value.join(", ") : value;
							}
							return acc;
						},
						{} as Record<string, string>,
					),
				),
			});

			if (session?.user && session.session) {
				// 인증 성공: user와 session을 컨텍스트에 추가하여 프로시저에서 사용 가능하게 함
				return next({
					ctx: {
						...ctx,
						user: session.user,
						session: session.session,
					},
				});
			}

			throw new Error("Unauthorized");
		} catch (_err) {
			throw new Error("Unauthorized");
		}
	}
}
