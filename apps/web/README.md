# Tkstagram - Web

Tkstagram의 프론트엔드 애플리케이션. React Router v7 (framework mode) 기반.

## Tech Stack

- **Framework**: [React Router v7](https://reactrouter.com/) (SSR)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Bundler**: [Vite](https://vite.dev/)
- **Linter/Formatter**: [Biome](https://biomejs.dev/)

## Getting Started

루트 디렉토리에서 의존성 설치 후 실행:

```bash
bun install
bun run dev
```

`http://localhost:5173`에서 확인 가능.

## Scripts

| 명령어 | 설명 |
|--------|------|
| `bun run dev` | 개발 서버 실행 (HMR) |
| `bun run build` | 프로덕션 빌드 |
| `bun run start` | 빌드된 서버 실행 |
| `bun run check-types` | TypeScript 타입 체크 |

## Project Structure

```
apps/web/
├── app/
│   ├── routes/       # 페이지 라우트
│   ├── welcome/      # Welcome 컴포넌트
│   ├── app.css        # 글로벌 스타일
│   ├── root.tsx       # 루트 레이아웃
│   └── routes.ts      # 라우트 설정
├── public/            # 정적 파일
├── biome.json         # Biome 설정 (extends @repo/biome-config)
├── vite.config.ts     # Vite 설정
└── react-router.config.ts
```

## Docker

```bash
docker build -t tkstagram-web .
docker run -p 3000:3000 tkstagram-web
```
