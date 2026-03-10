import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../../auth/schema";
import { post } from "../../posts/schemas/schema";

// Comment 테이블 스키마 정의
// 게시글에 달리는 댓글을 저장하며, user와 post에 각각 외래 키로 연결
export const comment = pgTable("comment", {
	id: serial("id").primaryKey(),
	// 댓글 본문 텍스트
	text: text("text").notNull(),
	// 댓글 작성자 (user 테이블 외래 키 — BetterAuth의 user.id는 text 타입)
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	// 댓글이 속한 게시글 (post 테이블 외래 키 — post.id는 serial(integer) 타입)
	postId: integer("post_id")
		.notNull()
		.references(() => post.id),
	// 댓글 생성 시각 (시간순 정렬에 사용)
	createdAt: timestamp("created_at").notNull(),
});

// Comment 관계 정의
// 하나의 댓글은 하나의 사용자(one)와 하나의 게시글(one)에 귀속
// fields: 현재 테이블의 외래 키, references: 참조 대상 테이블의 기본 키
export const commentRelations = relations(comment, ({ one }) => ({
	user: one(user, {
		fields: [comment.userId],
		references: [user.id],
	}),
	post: one(post, {
		fields: [comment.postId],
		references: [post.id],
	}),
}));
