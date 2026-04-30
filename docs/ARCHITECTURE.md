# Project Architecture — FeedCurator

> **Last Updated:** 2026-05-01 | **Current Version:** v2.1.0

---

## Overview

FeedCurator는 마케터를 위한 이메일 뉴스레터 AI 요약 대시보드입니다.
Gmail 구독 뉴스레터를 n8n이 자동 수집·AI 요약하여 Supabase에 저장하고,
Next.js 프론트엔드가 이를 카드 및 캐러셀 형태로 렌더링합니다.

---

## Tech Stack

| 카테고리 | 기술 |
|----------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (base 라이브러리) |
| Animation | Framer Motion |
| Data Fetching | TanStack Query v5 (클라이언트) + Server Components (초기 렌더링) |
| Database | Supabase (PostgreSQL) |
| Auth/Security | service_role 키를 Server 측에서만 사용, RLS 정책 없이 서버에서 직접 쿼리 |
| Automation | n8n (Gmail 트리거, Cohere LLM 요약, Supabase Upsert) |
| Deployment | Vercel (예정) |

---

## 데이터 플로우

```
Gmail (구독 뉴스레터 수신)
  └─ n8n Gmail Trigger (1분마다 폴링 OR 대시보드 Sync 버튼)
       └─ subscriptions 테이블 화이트리스트 필터 (DB 검문소)
            └─ Cohere LLM (요약 JSON 생성)
                 └─ Supabase articles 테이블 Upsert
                      └─ Next.js Server Component → ArticleCard 렌더링
```

---

## 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx              ← ThemeProvider + QueryProvider + SidebarProvider
│   ├── page.tsx                ← 메인 피드 (AiBriefingBanner + StatsBar + FeedCarousel 3개)
│   ├── explore/
│   │   └── page.tsx            ← 추천 탐색 (카테고리 Tabs + RecommendationCard)
│   ├── api/
│   │   └── sync/route.ts       ← n8n Webhook 프록시 (CORS 우회)
│   └── actions.ts              ← Server Actions (구독 CRUD, 추천 조회)
├── components/
│   ├── AppSidebar.tsx          ← 2-Column 사이드바 (nav + 카테고리 필터 + 채널 필터 + 동기화 + 다크모드 + 구독관리)
│   ├── ThemeToggle.tsx         ← 다크/라이트 전환 버튼
│   ├── AiBriefingBanner.tsx    ← Hero 섹션 (DB 태그 집계 → 오늘의 키워드)
│   ├── StatsBar.tsx            ← 4칸 통계 바 (Server Component, senderEmail/category prop 수신)
│   ├── FeedCarousel.tsx        ← 가로 스크롤 캐러셀 (shadcn Carousel + embla, dragFree 제거)
│   ├── ArticleCard.tsx         ← 인사이트 카드 (framer-motion + Sheet 연동)
│   ├── ArticleDetailSheet.tsx  ← 상세보기 우측 Drawer
│   ├── RecommendationCard.tsx  ← 추천 채널 카드 (framer-motion)
│   ├── SubscriptionManager.tsx ← 구독 CRUD Sheet (category 드롭다운 포함)
│   ├── SyncButton.tsx          ← n8n 동기화 버튼 (sidebar/default variant)
│   └── providers/
│       └── QueryProvider.tsx   ← TanStack Query v5 + DevTools Provider
├── lib/
│   └── supabase.ts             ← anon 클라이언트 + service_role 클라이언트
├── hooks/
│   └── use-mobile.ts           ← shadcn 모바일 감지 훅
└── types/
    └── index.ts                ← Article, Subscription, Recommendation, SUBSCRIPTION_CATEGORIES
