import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard, AuthModule } from "@thallesp/nestjs-better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { DATABASE_CONNECTION } from "./database/database-connection";

@Module({
	imports: [
		// .env 파일에서 환경변수를 읽어오는 ConfigModule 초기화
		ConfigModule.forRoot(),
		// Drizzle ORM 데이터베이스 연결을 관리하는 모듈
		DatabaseModule,
		/**
		 * BetterAuth 인증 모듈 설정
		 * - forRootAsync를 사용하여 NestJS 의존성 주입(DI)으로 동적 설정 가능
		 * - DatabaseModule을 import하여 useFactory에서 Drizzle ORM 인스턴스를 주입받음
		 * - BetterAuth가 자동으로 /api/auth/* 경로에 인증 관련 엔드포인트를 생성
		 *   (회원가입, 로그인, 세션 조회 등)
		 */
		AuthModule.forRootAsync({
			// useFactory에서 DATABASE_CONNECTION 프로바이더를 사용하기 위해 DatabaseModule 임포트
			imports: [DatabaseModule],
			useFactory: (database: NodePgDatabase) => ({
				// betterAuth() 함수로 BetterAuth 인스턴스를 생성하여 auth 속성에 전달
				auth: betterAuth({
					// drizzleAdapter로 기존 Drizzle ORM 연결을 BetterAuth의 데이터 저장소로 활용
					// BetterAuth가 사용자 정보, 인증 세션 등을 이 DB에 자동으로 저장/관리
					database: drizzleAdapter(database, {
						provider: "pg", // 사용 중인 DB 종류 (PostgreSQL)
					}),
				}),
			}),
			// useFactory에 주입할 의존성 토큰 목록
			inject: [DATABASE_CONNECTION],
		}),
	],
	controllers: [AppController],
	providers: [
		/**
		 * 전역 인증 가드 (Global Auth Guard)
		 * - APP_GUARD로 등록하면 모든 라우트에 자동으로 AuthGuard가 적용됨
		 * - 매 요청마다 BetterAuth가 생성한 JWT 쿠키의 유효성을 검증
		 * - JWT 쿠키가 없거나 유효하지 않으면 401 Unauthorized 응답 반환
		 * - 특정 라우트를 인증에서 제외하려면 @AllowAnonymous() 데코레이터 사용
		 */
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
})
export class AppModule {}
