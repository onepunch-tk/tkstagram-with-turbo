import { Injectable } from "@nestjs/common";

/**
 * 파일 업로드 비즈니스 로직을 담당하는 서비스
 * - 현재는 Multer가 로컬 디스크에 저장한 파일의 이름을 반환하는 스텁 메서드
 * - 추후 클라우드 기반 스토리지(S3 등) 업로드 로직을 이 서비스에 구현 예정
 */
@Injectable()
export class UploadService {
	/**
	 * 이미지 업로드 처리 (스텁 메서드)
	 * - Multer의 editFileName 함수가 생성한 고유 파일명을 반환
	 * - 클라이언트는 이 파일명을 사용하여 게시물(Post)과 업로드된 파일을 연결
	 * - 추후 클라우드 스토리지 업로드 로직으로 교체 예정
	 */
	uploadImage(file: Express.Multer.File) {
		return { filename: file.filename };
	}
}
