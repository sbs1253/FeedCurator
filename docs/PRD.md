# 📄 [Master PRD] FeedCurator: 마케터용 이메일 트렌드 AI 대시보드

## 1. 프로젝트 개요 (Overview)

- **한 줄 정의:** 내 지메일(Gmail)로 수신되는 뉴스레터 중 '구독 명단'에 있는 메일만 자동 수집하여, AI가 마케터 관점으로 요약해 주는 개인화 트렌드 대시보드.
- **타겟 고객:** 수많은 트렌드 뉴스레터를 구독하지만 다 읽을 시간이 부족한 마케팅/콘텐츠 기획자.
- **프로젝트 핵심 가치:**
    - **합법성 & 안정성:** 타 사이트 크롤링(RSS 등) 시 발생하는 봇 차단(403 에러) 및 저작권 이슈를 피하고, 내 이메일을 구글 공식 API로 연동하여 100% 안정성 확보.
    - **시간 단축:** 흩어진 뉴스레터를 대시보드 한 곳에서 카드형 피드로 모아보고, AI의 3줄 요약과 '마케터 인사이트'를 통해 핵심만 빠르게 소화.

## 2. 시스템 아키텍처 (System Architecture)

데이터 수집(Backend)과 렌더링(Frontend)을 완벽히 분리하고, Supabase(DB)를 상태 관리의 브릿지로 활용하는 Serverless 풀스택 아키텍처.

1. **Frontend (Next.js):** 사용자 UI/UX 처리, DB 데이터 열람 및 '구독 명단' CRUD 관리. 웹훅을 통해 백엔드 수동 동기화 트리거.
2. **Database (Supabase):** 가공된 피드(articles)와 필터링 화이트리스트(subscriptions) 영구 저장.
3. **Backend (n8n + AI):** 지메일 24시간 감시 및 수동 동기화 요청 수신 ➡️ DB 명단 대조(스팸 필터링) ➡️ AI 요약 ➡️ DB 적재 및 지메일 읽음 처리.

## 3. n8n 백엔드 파이프라인 로직 (Data Flow)

n8n은 "실시간 수집"과 "수동 동기화"를 모두 지원하는 **투-트랙(Two-Track) & 동적 필터링 구조**로 설계되었습니다.

- **Track 1 (실시간 코어):**
    - Gmail Trigger ("수신거부" 키워드가 포함된 메일 1차 낚아챔) ➡️ Supabase (등록된 구독 명단인지 확인) ➡️ If (명단에 있으면 통과, 스팸이면 파기).
- **Track 2 (수동 동기화):**
    - 대시보드에서 Webhook 수신 ➡️ Supabase (구독 명단 전체 호출) ➡️ 명단에 있는 이메일들의 **'안 읽은 메일(is:unread)'**만 검색어로 조립하여 Gmail (Get Many) 핀셋 수집.
- **공통 처리 (통합 정거장 ~ 마무리):**
    - 두 트랙에서 온 데이터를 Extract 노드에서 표준화 ➡️ AI Model (마케터 관점 JSON 요약) ➡️ Code (파싱 및 데이터 조립) ➡️ Supabase Upsert (DB 저장, 중복 방지) ➡️ Gmail Mark as Read (무한 요약 방지를 위한 원문 읽음 처리).

## 4. 데이터베이스 스키마 (Supabase)

프론트엔드와 백엔드가 통신하는 핵심 데이터 구조입니다.

**1) subscriptions (구독 명단 - 필터링 화이트리스트)**

- id: UUID (PK)
- sender_email: TEXT (UNIQUE) — 예: careet@careet.net (n8n 스팸 필터링의 절대 기준)
- source_name: TEXT — 예: 캐릿
- created_at: TIMESTAMP

**2) articles (AI 요약 피드)**

- id: UUID (PK)
- source_id: TEXT (UNIQUE) — 지메일 원문 고유 Message ID
- source_type: TEXT — "newsletter" 고정
- source_name: TEXT — 발신자 이름 및 이메일 주소
- title: TEXT — 원문 제목
- original_url: TEXT — 지메일 앱으로 직접 이동하는 링크 (https://mail.google.com/...)
- summary: TEXT — AI 3줄 요약 (\n 개행 포함)
- insight: TEXT — 실무 적용 1문장 인사이트
- tags: TEXT — 해시태그 문자열 (예: #트렌드 #마케팅)
- created_at: TIMESTAMP

## 5. 프론트엔드 핵심 UI/UX 명세 (Next.js)

- **메인 피드 화면 (Feed Dashboard):**
    - articles 테이블 데이터를 최신순으로 가져와 반응형 카드 그리드로 렌더링.
    - 카드 구성: 출처/시간/원문링크(Header), 굵은 제목(Title), 본문 요약(Summary), **강조된 전구(💡) 디자인의 인사이트 박스(Insight)**, 개별 뱃지로 분리된 태그(Footer).
- **구독 관리 패널 (Subscription Sidebar):**
    - 내가 등록한 subscriptions 명단을 리스트로 보여주고 삭제 가능 (Delete).
    - 새로운 뉴스레터 발신자의 이메일과 이름을 입력받아 DB에 추가 (Create).
    - *UX 핵심:* 여기서 명단이 바뀌면 n8n 백엔드를 건드리지 않아도 다음번 메일 수집부터 필터링 기준이 즉시 자동 반영됨.
- **수동 동기화 버튼 (Sync Action):**
    - [🔄 안읽음 동기화] 버튼 클릭 시, n8n Webhook URL을 찔러 Track 2 파이프라인을 가동시킴.
    - "구독 중인 뉴스레터 중 안 읽은 메일만 가져옵니다"라는 툴팁 제공 및 로딩 UI(Spinner) 처리.

## 6. 향후 고도화 계획 (Next Steps)

[ ] 카테고리/태그 기반 피드 필터링 기능 추가.

[ ] RSS 및 외부 웹 크롤링 소스(Layer 2)를 우회 API(Firecrawl 등)를 통해 파이프라인에 병합.

[ ] 주간(Weekly) 핫 트렌드 모아보기 자동 이메일 발송.

---