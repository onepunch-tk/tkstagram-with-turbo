import { z } from "zod";

// 스토리 생성 입력 — 이미지 파일명만 필요 (업로드는 REST로 별도 처리)
export const createStorySchema = z.object({
	image: z.string().min(1, "Image is required"),
});

// 개별 스토리 스키마 — 서버에서 반환하는 단일 스토리의 형태
export const storySchema = z.object({
	id: z.number(),
	user: z.object({
		id: z.string(),
		username: z.string(),
		avatar: z.string(),
	}),
	image: z.string(),
	createdAt: z.string(),
	expiresAt: z.string(),
});

// 스토리 그룹 스키마 — 한 사용자의 여러 스토리를 묶은 그룹 (슬라이드쇼 표시용)
export const storyGroupSchema = z.object({
	userId: z.string(),
	username: z.string(),
	avatar: z.string(),
	stories: z.array(storySchema),
});

export type Story = z.infer<typeof storySchema>;
export type StoryGroup = z.infer<typeof storyGroupSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
