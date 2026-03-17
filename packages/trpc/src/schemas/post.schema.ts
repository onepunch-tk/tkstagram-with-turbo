import { z } from "zod";

/**
 * 게시물 생성 시 필요한 입력 스키마
 * - 이미지는 별도의 HTTP 파일 업로드 컨트롤러에서 처리하므로 여기에 포함하지 않음
 */
export const createPostSchema = z.object({
	image: z.string().min(1, "Image is required"),
	caption: z.string().min(1, "Caption is required"),
});

export const findAllPostsSchema = z.object({
	userId: z.string().optional(),
});

/**
 * TRPC 서버에서 반환하는 게시물 응답 스키마
 * - DB의 userId 대신 username, avatar를 포함한 user 객체로 확장
 * - likes: 별도의 like 테이블에서 집계한 좋아요 수 (savedPost.likes.length)
 * - isLiked: 현재 요청 사용자가 해당 게시물에 좋아요했는지 여부 (서버에서 계산하여 클라이언트 로직 간소화)
 * - nestjs-trpc가 이 스키마를 참조하여 AppRouter 타입을 자동 생성
 */
export const postSchema = z.object({
	id: z.number(),
	user: z.object({
		id: z.string(),
		username: z.string(),
		avatar: z.string(),
	}),
	image: z.string(),
	caption: z.string(),
	likes: z.number(),
	comments: z.number(),
	timestamp: z.string(),
	isLiked: z.boolean().optional(),
});

/** 좋아요 토글 시 필요한 입력 스키마 — 대상 게시물의 ID만 전달 */
export const likePostSchema = z.object({
	postId: z.number(),
});

/** Zod 스키마로부터 자동 추론된 TypeScript 타입 */
export type Post = z.infer<typeof postSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type LikePostInput = z.infer<typeof likePostSchema>;
export type FindAllPostsInput = z.infer<typeof findAllPostsSchema>;
