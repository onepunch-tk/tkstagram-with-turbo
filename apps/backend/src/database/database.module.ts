import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DATABASE_CONNECTION } from "./database-connection";

@Module({
	// ConfigService를 사용하기 위해 ConfigModule 임포트
	imports: [ConfigModule],
	providers: [
		{
			// 다른 서비스에서 @Inject(DATABASE_CONNECTION)으로 주입할 수 있는 커스텀 프로바이더
			provide: DATABASE_CONNECTION,
			// useFactory로 ConfigService를 주입받아 DB 연결 생성
			useFactory: (configService: ConfigService) => {
				// node-postgres의 Pool - 커넥션 풀링으로 DB 연결을 재사용하여 성능 향상
				const pool = new Pool({
					connectionString: configService.getOrThrow("DATABASE_URL"),
				});

				// Drizzle ORM 객체 반환 - 이후 서비스에서 DB 쿼리에 사용
				return drizzle(pool);
			},
			// NestJS에게 ConfigService를 useFactory에 주입하도록 지시
			inject: [ConfigService],
		},
	],
})
export class DatabaseModule {}
