import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// BetterAuth CLI 전용 스텁 인스턴스
// 실제 앱에서는 사용되지 않으며, CLI가 스키마를 파싱하여 Drizzle ORM 타입을 생성하는 용도
// 실행: npx @better-auth/cli generate
export const auth = betterAuth({
	database: drizzleAdapter({}, { provider: "pg" }),
});
