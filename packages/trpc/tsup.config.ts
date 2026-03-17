import { defineConfig } from "tsup";

export default defineConfig({
	// 빌드할 엔트리 포인트 정의
	// 키: 출력 파일 경로 (dist/ 기준), 값: 소스 파일 경로
	// 예: "schemas/index" → dist/schemas/index.js + dist/schemas/index.mjs
	entry: {
		"schemas/index": "src/schemas/index.ts",
		"server/server": "src/server/server.ts",
	},

	// CJS(.js)와 ESM(.mjs) 두 가지 포맷으로 동시 출력
	// - CJS: NestJS 백엔드에서 require()로 사용
	// - ESM: Vite 기반 웹앱에서 import로 사용
	// package.json의 conditional exports가 런타임에 자동 분기
	format: ["cjs", "esm"],

	// TypeScript 선언 파일(.d.ts) 자동 생성
	// tsconfig.json의 declaration/declarationMap 설정을 참조하여 생성
	dts: true,

	// 빌드 전 dist/ 디렉토리를 자동 정리
	clean: true,

	// peer dependencies는 번들에 포함하지 않음
	// 소비하는 앱(NestJS, Vite)이 자체적으로 설치하므로 중복 방지
	external: ["zod", "@trpc/server"],

	// esbuild 옵션 커스터마이징
	esbuildOptions(options) {
		// nestjs-trpc가 자동 생성한 server.ts 내의 셀프 참조 해결
		// server.ts에서 `import { ... } from "@repo/trpc/schemas"` 형태로
		// 자기 자신 패키지를 import하는데, 빌드 시점에는 패키지가 아직 없으므로
		// esbuild alias로 로컬 소스 파일을 직접 가리키도록 리다이렉트
		options.alias = {
			"@repo/trpc/schemas": "./src/schemas/index.ts",
		};
	},
});
