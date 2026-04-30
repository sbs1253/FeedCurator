# 📄 [Master PRD] FeedCurator: 마케터용 이메일 트렌드 AI 대시보드

> **버전:** v2.1 | **최종 업데이트:** 2026-05-01

---

## 1. 프로젝트 개요 (Overview)

- **한 줄 정의:** 내 Gmail로 수신되는 뉴스레터 중 '구독 명단'에 있는 메일만 자동 수집하여, AI가 마케터 관점으로 요약해 주는 개인화 트렌드 대시보드.
- **타겟 고객:** 수많은 트렌드 뉴스레터를 구독하지만 다 읽을 시간이 부족한 마케팅/콘텐츠 기획자.
- **핵심 가치:**
  - **합법성 & 안정성:** Gmail 공식 API(Google OAuth) 연동으로 봇 차단·저작권 이슈 없음.
  - **시간 단축:** 흩어진 뉴스레터를 대시보드 한 곳에서 카드형 피드로 모아보고, AI의 3줄 요약 + 마케터 인사이트 1문장으로 핵심만 빠르게 소화.
  - **개인화:** 내가 구독하는 채널만 선택적으로 수집하고, 카테고리/채널별 필터로 원하는 정보만 집중 탐색.

---

## 2. 시스템 아키텍처 (System Architecture)

데이터 수집(Backend)과 렌더링(Frontend)을 완벽히 분리하고, Supabase(DB)를 브릿지로 활용하는 Serverless 풀스택 아키텍처.

1. **Frontend (Next.js 16):** 사용자 UI/UX 처리, DB 데이터 열람, 구독 명단 CRUD 관리. 웹훅을 통한 백엔드 수동 동기화 트리거.
2. **Database (Supabase):** 가공된 피드(`articles`), 필터링 화이트리스트(`subscriptions`), 추천 채널 목록(`recommendations`) 영구 저장.
3. **Backend (n8n + AI):** Gmail 24시간 감시 및 수동 동기화 요청 수신 → DB 명단 대조(스팸 필터링) → AI 요약 → DB 적재 및 Gmail 읽음 처리.

---

## 3. n8n 백엔드 파이프라인 로직 (Data Flow)

**Two-Track & 동적 필터링 구조:**

- **Track 1 (실시간 코어):**
  Gmail Trigger (수신거부 키워드 1차 필터) → subscriptions 화이트리스트 검문 → LLM 요약 → Upsert + 읽음 처리

- **Track 2 (수동 동기화):**
  대시보드 Sync 버튼 → `/api/sync` 프록시 → n8n Webhook → subscriptions 전체 조회 → Gmail `is:unread` 핀셋 수집 → LLM 요약 → Upsert + 읽음 처리

- **공통 LLM 처리:**
  Cohere AI (마케터 관점 JSON 요약) → title / summary(3줄, `\n` 구분) / insight(1문장) / tags(해시태그) / email_date 파싱 → Supabase Upsert

---

## 4. 데이터베이스 스키마 (Supabase)

### 4-1. `subscriptions` — 구독 명단 (n8n 화이트리스트)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| sender_email | TEXT (UNIQUE) | 발신자 이메일 — n8n 필터링의 절대 기준. articles.source_name ILIKE 매칭 키 |
| source_name | TEXT | 채널 표시 이름 (예: 캐릿) |
| category | TEXT | 채널 카테고리 (DEFAULT '기타') — 사이드바 그룹화 및 필터에 활용 |
| created_at | TIMESTAMPTZ | 등록 시간 |

