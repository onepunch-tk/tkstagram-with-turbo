import { Heart, MessageCircle, User } from "lucide-react";
import { getImageUrl } from "@/lib/image.client";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

/** tRPC postSchema와 동일한 구조 — 서버에서 반환하는 게시물 응답 타입 */
interface Post {
	id: number;
	user: {
		username: string;
		avatar: string;
	};
	image: string;
	caption: string;
	likes: number;
	comments: number;
	timestamp: string;
	isLiked?: boolean;
}

/**
 * Feed 컴포넌트 props — 부모(Home)에서 tRPC 쿼리로 조회한 게시물 배열을 전달받음
 * onLikePost: 좋아요 토글 핸들러 — 컴포넌트를 "dumb"하게 유지하기 위해 부모에서 주입
 */
interface FeedProps {
	posts: Post[];
	onLikePost: (postId: number) => void;
}

export default function Feed({ posts, onLikePost }: FeedProps) {
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
								<Button variant="ghost" size="sm" onClick={() => {}} className="p-0 h-auto">
									<MessageCircle className="w-6 h-6 text-foreground" />
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
					</div>
				</Card>
			))}
		</div>
	);
}
