# Tkstagram

Instagram 클론 프로젝트. [Turborepo](https://turborepo.dev/) 기반 모노레포.

## Tech Stack

- **Monorepo**: Turborepo
- **Package Manager**: Bun
- **Language**: TypeScript
- **Linter/Formatter**: [Biome](https://biomejs.dev/)

## Project Structure

```
tkstagram/
├── apps/
│   └── web/          # React Router v7 프론트엔드
├── packages/
│   ├── biome-config/        # @repo/biome-config - Biome 공유 설정
│   └── typescript-config/   # @repo/typescript-config - TSConfig 공유 설정
├── biome.json        # 루트 Biome 설정 (extends @repo/biome-config/base)
└── turbo.json        # Turborepo 설정
```

## Getting Started

```bash
bun install
bun run dev
```

## Scripts

| 명령어 | 설명 |
|--------|------|
| `bun run dev` | 모든 앱 개발 서버 실행 |
| `bun run build` | 모든 앱/패키지 빌드 |
| `bun run lint` | Biome 린트 검사 |
| `bun run format` | Biome 포맷팅 적용 |
| `bun run check-types` | TypeScript 타입 체크 |
