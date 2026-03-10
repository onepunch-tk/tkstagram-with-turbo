import {
	type CreateCommentInput,
	commentSchema,
	createCommentSchema,
	type DeleteCommentInput,
	deleteCommentSchema,
	type GetCommentInput,
	getCommentSchema,
} from "@repo/trpc/schemas";
import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import { z } from "zod";
import type { AppContext } from "../app-context-.interface";
import { AuthTRPCMiddleware } from "../auth/auth-trpc.middleware";
import { CommentsService } from "./comments.service";

@Router()
@UseMiddlewares(AuthTRPCMiddleware)
export class CommentsRouter {
	constructor(private readonly commentsService: CommentsService) {}

	@Mutation({ input: createCommentSchema })
	async create(@Input() createCommentInput: CreateCommentInput, @Ctx() context: AppContext) {
		return this.commentsService.create(createCommentInput, context.user.id);
	}

	@Query({ input: getCommentSchema, output: z.array(commentSchema) })
	async findByPostId(@Input() getCommentInput: GetCommentInput) {
		return this.commentsService.findByPostId(getCommentInput.postId);
	}

	@Mutation({ input: deleteCommentSchema })
	async delete(@Input() deleteCommentInput: DeleteCommentInput, @Ctx() context: AppContext) {
		return this.commentsService.delete(deleteCommentInput.commentId, context.user.id);
	}
}
