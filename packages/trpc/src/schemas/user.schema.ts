// 사용자 프로필 및 팔로우 기능을 위한 tRPC 스키마 정의
// BetterAuth 유저 스키마와 별도로, tRPC 응답에 필요한 필드만 포함
import { z } from "zod";

// 팔로워/팔로잉/추천 유저 목록에서 사용하는 최소 유저 정보
export const userSchema = z.object({
	id: z.string(),
	displayName: z.string(),
});

// 팔로우/언팔로우/프로필 조회 등 여러 프로시저에서 공유하는 입력 스키마
export const userIdSchema = z.object({
	userId: z.string(),
});

// 프로필 수정 입력: 모든 필드가 optional이므로 부분 업데이트 가능
export const updateProfileSchema = z.object({
	name: z.string().optional(),
	displayName: z.string().optional(),
	username: z.string().optional(),
	bio: z.string().optional(),
	website: z.string().optional(),
});

// 프로필 페이지 출력: 정적 유저 정보 + 서버에서 계산된 팔로워/팔로잉/게시글 수, 팔로우 여부
export const userProfileSchema = z.object({
	id: z.string(),
	name: z.string(),
	displayName: z.string(),
	username: z.string(),
	bio: z.string().nullable(),
	website: z.string().nullable(),
	image: z.string().nullable(),
	followerCount: z.number(),
	followingCount: z.number(),
	postCount: z.number(),
	isFollowing: z.boolean(),
});

export type UserIdInput = z.infer<typeof userIdSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