### 4-2. `articles` — AI 요약 피드

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| source_id | TEXT (UNIQUE) | Gmail 원본 Message ID (중복 방지 키) |
| source_type | TEXT | `"newsletter"` 또는 `"rss"` (RSS Layer 2 도입 시 활용) |
| source_name | TEXT | 발신자 이름+이메일 복합 형식 — 예: `"팁스터 (tipster@tipster-letter.kr)"` |
| title | TEXT | AI 정제 제목 |
| original_url | TEXT | Gmail 원문 링크 (https://mail.google.com/...) |
| summary | TEXT | AI 3줄 요약 (`\n` 개행 구분) |
| insight | TEXT | 마케터 관점 실무 적용 1문장 인사이트 |
| tags | TEXT | 해시태그 문자열 — 예: `"#트렌드 #마케팅"` (공백 기준 split → 개별 Badge 렌더링) |
| email_date | TIMESTAMPTZ | 실제 이메일 발송 시간 (created_at 대신 이 값 기준으로 정렬 및 표기) |
| created_at | TIMESTAMPTZ | DB 저장 시간 |

### 4-3. `recommendations` — 추천 채널 목록 (v2.0 신규)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| name | TEXT | 채널명 (예: 캐릿) |
| description | TEXT | 한 줄 소개 |
| category | TEXT | 카테고리 (SUBSCRIPTION_CATEGORIES 상수 기준) |
| site_url | TEXT | 구독 링크 |
| tags | TEXT | 해시태그 |
| thumbnail_url | TEXT (nullable) | 썸네일 이미지 URL |
| created_at | TIMESTAMPTZ | 등록 시간 |

---

## 5. 프론트엔드 핵심 UI/UX 명세 (Next.js 16)

### 5-1. 전체 레이아웃
- **2-Column 사이드바 레이아웃**: shadcn/ui SidebarProvider 기반.
  - 좌측: AppSidebar (고정)
  - 우측: SidebarInset (메인 콘텐츠 영역)
  - 모바일: Sheet 슬라이드인 + SidebarTrigger 햄버거 버튼
- **다크/라이트 모드**: next-themes + ThemeToggle 버튼

### 5-2. 메인 대시보드 (`/`)
- **AI 브리핑 배너 (AiBriefingBanner):** 최근 30개 아티클의 태그를 집계하여 오늘의 TOP 키워드 표시. 채널/카테고리 필터 적용 시 숨김.
- **통계 바 (StatsBar):** 총 아티클 수 / 구독 채널 수 / 이번 주 신규 / 최신 메일 발송 시각 — 4칸 카드. 채널/카테고리 필터 적용 시 해당 범위 통계로 변경.
- **피드 캐러셀 (FeedCarousel):** 가로 스크롤 Netflix 스타일 섹션.
  - 전체 보기: 🕐 최근 도착한 인사이트 / 🔥 놓치기 아쉬운 트렌드 / 📬 채널별 대표 아티클 (3개 섹션)
  - 채널/카테고리 필터 시: 해당 필터의 아티클 단일 섹션
- **필터 배너:** 필터 적용 시 상단에 채널명/카테고리 + 개수 표시, "전체 보기" 링크 제공.

### 5-3. 아티클 카드 (ArticleCard)
- 카드 구성: 소스 아이콘(📧/🌐) + 채널명 + email_date (Header), 굵은 제목 2줄 (Title), 요약 3줄 (Content), 💡 인사이트 박스 (강조), 해시태그 Badge (Footer)
- framer-motion 호버: scale(1.02) + y(-2px) 애니메이션
- 카드 클릭 → `ArticleDetailSheet` (우측 슬라이드인 상세보기)
- 외부 링크 버튼(↗) 클릭 → 원문 Gmail 이동 (카드 클릭 이벤트와 분리)

### 5-4. 아티클 상세보기 (ArticleDetailSheet)
- 우측 슬라이드인 Sheet (shadcn)
- 섹션: 채널 정보 + 날짜 → 제목 → 핵심 요약(전체) → 💡 인사이트 박스 → 태그 → 원문 보기 버튼

### 5-5. 사이드바 (AppSidebar)
- **네비게이션:** Overview(홈) / 추천 탐색
- **카테고리 필터:** 구독 중인 카테고리만 표시. 클릭 시 `?category=` 파라미터 적용.
- **내 구독 채널:** useQuery로 동적 로딩 + Skeleton 로딩 상태. 카테고리별 그룹화 표시. 클릭 시 `?email=sender@email.com` ILIKE 필터 적용. 같은 항목 재클릭 → 필터 해제.
- **하단 액션:** 안읽음 동기화(SyncButton) / 다크모드 토글(ThemeToggle) / 구독 관리(SubscriptionManager)

### 5-6. 구독 관리 (SubscriptionManager Sheet)
- 채널 이름, 발신자 이메일, 카테고리(드롭다운) 입력으로 구독 추가
- 기존 구독 목록 (이름/이메일/카테고리 표시, 삭제 버튼)
- Server Action으로 CRUD 처리, 변경 후 revalidatePath('/')

### 5-7. 추천 탐색 (`/explore`)
- 카테고리별 Tabs (전체 + SUBSCRIPTION_CATEGORIES 항목)
- 카드 그리드: RecommendationCard (카테고리 컬러 배지, framer-motion 호버, 구독하러 가기 CTA)

---

## 6. 필터링 기술 명세

> `articles.source_name`이 `"팁스터 (tipster@tipster-letter.kr)"` 복합 형식으로 저장되므로 이름 기반 직접 매칭이 불가능함. `sender_email`을 ILIKE 키로 활용.

| 필터 종류 | URL 파라미터 | Supabase 쿼리 |
|-----------|-------------|---------------|
| 채널 필터 | `?email=tipster@tipster-letter.kr` | `.ilike('source_name', '%tipster@tipster-letter.kr%')` |
| 카테고리 필터 | `?category=마케팅/트렌드` | subscriptions에서 해당 카테고리 email 목록 조회 후 `.or('source_name.ilike.%email1%,...')` |
| 필터 해제 | 같은 항목 재클릭 또는 "전체 보기" 링크 | `router.push('/')` |

---

## 7. 향후 고도화 계획 (→ ROADMAP.md 참조)

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 5 | 구독 채널 메타데이터 수정 기능 (이름, 카테고리 편집) | 🔲 예정 |
| Phase 6 | RSS Layer 2 연동 (n8n RSS 트랙 + source_type 분기) | 🔲 예정 |
| Phase 7 | AI 큐레이션 고도화 (Gemini API 브리핑, 개인화 추천) | 🔲 미래 |
| Phase 8 | Vercel 배포 + Analytics + 성능 최적화 | 🔲 미래 |

> 전체 Phase 상세 내용은 `docs/ROADMAP.md` 참조.