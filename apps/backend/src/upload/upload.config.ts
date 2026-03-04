import { extname } from "node:path";
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
 * Multer 설정 객체
 * - diskStorage: 로컬 디스크에 파일을 저장하는 스토리지 엔진
 * - 프로덕션 환경에서는 클라우드 스토리지(S3 등)로 교체 예정
 */
export const multerConfig = {
	storage: diskStorage({
		// 업로드된 이미지가 저장될 로컬 디렉토리 경로
		destination: "./uploads/images",
		// 저장 시 사용할 파일명 생성 함수
		filename: editFileName,
	}),
};
