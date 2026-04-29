# Changelog

All notable changes to the FeedCurator project will be documented in this file.

## [v1.1.0] - 2026-04-29 21:50

### Added
- **프로젝트 초기화**: Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui 기반 프론트엔드 환경 세팅 완료 (`feed-curator-app` 통합).
- **Supabase 연동**: 읽기 전용 기본 클라이언트 및 Server Actions 전용 `service_role` 클라이언트 로직 구현 (`types/index.ts` 정의 포함).
- **메인 피드 대시보드**: `ArticleCard` 컴포넌트를 이용한 💡마케터 인사이트 카드형 UI 및 최신순 DB Fetch 로직 구현.
- **구독 관리 패널**: 우측 사이드바(`Sheet`) 형태의 UI와 Server Actions를 결합하여 이메일 화이트리스트(`subscriptions` 테이블) CRUD (추가/삭제) 기능 연동.
- **n8n 웹훅 동기화**: 브라우저 직접 호출에 따른 CORS 문제를 방지하기 위해 Next.js Route Handler(`/api/sync`)를 프록시로 추가 및 `SyncButton` 연동.
- **공통 컴포넌트**: `Header` 레이아웃 구성 및 동작 알림을 위한 `sonner` Toaster, `TooltipProvider` 통합.

## [v1.0.1] - 2026-04-29 14:55

### Added

- **Skill Infrastructure Update**: 시스템 에이전트 스킬(12개) 및 n8n 기술 지침(7개)을 포함한 총 19개의 스킬 목록을 아키텍처 문서에 현행화.
- **Korean Language Support**: `grammar-checker`, `humanizer`, `style-guide` 스킬 추가 확인 및 반영.

## [v1.0.0] - 2026-04-29 14:10

### Added

- **Project Initialization**: FeedCurator 프로젝트 Git 저장소 초기화 및 `.gitignore` 설정 완료.
- **n8n Skills Installation**: 워크플로우 자동화를 위한 7가지 핵심 기술 지침 설치 (`docs/skills/n8n/`).
- **Base Documentation**: `ARCHITECTURE.md`, `PLANNING.md`, `N8N_INTERGRATION.md` 생성.
