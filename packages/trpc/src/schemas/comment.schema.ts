import { z } from "zod";

/** 댓글 생성 mutation 입력 스키마 */
export const createCommentSchema = z.object({
	postId: z.number(),
	text: z.string().min(1, "Comment cannot be empty"),
});

/** 댓글 삭제 mutation 입력 스키마 */
export const deleteCommentSchema = z.object({
	commentId: z.number(),
});

/** 특정 게시물의 댓글 목록 조회 query 입력 스키마 */
export const getCommentSchema = z.object({
	postId: z.number(),
});

/**
 * tRPC 서버에서 반환하는 댓글 응답 스키마
 * - user 객체는 DB relation으로 조인하여 username, avatar를 포함
 */
export const commentSchema = z.object({
	id: z.number(),
	text: z.string(),
	user: z.object({
		id: z.string(),
		username: z.string(),
		avatar: z.string().nullable(),
	}),
	createdAt: z.string(),
});

/** Zod 스키마로부터 자동 추론된 TypeScript 타입 */
export type Comment = z.infer<typeof commentSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type GetCommentInput = z.infer<typeof getCommentSchema>;
