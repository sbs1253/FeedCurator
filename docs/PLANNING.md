# FeedCurator Phase 3.1 — 하이엔드 UI/UX 대시보드 구현 계획

> **기준 문서:** `docs/PLAN.md` (Phase 3.1 명세), `docs/PRD.md` (Master PRD)
> **현재 상태:** MVP 프론트엔드 완성 (단일 Header, ArticleCard Grid, SubscriptionManager, SyncButton)
> **목표:** Linear/Vercel급 하이엔드 B2B SaaS 대시보드로 전면 개편
> **데이터 패칭 전략:** TanStack Query v5 (클라이언트 인터랙션 담당) + Next.js Server Component (초기 데이터 prefetch 담당) 하이브리드

---

## React Query (TanStack Query v5) 도입 계획

### 도입 배경
- 채널 필터, 태그 필터, 구독 목록 등 **클라이언트 인터랙션 기반 데이터 요청**이 Phase 3~4에서 대거 추가됨
- n8n 동기화 버튼 클릭 후 피드를 자동 갱신하는 **낙관적 업데이트(Optimistic UI)** 및 **자동 리패칭** 필요
- SubscriptionManager의 추가/삭제 후 사이드바 채널 목록 즉시 반영

### 패키지 설치 (Phase 1에서 함께 진행)
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 아키텍처 패턴: 하이브리드 (Server + Client)

```
[초기 렌더링]
Server Component (page.tsx)
  └─ getServiceSupabase() 직접 호출
  └─ <HydrationBoundary> 로 초기 데이터를 Client에게 전달

[클라이언트 인터랙션 후 리패칭]
Client Component
  └─ useQuery / useMutation (TanStack Query)
  └─ queryFn: fetch('/api/...') 또는 Supabase 클라이언트 직접 호출
```

### React Query 적용 위치 (필요한 곳만)

| 컴포넌트 | 적용 여부 | 이유 |
|----------|-----------|------|
| `page.tsx` (메인 피드 초기) | ❌ Server Component 유지 | SEO + 초기 렌더링 속도 |
| `TagFilter.tsx` | ✅ `useQuery` | 태그 클릭 시 클라이언트 필터링 |
| 채널 필터 (사이드바) | ✅ `useQuery` | 채널 선택 시 즉각 리패칭 |
| `SubscriptionManager.tsx` | ✅ `useMutation` + `invalidateQueries` | 추가/삭제 후 사이드바 즉시 갱신 |
| `SyncButton.tsx` | ✅ `useMutation` | 동기화 완료 후 피드 자동 리패칭 |
| `AiBriefingBanner.tsx` | ❌ Server Component 유지 | 서버 집계 데이터, 갱신 불필요 |
| `StatsBar.tsx` | ❌ Server Component 유지 | 서버 count query, 정적 표시 |
| `Explore/page.tsx` | ❌ Server Component 유지 | 추천 목록은 정적 데이터 |

### 신규 파일: QueryProvider + DevTools

