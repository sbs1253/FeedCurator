# 🗺️ FeedCurator — Master Roadmap

> **목적:** 프로젝트 전체 진행 흐름을 Phase 단위로 관리하는 단일 진실 공급원(Single Source of Truth).
> **최종 업데이트:** 2026-05-01 | **현재 버전:** v2.1.0

---

## 진행 상황 요약

```
Phase 0 ✅ → Phase 1 ✅ → Phase 2 ✅ → Phase 3 ✅ → Phase 4 ✅
→ Phase 5 🔲 → Phase 6 🔲 → Phase 7 🔲 → Phase 8 🔲
```

---

## Phase 0: 인프라 & 초기 세팅 ✅ 완료

> **목표:** 프로젝트 기반 환경 구성 및 n8n 파이프라인 구축

- `[x]` Next.js 16 (App Router, Turbopack) 프로젝트 초기화
- `[x]` Tailwind CSS v4 + shadcn/ui 설정
- `[x]` Supabase 연동 (anon 클라이언트 + service_role 서버 전용)
- `[x]` n8n Two-Track 파이프라인 구축
  - Track 1: Gmail Trigger → subscriptions 화이트리스트 검문 → LLM 요약 → Upsert
  - Track 2: Webhook → 안읽음 Gmail 핀셋 수집 → LLM 요약 → Upsert
- `[x]` `/api/sync` Route Handler (CORS 우회 n8n Webhook 프록시)
- `[x]` 기초 UI: ArticleCard 그리드, SubscriptionManager Sheet, SyncButton

---

## Phase 1: 기반 세팅 & 레이아웃 전환 ✅ 완료

> **목표:** 헤더 제거, 2-Column 사이드바 도입, 다크모드, React Query 기반 구조 확립

- `[x]` `framer-motion`, `@tanstack/react-query`, DevTools 설치
- `[x]` shadcn 컴포넌트 추가: `sidebar`, `scroll-area`, `tabs`, `separator`, `dialog`, `skeleton`, `carousel`
- `[x]` `QueryProvider.tsx` 생성 (TanStack Query v5 + DevTools)
- `[x]` `ThemeToggle.tsx` 생성 (next-themes 다크/라이트 전환)
- `[x]` `AppSidebar.tsx` 생성 (shadcn Sidebar 기반 2-Column 레이아웃)
- `[x]` `layout.tsx` 리팩토링: ThemeProvider + QueryProvider + SidebarProvider + AppSidebar 통합

---

## Phase 2: 메인 피드 리디자인 ✅ 완료

> **목표:** 정보 카드 UI 고도화, framer-motion 적용, 상세보기 Sheet 도입

- `[x]` `AiBriefingBanner.tsx`: 실DB 태그 집계 → "오늘의 키워드" Hero 섹션
- `[x]` `StatsBar.tsx`: 총 아티클 / 구독 채널 / 이번 주 신규 / 최신 메일 시각 — 4칸 통계 바
- `[x]` `ArticleCard.tsx` 리디자인: framer-motion hover(scale + y), 카드 클릭 → Sheet
- `[x]` `ArticleDetailSheet.tsx`: 우측 슬라이드인 상세보기 Drawer (요약, 인사이트, 태그, 원문 CTA)
- `[x]` `source_type` 구분 아이콘: 📧 newsletter / 🌐 rss
- `[x]` `email_date` 기준 정렬 및 표기 (실제 발송 시간)

---

## Phase 3: 캐러셀 & 콘텐츠 그룹화 ✅ 완료

> **목표:** Netflix 스타일 가로 스크롤 캐러셀로 콘텐츠 섹션화

- `[x]` `FeedCarousel.tsx` 생성: shadcn Carousel(embla) 기반
- `[x]` 메인 피드 3개 섹션: 🕐 최근 인사이트 / 🔥 트렌드 / 📬 채널별 대표
- `[x]` 버그 수정
  - `dragFree: true` 제거 → 빈 공간 이동 버그 해결
  - 화살표 버튼을 헤더 flex row에 `static` 배치 → 겹침/이동 버그 해결
  - `overflow-visible` + `overflowY: visible` 인라인 조합 → framer-motion scale 클리핑 해결
  - `whitespace-nowrap` → 타이틀 잘림 해결

---

## Phase 4: 구독 채널 관리 고도화 + Explore 탭 ✅ 완료

> **목표:** 구독 카테고리화, 추천 탐색 페이지 구축, 채널/카테고리 필터 구현

