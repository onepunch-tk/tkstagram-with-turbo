import { type CreateStoryInput, createStorySchema, storyGroupSchema } from "@repo/trpc/schemas";
import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import { z } from "zod";
import type { AppContext } from "../app-context-.interface";
import { AuthTRPCMiddleware } from "../auth/auth-trpc.middleware";
import { StoriesService } from "./stories.service";

@Router()
@UseMiddlewares(AuthTRPCMiddleware)
export class StoriesRouter {
	constructor(private readonly storiesService: StoriesService) {}

	// 스토리 생성 — 이미지 파일명을 받아 24시간 만료 스토리를 DB에 저장
	@Mutation({ input: createStorySchema })
	async create(@Input() createStoryInput: CreateStoryInput, @Ctx() context: AppContext) {
		return this.storiesService.create(createStoryInput, context.user.id);
	}

	// 전체 스토리 조회 — 만료되지 않은 스토리를 사용자별 그룹으로 묶어 반환
	// TODO: 팔로우 기능 구현 후 팔로잉 사용자의 스토리만 반환하도록 업데이트
	@Query({ output: z.array(storyGroupSchema) })
	async getStories(@Ctx() context: AppContext) {
		return this.storiesService.getStories(context.user.id);
	}
}