**[신규]** `components/providers/QueryProvider.tsx`
```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } }, // 1분 캐시
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

- `layout.tsx`에 `<QueryProvider>`로 앱 전체 래핑
- DevTools 패널: 개발 환경에서만 표시 (`process.env.NODE_ENV === 'development'` 자동 적용)

### Query Key 네이밍 컨벤션
```typescript
export const queryKeys = {
  articles: (filter?: { tag?: string; channel?: string }) =>
    ['articles', filter] as const,
  subscriptions: () => ['subscriptions'] as const,
  recommendations: (category?: string) =>
    ['recommendations', category] as const,
  stats: () => ['stats'] as const,
};
```

---

## Q&A 결정사항 (승인된 방향)

### Q1. 상세보기에서 이메일 원문 미리보기 필요한가?
**결론: 불필요 — 현재 구조 유지**

현재 n8n은 `summary`, `insight`만 DB에 저장합니다. 원문 HTML 전체를 저장하려면 n8n 수정 + DB 용량 이슈가 발생합니다.
**상세보기 패널 = AI 요약 전체 표시 + "원문 보기 🔗" 아웃링크(Gmail)** 가 최적 구조입니다.
카드는 3줄 요약 미리보기, 상세보기 패널에서는 요약 전체 + 인사이트 + 태그를 모두 보여줍니다.

### Q2. 에이전트 추가 제안 5가지 → 전부 승인
- 스켈레톤 로딩, 통계 요약 바, 태그 필터 칩, 빈 상태 개성화, Realtime 대비 설계 모두 포함

### Q3. 구독 채널 목록 + 채널 필터링
**결론: 사이드바 "내 구독" 섹션에 채널 리스트 + 클릭 필터링**

- 사이드바에 유튜브 구독 채널처럼 구독 중인 채널 목록 나열
- 채널 클릭 → 해당 `source_name`의 아티클만 메인 피드에 필터링
- "전체 보기" 기본 상태, 채널 선택 시 강조 표시

### Q4. 구독 채널 카테고리 분류
**결론: subscriptions 테이블에 `category` 컬럼 추가 + 등록 시 카테고리 선택**

- `subscriptions` 테이블에 `category TEXT` 컬럼 추가 (Supabase Migration 필요)
- 구독 등록 폼에 카테고리 드롭다운 추가 (마케팅/IT/브랜드/AI·테크/기타)
- 사이드바에서 카테고리별 접힘/펼침(Accordion) 구조로 채널 목록 표시
- 드래그앤드롭은 Phase 5 이후 고도화로 유보

### Q5. RSS 연동 계획 추가
**결론: n8n Layer 2 파이프라인 + `source_type: 'rss'` DB 구분**

- n8n에 별도 RSS 수집 트랙 추가 (RSS Feed Read 노드 활용)
- 동일한 AI 요약 파이프라인(LLM Chain → Code → Supabase Upsert)을 통과
- `source_type: 'rss'`로 저장하여 뉴스레터와 피드 내에서 뱃지로 구분 표시
- UI에서 source_type 아이콘 뱃지: 📧 뉴스레터 / 🌐 RSS

---

## DB 스키마 변경 사항

### `subscriptions` 테이블 — 컬럼 추가
```sql
ALTER TABLE subscriptions ADD COLUMN category TEXT DEFAULT '기타';
```

카테고리 허용값: `마케팅/트렌드`, `IT/서비스기획`, `브랜드/카피`, `AI·테크`, `로컬`, `비즈니스`, `기타`

### `recommendations` 테이블 — 신규 생성
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  site_url TEXT NOT NULL,
  tags TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### TypeScript 인터페이스 변경
```typescript
// types/index.ts 수정
export interface Subscription {
  id: string;
  sender_email: string;
  source_name: string;
  category: string;       // ← 신규 추가
  created_at: string;
}

export interface Recommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  site_url: string;
  tags: string;
  thumbnail_url?: string;
}
```

---

## 파일 구조 (최종 목표)

```
src/
├── app/
│   ├── layout.tsx              ← 수정 (SidebarProvider + ThemeProvider)
│   ├── page.tsx                ← 수정 (브리핑 Hero + 캐러셀 구조)
│   ├── explore/
│   │   └── page.tsx            ← 신규 (추천 사이트 탭)
│   ├── api/
│   │   └── sync/route.ts       ← 유지
│   └── actions.ts              ← 확장
├── components/
│   ├── AppSidebar.tsx          ← 신규 (2-Column 사이드바)
│   ├── ThemeToggle.tsx         ← 신규 (다크/라이트 토글)
│   ├── AiBriefingBanner.tsx    ← 신규 (AI 브리핑 Hero)
│   ├── StatsBar.tsx            ← 신규 (통계 요약 4칸)
│   ├── FeedCarousel.tsx        ← 신규 (가로 스크롤 섹션)
│   ├── TagFilter.tsx           ← 신규 (태그 필터 칩)
│   ├── ArticleCard.tsx         ← 수정 (motion + 클릭)
│   ├── ArticleDetailSheet.tsx  ← 신규 (상세보기 Drawer)
│   ├── RecommendationCard.tsx  ← 신규 (추천 사이트 카드)
│   ├── SubscriptionManager.tsx ← 수정 (category 필드 추가)
│   ├── SyncButton.tsx          ← 유지
│   ├── Header.tsx              ← 삭제 예정
│   └── ui/                     ← shadcn 컴포넌트 추가
├── lib/
│   └── supabase.ts             ← 유지
└── types/
    └── index.ts                ← 확장
