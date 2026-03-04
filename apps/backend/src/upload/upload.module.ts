import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { multerConfig } from "./upload.config";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

/**
 * 파일 업로드 모듈
 * - 게시물, 프로필 사진, 스토리 등 다양한 이미지 업로드를 처리하는 범용 모듈
 * - NestJS의 MulterModule을 통해 Multer 라이브러리를 통합하여
 *   멀티파트 폼 데이터에서 파일을 추출하고 로컬 디스크에 저장
 */
@Module({
	imports: [
		// multerConfig에 정의된 스토리지 설정(디스크 저장, 파일명 생성 규칙)으로 Multer 초기화
		MulterModule.register(multerConfig),
	],
	controllers: [UploadController],
	providers: [UploadService],
})
export class UploadModule {}
