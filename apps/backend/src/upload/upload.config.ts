import { extname } from "node:path";
import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";

/**
 * 업로드된 파일의 이름을 고유하게 재생성하는 콜백 함수
 * - 원본 파일명 + 현재 타임스탬프 + UUID를 조합하여 파일명 충돌 방지
 * - Multer의 diskStorage filename 옵션에 전달하여 사용
 */
export const editFileName = (_request: Request, file: Express.Multer.File, callback: any) => {
	// 확장자를 제외한 원본 파일명 추출
	const name = file.originalname.split(".")[0];
	// 원본 파일의 확장자 추출 (예: .jpg, .png)
	const fileExtName = extname(file.originalname);
	// UUID v4로 고유한 랜덤 문자열 생성
	const randomName = uuidv4();
	// 최종 파일명: 원본이름-타임스탬프-UUID.확장자
	callback(null, `${name}-${Date.now()}-${randomName}${fileExtName}`);
};

/**
 * Multer 레벨 파일 필터 함수
 * - 파일이 디스크에 저장되기 전에 확장자를 검사하여 이미지 파일만 허용
 * - 허용 확장자: jpg, jpeg, png, gif, webp
 * - NestJS 파이프 검증보다 먼저 실행되어 잘못된 파일이 서버에 저장되는 것을 방지
 */
const imageFileFilter = (_request: Request, file: Express.Multer.File, callback: any) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
		return callback(new BadRequestException("Only image files are allowed!"), false);
	}

	callback(null, true);
};

/**
 * Multer 설정 객체
 * - diskStorage: 로컬 디스크에 파일을 저장하는 스토리지 엔진 (추후 클라우드 스토리지로 교체 예정)
 * - fileFilter: 파일 저장 전 이미지 타입 검증 (Multer 레벨 검증)
 * - limits.fileSize: 최대 업로드 파일 크기 제한
 * - NestJS 파이프와 함께 이중 검증 구조를 형성하여 잘못된 파일 업로드를 방지
 */
export const multerConfig: MulterOptions = {
	storage: diskStorage({
		// 업로드된 이미지가 저장될 로컬 디렉토리 경로
		destination: "./uploads/images",
		// 저장 시 사용할 파일명 생성 함수
		filename: editFileName,
	}),
	// Multer 레벨에서 파일 타입 검증 (파이프 실행 전에 잘못된 파일 저장 방지)
	fileFilter: imageFileFilter,
	limits: {
		// 최대 파일 크기 제한 (12MB)
		fileSize: 12 * 1024 * 1024,
	},
};
