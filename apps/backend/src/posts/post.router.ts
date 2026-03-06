import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import { z } from "zod";
import type { AppContext } from "../app-context-.interface";
import { AuthTRPCMiddleware } from "../auth/auth-trpc.middleware";
import { PostsService } from "./posts.service";
import { type CreatePostInput, createPostSchema, postSchema } from "./schemas/trpc.schema";

/**
 * Posts TRPC 라우터
 * - @Router() 데코레이터로 nestjs-trpc에 등록되어 HTTP 트래픽을 수신
 * - input/output에 Zod 스키마를 지정하면 자동 유효성 검증 + AppRouter 타입 생성
 * - NestJS DI를 통해 PostsService를 주입받아 실제 비즈니스 로직 위임
 */
@Router()
@UseMiddlewares(AuthTRPCMiddleware)
export class PostsRouter {
	constructor(private readonly postsService: PostsService) {}

	/** Mutation: 새 게시물 생성 (input → createPostSchema, output → postSchema) */
	@Mutation({
		input: createPostSchema,
		output: postSchema,
	})
	async create(@Input() createPostDto: CreatePostInput, @Ctx() context: AppContext) {
		return this.postsService.create(createPostDto, context.user.id);
	}

	/** Query: 전체 게시물 목록 조회 (output → postSchema 배열) */
	@Query({ output: z.array(postSchema) })
	async findAll() {
		return this.postsService.findAll();
	}
}
