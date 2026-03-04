import { Injectable } from "@nestjs/common";
import { CreatePostInput } from "./trpc.schema";

@Injectable()
export class PostsService {
	/** 전체 게시물 조회 — 다음 강의에서 Drizzle ORM으로 구현 예정 */
	async findAll() {}

	/** 새 게시물 생성 — 다음 강의에서 Drizzle ORM으로 구현 예정 */
	async create(_createPostDto: CreatePostInput) {}
}
