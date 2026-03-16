import type { Post } from "@repo/trpc/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, User } from "lucide-react";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/lib/image.client";
import { useTRPC } from "@/lib/trpc/client";
import { authClient } from "../../auth/lib/auth-client";

interface PostModalProps {
	initialPost: Post;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	postUserId: string;
}

export default function PostModal({ initialPost, open, onOpenChange, postUserId }: PostModalProps) {
	const [commentText, setCommentText] = useState("");
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// initialPost는 정적 prop이라 좋아요 등 캐시 갱신이 반영되지 않음
	// 쿼리 캐시에서 최신 데이터를 구독하여 실시간 UI 업데이트를 보장
	const { data: allPosts } = useQuery(
		trpc.postsRouter.findAll.queryOptions({ userId: postUserId }),
	);
	const post = allPosts?.find((p) => p.id === initialPost.id) ?? initialPost;
	console.log(post.id);

	const { data: comments = [] } = useQuery(
		trpc.commentsRouter.findByPostId.queryOptions({ postId: post.id }),
	);
	const { data: session } = authClient.useSession();
	const deleteCommentMutation = useMutation(
		trpc.commentsRouter.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.commentsRouter.findByPostId.queryKey({ postId: post.id }),
				});

				queryClient.invalidateQueries({
					queryKey: trpc.postsRouter.findAll.queryKey({}),
				});
			},
		}),
	);
	const likePostMutation = useMutation(
		trpc.postsRouter.likePost.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.postsRouter.findAll.queryKey({ userId: postUserId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.usersRouter.getUserProfile.queryKey({ userId: postUserId }),
				});
			},
		}),
	);

	const createCommentMutation = useMutation(
		trpc.commentsRouter.create.mutationOptions({
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.commentsRouter.findByPostId.queryKey({ postId: variables.postId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.postsRouter.findAll.queryKey({ userId: postUserId }),
				});
				setCommentText("");
			},
		}),
	);

	const handleDeleteComment = async (commentId: number) => {
		await deleteCommentMutation.mutateAsync({ commentId });
	};

	const handleLike = async () => {
		await likePostMutation.mutateAsync({ postId: post.id });
	};

	const handleAddComment = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (commentText.trim()) {
			await createCommentMutation.mutateAsync({ postId: post.id, text: commentText });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl! w-full h-[90vh] p-0 overflow-hidden flex flex-col">
				<div className="grid md:grid-cols-[1.5fr_1fr] h-full flex-1 overflow-hidden">
					<div className="relative bg-black flex items-center justify-center min-h-0">
						<div className="relative w-full h-full">
							<img
								src={getImageUrl(post.image)}
								alt={post.caption}
								className="object-contain"
								sizes="(max-width:768px) 100vw 50vw"
							/>
						</div>
					</div>
					<div className="flex flex-col h-full bg-background">
						<div className="flex items-center justify-between p-4 border-b">
							<Button variant={"ghost"} className="flex items-center space-x-3 h-auto p-0">
								{post.user.avatar ? (
									<img
										src={getImageUrl(post.user.avatar)}
										alt={post.user.username}
										width={40}
										height={40}
										className="w-10 h-10 rounded-full object-cover"
									/>
								) : (
									<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
										<User className="w-5 h-5 text-muted-foreground" />
									</div>
								)}
								<span className="font-semibold">{post.user.username}</span>
							</Button>
						</div>

						<div className="flex-1 overflow-auto p-4">
							<div className="flex space-x-3 mb-4">
								<Button
									variant={"ghost"}
									className="shrink-0 p-0 h-auto hover:opacity-80 hover:bg-transparent"
								>
									{post.user.avatar ? (
										<img
											src={getImageUrl(post.user.avatar)}
											alt={post.user.username}
											width={32}
											height={32}
											className="w-8 h-8 rounded-full object-cover"
										/>
									) : (
										<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
											<User className="w-4 h-4 text-muted-foreground" />
										</div>
									)}
								</Button>

								<div className="flex-1">
									<div className="space-y-1">
										<div>
											<Button
												variant={"ghost"}
												className="font-semibold mr-2 p-0 h-auto hover:opacity-80 hover:bg-transparent"
											>
												{post.user.username}
											</Button>
											<span className="text-sm">{post.caption}</span>
										</div>
										<div className="text-xs text-muted-foreground">
											{new Date(post.timestamp).toLocaleDateString()}
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								{comments.map((comment) => (
									<div key={comment.id} className="flex items-center space-x-2">
										<Button
											variant={"ghost"}
											className="shrink-0 p-0 h-auto hover:opacity-80 hover:bg-transparent"
										>
											{comment.user.avatar ? (
												<img
													src={getImageUrl(comment.user.avatar)}
													alt={comment.user.username}
													width={32}
													height={32}
													className="w-8 h-8 rounded-full"
												/>
											) : (
												<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
													<User className="w-4 h-4 text-muted-foreground" />
												</div>
											)}
										</Button>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<Button
														variant={"ghost"}
														className="font-semibold text-sm p-0 h-auto hover:opacity-80 hover:bg-transparent"
													>
														{comment.user.username}
													</Button>
													<p>{comment.text}</p>
													<p>{new Date(comment.createdAt).toLocaleDateString()}</p>
												</div>
												{session?.user.id === comment.user.id && (
													<Button
														variant={"ghost"}
														size={"sm"}
														className="p-1 h-auto shrink-0"
														onClick={() => handleDeleteComment(comment.id)}
													>
														<Trash2 className="w-3 h-3 text-muted-foreground" />
													</Button>
												)}
											</div>
										</div>
									</div>
								))}
								{comments.length === 0 && (
									<p className="text-sm">No comments yet. Be the first to comment!</p>
								)}
							</div>
						</div>

						<div className="border-t p-4">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center space-x-4">
									<Button
										variant={"ghost"}
										size={"icon"}
										onClick={handleLike}
										disabled={likePostMutation.isPending}
										className="p-0 h-auto"
									>
										<Heart
											className={`h-6 w-6 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
										/>
									</Button>
								</div>
								<div className="font-semibold text-sm mb-3">{`${post.likes} likes`}</div>
							</div>

							<div className="border-t p-4">
								<form onSubmit={handleAddComment} className="flex items-center space-x-2">
									<Input
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										placeholder="Add a comment..."
										className="flex-1"
									/>
									<Button type="submit" disabled={!commentText.trim()}>
										Post
									</Button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
