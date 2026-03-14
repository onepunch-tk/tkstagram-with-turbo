import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateProfileInput, UserProfile } from "@repo/trpc/schemas";
import { and, count, eq, exists, ne, notInArray, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "../../database/database.module";
import { DATABASE_CONNECTION } from "../../database/database-connection";
import { post } from "../../posts/schemas/schema";
import { follow, user } from "../schema";

@Injectable()
export class UsersService {
	constructor(
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

	// 팔로우 생성: 자기 자신 팔로우 및 중복 팔로우 방지 후 레코드 삽입
	async follow(followingId: string, followerId: string) {
		if (followerId === followingId) {
			throw new Error("Cannot follow yourself");
		}

		const existingFollow = await this.database.query.follow.findFirst({
			where: and(eq(follow.followerId, followerId), eq(follow.followingId, followingId)),
		});

		if (existingFollow) {
			throw new Error("Already following this user");
		}

		await this.database.insert(follow).values({
			followerId,
			followingId,
		});
	}

	// 언팔로우: 기존 팔로우 레코드 존재 여부 확인 후 삭제
	async unfollow(followingId: string, followerId: string) {
		const existingFollow = await this.database.query.follow.findFirst({
			where: and(eq(follow.followerId, followerId), eq(follow.followingId, followingId)),
		});

		if (!existingFollow) {
			throw new Error("Not following this user");
		}

		await this.database
			.delete(follow)
			.where(and(eq(follow.followerId, followerId), eq(follow.followingId, followingId)));
	}

	// 나를 팔로우하는 유저 목록: followingId가 나인 레코드에서 follower relation으로 유저 정보 조인
	async getFollowers(userId: string) {
		return this.database.query.follow.findMany({
			where: eq(follow.followingId, userId),
			with: {
				follower: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	// 내가 팔로우하는 유저 목록: followerId가 나인 레코드에서 following relation으로 유저 정보 조인
	async getFollowings(userId: string) {
		return this.database.query.follow.findMany({
			where: eq(follow.followerId, userId),
			with: {
				following: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	// 추천 유저: 서브쿼리로 이미 팔로우 중인 유저를 제외하고 최대 5명 반환 (단일 쿼리로 처리)
	async getSuggestedUsers(userId: string) {
		const followingSq = this.database
			.select({ id: follow.followingId })
			.from(follow)
			.where(eq(follow.followerId, userId));

		return this.database.query.user.findMany({
			where: and(ne(user.id, userId), notInArray(user.id, followingSq)),
			columns: {
				id: true,
				name: true,
			},
			limit: 5,
		});
	}

	// 유저 프로필 조회: 정적 컬럼 + 서브쿼리 기반 계산 컬럼(팔로워/팔로잉/게시글 수, 팔로우 여부)을 단일 쿼리로 반환
	async getUserProfile(userId: string, currentUserId: string): Promise<UserProfile> {
		const followerCountSq = this.database
			.select({ count: count().mapWith(Number) })
			.from(follow)
			.where(eq(follow.followingId, user.id));

		const followingCountSq = this.database
			.select({ count: count().mapWith(Number) })
			.from(follow)
			.where(eq(follow.followerId, user.id));

		const postCountSq = this.database
			.select({ count: count().mapWith(Number) })
			.from(post)
			.where(eq(post.userId, user.id));

		const isFollowingSq = this.database
			.select({ one: sql<number>`1` })
			.from(follow)
			.where(and(eq(follow.followerId, currentUserId), eq(follow.followingId, user.id)));

		const result = await this.database
			.select({
				id: user.id,
				name: user.name,
				image: user.image,
				bio: user.bio,
				website: user.website,
				followerCount: sql<number>`(${followerCountSq})`,
				followingCount: sql<number>`(${followingCountSq})`,
				postCount: sql<number>`(${postCountSq})`,
				isFollowing: exists(isFollowingSq).mapWith(Boolean),
			})
			.from(user)
			.where(eq(user.id, userId));

		return result[0] || null;
	}

	// 프로필 업데이트: optional 필드만 포함된 입력값으로 부분 수정(upsert) 지원
	async updateProfile(updateProfileInput: UpdateProfileInput, userId: string) {
		await this.database.update(user).set(updateProfileInput).where(eq(user.id, userId));
	}
}
