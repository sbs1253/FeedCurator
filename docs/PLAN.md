[Project: FeedCurator] Phase 3.1 - 하이엔드 UI/UX 개편 및 AI 큐레이션 대시보드 구축

To. 자율 AI 에이전트 (Senior Full-Stack Developer & UX Designer)
현재 FeedCurator는 백엔드 자동화 및 MVP 렌더링을 성공적으로 마쳤습니다. 이제 이 프로토타입을 최고 수준의 B2B SaaS 대시보드이자 콘텐츠 큐레이션 플랫폼으로 전면 개편하십시오. 기획자의 최신 의도를 반영하여 아래 명세를 엄격히 준수하십시오.

0. UI/UX 레퍼런스 (Visual Inspiration) [신규]

디자인 작업 시 아래 레퍼런스들의 핵심 특징을 융합하여 구현하십시오.

Linear / Vercel: 하이엔드 B2B SaaS의 정석. 얇은 선(Border), 미니멀한 여백, 고급스러운 다크모드, 절제된 애니메이션. (shadcn/ui의 기본 테마와 완벽히 일치해야 함)

Notion (노션): 깔끔하게 구조화된 좌측 사이드바, 직관적인 아이콘(Lucide) 배치, 사용자가 집중하기 편한 레이아웃.

Netflix (넷플릭스): 메인 피드의 콘텐츠 탐색 경험. 주제별 가로 스크롤(Carousel) 배치, 카드 호버 시 즉각적이고 부드러운 스케일 업(Scale-up) 효과.

캐릿(Careet) / 요즘IT / 오픈애즈: 아티클 큐레이션 특화 UI. 태그(#) 기반의 명확한 시각적 분류, 텍스트 가독성을 극대화한 카드 UI와 폰트 크기 비례(Hierarchy).

1. 디자인 시스템 및 테마 설정

UI Framework: shadcn/ui를 즉시 초기화(npx shadcn@latest init)하여 사용하십시오. (Button, Badge, Card, Sheet, ScrollArea, Tabs, Dialog 등 적극 활용)

Animation: framer-motion을 설치하여, 카드 호버, 모달 오픈, 페이지 전환 시 부드러운 트랜지션(60fps)을 구현하십시오.

Dark/Light Mode: next-themes를 설치하고 시스템 환경에 반응하는 다크/라이트 모드를 완벽히 지원하십시오.

Theme: 넉넉한 여백(Whitespace), 둥근 모서리(Rounded-xl), 은은한 그림자(Drop-shadow-sm)를 사용하여 가독성 높고 모던한 느낌을 주십시오.

2. 데이터 모델 업데이트 (필수 반영)

1) articles 테이블 정렬 기준 변경

기존 created_at 대신, 실제 이메일 발송 시간을 담은 email_date (timestamp) 컬럼 기준으로 DESC 정렬하십시오. (UI 표기도 email_date 기준의 상대 시간 적용)

2) recommendations 테이블 신규 정의

추천 사이트 관리를 위한 신규 테이블입니다. 아래 인터페이스를 참고하여 DB Fetching 로직을 구성하십시오.

interface Recommendation {
  id: string;
  name: string; // 예: "캐릿 (Careet)"
  description: string; // 예: "1020 MZ세대 트렌드 및 팝업스토어 정보"
  site_url: string; // 아웃링크 주소
  tags: string; // 예: "#트렌드 #마케팅"
  thumbnail_url?: string; // 썸네일 이미지 주소
}


3. 레이아웃 아키텍처 (2-Column Dashboard)

A. 좌측 사이드바 (Sidebar Navigation)

구조: 화면 좌측 고정 (폭 약 260px), 모바일에서는 햄버거 메뉴로 숨김 처리 (shadcn/ui의 Sheet 활용).

메뉴 구성:

Overview (홈): 전체 피드 및 대시보드.

My Subscriptions (내 구독): 현재 구독 중인 채널 목록 리스트뷰 (필터링 용도).

Explore (추천 탐색): 마케터/기획자를 위한 추천 뉴스레터 탐색 탭.

하단 액션: 다크/라이트 모드 토글 스위치(해/달 아이콘), 프로필 아이콘, 그리고 [🔄 수동 동기화] 버튼 (로딩 스피너 애니메이션 포함).

B. 메인 콘텐츠 영역 (홈 대시보드)

1) AI 트렌드 브리핑 존 (종합 요약)

대시보드 최상단에 넓은 배너(Hero Section) 형태로 배치.

"오늘 수집된 인사이트를 바탕으로 AI가 요약한 핵심 트렌드입니다."라는 컨셉의 영역입니다. (현재는 시각적으로 돋보이는 UI 목업 컴포넌트로 우선 구현하십시오. 텍스트에 그라데이션 효과나 반짝이는 ✨ 아이콘을 활용해 AI 기능임을 강조할 것).