```

---

## 단계별 구현 계획 (Phase 1~5)

### Phase 1: 기반 세팅 & 레이아웃 전환

**목표:** Header → 2-Column Sidebar 레이아웃 전환 + 다크모드 완벽 지원

#### 1-1. 패키지 설치
```bash
npm install framer-motion
npx shadcn@latest add scroll-area tabs separator dialog sidebar skeleton
```

#### 1-2. ThemeProvider 적용
- `next-themes`의 `ThemeProvider`를 `layout.tsx`에 래핑
- `components/ThemeToggle.tsx` 생성 (해/달 아이콘 토글)

#### 1-3. AppSidebar 컴포넌트
```
┌─────────────────────────────────┐
│  💡 FeedCurator  (로고)          │
│─────────────────────────────────│
│  📋 Overview (홈 피드)           │
│─────────────────────────────────│
│  📬 내 구독                      │
│  └─ 마케팅/트렌드                  │
│     ├─ 📧 캐릿                   │
│     └─ 📧 팁스터                  │
│  └─ IT/서비스기획                  │
│     └─ 📧 요즘IT                  │
│─────────────────────────────────│
│  🧭 추천 탐색                     │
│─────────────────────────────────│
│  🔄 수동 동기화                   │
│  🌙 다크모드 토글                  │
│  ⚙️ 구독 관리                     │
└─────────────────────────────────┘
```

- 모바일: `SidebarTrigger` 햄버거 + Sheet 슬라이드
- "내 구독" 섹션: 카테고리별 Accordion, 채널 클릭 시 필터링

#### 1-4. 레이아웃 수정
- `layout.tsx`: `SidebarProvider > AppSidebar + SidebarInset` 구조
- `Header.tsx` 삭제

**검증:** `npm run build` 성공, 다크/라이트 토글 동작

---

### Phase 2: 메인 피드 리디자인

**목표:** AI 브리핑 Hero + ArticleCard framer-motion + 상세보기 Drawer

#### 2-1. AiBriefingBanner
- 그라데이션 배경 Hero 섹션
- `✨ AI 트렌드 브리핑` 타이틀
- DB에서 오늘 날짜 articles의 tags 집계 → "오늘의 TOP 키워드" 3개 자동 산출 (실데이터 기반)
- 총 아티클 수 표시

#### 2-2. StatsBar (에이전트 제안)
- 총 아티클 | 구독 채널 수 | 이번 주 신규 | 최신 아티클 발송 시간
- Supabase count query, Server Component

#### 2-3. ArticleCard 리디자인
- `motion.div` 래핑: hover `scale: 1.02`
- `source_type` 뱃지: 📧 newsletter / 🌐 rss
- 카드 전체 클릭 → ArticleDetailSheet 오픈
- 기존 ExternalLink 아이콘은 카드 우상단에 유지 (아웃링크 전용)

#### 2-4. ArticleDetailSheet
- 우측 슬라이드인 Sheet
- 구성: 출처 + email_date → 제목 → 요약(전체) → 💡 인사이트 박스 → 태그
- 하단 CTA: **"원문 보기 🔗"** → `original_url` 새 창

**검증:** `npm run build`, 카드 호버 애니메이션, Sheet 동작 확인

---

### Phase 3: 캐러셀 & 콘텐츠 그룹화

**목표:** Netflix 스타일 가로 스크롤 섹션 + 태그 필터

#### 3-1. FeedCarousel
- shadcn Carousel (embla-carousel-react 기반)
- `title`, `articles` props 수신하는 제네릭 컴포넌트
- 좌우 화살표 네비게이션 + 드래그 스크롤

#### 3-2. 피드 섹션 구성 (page.tsx)
```
<AiBriefingBanner />
<StatsBar />
<TagFilter />          ← 에이전트 추가 제안
<FeedCarousel title="🕐 최근 도착한 인사이트" articles={latest} />
<FeedCarousel title="🔥 놓치기 아쉬운 트렌드" articles={trending} />
<FeedCarousel title="📬 채널별 모아보기" articles={byChannel} />
```

- `latest`: email_date DESC LIMIT 10
- `trending`: `#트렌드`, `#마케팅`, `#AI` 태그 포함 필터링
- `byChannel`: source_name 그룹화 후 채널당 최신 1개

