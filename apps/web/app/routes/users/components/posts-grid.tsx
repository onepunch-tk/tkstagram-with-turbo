import type { Post } from "@repo/trpc/schemas";
import { Heart, MessageCircle } from "lucide-react";
import { getImageUrl } from "@/lib/image.client";

interface PostsGridProps {
	posts: Post[];
	onPostClick: (post: Post) => void;
}

export default function PostsGrid({ posts, onPostClick }: PostsGridProps) {
	return (
		<div className="grid grid-cols-3 gap-1 md:gap-4">
			{posts.map((post) => (
				<button
					type="button"
					key={post.id}
					className="aspect-square relative group cursor-pointer overflow-hidden rounded-sm"
					onClick={() => onPostClick(post)}
				>
					<img src={getImageUrl(post.image)} alt={post.caption} className="object-cover" />
					<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
						<div className="flex items-center gap-2">
							<Heart className="w-5 h-5" />
							<span className="font-semibold">{post.likes}</span>
						</div>
						<div className="flex items-center gap-2">
							<MessageCircle className="w-5 h-5" />
							<span className="font-semibold">{post.comments}</span>
						</div>
					</div>
				</button>
			))}
		</div>
	);
}
