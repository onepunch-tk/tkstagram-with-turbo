import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../../auth/schema";

// Post 테이블 스키마 정의
// drizzle.config.ts의 schema 경로 패턴(*.schema.ts)에 맞춰 파일명을 schema.ts로 지정하여
// DrizzleKit이 마이그레이션 생성 시 이 파일을 자동 인식하도록 함
export const post = pgTable("post", {
	// serial: 자동 증가(auto-increment) 정수 타입 — ID 필드에 적합
	id: serial("id").primaryKey(),
	// 업로드된 이미지 파일명 (추후 파일 업로드 구현 시 실제 저장 경로와 매핑)
	image: text("image").notNull(),
	caption: text("caption").notNull(),
	likes: integer("likes").notNull(),
	createdAt: timestamp("createdAt").notNull(),
	// user 테이블의 id를 참조하는 외래 키 (1:1 관계 — 하나의 게시글은 하나의 사용자에 귀속)
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

// Post ↔ User 관계 정의 (Post 측)
// one(): 하나의 게시글은 하나의 사용자와 연결 (1:1)
// fields: 현재 테이블의 외래 키, references: 참조 대상 테이블의 기본 키
// 이 관계 설정으로 Drizzle ORM의 relational query에서 post 조회 시 user를 join으로 함께 가져올 수 있음
export const postRelations = relations(post, ({ one }) => ({
	user: one(user, {
		fields: [post.userId],
		references: [user.id],
	}),
}));