#### 3-3. TagFilter (에이전트 제안)
- DB에서 distinct tags 추출 (Server Action)
- 가로 스크롤 가능한 태그 칩 목록
- URL 쿼리스트링 기반 필터링 (`?tag=#마케팅`)

**검증:** `npm run build`, 캐러셀 스크롤, 태그 필터 동작

---

### Phase 4: 구독 채널 관리 고도화 + Explore 탭

**목표:** subscriptions에 카테고리 추가 + Explore 추천 탭 구현

#### 4-1. DB Migration
- Supabase MCP로 `subscriptions.category` 컬럼 추가
- `recommendations` 테이블 생성
- PLAN.md의 15개 추천 사이트 Seeding

#### 4-2. 구독 관리 폼 수정 (SubscriptionManager)
- 이름/이메일 입력 폼에 카테고리 드롭다운 추가
- 카테고리: 마케팅/트렌드 | IT/서비스기획 | 브랜드/카피 | AI·테크 | 로컬 | 비즈니스 | 기타

#### 4-3. Explore 페이지 (app/explore/page.tsx)
- 카테고리 Tabs: 전체 / 마케팅·트렌드 / IT / 브랜드 / AI·테크 / 로컬 / 비즈니스
- RecommendationCard: 썸네일(fallback 아이콘) + 이름 + 설명 + 태그
- 카드 클릭 → `site_url` 새 창 이동

**검증:** `npm run build`, Explore 탭 렌더링 및 아웃링크 동작

---

### Phase 5: RSS Layer 2 연동 (n8n + UI)

**목표:** RSS 소스를 동일한 파이프라인에 통합

#### 5-1. n8n RSS 파이프라인 (백엔드)
```
RSS Feed Read 노드 (URL 목록 입력)
  └─ Extract RSS 노드 (제목, 링크, 본문 추출)
     └─ [기존] Basic LLM Chain (동일 AI 요약)
        └─ Code (source_type: 'rss' 로 조립)
           └─ Supabase Upsert (articles 테이블)
```

- `subscriptions` 테이블에 `source_url` 컬럼 추가 (RSS URL 저장 용도)
- 또는 별도 `rss_sources` 테이블로 분리

#### 5-2. 프론트엔드 UI 변경
- ArticleCard의 `source_type` 뱃지 표시 (이미 Phase 2에서 준비됨)
- 사이드바 "내 구독" 섹션에 RSS 채널도 함께 표시

#### 5-3. RSS 소스 관리 UI
- SubscriptionManager에 "RSS 피드 추가" 탭 추가
- 이름 + RSS URL 입력 → `rss_sources` 테이블 저장

---

### Phase 6: AI 큐레이션 통합 (미래 계획)

> ⚠️ 현재 구현 범위 밖. 설계 방향만 기록.

#### 6-1. AI 브리핑 실연동
- Gemini API를 Server Action에서 호출
- 오늘 수집된 articles의 insight들을 모아 종합 트렌드 브리핑 생성
- 결과를 Supabase에 캐싱 (일 1회 갱신, `ai_briefings` 테이블)

#### 6-2. AI 추천 기능
- 사용자 구독 채널 + 최근 열람 기반으로 아티클 스코어링
- "당신이 놓친 중요한 인사이트" 섹션 자동 생성

#### 6-3. 대화형 검색
- 자연어 검색 입력창
- Gemini가 수집된 articles를 context로 활용하여 답변

---

## 전체 실행 순서

```
Phase 1 (레이아웃)
  → Phase 2 (피드 리디자인)
    → Phase 3 (캐러셀)
      → Phase 4 (구독 카테고리 + Explore)
        → Phase 5 (RSS 연동)
          → Phase 6 (AI 통합, 미래)
```

> 각 Phase 완료 시 반드시 `npm run build` 검증 후 다음 단계 진행.