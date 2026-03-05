import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

/**
 * 파일 크기 검증 파이프
 * - NestJS PipeTransform을 구현하여 요청 실행 전에 파일 크기를 검증
 * - Multer 인터셉터 이후에 실행되므로, Multer 레벨 검증과 함께 이중 검증 구조를 형성
 * - 파일이 없거나 최대 크기를 초과하면 400 Bad Request 에러를 반환
 */
@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
	// 최대 허용 파일 크기 (12MB)
	private readonly maxSize = 12 * 1024 * 1024;

	transform(value: Express.Multer.File, _metadata: ArgumentMetadata) {
		if (!value) {
			throw new BadRequestException("No file provided");
		}

		// Multer가 제공하는 size 속성으로 파일 크기 검증
		if (value.size > this.maxSize) {
			throw new BadRequestException(
				`File size exceeds the maximum limit of ${this.maxSize / (1024 * 1024)}MB`,
			);
		}

		// 검증 통과 시 원본 파일 객체를 컨트롤러로 전달
		return value;
	}
}

/**
 * 파일 타입 검증 파이프
 * - NestJS PipeTransform을 구현하여 요청 실행 전에 파일 MIME 타입을 검증
 * - 허용된 이미지 타입(JPEG, PNG, GIF, WebP)만 통과시킴
 * - Multer의 fileFilter가 확장자를 검사하는 반면, 이 파이프는 MIME 타입을 검사하여 보완
 */
@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
	// 허용되는 이미지 MIME 타입 목록
	private readonly allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

	transform(value: Express.Multer.File, _metadata: ArgumentMetadata) {
		if (!value) {
			throw new BadRequestException("No file provided");
		}

		// Multer가 제공하는 mimetype 속성으로 파일 타입 검증
		if (!this.allowedTypes.includes(value.mimetype)) {
			throw new BadRequestException(
				`File type ${value.mimetype} is not allowed. Allowed types: ${this.allowedTypes.join(", ")}`,
			);
		}

		// 검증 통과 시 원본 파일 객체를 컨트롤러로 전달
		return value;
	}
}
