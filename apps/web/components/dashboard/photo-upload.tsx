import { Image, Upload, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
	const fileInputRef = useRef<HTMLInputElement>(null); // 숨겨진 file input에 대한 ref — 버튼/div 클릭 시 프로그래밍적으로 click() 호출

	// 드래그 시 브라우저 기본 동작(파일을 새 탭에서 열기) 방지
	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	// 드래그 앤 드롭으로 파일 업로드 처리
	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const file = event.dataTransfer.files?.[0];
		if (file?.type.startsWith("image/")) {
			setSelectedFile(file);
			// FileReader로 이미지를 Data URL로 변환하여 미리보기 표시
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// file input의 onChange로 파일 선택 처리 (handleDrop과 동일한 FileReader 패턴)
	const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target?.files?.[0];
		if (file?.type.startsWith("image/")) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// 선택 초기화 — Back 버튼, X 버튼, 업로드 완료 시 호출하여 모달 상태 리셋
	const handleClearSelection = () => {
		setSelectedFile(null);
		setPreview(null);
		setCaption("");
		if (fileInputRef.current) {
			fileInputRef.current.value = ""; // file input의 선택된 파일명도 리셋
		}
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
					// 파일 업로드 영역 — 드래그 앤 드롭 또는 클릭으로 파일 선택
					// biome-ignore lint/a11y/noStaticElementInteractions: drop zone area
					// biome-ignore lint/a11y/useKeyWithClickEvents: file input triggered via ref
					<div
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={() => fileInputRef?.current?.click()} // 숨겨진 file input을 프로그래밍적으로 클릭
						className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
					>
						<Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-lg font-medium mb-2">Drag photos here</p>
						<p className="text-sm text-muted-foreground mb-4">
							or click to select from your computer
						</p>
						<Button variant="outline">
							<Image className="w-4 h-4 mr-2" />
							Select from your computer
						</Button>
						{/* 실제 file input — hidden으로 숨기고 ref로 제어, accept="image/*"로 이미지만 허용 */}
						<Input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							className="hidden"
						/>
					</div>
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
