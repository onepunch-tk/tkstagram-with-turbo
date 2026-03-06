import { Injectable } from "@nestjs/common";
import { ContextOptions, TRPCContext } from "nestjs-trpc";

/**
 * TRPC 컨텍스트 프로바이더
 * - 모든 TRPC 프로시저 실행 전에 create()가 호출되어 공유 컨텍스트 객체를 생성
 * - Express의 req/res를 컨텍스트에 포함시켜 미들웨어와 프로시저에서 접근 가능하게 함
 * - TRPCModule.forRoot({ context: AppContext })로 등록
 */
@Injectable()
export class AppContext implements TRPCContext {
	create(opts: ContextOptions): Record<string, unknown> {
		return {
			req: opts.req,
			res: opts.res,
		};
	}
}
