import {
	type UpdateProfileInput,
	type UserIdInput,
	updateProfileSchema,
	userIdSchema,
	userProfileSchema,
	userSchema,
} from "@repo/trpc/schemas";
import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import z from "zod";
import type { AppContext } from "../../app-context-.interface";
import { AuthTRPCMiddleware } from "../auth-trpc.middleware";
import { UsersService } from "./users.service";

@Router()
@UseMiddlewares(AuthTRPCMiddleware)
export class UsersRouter {
	constructor(private readonly usersService: UsersService) {}

	@Mutation({ input: userIdSchema })
	async follow(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.follow(input.userId, context.user.id);
	}

	@Mutation({ input: userIdSchema })
	async unfollow(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.unfollow(input.userId, context.user.id);
	}

	@Query({ input: userIdSchema, output: z.array(userSchema) })
	async getFollowers(@Input() input: UserIdInput) {
		return this.usersService.getFollowers(input.userId);
	}

	@Query({ input: userIdSchema, output: z.array(userSchema) })
	async getFollowings(@Input() input: UserIdInput) {
		return this.usersService.getFollowings(input.userId);
	}

	@Query({ output: z.array(userSchema) })
	async getSuggestedUsers(@Ctx() context: AppContext) {
		return this.usersService.getSuggestedUsers(context.user.id);
	}

	@Mutation({ input: updateProfileSchema })
	async updateProfile(@Input() updateProfileInput: UpdateProfileInput, @Ctx() context: AppContext) {
		return this.usersService.updateProfile(updateProfileInput, context.user.id);
	}

	@Query({ input: userIdSchema, output: userProfileSchema })
	async getUserProfile(@Input() input: UserIdInput, @Ctx() context: AppContext) {
		return this.usersService.getUserProfile(input.userId, context.user.id);
	}
}
