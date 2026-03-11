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
import { Label } from "@/components/ui/label";

/**
 * PhotoUpload 컴포넌트 Props
 * - 비즈니스 로직을 부모에 위임하는 "dumb" 컴포넌트 패턴
 * - onSubmit으로 파일과 캡션을 부모에 전달 → 부모가 서버 업로드 및 TRPC mutation 처리
 */
interface PhotoUploadProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (file: File, caption: string) => Promise<void>;
}

export default function PhotoUpload({ open, onOpenChange, onSubmit }: PhotoUploadProps) {
	const [preview, setPreview] = useState<string | null>(null); // 업로드된 이미지의 Data URL (미리보기용)
	const [selectedFile, setSelectedFile] = useState<File | null>(null); // 실제 업로드할 File 객체
	const [isUploading, setIsUploading] = useState(false); // 업로드 중 상태 — 중복 업로드 방지용
	const [caption, setCaption] = useState("");

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
		setCaption("");
	};

	// Share 버튼 클릭 시 — 파일과 캡션을 부모의 onSubmit 핸들러에 전달
	// 부모에서 파일 업로드 API + TRPC mutation(create post)을 호출
	const handleUpload = async () => {
		if (!selectedFile || !caption.trim()) {
			return;
		}

		setIsUploading(true);
		try {
			await onSubmit(selectedFile, caption.trim());
			handleClearSelection();
			onOpenChange(false); // 업로드 성공 시 다이얼로그 닫기
		} catch (err) {
			console.error("Error creating post", err);
		}
		setIsUploading(false);
	};

	// ShadCN Dialog 기반 — open/onOpenChange로 열기/닫기 제어
	// 미리보기가 없으면 파일 업로드 영역, 있으면 이미지 프리뷰 + 캡션 입력 영역 표시
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Create new post</DialogTitle>
				</DialogHeader>

				{!preview ? (
					<FileUploadArea onFileSelect={handleFileSelect} />
				) : (
					<div className="space-y-4">
						<div className="relative">
							<img
								src={preview}
								alt="Preview"
								width={64}
								height={64}
								className="w-full h-64 object-cover rounded-lg"
							/>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
								onClick={handleClearSelection}
							>
								<X className="w-4 h-4" />
							</Button>
						</div>

						<div className="space-y-2">
							<Label htmlFor="caption">Caption</Label>
							<textarea
								id="caption"
								placeholder="Write a caption..."
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
								rows={3}
								className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={handleClearSelection} disabled={isUploading}>
								Back
							</Button>
							<Button onClick={handleUpload} disabled={isUploading || !caption.trim()}>
								Share
							</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
