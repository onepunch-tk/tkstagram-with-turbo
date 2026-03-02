import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
	/**
	 * 헬스체크 엔드포인트 (GET /)
	 * - 서버가 정상 작동 중인지 확인하는 용도
	 * - @AllowAnonymous() 데코레이터로 전역 AuthGuard를 우회하여 인증 없이 접근 가능
	 *   (JWT 쿠키 검증을 건너뜀)
	 */
	@Get()
	@AllowAnonymous()
	health() {
		return true;
	}
}
