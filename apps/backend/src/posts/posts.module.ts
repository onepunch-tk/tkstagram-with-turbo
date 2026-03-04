import { Module } from "@nestjs/common";
import { PostsRouter } from "./post.router";
import { PostsService } from "./posts.service";

@Module({
	// PostsRouter를 providers에 등록하여 NestJS DI 및 nestjs-trpc 스캐닝 대상으로 포함
	providers: [PostsService, PostsRouter],
})
export class PostsModule {}
