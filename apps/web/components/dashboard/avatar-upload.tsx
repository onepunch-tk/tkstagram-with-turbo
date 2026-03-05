import { X } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "@/lib/image.client";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import FileUploadArea from "../ui/file-upload-area";

/**
 * PhotoUpload 컴포넌트 Props
 * - 비즈니스 로직을 부모에 위임하는 "dumb" 컴포넌트 패턴
 * - onSubmit으로 파일과 캡션을 부모에 전달 → 부모가 서버 업로드 및 TRPC mutation 처리
 */
interface AvatarUploadProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (file: File) => Promise<void>;
	currentAvatar?: string | null;
}

export default function AvatarUpload({
	open,
	onOpenChange,
	onSubmit,
	currentAvatar,
}: AvatarUploadProps) {
	const [preview, setPreview] = useState<string | null>(null); // 업로드된 이미지의 Data URL (미리보기용)
	const [selectedFile, setSelectedFile] = useState<File | null>(null); // 실제 업로드할 File 객체
	const [isUploading, setIsUploading] = useState(false); // 업로드 중 상태 — 중복 업로드 방지용

	const handleFileSelect = (file: File) => {
		setSelectedFile(file);
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreview(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	// 선택 초기화 — Back 버튼, X 버튼, 업로드 완료 시 호출하여 모달 상태 리셋
	const handleClearSelection = () => {
		setSelectedFile(null);
		setPreview(null);
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			return;
		}

		setIsUploading(true);
		try {
			await onSubmit(selectedFile);
			handleClearSelection();
			onOpenChange(false); // 업로드 성공 시 다이얼로그 닫기
		} catch (err) {
			console.error("Error creating avatar", err);
		}
		setIsUploading(false);
	};

	// ShadCN Dialog 기반 — open/onOpenChange로 열기/닫기 제어
	// 미리보기가 없으면 파일 업로드 영역, 있으면 이미지 프리뷰 + 캡션 입력 영역 표시
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Update Profile Picture</DialogTitle>
				</DialogHeader>

				{!preview ? (
					<div>
						{currentAvatar && (
							<div className="flex justify-center">
								<img
									src={getImageUrl(currentAvatar)}
									alt="Current avatar"
									className="w-24 h-24 rounded-full object-cover border-2 border-muted"
								/>
							</div>
						)}
						<FileUploadArea onFileSelect={handleFileSelect} />
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex justify-center">
							<div className="relative">
								<img
									src={preview}
									alt="Preview"
									width={64}
									height={64}
									className="w-32 h-32 rounded-full object-cover border-2 border-primary"
								/>
								<Button
									variant="ghost"
									size="sm"
									className="absolute -top-2 -right-2 bg-black/50 text-white hover:bg-black/70 rounded-full p-2"
									onClick={handleClearSelection}
								>
									<X className="w-4 h-4" />
								</Button>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={handleClearSelection} disabled={isUploading}>
								Back
							</Button>
							<Button onClick={handleUpload} disabled={isUploading}>
								{isUploading ? "Updating..." : "Update avatar"}
							</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
