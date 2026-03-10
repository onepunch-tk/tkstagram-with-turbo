import { Module } from "@nestjs/common";
import { UsersModule } from "../auth/users/users.module";
import { DatabaseModule } from "../database/database.module";
import { PostsRouter } from "./posts.router";
import { PostsService } from "./posts.service";

@Module({
	// UsersModule: PostsService에서 UsersService를 주입받기 위해 import
	// DatabaseModule: PostsService에서 Drizzle ORM DB 연결 프로바이더를 주입받기 위해 import
	imports: [UsersModule, DatabaseModule],
	// PostsRouter를 providers에 등록하여 NestJS DI 및 nestjs-trpc 스캐닝 대상으로 포함
	providers: [PostsService, PostsRouter],
})
export class PostsModule {}
