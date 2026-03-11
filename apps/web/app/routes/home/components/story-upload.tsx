import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import FileUploadArea from "@/components/ui/file-upload-area";

interface StoryUploadProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (file: File) => Promise<void>;
}

export default function StoryUpload({ open, onOpenChange, onSubmit }: StoryUploadProps) {
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

	// Share 버튼 클릭 시 — 파일과 캡션을 부모의 onSubmit 핸들러에 전달
	// 부모에서 파일 업로드 API + TRPC mutation(create post)을 호출
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
			console.error("Error creating post", err);
		}
		setIsUploading(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Add to your story</DialogTitle>
				</DialogHeader>

				{!preview ? (
					<FileUploadArea onFileSelect={handleFileSelect} />
				) : (
					<div className="space-y-4">
						<div className="relative">
							<img
								src={preview}
								alt="Preview"
								height={64}
								width={64}
								className="w-full h-96 object-cover rounded-lg"
							/>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearSelection}
								className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={handleClearSelection} disabled={isUploading}>
								Back
							</Button>
							<Button onClick={handleUpload} disabled={isUploading}>
								Share to Story
							</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
