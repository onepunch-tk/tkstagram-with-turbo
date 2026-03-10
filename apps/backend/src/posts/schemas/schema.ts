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
// Post ↔ Like 관계 추가: 하나의 게시글은 여러 좋아요를 가질 수 있음 (1:N)
export const postRelations = relations(post, ({ one, many }) => ({
	user: one(user, {
		fields: [post.userId],
		references: [user.id],
	}),

	likes: many(like),
}));

/**
 * Like 테이블 스키마 정의
 * - 사용자별 게시글 좋아요를 별도 테이블로 관리하여 중복 좋아요 방지
 * - userId + postId 조합으로 특정 사용자가 특정 게시글에 이미 좋아요했는지 확인 가능
 */
export const like = pgTable("like", {
	id: serial("id").primaryKey(),

	// 좋아요를 누른 사용자 (user 테이블 외래 키)
	userId: text("user_id")
		.notNull()
		.references(() => user.id),

	// 좋아요 대상 게시글 (post 테이블 외래 키)
	postId: integer("post_id")
		.notNull()
		.references(() => post.id),
});

// Like 관계 정의: 각 좋아요는 하나의 사용자(one)와 하나의 게시글(one)에 귀속
export const likeRelations = relations(like, ({ one }) => ({
	user: one(user, {
		fields: [like.userId],
		references: [user.id],
	}),

	post: one(post, {
		fields: [like.postId],
		references: [post.id],
	}),
}));