- `[x]` DB Migration: `subscriptions.category` 컬럼 추가 (DEFAULT '기타')
- `[x]` DB Migration: `recommendations` 테이블 생성 + 15개 추천 채널 Seeding
- `[x]` `SubscriptionManager.tsx`: 카테고리 드롭다운 추가
- `[x]` `AppSidebar.tsx` 채널 목록 동적 로딩 (useQuery)
  - `ChannelList` 분리 + Suspense 래핑 (useSearchParams 경계 규칙)
  - 카테고리별 그룹화 표시
  - 채널 클릭 → URL `?email=sender@email.com` ILIKE 필터 (source_name 복합 형식 대응)
  - 카테고리 클릭 → URL `?category=` 파라미터 → 해당 카테고리 채널들 OR 쿼리
  - 같은 항목 재클릭 → 필터 해제
- `[x]` `StatsBar.tsx`: `senderEmail`/`category` prop 수신 → 필터 통계 반영
- `[x]` `RecommendationCard.tsx`: 카테고리별 컬러 + framer-motion 호버
- `[x]` `app/explore/page.tsx`: 카테고리 Tabs + 추천 카드 그리드
- `[x]` `types/index.ts`: `Recommendation` 인터페이스, `SUBSCRIPTION_CATEGORIES` 상수 추가
- `[x]` `page.tsx`: `force-dynamic`, `?email`/`?category` searchParams → Supabase 필터 적용

---

## Phase 5: 구독 채널 메타데이터 수정 기능 🔲 예정

> **목표:** 사용자가 구독 채널의 이름과 카테고리를 직접 수정할 수 있는 편집 기능 추가
> **진입 조건:** Phase 4 완료 후 사용자 승인

**예정 작업:**
- `[ ]` SubscriptionManager에 편집(✏️) 버튼 추가
- `[ ]` 인라인 편집 또는 모달로 `source_name`, `category` 수정 UI 구현
- `[ ]` Server Action: `updateSubscription(id, { source_name, category })` 추가
- `[ ]` 변경 후 사이드바 채널 목록 즉시 갱신 (queryClient.invalidateQueries)

---

## Phase 6: RSS Layer 2 연동 🔲 예정

> **목표:** Gmail 뉴스레터 외에 RSS 피드를 추가 소스로 연동
> **진입 조건:** Phase 5 완료 또는 스킵 후 승인

**예정 작업:**
- `[ ]` n8n에 RSS 수집 트랙 추가 (RSS Trigger 노드 활용)
- `[ ]` `source_type: 'rss'` 구분 적용 (articles 테이블에 이미 컬럼 존재)
- `[ ]` `subscriptions` 테이블에 `feed_url` 컬럼 추가 (RSS URL 저장)
- `[ ]` 사이드바: RSS 채널 구분 아이콘 (🌐) 적용
- `[ ]` Explore 페이지에 RSS 채널 추천 카드 추가

---

## Phase 7: AI 큐레이션 고도화 🔲 미래

> **목표:** Gemini API 기반 개인화 추천 및 트렌드 분석 기능 구현
> **진입 조건:** Phase 6 완료 후 설계 시작

**예정 작업:**
- `[ ]` `AiBriefingBanner` → Gemini API 실제 브리핑 텍스트 생성으로 고도화
- `[ ]` 주간 핫 트렌드 요약 기능
- `[ ]` 아티클 기반 개인화 추천 카드 생성
- `[ ]` AI 트렌드 리포트 이메일 자동 발송 (n8n + Gmail Send)

---

## Phase 8: 배포 & 운영 🔲 미래

> **목표:** Vercel 프로덕션 배포 및 모니터링 설정
> **진입 조건:** Phase 7 완료 또는 MVP 기준 충족 후

**예정 작업:**
- `[ ]` Vercel 배포 설정 (환경변수 이전)
- `[ ]` Vercel Analytics 통합
- `[ ]` 성능 최적화 (이미지, 번들 사이즈)
- `[ ]` 에러 모니터링 설정

---

## 참조 문서

| 파일 | 역할 |
|------|------|
| `docs/PRD.md` | Master PRD — 프로덕트 요구사항 정의서 |
| `docs/ARCHITECTURE.md` | 기술 아키텍처 현행화 문서 |
| `docs/ROADMAP.md` | **이 파일** — 전체 Phase 진행 관리 |
| `docs/PLANNING.md` | 현재 진행 중인 단기 실행 계획 |
| `docs/CHANGELOG.md` | 버전별 변경 이력 |
| `docs/QNA_TROUBLESHOOTING.md` | 이슈 해결 가이드 |
| `docs/n8n_setting.md` | n8n 워크플로우 JSON 설정 |
