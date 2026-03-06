import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard, AuthModule } from "@thallesp/nestjs-better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TRPCModule } from "nestjs-trpc";
import { AppContext } from "./app.context";
import { AppController } from "./app.controller";
import { AuthTRPCMiddleware } from "./auth/auth-trpc.middleware";
import { UsersModule } from "./auth/users/users.module";
import { DatabaseModule } from "./database/database.module";
import { DATABASE_CONNECTION } from "./database/database-connection";
import { PostsModule } from "./posts/posts.module";
import { UploadModule } from "./upload/upload.module";

@Module({
	imports: [
		// .env 파일에서 환경변수를 읽어오는 ConfigModule 초기화
		ConfigModule.forRoot(),
		// Drizzle ORM 데이터베이스 연결을 관리하는 모듈
		DatabaseModule,
		/**
		 * TRPC 모듈 초기화
		 * - NestJS에 TRPC 서버를 통합하여 Express HTTP 위에서 동작
		 * - nestjs-trpc CLI(trpc:watch)가 *.router.ts 파일을 감시하여
		 *   packages/trpc/src/server/server.ts에 AppRouter 타입을 자동 생성
		 * - 이 AppRouter를 백엔드와 프론트엔드가 공유하여 end-to-end 타입 안전성 확보
		 */
		TRPCModule.forRoot({
			basePath: "/api/trpc",
			context: AppContext,
		}),
		/**
		 * BetterAuth 인증 모듈 설정
		 * - forRootAsync를 사용하여 NestJS 의존성 주입(DI)으로 동적 설정 가능
		 * - DatabaseModule을 import하여 useFactory에서 Drizzle ORM 인스턴스를 주입받음
		 * - BetterAuth가 자동으로 /api/auth/* 경로에 인증 관련 엔드포인트를 생성
		 *   (회원가입, 로그인, 세션 조회 등)
		 */
		AuthModule.forRootAsync({
			// useFactory에서 DATABASE_CONNECTION 프로바이더를 사용하기 위해 DatabaseModule 임포트
			imports: [DatabaseModule, ConfigModule],
			useFactory: (database: NodePgDatabase, configService: ConfigService) => ({
				// betterAuth() 함수로 BetterAuth 인스턴스를 생성하여 auth 속성에 전달
				auth: betterAuth({
					// drizzleAdapter로 기존 Drizzle ORM 연결을 BetterAuth의 데이터 저장소로 활용
					// BetterAuth가 사용자 정보, 인증 세션 등을 이 DB에 자동으로 저장/관리
					database: drizzleAdapter(database, {
						provider: "pg", // 사용 중인 DB 종류 (PostgreSQL)
					}),
					// 이메일/비밀번호 인증 방식 활성화 (명시적으로 opt-in 필요)
					emailAndPassword: {
						enabled: true,
					},
					// BetterAuth는 기본적으로 모든 외부 origin 요청을 차단
					// UI에서 오는 요청을 허용하기 위해 UI_URL을 신뢰 목록에 등록
					trustedOrigins: [configService.getOrThrow("UI_URL")],
				}),
			}),
			// useFactory에 주입할 의존성 토큰 목록
			inject: [DATABASE_CONNECTION, ConfigService],
		}),
		PostsModule,
		UsersModule,
		// Multer 기반 범용 파일 업로드 모듈 (이미지 업로드 및 로컬 디스크 저장)
		UploadModule,
	],
	controllers: [AppController],
	providers: [
		// TRPC 라우터에서 @UseMiddlewares()로 사용할 인증 미들웨어
		AuthTRPCMiddleware,
		// TRPC 프로시저의 공유 컨텍스트(req/res)를 생성하는 프로바이더
		AppContext,
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