2) 넷플릭스 스타일 가로 스크롤 큐레이션

기존의 단순 Grid 대신, 콘텐츠를 그룹화하여 수평(Horizontal) 스크롤이 가능한 캐러셀 UI(shadcn/ui Carousel)를 구현하십시오.

Section 1: "최근 도착한 인사이트" (최신순 5개 크게 강조)

Section 2: "놓치기 아쉬운 트렌드" (특정 태그 기반 필터링 렌더링)

Section 3: "채널별 모아보기" (출처별 그룹화)

4. 핵심 기능 UI 상세 명세

1) Article Card & Detail View (상세보기)

Card UI: 마우스 호버 시 framer-motion을 통해 카드가 살짝 떠오르며(scale: 1.02) 강조되도록 처리합니다. Insight 텍스트가 카드 내에서 가장 눈에 띄어야 합니다.

Detail Drawer (이메일 미리보기 및 아웃링크):

카드를 클릭하면 페이지 이동 없이 화면 우측에서 슬라이드 인(Slide-in) 되는 패널(shadcn/ui Sheet)을 엽니다.

패널 상단에 AI 요약(Summary, Insight)을 큼직하게 배치합니다.

중요: 하단 액션 버튼은 "구독하기"가 아닌 "원문 보기 🔗" 또는 **"사이트 이동"**으로 표기하고, 클릭 시 original_url로 새 창 열기(target="_blank")가 되도록 구현하십시오.

2) Explore (추천 탐색 탭)

recommendations 테이블의 데이터를 가져와 멋진 카드 형태로 나열합니다.

각 카드에는 썸네일, 사이트 이름, 설명, 태그가 표기되며, 카드를 클릭하면 해당 추천 사이트의 site_url로 새 창에서 이동하도록 만듭니다.

5. 에이전트 자율 실행 절차

한 번에 모든 것을 하려 하지 말고, 다음 단계별로 진행하며 렌더링 에러가 없는지 터미널 로그를 확인하십시오.

초기 세팅: framer-motion, next-themes, lucide-react, date-fns 및 shadcn/ui 필수 컴포넌트 설치.

레이아웃 뼈대: app/layout.tsx에 Sidebar와 Main 영역 분할 및 다크모드 적용.

컴포넌트 개발: 메인 피드의 AI 트렌드 브리핑 영역 및 가로 스크롤(Carousel) UI 구현.

상세 기능 연동: 우측 슬라이드 상세보기(Sheet) 및 Explore(추천 탭) DB 연동.

### 추천용 사이트 리스트
마케팅/트렌드

- 캐릿 (Careet) — 1020 트렌드, 밈, 팝업스토어
- 큐레터 (아이보스) — 마케팅 실무 뉴스
- 오픈애즈 — 퍼포먼스 마케팅, 광고 트렌드
- 대학내일20대연구소 — 20대 소비 패턴 데이터
- 어패럴뉴스 — 패션/리테일 시장 트렌드

### IT/서비스기획

- 요즘IT (위시켓) — IT 트렌드, 기획/개발 인사이트
- 스몰브랜더 — 브랜드 성장 전략

### 브랜드/카피라이팅

- HS애드 / 제일기획 매거진 — 광고 기획 논리
- 롱블랙 — 비즈니스/브랜드 케이스 스터디 (유료 구독 시)

### AI/테크

- 뉴닉 — 시사/경제/테크 요약
- AI타임스 — 최신 AI 소식

### 로컬/프로모션

- 주말랭이 — 팝업스토어, 로컬 핫플레이스

### 비즈니스/스타트업

- 아웃스탠딩 — IT/스타트업 심층 분석
- 폴인 — 비즈니스 트렌드 전문가 네트워크
- 스타트업위클리 / 넥스트유니콘 — 스타트업 투자 동향  

## 다음단계
### 1. Layer 2 (RSS 연동) 상세화

- **작동 방식:** Gmail과 수집 경로는 다르지만, 결국 **동일한 AI 요약 파이프라인**을 타고 동일한 피드(Feed) 화면에 섞여서 보여집니다.
- **DB 구조적 해결:** articles 테이블에 source_type 이라는 컬럼을 둡니다.
    - 이메일에서 온 글은 source_type: 'newsletter'
    - RSS에서 긁어온 글은 source_type: 'rss'
- **프론트엔드 UI:** 피드 카드에 작은 뱃지나 아이콘으로 "이메일로 온 뉴스레터인지", "웹에서 긁어온 블로그 글인지" 출처를 시각적으로 구분해 줍니다.

