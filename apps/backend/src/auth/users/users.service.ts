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
	 * 유저 프로필 조회에 필요한 SELECT 컬럼을 정의하는 공통 헬퍼
	 * getUserProfile, getFollowers, getFollowings, getSuggestedUsers에서 재사용
	 *
	 * @param userId - 현재 로그인한 유저의 ID (isFollowing 계산에 사용)
	 *
	 * 정적 컬럼 (user 테이블에서 직접 조회):
	 *   id, name, image, bio, website
	 *
	 * 계산 컬럼 (서브쿼리로 매 행마다 계산):
	 *   followerCount  - 이 유저를 팔로우하는 사람 수
	 *   followingCount - 이 유저가 팔로우하는 사람 수
	 *   postCount      - 이 유저의 게시글 수
	 *   isFollowing    - 현재 로그인 유저(userId)가 이 유저를 팔로우하는지 여부
	 */
	private profileSelect(userId: string) {
		// 서브쿼리: 이 유저를 팔로우하는 사람 수 (follow.followingId = 조회 대상 유저)
		const followerCountSq = this.database
			.select({ count: count() })
			.from(follow)
			.where(eq(follow.followingId, user.id));

		// 서브쿼리: 이 유저가 팔로우하는 사람 수 (follow.followerId = 조회 대상 유저)
		const followingCountSq = this.database
			.select({ count: count() })
			.from(follow)
			.where(eq(follow.followerId, user.id));

		// 서브쿼리: 이 유저의 게시글 수
		const postCountSq = this.database
			.select({ count: count() })
			.from(post)
			.where(eq(post.userId, user.id));

		// 서브쿼리: 현재 로그인 유저(userId)가 이 유저를 팔로우하는지 EXISTS 체크
		// EXISTS → true/false로 매핑하여 isFollowing 불린값으로 반환
		const isFollowingSq = this.database
			.select({ one: sql<number>`1` })
			.from(follow)
			.where(and(eq(follow.followerId, userId), eq(follow.followingId, user.id)));

		return {
			id: user.id,
			name: user.name,
			image: user.image,
			bio: user.bio,
			website: user.website,
			// ::int 캐스팅으로 PostgreSQL의 bigint → JS number 변환
			followerCount: sql<number>`(${followerCountSq})::int`,
			followingCount: sql<number>`(${followingCountSq})::int`,
			postCount: sql<number>`(${postCountSq})::int`,
			// exists()는 서브쿼리에 결과가 있으면 true, 없으면 false
			// mapWith(Boolean)으로 DB 값을 JS boolean으로 변환
			isFollowing: exists(isFollowingSq).mapWith(Boolean),
		};
	}

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

	/**
	 * 팔로워 목록 조회
	 * @param userId - 조회 대상 유저 (이 유저의 팔로워를 가져옴)
	 * @param currentUserId - 현재 로그인 유저 (isFollowing 계산용)
	 *
	 * follow 테이블에서 followingId = userId인 레코드를 찾고,
	 * followerId로 user 테이블을 INNER JOIN하여 팔로워의 프로필 정보를 반환
	 *
	 * 예: userId="A"이면 → A를 팔로우하는 모든 유저의 프로필
	 */
	async getFollowers(userId: string, currentUserId: string) {
		return (
			this.database
				// 1) SELECT: profileSelect(currentUserId)로 반환할 컬럼 정의
				//    정적 컬럼(id, name, bio...) + 계산 컬럼(followerCount, isFollowing 등)
				//    isFollowing은 currentUserId(로그인 유저) 기준으로 계산됨
				.select(this.profileSelect(currentUserId))
				// 2) FROM: follow 테이블을 기준 테이블로 설정
				//    follow 테이블 구조: { followerId: "팔로우하는 사람", followingId: "팔로우당하는 사람" }
				.from(follow)
				// 3) INNER JOIN: follow.followerId로 user 테이블을 조인
				//    → 팔로우를 "한" 사람의 유저 정보를 가져옴 (= 팔로워의 프로필)
				//    SQL: INNER JOIN user ON follow.follower_id = user.id
				.innerJoin(user, eq(follow.followerId, user.id))
				// 4) WHERE: followingId = userId인 레코드만 필터
				//    → "userId를 팔로우하는" 모든 레코드를 찾음
				//    예: userId="철수"면 → follow 테이블에서 followingId="철수"인 행만 선택
				//    = 철수를 팔로우하는 사람들
				.where(eq(follow.followingId, userId))
		);
	}

	/**
	 * 팔로잉 목록 조회
	 * @param userId - 조회 대상 유저 (이 유저가 팔로우하는 사람들을 가져옴)
	 * @param currentUserId - 현재 로그인 유저 (isFollowing 계산용)
	 *
	 * getFollowers와 반대 방향:
	 * follow 테이블에서 followerId = userId인 레코드를 찾고,
	 * followingId로 user 테이블을 INNER JOIN
	 *
	 * 예: userId="A"이면 → A가 팔로우하는 모든 유저의 프로필
	 */
	async getFollowings(userId: string, currentUserId: string) {
		return this.database
			.select(this.profileSelect(currentUserId))
			.from(follow)
			.innerJoin(user, eq(follow.followingId, user.id))
			.where(eq(follow.followerId, userId));
	}

	/**
	 * 추천 유저 목록 (최대 5명)
	 * 서브쿼리로 이미 팔로우 중인 유저 ID를 조회한 뒤,
	 * NOT IN으로 제외하고 자기 자신도 제외
	 */
	async getSuggestedUsers(userId: string) {
		// 서브쿼리: 현재 유저가 이미 팔로우하는 유저 ID 목록
		const followingSq = this.database
			.select({ id: follow.followingId })
			.from(follow)
			.where(eq(follow.followerId, userId));

		return this.database
			.select(this.profileSelect(userId))
			.from(user)
			// 자기 자신 제외 + 이미 팔로우 중인 유저 제외
			.where(and(ne(user.id, userId), notInArray(user.id, followingSq)))
			.limit(5);
	}

	/**
	 * 유저 프로필 단건 조회
	 * @param userId - 조회할 유저 ID
	 * @param currentUserId - 현재 로그인 유저 (isFollowing 계산용)
	 * @returns 프로필 정보 + 계산 컬럼 (followerCount, followingCount, postCount, isFollowing)
	 */
	async getUserProfile(userId: string, currentUserId: string): Promise<UserProfile> {
		const result = await this.database
			.select(this.profileSelect(currentUserId))
			.from(user)
			.where(eq(user.id, userId));

		return result[0] || null;
	}

	// 프로필 업데이트: Zod 스키마(updateProfileSchema)로 검증된 optional 필드만 부분 수정
	async updateProfile(updateProfileInput: UpdateProfileInput, userId: string) {
		await this.database.update(user).set(updateProfileInput).where(eq(user.id, userId));
	}
}
