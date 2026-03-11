import type { Comment } from "@repo/trpc/schemas";
import { Trash2, User } from "lucide-react";
import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/lib/image.client";

/**
 * Comments — 댓글 목록 표시 및 새 댓글 입력을 담당하는 프레젠테이션 컴포넌트
 * 데이터 페칭 없이 props로 전달받은 댓글 배열만 렌더링하는 "dumb" 컴포넌트
 */
interface CommentsPorps {
	comments: Comment[];
	onAddComment: (text: string) => void;
	onDeleteComment: (commentId: number) => void;
}

export default function Comments({ comments, onAddComment, onDeleteComment }: CommentsPorps) {
	const [commentText, setCommentText] = useState("");

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (commentText.trim()) {
			onAddComment(commentText);
			setCommentText("");
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-3 max-h-64 overflow-y-auto">
				{comments.map((comment) => (
					<div key={comment.id} className="flex items-start space-x-2">
						{getImageUrl(comment.user.avatar) ? (
							<img
								src={getImageUrl(comment.user.avatar)}
								alt={comment.user.username}
								width={32}
								height={32}
								className="w-8 h-8 rounded-full shrink-0"
							/>
						) : (
							<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
								<User className="w-4 h-4 text-muted-foreground" />
							</div>
						)}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<span className="font-semibold text-sm">{comment.user.username}</span>
									<p className="text-sm wrap-break-word">{comment.text}</p>
									<p className="text-xs text-muted-foreground mt-1">
										{new Date(comment.createdAt).toLocaleDateString()}
									</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="p-1 h-auto shrink-0"
									onClick={() => onDeleteComment(comment.id)}
								>
									<Trash2 className="w-3 h-3 text-muted-foreground" />
								</Button>
							</div>
						</div>
					</div>
				))}

				{comments.length === 0 && (
					<p className="text-sm text-muted-foreground text-center py-4">
						No comments yet. Be the First to comment!
					</p>
				)}

				<form onSubmit={handleSubmit} className="flex items-center space-x-2">
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
	);
}
