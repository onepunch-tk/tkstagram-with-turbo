import {
	type UpdateProfileInput,
	type UserIdInput,
	updateProfileSchema,
	userIdSchema,
	userProfileSchema,
} from "@repo/trpc/schemas";
import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import z from "zod";
import type { AppContext } from "../../app-context-.interface";
import { AuthTRPCMiddleware } from "../auth-trpc.middleware";
import { UsersService } from "./users.service";

// nestjs-trpc의 @Router() 데코레이터로 tRPC 라우터로 등록
// @UseMiddlewares로 모든 프로시저에 인증 미들웨어 적용 → context.user 보장
@Router()
@UseMiddlewares(AuthTRPCMiddleware)
export class UsersRouter {
	constructor(private readonly usersService: UsersService) {}

	// 팔로우: input.userId = 팔로우할 대상, context.user.id = 현재 로그인 유저
	@Mutation({ input: userIdSchema })
	async follow(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.follow(input.userId, context.user.id);
	}

	// 언팔로우: 위와 동일한 파라미터 구조
	@Mutation({ input: userIdSchema })
	async unfollow(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.unfollow(input.userId, context.user.id);
	}

	// 팔로워 목록: userProfileSchema 배열을 반환하여 프로필 정보 + isFollowing 포함
	// context.user.id를 넘겨서 각 팔로워에 대해 "내가 이 유저를 팔로우하는지" 계산
	@Query({ input: userIdSchema, output: z.array(userProfileSchema) })
	async getFollowers(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.getFollowers(input.userId, context.user.id);
	}

	// 팔로잉 목록: 위와 동일한 구조, 방향만 반대 (내가 팔로우하는 유저들)
	@Query({ input: userIdSchema, output: z.array(userProfileSchema) })
	async getFollowings(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.getFollowings(input.userId, context.user.id);
	}

	// 추천 유저: 현재 유저가 아직 팔로우하지 않은 유저 목록 (최대 5명)
	@Query({ output: z.array(userProfileSchema) })
	async getSuggestedUsers(@Ctx() context: AppContext) {
		return this.usersService.getSuggestedUsers(context.user.id);
	}

	// 프로필 수정: name, bio, website 등 optional 필드만 부분 업데이트
	@Mutation({ input: updateProfileSchema })
	async updateProfile(@Input() updateProfileInput: UpdateProfileInput, @Ctx() context: AppContext) {
		return this.usersService.updateProfile(updateProfileInput, context.user.id);
	}

	// 유저 프로필 조회: 단일 userProfileSchema 반환
	// input.userId = 조회 대상, context.user.id = 현재 유저 (isFollowing 계산에 사용)
	@Query({ input: userIdSchema, output: userProfileSchema })
	async getUserProfile(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.getUserProfile(input.userId, context.user.id);
	}
}
