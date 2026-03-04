import { Plus } from "lucide-react";
import { useState } from "react";
import Feed from "@/components/dashboard/feed";
import PhotoUpload from "@/components/dashboard/photo-upload";
import SideBar from "@/components/dashboard/sidebar";
import Stories from "@/components/dashboard/stories";
import Fab from "@/components/ui/fab";
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

	// PhotoUpload의 onSubmit 핸들러 — 추후 파일 업로드 API + TRPC mutation(create post) 호출 구현 예정
	const handleCreatePost = async (_file: File, _captionn: string) => {};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* 메인 레이아웃: 모바일 1열, 대형화면 3열 그리드 */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* 메인 콘텐츠 영역 (2열 차지) - Stories + Feed */}
					<div className="lg:col-span-2 space-y-6">
						<Stories />
						<Feed />
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
