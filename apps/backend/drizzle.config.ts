import { defineConfig } from "drizzle-kit";

// DrizzleKit 설정 - 마이그레이션 스크립트 생성 및 DB 적용을 위한 설정
// 생성: npx drizzle-kit generate / 적용: npx drizzle-kit migrate
export default defineConfig({
	schema: "./src/**/schema.ts", // 스키마 파일 탐색 경로 (모든 하위 폴더의 schema.ts)
	out: "./drizzle", // 생성된 SQL 마이그레이션 파일 출력 경로
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
