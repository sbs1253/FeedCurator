# 🚀 FeedCurator 프론트엔드 구축 계획 (Phase 2)

## 1. 개요 (Overview)
- **목표**: n8n 백엔드와 연동되어 동작하는 이메일 트렌드 AI 대시보드(FeedCurator)의 사용자 인터페이스(UI) 및 클라이언트 로직 구현.
- **주요 스택**: Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Supabase Client, lucide-react.

## 2. 작업 단계 (Implementation Steps)

### Step 1: 프로젝트 초기화 및 환경 세팅
1. `npx shadcn@latest init` 를 활용하여 Next.js + Tailwind v4 + shadcn/ui 초기화.
2. 환경 변수 세팅: `.env.local` 템플릿 생성 후 사용자로부터 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_N8N_WEBHOOK_URL` 입력 요청 및 대기.
3. Supabase Client 세팅: `@supabase/supabase-js` 설치 및 `lib/supabase.ts` 작성.

### Step 2: Supabase 데이터 모델 & 타입 정의
- `types/index.ts` 에 `Article` 및 `Subscription` 인터페이스 정의. (docs/PLANNING.md 참조)

### Step 3: 공통 UI 레이아웃 & 컴포넌트 추가 (shadcn)
- 필수 컴포넌트 추가: `button`, `card`, `badge`, `input`, `sheet` (구독 관리 패널용), `sonner` (Toast 알림용), `tooltip`
- 메인 레이아웃 (`app/layout.tsx`): Header (로고 및 동기화 버튼, 구독 관리 열기 버튼 포함), Main 컨테이너 구성.

### Step 4: 메인 피드 대시보드 (`app/page.tsx`, `components/ArticleCard.tsx`)
- Server Component에서 Supabase `articles` 테이블 최신순 Fetch.
- Grid 레이아웃 적용 (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).
- `ArticleCard` UI 구현:
  - Header: 출처, 상대 시간(`date-fns`), 원문 링크(`ExternalLink` 아이콘)
  - Title: 굵은 텍스트
  - Summary: 개행문자 인식 `<br />` 변환 렌더링
  - Insight: 전구 아이콘(💡)과 강조된 옅은 배경 박스 및 왼쪽 Border로 시각적 분리
  - Footer: `tags` 문자열 띄어쓰기 기준 Split 및 Badge 렌더링

### Step 5: 구독 관리 패널 (`components/SubscriptionManager.tsx`)
- 우측 사이드바(`Sheet` 컴포넌트) 형태 적용.
- 상태 통신: Server Actions 및 Client Component 조합.
- **Read & Delete**: `subscriptions` 목록 렌더링 및 휴지통 아이콘 클릭 시 Delete 쿼리 후 UI 갱신.
- **Create**: 발신자 이메일(`sender_email`) 및 이름(`source_name`) Form Submit 시 Insert 후 갱신.

### Step 6: 수동 동기화 웹훅 연동 (`components/SyncButton.tsx`)
- `Button` 클릭 시 `fetch`로 `NEXT_PUBLIC_N8N_WEBHOOK_URL` 에 POST 요청 전송.
- `lucide-react` 의 스피너(`Loader2`)를 활용한 로딩 상태 UI 적용 및 `Tooltip` 으로 안내 문구 노출.

## 3. 검증 계획 (Verification Plan)
- 터미널 린트 및 빌드 검사 (`npm run lint`, `npm run build`).
- 로컬 개발 서버(`npm run dev`)에서 실제 Supabase DB와 연동하여 렌더링 검증.
- `SyncButton` 웹훅 트리거 정상 동작 확인.

## 4. 사용자 검토 필요 항목 (Open Questions)
> [!IMPORTANT]
> 1. Next.js 프로젝트가 현재 폴더(`FeedCurator`) 최상단에 초기화되어야 합니까, 아니면 `frontend` 등 하위 폴더에 초기화해야 합니까? (기본적으로는 현재 폴더에 초기화할 계획입니다)
> 2. `n8n` 웹훅 호출 시 브라우저 직접 호출의 경우 CORS 문제가 발생할 수 있습니다. 필요시 Next.js API Route(Route Handler)를 프록시로 사용하여 우회할 계획인데 동의하시나요?
