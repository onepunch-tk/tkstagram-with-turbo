import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import Fab from "@/components/ui/fab";
import { useTRPC } from "@/lib/trpc/client";
import Feed from "../components/feed";
import PhotoUpload from "../components/photo-upload";
import SideBar from "../components/sidebar";
import Stories from "../components/stories";
import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	// 업로드 다이얼로그 표시 여부 — FAB 클릭 시 true, 다이얼로그 닫기 시 false
	const [showUploadModal, setShowUploadModal] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// tRPC + TanStack Query 통합: mutationOptions/queryOptions로 타입 안전한 서버 호출
	// onSuccess: 게시물 생성 성공 시 findAll 쿼리 캐시를 무효화하여 피드를 자동 갱신
	const createPost = useMutation(
		trpc.postsRouter.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.postsRouter.findAll.queryKey(),
				});
			},
		}),
	);
	const posts = useQuery(trpc.postsRouter.findAll.queryOptions());
	// 좋아요 토글 mutation — onMutate에서 클라이언트 캐시를 직접 갱신하여 즉각적인 UI 반영
	// 서버 재요청(invalidate) 대신 setQueryData로 메모리 내 캐시만 수정하므로 네트워크 비용 없음
	const likePost = useMutation(
		trpc.postsRouter.likePost.mutationOptions({
			onMutate: ({ postId }) => {
				// findAll 쿼리 캐시에서 해당 게시물의 isLiked/likes를 토글하여 즉시 UI에 반영
				queryClient.setQueryData(trpc.postsRouter.findAll.queryKey(), (old) => {
					if (!old) return old;

					return old.map((post) => {
						if (post.id === postId) {
							return {
								...post,
								isLiked: !post.isLiked,
								likes: post.isLiked ? post.likes - 1 : post.likes + 1,
							};
						}

						return post;
					});
				});
			},
		}),
	);

	// 댓글 생성 mutation — onSuccess에서 두 가지 캐시 업데이트 수행:
	// 1) 해당 게시물의 댓글 목록 캐시 무효화 → 리페치
	// 2) findAll 캐시에서 해당 게시물의 comments count를 +1 인메모리 업데이트
	const createComment = useMutation(
		trpc.commentsRouter.create.mutationOptions({
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.commentsRouter.findByPostId.queryKey({ postId: variables.postId }),
				});

				// findAll 캐시에서 해당 게시물의 댓글 수만 +1로 직접 갱신 (리페치 없이)
				queryClient.setQueryData(trpc.postsRouter.findAll.queryKey(), (old) => {
					if (!old) return old;

					return old.map((post) => {
						if (post.id === variables.postId) {
							return {
								...post,
								comments: post.comments + 1,
							};
						}

						return post;
					});
				});
			},
		}),
	);

	// 댓글 삭제 mutation — delete input에 postId가 없으므로 타겟 무효화 불가
	// 모든 댓글 쿼리와 게시물 목록 쿼리를 전체 무효화하여 리페치
	const deleteComment = useMutation(
		trpc.commentsRouter.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.commentsRouter.findByPostId.queryKey(),
				});

				queryClient.invalidateQueries({
					queryKey: trpc.postsRouter.findAll.queryKey(),
				});
			},
		}),
	);

	// tRPC 스토리 쿼리 — 24시간 이내의 활성 스토리를 사용자별 그룹으로 조회
	const stories = useQuery(trpc.storiesRouter.getStories.queryOptions());
	// 스토리 생성 mutation — 성공 시 getStories 캐시 무효화로 스토리 목록 자동 갱신
	const createStory = useMutation(
		trpc.storiesRouter.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.storiesRouter.getStories.queryKey(),
				});
			},
		}),
	);

	// 스토리 업로드 핸들러 — 게시물과 동일한 2단계 처리:
	// 1) REST /api/upload/image로 파일 업로드 → 파일명 획득
	// 2) tRPC create mutation으로 스토리 레코드 생성
	const handleStoryUpload = async (file: File) => {
		const formData = new FormData();
		formData.append("image", file);

		const uploadResponse = await fetch("/api/upload/image", {
			method: "POST",
			body: formData,
		});

		if (!uploadResponse.ok) {
			throw new Error("Failed to upload image");
		}

		const { filename } = await uploadResponse.json();

		await createStory.mutateAsync({ image: filename });
	};

	/**
	 * 게시물 생성 핸들러 — 2단계로 처리:
	 * 1) 이미지 파일을 REST 엔드포인트(/api/upload/image)로 업로드하여 파일명 획득
	 * 2) 획득한 파일명과 캡션을 tRPC mutation으로 전송하여 DB에 게시물 저장
	 */
	const handleCreatePost = async (file: File, caption: string) => {
		const formData = new FormData();
		formData.append("image", file);

		const uploadResponse = await fetch("/api/upload/image", {
			method: "POST",
			body: formData,
		});

		if (!uploadResponse.ok) {
			throw new Error("Failed to upload image");
		}

		const { filename } = await uploadResponse.json();

		await createPost.mutateAsync({
			image: filename,
			caption,
		});
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* 메인 레이아웃: 모바일 1열, 대형화면 3열 그리드 */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* 메인 콘텐츠 영역 (2열 차지) - Stories + Feed */}
					<div className="lg:col-span-2 space-y-6">
						<Stories onStoryUpload={handleStoryUpload} storyGroups={stories.data || []} />
						{/* posts.data가 아직 없으면(로딩 중) 빈 배열을 전달하여 빈 피드 렌더링 */}
						{/* onLikePost: 좋아요 클릭 시 likePost mutation 실행 (like/unlike 토글) */}
						<Feed
							posts={posts.data || []}
							onLikePost={(postId) => likePost.mutate({ postId })}
							onAddComment={(postId, text) => {
								createComment.mutate({ postId, text });
							}}
							onDeleteComment={(commentId) => {
								deleteComment.mutate({ commentId });
							}}
						/>
					</div>
					{/* 사이드바 영역 - 대형화면에서 스크롤 시 고정 */}
					<div className="lg:sticky lg:top-8 lg:h-fit">
						<SideBar />
					</div>
				</div>
			</div>

			{/* 게시물 생성 다이얼로그 — ShadCN Dialog 기반, 파일 업로드 + 캡션 입력 */}
			<PhotoUpload
				open={showUploadModal}
				onOpenChange={setShowUploadModal}
				onSubmit={handleCreatePost}
			/>
			{/* FAB(Floating Action Button) — 클릭 시 업로드 다이얼로그 표시 */}
			<Fab onClick={() => setShowUploadModal(true)}>
				<Plus className="h-6 w-6" />
			</Fab>
		</div>
	);
}
