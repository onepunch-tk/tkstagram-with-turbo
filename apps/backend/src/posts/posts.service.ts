import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UsersService } from "../auth/users/users.service";
import { schema } from "../database/database.module";
import { DATABASE_CONNECTION } from "../database/database-connection";
import { like, post } from "./schemas/schema";
import { CreatePostInput, Post } from "./schemas/trpc.schema";

@Injectable()
export class PostsService {
	constructor(
		// @Inject로 DATABASE_CONNECTION 토큰에 해당하는 Drizzle ORM 프로바이더를 수동 주입
		// NodePgDatabase<typeof schema> 제네릭으로 스키마 타입 정보를 전달하여
		// DB 쿼리 시 테이블/컬럼에 대한 타입 안전성 확보
		@Inject(DATABASE_CONNECTION) private readonly database: NodePgDatabase<typeof schema>,
		readonly _usersService: UsersService,
	) {}

	/**
	 * 새 게시물을 DB에 저장
	 * @param createPostDto - TRPC 클라이언트에서 전달받은 게시물 생성 입력값
	 * @param userId - 게시물 작성자의 ID (추후 인증 구현 시 JWT에서 추출하여 동적으로 전달)
	 */
	async create(createPostDto: CreatePostInput, userId: string) {
		await this.database.insert(post).values({
			userId,
			caption: createPostDto.caption,
			image: createPostDto.image,
			createdAt: new Date(),
		});
	}
	/**
	 * 전체 게시물 목록을 DB에서 조회하여 TRPC 응답 형식으로 반환
	 * @param userId - 현재 요청 사용자 ID (isLiked 계산에 사용)
	 */
	async findAll(userId: string): Promise<Post[]> {
		const posts = await this.database.query.post.findMany({
			// with: Drizzle ORM의 관계형 쿼리 — postRelations에서 설정한 user 관계를
			// 활용하여 단일 쿼리로 게시물과 작성자 정보를 함께 조회
			with: {
				user: true,
				likes: true,
			},
			// 최신 게시물이 먼저 오도록 createdAt 내림차순 정렬
			orderBy: [desc(post.createdAt)],
		});

		// DB 레코드를 TRPC 스키마(Post 타입)에 맞게 변환
		// likes: like 테이블에서 가져온 배열의 length로 좋아요 수 집계
		// isLiked: likes 배열에서 현재 사용자의 좋아요가 존재하는지 some()으로 확인
		return posts.map((savedPost) => ({
			id: savedPost.id,
			user: {
				username: savedPost.user.name,
				avatar: savedPost.user.image || "",
			},
			image: savedPost.image,
			likes: savedPost.likes.length,
			caption: savedPost.caption,
			timestamp: savedPost.createdAt.toISOString(),
			comments: 0,
			isLiked: savedPost.likes.some((like) => like.userId === userId),
		}));
	}

	/**
	 * 게시물 좋아요 토글 (like / unlike)
	 * - 동일한 userId + postId 조합의 좋아요가 이미 존재하면 삭제(unlike)
	 * - 존재하지 않으면 새로 생성(like)
	 * - and()로 두 조건을 결합하여 정확한 기존 좋아요 레코드를 조회
	 */
	async likePost(postId: number, userId: string) {
		// userId + postId 조합으로 기존 좋아요 존재 여부 확인
		const existingLike = await this.database.query.like.findFirst({
			where: and(eq(like.postId, postId), eq(like.userId, userId)),
		});

		if (existingLike) {
			// 이미 좋아요한 상태 → 기존 레코드 삭제 (unlike)
			await this.database.delete(like).where(eq(like.id, existingLike.id));
		} else {
			// 좋아요하지 않은 상태 → 새 레코드 생성 (like)
			await this.database.insert(like).values({ postId, userId });
		}
	}
}
