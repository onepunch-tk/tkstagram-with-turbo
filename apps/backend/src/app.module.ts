import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";

@Module({
	imports: [
		// .env 파일에서 환경변수를 읽어오는 ConfigModule 초기화
		ConfigModule.forRoot(),
		// Drizzle ORM 데이터베이스 연결을 관리하는 모듈
		DatabaseModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
