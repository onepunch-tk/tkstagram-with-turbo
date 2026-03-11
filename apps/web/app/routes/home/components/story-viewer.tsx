import type { StoryGroup } from "@repo/trpc/schemas";
import { ChevronLeft, ChevronRight, User, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/image.client";

// 스토리 뷰어 모달 — 모든 스토리 그룹을 하나의 컴포넌트에서 렌더링
// initialGroupIndex로 클릭한 사용자의 스토리 그룹부터 시작
interface StoryViewerProps {
	storyGroups: StoryGroup[];
	open: boolean;
	initialGroupIndex: number;
	onOpenChange: (open: boolean) => void;
}
export default function StoryViewer({
	storyGroups,
	open,
	onOpenChange,
	initialGroupIndex,
}: StoryViewerProps) {
	const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex); // 현재 보고 있는 스토리 그룹
	const [currentStoryIndex, setCurrentStoryIndex] = useState(0); // 그룹 내 현재 스토리 인덱스
	const [progress, setProgress] = useState(0); // 프로그레스 바 진행률 (0~100)

	const currentGroup = storyGroups[currentGroupIndex];
	const currentStory = currentGroup?.stories[currentStoryIndex];

	const handleClose = () => {
		onOpenChange(false);
	};

	// 다음 스토리로 이동 — 그룹 내 다음 스토리가 있으면 진행, 마지막이면 처음으로 순환
	const handleNext = useCallback(() => {
		if (!currentGroup) return;

		if (currentStoryIndex < currentGroup.stories.length - 1) {
			setCurrentStoryIndex(currentStoryIndex + 1);
			setProgress(0);
		} else {
			setCurrentStoryIndex(0);
			setProgress(0);
		}
	}, [currentGroup, currentStoryIndex]);

	const handlePrevious = () => {
		if (!currentGroup) return;

		if (currentStoryIndex > 0) {
			setCurrentStoryIndex(currentStoryIndex - 1);
			setProgress(0);
		}
	};

	// 모달이 열릴 때마다 상태를 초기값으로 리셋
	useEffect(() => {
		if (open) {
			setCurrentGroupIndex(initialGroupIndex);
			setCurrentStoryIndex(0);
			setProgress(0);
		}
	}, [open, initialGroupIndex]);

	// 슬라이드쇼 타이머 — 100ms마다 progress를 +2씩 증가 (총 약 5초)
	// progress가 100에 도달하면 handleNext로 다음 스토리로 자동 전환
	useEffect(() => {
		if (!open || !currentStory) return;

		setProgress(0);
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					handleNext();
					return 0;
				}

				return prev + 2;
			});
		}, 100);

		return () => clearInterval(interval);
	}, [currentStory?.id, open, currentStory, handleNext]);

	if (!currentGroup || !currentStory) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent
				className="max-w-md! w-full h-[90vh] p-0 overflow-hidden bg-black"
				showCloseButton={false}
			>
				<div className="relative w-full h-full flex items-center justify-center">
					{/* 프로그레스 바 — 스토리 수만큼 분할, 현재 스토리는 progress%만큼 채움 */}
				<div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
						{currentGroup.stories.map((_, index) => (
							<div
								key={index.toString()}
								className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
							>
								<div
									className="h-full bg-white transition-all duration-100"
									style={{
										width:
											index < currentStoryIndex
												? "100%"
												: index === currentStoryIndex
													? `${progress}%`
													: "0%",
									}}
								/>
							</div>
						))}
					</div>

					<div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2">
						<button
							type="button"
							className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
						>
							{currentGroup.avatar ? (
								<img
									src={getImageUrl(currentGroup.avatar)}
									alt={currentGroup.username}
									width={32}
									height={32}
									className="w-8 h-8 rounded-full object-cover border-2 border-white"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
									<User className="w-4 h-4 text-white" />
								</div>
							)}
							<div>
								<div className="text-white font-semibold text-sm">{currentGroup.username}</div>
							</div>
						</button>

						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={handleClose}
								className="text-white hover:bg-white/20"
							>
								<X className="w-5 h-5" />
							</Button>
						</div>
					</div>

					<div className="relative w-full h-full">
						<img
							src={getImageUrl(currentStory.image)}
							alt="Story"
							className="absolute inset-0 w-full h-full object-cover"
						/>
					</div>

					{(currentGroupIndex > 0 || currentStoryIndex > 0) && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handlePrevious}
							className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70 transition-colors"
						>
							<ChevronLeft className="w-6 h-6" />
						</Button>
					)}

					<Button
						variant="ghost"
						size="icon"
						onClick={handleNext}
						className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70 transition-colors"
					>
						<ChevronRight className="w-6 h-6" />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
