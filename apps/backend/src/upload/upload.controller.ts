import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe, FileTypeValidationPipe } from "./file-validation.pipe";
import { UploadService } from "./upload.service";

/**
 * 파일 업로드 요청을 처리하는 컨트롤러
 * - POST /upload/image 라우트를 통해 이미지 업로드를 처리
 * - Multer FileInterceptor를 사용하여 multipart/form-data에서 파일을 추출
 * - NestJS Pipe를 통해 파일 크기 및 타입 검증을 수행
 */
@Controller("upload")
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	/**
	 * 이미지 업로드 라우트
	 * - @UseInterceptors: Multer FileInterceptor를 적용하여 요청이 실행되기 전에
	 *   multipart/form-data에서 "image" 필드의 파일을 추출
	 * - @UploadedFile: Multer가 추출한 파일 객체를 매개변수로 주입하는 파라미터 데코레이터
	 * - FileSizeValidationPipe, FileTypeValidationPipe: 파일이 컨트롤러에 도달하기 전에
	 *   크기와 타입을 검증하는 NestJS 파이프 (Multer 레벨 검증 이후 이중 검증)
	 */
	@Post("image")
	@UseInterceptors(FileInterceptor("image"))
	async uploadFile(
		@UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe())
		file: Express.Multer.File,
	) {
		return this.uploadService.uploadImage(file);
	}
}