```

---

## Supabase 스키마

### `articles` 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| source_id | TEXT | 원본 Gmail 메일 ID |
| source_type | TEXT | `"newsletter"` 또는 `"rss"` |
| source_name | TEXT | 발신자명 (예: 캐릿) |
| title | TEXT | AI 정제 제목 |
| original_url | TEXT | Gmail 원문 링크 |
| summary | TEXT | 3줄 요약 (`\n` 구분) |
| insight | TEXT | 마케팅 인사이트 1문장 |
| tags | TEXT | 해시태그 (공백 구분) |
| email_date | TIMESTAMPTZ | 실제 이메일 발송 시간 |
| created_at | TIMESTAMPTZ | DB 저장 시간 |

### `subscriptions` 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| sender_email | TEXT (UNIQUE) | 발신자 이메일 (n8n 필터 기준) |
| source_name | TEXT | 채널 이름 |
| category | TEXT | 카테고리 (DEFAULT '기타') — v2.0에서 추가 |
| created_at | TIMESTAMPTZ | 등록 시간 |

### `recommendations` 테이블 (v2.0 신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| name | TEXT | 채널명 |
| description | TEXT | 한 줄 소개 |
| category | TEXT | 카테고리 |
| site_url | TEXT | 외부 링크 |
| tags | TEXT | 해시태그 |
| thumbnail_url | TEXT (nullable) | 썸네일 이미지 |
| created_at | TIMESTAMPTZ | 등록 시간 |

---

## 데이터 패칭 전략 (하이브리드)

| 상황 | 패턴 | 적용 컴포넌트 |
|------|------|--------------|
| 초기 페이지 렌더링 | Server Component + Supabase service_role | page.tsx, AiBriefingBanner, StatsBar, explore/page.tsx |
| 구독 추가/삭제 후 목록 갱신 | Server Action + revalidatePath('/') | SubscriptionManager |
| 동기화 버튼 → n8n 호출 | fetch + toast + revalidatePath | SyncButton |
| 사이드바 구독 채널 목록 | useQuery (staleTime 30s) + Suspense 경계 | AppSidebar > ChannelList |
| 채널 필터 | `?email=sender@email.com` → `.ilike('source_name', '%email%')` | page.tsx |
| 카테고리 필터 | `?category=` → subscriptions OR 쿼리 → articles | page.tsx |

---

## n8n 자동화 구조

### Track 1: 실시간 (Gmail Trigger)
```
Gmail Trigger → Extract → DB 검문소 → Track1 Restore → LLM Chain → Code → Upsert + 읽음처리
```

### Track 2: 수동 동기화 (Webhook)
```
Webhook → 구독 명단 조회 → 검색어 조립 → Gmail 안읽음 수집 → Extract → LLM Chain → Code → Upsert + 읽음처리
```

---

## Agent Skills

### System Agent Skills (12종)
- `find-skills`, `frontend-design`, `grammar-checker`, `humanizer`, `style-guide`
- `next-best-practices`, `next-cache-components`, `shadcn`, `tailwind-design-system`
- `tailwind-v4-shadcn`, `vercel-react-best-practices`, `web-design-guidelines`

### n8n Domain Skills (7종)
`docs/skills/n8n/` 디렉토리에 저장됨

---

## 채널 필터 기술 메모

> `articles.source_name` 필드가 `"팁스터 (tipster@tipster-letter.kr)"` 형식의 복합 문자열로 저장됨.
> 이름 기반 직접 매칭이 불가능하므로, `subscriptions.sender_email` 값을 URL 파라미터로 전달하여 ILIKE 매칭 수행.

```
?email=tipster@tipster-letter.kr
  → .ilike('source_name', '%tipster@tipster-letter.kr%')

?category=마케팅/트렌드
  → subscriptions에서 email 목록 조회
  → .or('source_name.ilike.%email1%,source_name.ilike.%email2%,...')
```

---

## Documentation Structure

- `docs/ROADMAP.md` — **Master Roadmap** (전체 Phase 진행 관리)
- `docs/PRD.md` — Master PRD (프로덕트 요구사항 정의서)
- `docs/ARCHITECTURE.md` — 이 파일 (기술 아키텍처 현행화)
- `docs/PLANNING.md` — 현재 진행 중인 단기 실행 계획
- `docs/CHANGELOG.md` — 버전별 변경 이력
- `docs/QNA_TROUBLESHOOTING.md` — 이슈 해결 가이드
- `docs/n8n_setting.md` — n8n 워크플로우 JSON 설정
