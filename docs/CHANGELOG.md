# Changelog

All notable changes to the FeedCurator project will be documented in this file.

## [v2.1.0] - 2026-04-30 01:51

### Fixed — 캐러셀 & 채널 필터 버그 수정
- **[긴급] FeedCarousel 빈 공간 이동 버그**: `dragFree: true` 제거 → embla 기본 스냅 모드 복귀. 스크롤 가능한 범위를 벗어나는 문제 해결
- **FeedCarousel 버튼 위치**: `absolute -top-9` 방식 → 헤더 flex row 내 `static` 배치로 변경. 구분선 겹침 및 카드 클릭 오인 문제 해결
- **FeedCarousel 타이틀 잘림**: `whitespace-nowrap` + `flex-1 h-px bg-border` 디바이더 구조로 변경
- **ArticleCard 클리핑**: `pb-3 pt-1` 여백 + `overflow-visible` + `overflowY: visible` 인라인 조합

### Added — 채널 필터 정확성 개선 & 카테고리 필터
- **채널 필터 URL 파라미터 변경**: `?channel=이름` → `?email=sender@email.com` 방식으로 변경
  - 이유: `articles.source_name`이 `"팁스터 (tipster@tipster-letter.kr)"` 형식 → `sender_email` 기반 ILIKE로 정확히 매칭
- **카테고리 필터**: 사이드바에 카테고리 섹션 추가. 구독 중인 카테고리만 표시. `?category=마케팅/트렌드` 파라미터로 해당 카테고리 채널들의 아티클 일괄 조회
- **StatsBar 필터 연동**: 채널/카테고리 필터 적용 시 통계(총 아티클, 이번 주 신규, 최신 메일)가 해당 필터의 데이터로 표시

## [v2.0.0] - 2026-04-30 01:13

### Added — Phase 3 & 4: 캐러셀 & Explore 탭
- **FeedCarousel**: shadcn Carousel(embla) 기반 넷플릭스 스타일 가로 스크롤 섹션 구현 (`components/FeedCarousel.tsx`)
  - 3개 섹션: 🕐 최근 도착한 인사이트 / 🔥 놓치기 아쉬운 트렌드 / 📬 채널별 모아보기
  - 드래그 스크롤(`dragFree: true`) 및 좌우 화살표 네비게이션 지원
- **Explore 페이지** (`app/explore/page.tsx`): 추천 뉴스레터 및 정보 채널 탐색 페이지
  - 카테고리별 Tabs UI (전체 / 마케팅·트렌드 / IT / 브랜드 / AI·테크 / 로컬 / 비즈니스)
  - framer-motion 호버 애니메이션이 적용된 `RecommendationCard` 컴포넌트
- **Supabase Migration**: `recommendations` 테이블 생성 및 15개 추천 채널 Seeding 완료
- **subscriptions 테이블**: `category` 컬럼 추가 (`DEFAULT '기타'`)
- **SubscriptionManager**: 구독 등록 폼에 카테고리 드롭다운 추가
- **Server Actions 확장** (`actions.ts`): `getRecommendations(category?)` 추가
- **Types 확장** (`types/index.ts`): `Recommendation` 인터페이스, `SUBSCRIPTION_CATEGORIES` 상수 추가

### Added — Phase 1 & 2: 기반 & 피드 리디자인
- **2-Column 사이드바 레이아웃** (`AppSidebar.tsx`): Header 제거 → shadcn Sidebar 기반 좌측 네비게이션 도입
  - 모바일: Sheet 슬라이드인, `SidebarTrigger` 햄버거 제공
  - SyncButton, ThemeToggle, SubscriptionManager를 사이드바 하단으로 이동
- **다크/라이트 모드**: `next-themes`의 ThemeProvider 적용 + `ThemeToggle.tsx` 구현
- **TanStack Query v5 (React Query)**: `QueryProvider.tsx` 생성, DevTools 활성화(개발 환경)
- **AiBriefingBanner**: DB에서 실시간 태그 집계 → "오늘의 TOP 키워드" 표시하는 Hero 섹션
- **StatsBar**: 총 아티클 수 / 구독 채널 수 / 이번 주 신규 / 최신 메일 발송 시각을 표시하는 4칸 통계 바
- **ArticleCard 리디자인**: framer-motion hover(scale + y), 카드 클릭 → `ArticleDetailSheet` 연동
  - `source_type` 뱃지 추가: 📧 newsletter / 🌐 rss
- **ArticleDetailSheet**: 우측 슬라이드인 상세보기 Drawer (요약 전체, 인사이트 박스, 태그, 원문 보기 CTA)

### Packages Added
- `framer-motion` — 카드 호버 및 페이지 전환 애니메이션
- `@tanstack/react-query` + `@tanstack/react-query-devtools` — 클라이언트 데이터 페칭 및 캐싱
- shadcn/ui 컴포넌트 추가: `carousel`, `scroll-area`, `tabs`, `separator`, `dialog`, `sidebar`, `skeleton`

---

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
