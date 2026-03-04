import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "../../database/database.module";
import { DATABASE_CONNECTION } from "../../database/database-connection";
import { user } from "../schema";

/**
 * 사용자 조회 서비스
 * - 다른 모듈(PostsModule 등)에서 사용자 정보가 필요할 때 활용
 * - UsersModule에서 export하여 외부 모듈에서 주입 가능
 */
@Injectable()
export class UsersService {
	constructor(
		// PostsService와 동일한 패턴으로 Drizzle ORM DB 연결 주입
		@Inject(DATABASE_CONNECTION) private readonly database: NodePgDatabase<typeof schema>,
	) {}

	/**
	 * ID로 사용자 조회
	 * - Drizzle ORM의 query API + eq() 셀렉터로 WHERE 조건을 타입 안전하게 구성
	 * - 사용자가 존재하지 않으면 404 NotFoundException 발생
	 */
	async findById(userId: string) {
		const foundUser = await this.database.query.user.findFirst({
			where: eq(user.id, userId),
		});

		if (!foundUser) {
			throw new NotFoundException("User not found");
		}

		return foundUser;
	}
}
