import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import Comments from "./comments";

/**
 * PostComments — 개별 게시물의 댓글을 페칭하고 Comments 컴포넌트에 전달하는 래퍼 컴포넌트
 * 이 컴포넌트만 사용하는 로컬 쿼리이므로 프레젠테이션 레이어에서 직접 데이터 페칭 수행
 */
interface PostCommentsProps {
	postId: number;
	onAddComment: (postId: number, text: string) => void;
	onDeleteComment: (postId: number) => void;
}

export default function PostComments({ postId, onAddComment, onDeleteComment }: PostCommentsProps) {
	const trpc = useTRPC();
	// postId에 해당하는 댓글 목록을 tRPC로 조회
	const { data: comments } = useQuery(trpc.commentsRouter.findByPostId.queryOptions({ postId }));
	return (
		<Comments
			comments={comments || []}
			onAddComment={(text) => onAddComment(postId, text)}
			onDeleteComment={onDeleteComment}
		/>
	);
}
