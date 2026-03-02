import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	// bodyParser: false - BetterAuth가 기본 body parser와 호환되지 않기 때문에 비활성화
	// BetterAuth는 자체적으로 요청 본문을 파싱하므로 NestJS의 기본 body parser를 꺼야 정상 동작
	const app = await NestFactory.create(AppModule, { bodyParser: false });
	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
