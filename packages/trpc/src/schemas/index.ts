/**
 * 배럴 파일 — 모든 스키마를 단일 진입점으로 re-export
 * 컴파일된 dist/schemas/index.js를 통해 소비 앱(NestJS, React Router)에서 import
 */
export * from "./comment.schema";
export * from "./post.schema";
