import { Image, Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface FileUploadAreaProps {
	onFileSelect: (file: File) => void;
}

export default function FileUploadArea({ onFileSelect }: FileUploadAreaProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	// 드래그 시 브라우저 기본 동작(파일을 새 탭에서 열기) 방지
	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	// 드래그 앤 드롭으로 파일 업로드 처리
	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const file = event.dataTransfer.files?.[0];
		if (file?.type.startsWith("image/")) {
			onFileSelect(file);
		}
	};

	// file input의 onChange로 파일 선택 처리 (handleDrop과 동일한 FileReader 패턴)
	const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target?.files?.[0];
		if (file?.type.startsWith("image/")) {
			onFileSelect(file);
		}
	};

	// ShadCN Dialog 기반 — open/onOpenChange로 열기/닫기 제어
	// 미리보기가 없으면 파일 업로드 영역, 있으면 이미지 프리뷰 + 캡션 입력 영역 표시
	return (
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
			<p className="text-sm text-muted-foreground mb-4">or click to select from your computer</p>
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
	);
}
