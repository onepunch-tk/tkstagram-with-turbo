import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../../auth/schema";

/**
 * 스토리 테이블 스키마
 * - 사용자가 업로드하는 임시 이미지(24시간 후 만료)
 * - onDelete: "cascade" → 사용자 삭제 시 해당 사용자의 모든 스토리도 자동 삭제
 */
export const story = pgTable("story", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	image: text("image").notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	// 스토리 만료 시간 — 생성 시 현재 시간 +24시간으로 설정
	expiresAt: timestamp("expires_at").notNull(),
});

// 스토리 → 사용자 1:1 관계 — 스토리 조회 시 with: { user: true }로 작성자 정보 함께 조회
export const storyRelations = relations(story, ({ one }) => ({
	user: one(user, {
		fields: [story.userId],
		references: [user.id],
	}),
}));
