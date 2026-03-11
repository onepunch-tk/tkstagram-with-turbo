import type { Post } from "@repo/trpc/schemas";
import { Heart, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image.client";
import PostComments from "./post-comments";

/**
 * Feed 컴포넌트 props — 부모(Home)에서 tRPC 쿼리로 조회한 게시물 배열을 전달받음
 * onLikePost: 좋아요 토글 핸들러 — 컴포넌트를 "dumb"하게 유지하기 위해 부모에서 주입
 */
interface FeedProps {
	posts: Post[];
	onLikePost: (postId: number) => void;
	onAddComment: (postId: number, text: string) => void;
	onDeleteComment: (commentId: number) => void;
}

export default function Feed({ posts, onLikePost, onAddComment, onDeleteComment }: FeedProps) {
	// 댓글 섹션이 펼쳐진 게시물의 ID를 Set으로 관리
	// Set은 참조 비교이므로, 토글 시 new Set()으로 새 참조를 생성하여 리렌더 유발
	const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

	// 댓글 버블 클릭 시 해당 게시물의 댓글 섹션 표시/숨김 토글
	const toggleComments = (postId: number) => {
		setExpandedComments((prev) => {
			const newSet = new Set(prev);

			if (newSet.has(postId)) {
				newSet.delete(postId);
			} else {
				newSet.add(postId);
			}

			return newSet;
		});
	};
	return (
		<div className="space-y-6">
			{posts.map((post) => (
				<Card key={post.id} className="overflow-hidden">
					<div className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-3">
							{post.user.avatar ? (
								<img
									src={getImageUrl(post.user.avatar)}
									alt={post.user.username}
									width={64}
									height={64}
									className="w-8 h-8 rounded-full"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<User className="h-4 w-4 text-muted-foreground" />
								</div>
							)}
							<span className="font-semibold text-sm">{post.user.username}</span>
						</div>
					</div>

					<div className="aspect-square relative">
						<img
							src={getImageUrl(post.image)}
							alt="Post"
							className="absolute w-full h-full object-cover"
						/>
					</div>

					<div className="p-4 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								{/* 좋아요 버튼 — isLiked 상태에 따라 채워진/빈 하트 렌더링 */}
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onLikePost(post.id)}
									className="p-0 h-auto"
								>
									<Heart
										className={`w-6 h-6 ${post.isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`}
									/>
								</Button>
								{/* 댓글 버튼 — 클릭 시 댓글 섹션 토글, 펼쳐진 상태면 아이콘 채움 */}
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggleComments(post.id)}
									className="p-0 h-auto"
								>
									<MessageCircle
										className={`w-6 h-6 ${expandedComments.has(post.id) ? "fill-primary text-primary" : "text-foreground"} text-foreground`}
									/>
								</Button>
							</div>
						</div>

						<div className="text-sm font-semibold">{post.likes} likse</div>
						<div className="text-sm">
							<span className="font-semibold">{post.user.username} </span>
							{post.caption}
						</div>

						{post.comments > 0 && (
							<div className="text-sm text-muted-foreground">View all {post.comments} comments</div>
						)}

						<div className="text-sx text-muted-foreground uppercase">
							{new Date(post.timestamp).toLocaleDateString()}
						</div>

						{/* 댓글 섹션 — expandedComments Set에 포함된 게시물만 렌더링 */}
						{expandedComments.has(post.id) && (
							<div className="pt-4 border-t">
								<PostComments
									postId={post.id}
									onAddComment={onAddComment}
									onDeleteComment={onDeleteComment}
								/>
							</div>
						)}
					</div>
				</Card>
			))}
		</div>
	);
}
