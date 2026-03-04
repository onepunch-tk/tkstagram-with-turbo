import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { UsersService } from "./users.service";

/**
 * 사용자 모듈
 * - DatabaseModule을 import하여 Drizzle ORM DB 연결 프로바이더 사용 가능
 * - UsersService를 export하여 다른 모듈(PostsModule 등)에서 주입받아 사용 가능
 */
@Module({
	imports: [DatabaseModule],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
