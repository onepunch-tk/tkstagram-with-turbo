import { Inject, Injectable } from "@nestjs/common";
import { CreateStoryInput, StoryGroup } from "@repo/trpc/schemas";
import { gt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "../database/database.module";
import { DATABASE_CONNECTION } from "../database/database-connection";
import { story } from "./schemas/schema";

@Injectable()
export class StoriesService {
	constructor(@Inject(DATABASE_CONNECTION) readonly database: NodePgDatabase<typeof schema>) {}

	/**
	 * 새 스토리를 DB에 저장
	 * - expiresAt을 현재 시간 +24시간으로 계산하여 만료 시간 설정
	 */
	async create(createStoryInput: CreateStoryInput, userId: string) {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		await this.database.insert(story).values({
			userId,
			image: createStoryInput.image,
			expiresAt,
		});
	}

	/**
	 * 만료되지 않은 모든 스토리를 사용자별 그룹으로 묶어 반환
	 * - gt(expiresAt, now)로 만료 전 스토리만 조회
	 * - Map을 사용하여 userId 기준으로 스토리를 그룹화 (슬라이드쇼 표시용)
	 * - TODO: 팔로우 기능 구현 후 팔로잉 사용자의 스토리만 필터링
	 */
	async getStories(_userId: string): Promise<StoryGroup[]> {
		// expiresAt > now — 아직 만료되지 않은 활성 스토리만 조회
		const stories = await this.database.query.story.findMany({
			where: gt(story.expiresAt, new Date()),
			with: {
				user: true,
			},
		});

		// userId를 키로 하는 Map으로 스토리를 사용자별 그룹으로 집계
		// Map은 고유 키만 허용하므로 사용자당 하나의 그룹이 보장됨
		const storyGroups = new Map<string, StoryGroup>();

		for (const story of stories) {
			// 해당 사용자의 그룹이 없으면 새로 생성
			if (!storyGroups.has(story.userId)) {
				storyGroups.set(story.userId, {
					userId: story.userId,
					username: story.user.name,
					avatar: story.user.image || "",
					stories: [],
				});
			}

			// 현재 스토리를 해당 사용자의 그룹에 추가
			const group = storyGroups.get(story.userId);
			group?.stories.push({
				id: story.id,
				user: {
					id: story.user.id,
					username: story.user.name,
					avatar: story.user.image || "",
				},
				image: story.image,
				createdAt: story.createdAt.toISOString(),
				expiresAt: story.expiresAt.toISOString(),
			});
		}

		// Map의 values를 배열로 변환하여 사용자별 스토리 그룹 배열 반환
		return Array.from(storyGroups.values());
	}
}
