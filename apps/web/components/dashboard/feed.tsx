import { Heart, MessageCircle } from "lucide-react";
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
}

/** Feed 컴포넌트 props — 부모(Home)에서 tRPC 쿼리로 조회한 게시물 배열을 전달받음 */
interface FeedProps {
	posts: Post[];
}

export default function Feed({ posts }: FeedProps) {
	return (
		<div className="space-y-6">
			{posts.map((post) => (
				<Card key={post.id} className="overflow-hidden">
					<div className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-3">
							<img
								src={post.user.avatar}
								alt={post.user.username}
								width={64}
								height={64}
								className="w-8 h-8 rounded-full"
							/>
							<span className="font-semibold text-sm">{post.user.username}</span>
						</div>
					</div>

					<div className="aspect-square relative">
						<img
							src={post.image}
							alt="Post"
							className="w-full h-full object-cover"
							width={600}
							height={600}
						/>
					</div>

					<div className="p-4 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Button variant="ghost" size="sm" onClick={() => {}} className="p-0 h-auto">
									<Heart className="w-6 h-6 text-foreground" />
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

						<div className="text-sx text-muted-foreground uppercase">{post.timestamp}</div>
					</div>
				</Card>
			))}
		</div>
	);
}
