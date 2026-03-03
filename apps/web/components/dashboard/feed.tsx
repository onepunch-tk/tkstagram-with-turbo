import { Heart, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface Post {
	id: string;
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

const mockPosts: Post[] = [
	{
		id: "1",
		user: {
			username: "johndoe",
			avatar:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
		},
		image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
		caption: "Beautiful sunset at the beach",
		likes: 142,
		comments: 8,
		timestamp: "2 hours ago",
	},
	{
		id: "2",
		user: {
			username: "janedoe",
			avatar:
				"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face",
		},
		image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
		caption: "Coffee and code #dev #coffee",
		likes: 89,
		comments: 12,
		timestamp: "4 hours ago",
	},
	{
		id: "3",
		user: {
			username: "photographer",
			avatar:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
		},
		image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop",
		caption: "Nature at its finest #photography #nature",
		likes: 234,
		comments: 15,
		timestamp: "6 hours ago",
	},
];

export default function Feed() {
	return (
		<div className="space-y-6">
			{mockPosts.map((post) => (
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
