import { Inject, Injectable } from "@nestjs/common";
import { desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UsersService } from "../auth/users/users.service";
import { schema } from "../database/database.module";
import { DATABASE_CONNECTION } from "../database/database-connection";
import { post } from "./schemas/schema";
import { CreatePostInput, Post } from "./schemas/trpc.schema";

@Injectable()
export class PostsService {
	constructor(
		// @Inject로 DATABASE_CONNECTION 토큰에 해당하는 Drizzle ORM 프로바이더를 수동 주입
		// NodePgDatabase<typeof schema> 제네릭으로 스키마 타입 정보를 전달하여
		// DB 쿼리 시 테이블/컬럼에 대한 타입 안전성 확보
		@Inject(DATABASE_CONNECTION) private readonly database: NodePgDatabase<typeof schema>,
		private readonly usersService: UsersService,
	) {}

	/**
	 * 새 게시물을 DB에 저장
	 * @param createPostDto - TRPC 클라이언트에서 전달받은 게시물 생성 입력값
	 * @param userId - 게시물 작성자의 ID (추후 인증 구현 시 JWT에서 추출하여 동적으로 전달)
	 */
	async create(createPostDto: CreatePostInput, userId: string) {
		// Drizzle ORM의 insert → values → returning 체이닝으로 새 레코드 삽입 후 삽입된 행을 반환
		// image: 빈 문자열 (추후 파일 업로드 구현 시 실제 이미지 경로로 업데이트)
		// likes: 초기값 0, createdAt: 현재 시각
		const [newPost] = await this.database
			.insert(post)
			.values({
				userId,
				caption: createPostDto.caption,
				image: createPostDto.image,
				likes: 0,
				createdAt: new Date(),
			})
			.returning();

		// DB에 저장된 레코드를 TRPC 응답 형식으로 변환하여 반환
		return this.formatPostResponse(newPost, userId);
	}
	/** 전체 게시물 목록을 DB에서 조회하여 TRPC 응답 형식으로 반환 */
	async findAll(): Promise<Post[]> {
		const posts = await this.database.query.post.findMany({
			// with: Drizzle ORM의 관계형 쿼리 — postRelations에서 설정한 user 관계를
			// 활용하여 단일 쿼리로 게시물과 작성자 정보를 함께 조회
			with: {
				user: true,
			},
			// 최신 게시물이 먼저 오도록 createdAt 내림차순 정렬
			orderBy: [desc(post.createdAt)],
		});

		// DB 레코드를 TRPC 스키마(Post 타입)에 맞게 변환
		return posts.map((savedPost) => ({
			id: savedPost.id,
			user: {
				username: savedPost.user.name,
				avatar: savedPost.user.image || "",
			},
			image: savedPost.image,
			caption: savedPost.caption,
			likes: savedPost.likes,
			timestamp: savedPost.createdAt.toISOString(),
			comments: 0, // 추후 댓글 기능 구현 시 실제 댓글 수로 대체
		}));
	}

	/**
	 * DB에 저장된 게시물 레코드를 TRPC 응답 형식(Post 타입)으로 변환
	 * - Drizzle ORM의 $inferSelect로 DB 레코드 타입을 자동 추론
	 * - userId로 사용자 정보를 조회하여 username, avatar를 포함한 응답 객체 생성
	 */
	private async formatPostResponse(
		savedPost: typeof post.$inferSelect,
		userId: string,
	): Promise<Post> {
		const userInfo = await this.usersService.findById(userId);

		return {
			id: savedPost.id,
			user: {
				username: userInfo.name,
				avatar: "", // 추후 아바타 업로드 구현 시 실제 경로로 대체
			},
			image: savedPost.image,
			caption: savedPost.caption,
			likes: savedPost.likes,
			timestamp: savedPost.createdAt.toISOString(),
			comments: 0, // 추후 댓글 기능 구현 시 실제 댓글 수로 대체
		};
	}
}
