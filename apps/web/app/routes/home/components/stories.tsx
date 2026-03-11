import type { StoryGroup } from "@repo/trpc/schemas";
import { Plus, User } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/app/routes/auth/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image.client";
import StoryUpload from "./story-upload";
import StoryViewer from "./story-viewer";

// storyGroups: tRPC getStories 쿼리에서 가져온 스토리 그룹 목록 (사용자별 그룹핑)
// onStoryUpload: 이미지 파일 업로드 → tRPC create mutation 실행하는 콜백
interface StoriesProps {
	storyGroups: StoryGroup[];
	onStoryUpload: (file: File) => Promise<void>;
}

export default function Stories({ storyGroups, onStoryUpload }: StoriesProps) {
	const { data: session } = authClient.useSession();
	const [showCreateStory, setShowCreateStory] = useState(false); // 스토리 업로드 모달 표시 여부
	const [showStoryViewer, setShowStoryViewer] = useState(false); // 스토리 뷰어 모달 표시 여부
	const [selectedGroupIndex, setSelectedGroupIndex] = useState(0); // 뷰어에 전달할 초기 그룹 인덱스

	// 자신의 스토리와 다른 사용자의 스토리를 분리하여 렌더링 순서 제어
	// 자신의 스토리는 항상 첫 번째에 표시되며, 스토리가 없어도 "Your Story" 아이콘 노출
	const ownStoryGroup = storyGroups.find((group) => group.userId === session?.user.id);
	const otherStoryGroup = storyGroups.filter((group) => group.userId !== session?.user.id);

	return (
		<Card className="p-4">
			<div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
				<div className="flex flex-col items-center space-y-1 flex-shrink-8">
					<div className="relative">
						{/* 자신의 스토리가 있으면 그라데이션 테두리, 없으면 회색 테두리 */}
						<button
							type="button"
							onClick={() => {
								if (ownStoryGroup) {
									setSelectedGroupIndex(0);
									setShowStoryViewer(true);
								}
							}}
							className={`p-0.5 rounded-full ${ownStoryGroup ? "bg-linear-to-tr from-yellow-400 to-fuchsia-600" : "bg-gray-200"}`}
						>
							{session?.user.image ? (
								<img
									src={getImageUrl(session?.user.image)}
									alt="Your profile avatar"
									className="w-16 h-16 rounded-full object-cover border-2 border-white"
								/>
							) : (
								<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
									<User className="h-6 w-6 text-muted-foreground" />
								</div>
							)}
						</button>
						<Button
							onClick={() => setShowCreateStory(true)}
							size="icon"
							className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white"
						>
							<Plus className="w-3 h-3" />
						</Button>
					</div>
					<span className="text-xs text-center w-16 truncate" title="Your story">
						Your Story
					</span>
				</div>
				{otherStoryGroup?.map((storyGroup, index) => (
					<button
						type="button"
						key={storyGroup.userId}
						className="flex flex-col items-center space-y-1 flex-shrink-8"
						onClick={() => {
							setSelectedGroupIndex(ownStoryGroup ? index + 1 : index);
							setShowStoryViewer(true);
						}}
					>
						<div className="relative">
							{/* 다른 사용자의 스토리는 항상 인스타그램 스타일 그라데이션 테두리 적용 */}
					<div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 to-fuchsia-600 bg-gray-200">
								{storyGroup.avatar ? (
									<img
										src={getImageUrl(storyGroup.avatar)}
										alt={storyGroup.username}
										width={64}
										height={64}
										className="w-16 h-16 rounded-full object-cover border-2 border-white"
									/>
								) : (
									<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-white">
										<User className="h-6 w-6 text-muted-foreground" />
									</div>
								)}
							</div>
						</div>
						<span className="text-xs text-center w-16 truncate" title={storyGroup.username}>
							{storyGroup.username}
						</span>
					</button>
				))}
			</div>
			<StoryUpload
				open={showCreateStory}
				onOpenChange={setShowCreateStory}
				onSubmit={onStoryUpload}
			/>

			<StoryViewer
				storyGroups={storyGroups}
				initialGroupIndex={selectedGroupIndex}
				open={showStoryViewer}
				onOpenChange={setShowStoryViewer}
			/>
		</Card>
	);
}
