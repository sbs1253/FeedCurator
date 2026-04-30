

---

# 📄 DB업데이트지시서.md (에이전트 DB 관리 지침)

**목적:** `public.recommendations` 테이블의 최신성 유지 및 수집 메타데이터(Tags) 표준화
**대상 에이전트:** 데이터 엔지니어 및 수집 관리 에이전트

---

## 1. 데이터베이스 스키마 정의
에이전트는 모든 데이터를 아래 스키마 구조에 맞춰 가공해야 한다.

```sql
create table public.recommendations (
  id uuid not null default gen_random_uuid (),
  name text not null,                -- 사이트/서비스 명칭
  description text null,             -- 핵심 가치 요약 (기획자/디자이너 관점)
  category text not null,            -- [디자인/UIUX, 마케팅/트렌드, IT/서비스기획, AI/테크, 비즈니스, 로컬/라이프]
  site_url text not null,            -- 최종 접속 URL (Maily, Stibee 등 플랫폼 주소 우선)
  tags text null,                    -- 수집 메타데이터 (가장 중요)
  thumbnail_url text null,           -- Google Favicon API 기반 주소
  created_at timestamp with time zone null default now(),
  constraint recommendations_pkey primary key (id)
);
```

---

## 2. 수집 메타데이터(Tags) 작성 규칙
`tags` 컬럼은 에이전트가 실제 크롤링 및 파싱을 수행할 때 필터링 조건으로 사용된다. 반드시 아래 형식을 준수한다.

*   **형식:** `type:[값], priority:[값], platform:[값], sender:[값], rss:[값]`
*   **세부 항목:**
    *   **type:** `rss` (직접 크롤링 가능), `email` (뉴스레터 구독/파싱 필요)
    *   **priority:** `high` (매일 수집), `mid` (주 3회), `low` (주 1회)
    *   **platform:** `maily` (메일리), `stibee` (스티비), `self` (자체 도메인)
    *   **sender:** 뉴스레터 발신 이메일 주소 (type이 email일 때 필수)
    *   **rss:** RSS 피드 주소 (type이 rss일 때 필수)

---

## 3. 최종 데이터 입력 SQL (Full Version)

에이전트는 아래의 검증된 데이터를 사용하여 테이블을 업데이트(UPSERT) 한다.

```sql
-- 기존 데이터 삭제 후 재입력 또는 신규 입력
INSERT INTO public.recommendations (name, description, category, site_url, tags, thumbnail_url) VALUES

-- [디자인/UIUX]
('팁스터 (Tipster)', '서비스 UI/UX 패턴 분석 및 개선 사례 분석', '디자인/UIUX', 'https://maily.so/tipster', 'type:email, priority:high, platform:maily, sender:tipster@maily.so', 'https://www.google.com/s2/favicons?domain=maily.so&sz=128'),
('디자인 나침반', '디자인 트렌드 및 시각 언어 분석 전문 채널', '디자인/UIUX', 'https://designcompass.org', 'type:rss, priority:high, platform:self, rss:https://designcompass.org/feed/', 'https://www.google.com/s2/favicons?domain=designcompass.org&sz=128'),
('서핏 (Surfit)', '디자인, 기획, 마케팅 아티클 큐레이션 플랫폼', '디자인/UIUX', 'https://www.surfit.io', 'type:rss, priority:mid, platform:self, rss:https://www.surfit.io/feed', 'https://www.google.com/s2/favicons?domain=surfit.io&sz=128'),
('pxd 블로그', 'UX 디자인 에이전시 pxd의 실무 리서치 및 리포트', '디자인/UIUX', 'https://story.pxd.co.kr', 'type:rss, priority:mid, platform:self, rss:https://story.pxd.co.kr/rss', 'https://www.google.com/s2/favicons?domain=pxd.co.kr&sz=128'),
('플러스에잇 (Plus8)', '프로덕트 디자인 및 커리어 성장을 위한 인사이트', '디자인/UIUX', 'https://plus8.bz', 'type:email, priority:mid, platform:self, sender:hello@plus8.bz', 'https://www.google.com/s2/favicons?domain=plus8.bz&sz=128'),

-- [마케팅/트렌드]
('캐릿 (Careet)', 'MZ세대 트렌드 및 마케팅 밈, 브랜드 캠페인 분석', '마케팅/트렌드', 'https://www.careet.net', 'type:email, priority:high, platform:self, sender:letter@careet.net', 'https://www.google.com/s2/favicons?domain=careet.net&sz=128'),
('고구마팜', '마케팅 트렌드 분석 및 실무 데이터 아티클 제공', '마케팅/트렌드', 'https://gogumafarm.co', 'type:rss, priority:high, platform:self, rss:https://gogumafarm.co/feed', 'https://www.google.com/s2/favicons?domain=gogumafarm.co&sz=128'),
('트렌드라이트', '이커머스 및 비즈니스 관점의 트렌드 분석 뉴스레터', '마케팅/트렌드', 'https://maily.so/trendlite', 'type:email, priority:high, platform:maily, sender:trendlite@maily.so', 'https://www.google.com/s2/favicons?domain=maily.so&sz=128'),
('오픈애즈', '마케팅 인사이트 및 광고 매체 트렌드 큐레이션', '마케팅/트렌드', 'https://www.openads.co.kr', 'type:email, priority:mid, platform:self, sender:letter@openads.co.kr', 'https://www.google.com/s2/favicons?domain=openads.co.kr&sz=128'),
('스톤레터', '브랜드 전략 및 디자인 인사이트 중심 심층 분석', '마케팅/트렌드', 'https://stonebc.com', 'type:email, priority:mid, platform:self, sender:hello@stonebc.com', 'https://www.google.com/s2/favicons?domain=stonebc.com&sz=128'),

-- [IT/서비스기획]
('요즘IT', 'IT 기획, 개발, 디자인 통합 인사이트 매거진', 'IT/서비스기획', 'https://yozm.wishket.com', 'type:rss, priority:high, platform:self, rss:https://yozm.wishket.com/magazine/rss/', 'https://www.google.com/s2/favicons?domain=wishket.com&sz=128'),
('토스 피드', '최고 수준의 사용자 경험(UX) 및 금융 혁신 사례', 'IT/서비스기획', 'https://toss.im/blog', 'type:rss, priority:high, platform:self, rss:https://toss.im/blog/rss.xml', 'https://www.google.com/s2/favicons?domain=toss.im&sz=128'),
('디스콰이엇', 'IT 프로덕트 빌딩 과정 및 메이커 커뮤니티', 'IT/서비스기획', 'https://disquiet.io', 'type:rss, priority:mid, platform:self, rss:https://disquiet.io/feed', 'https://www.google.com/s2/favicons?domain=disquiet.io&sz=128'),
('우아한형제들 기술블로그', '대규모 서비스 운영 경험 및 조직 문화 공유', 'IT/서비스기획', 'https://techblog.woowahan.com', 'type:rss, priority:mid, platform:self, rss:https://techblog.woowahan.com/feed/', 'https://www.google.com/s2/favicons?domain=woowahan.com&sz=128'),
('커리어리', 'IT 업계 현직자 아티클 큐레이션 및 네트워킹', 'IT/서비스기획', 'https://careerly.co.kr', 'type:email, priority:mid, platform:self, sender:news@careerly.co.kr', 'https://www.google.com/s2/favicons?domain=careerly.co.kr&sz=128'),

-- [AI/테크 전문]
('데일리 프롬프트', '생성형 AI 활용 실무 및 글로벌 AI 산업 뉴스', 'AI/테크', 'https://maily.so/dailyprompt', 'type:email, priority:high, platform:maily, sender:dailyprompt@maily.so', 'https://www.google.com/s2/favicons?domain=maily.so&sz=128'),
('긱뉴스 (GeekNews)', '해외 최신 IT 이슈 및 오픈소스 트렌드 큐레이션', 'AI/테크', 'https://news.hada.io', 'type:rss, priority:high, platform:self, rss:https://news.hada.io/rss', 'https://www.google.com/s2/favicons?domain=hada.io&sz=128'),
('소도트 (Sodot)', 'AI 툴 활용 및 업무 생산성 혁신 가이드', 'AI/테크', 'https://maily.so/sodot', 'type:email, priority:mid, platform:maily, sender:sodot@maily.so', 'https://www.google.com/s2/favicons?domain=maily.so&sz=128'),
('AI타임스', 'AI 산업 정책 및 최신 기술 동향 전문 뉴스', 'AI/테크', 'https://www.aitimes.com', 'type:rss, priority:low, platform:self, rss:https://www.aitimes.com/rss/allArticle.xml', 'https://www.google.com/s2/favicons?domain=aitimes.com&sz=128'),

-- [비즈니스/로컬]
('커피팟 (COFFEEPOT)', '해외 비즈니스/경제 트렌드 전문 뉴스레터', '비즈니스', 'https://coffeepot.me', 'type:email, priority:high, platform:stibee, sender:news@coffeepot.me', 'https://www.google.com/s2/favicons?domain=coffeepot.me&sz=128'),
('롱블랙', '비즈니스 및 라이프스타일 브랜드 케이스 스터디', '비즈니스', 'https://www.longblack.co', 'type:email, priority:mid, platform:self, sender:letter@longblack.co', 'https://www.google.com/s2/favicons?domain=longblack.co&sz=128'),
('스몰브랜더', '작은 브랜드의 성장을 위한 마케팅 및 전략 제안', '비즈니스', 'https://smallbrander.co.kr', 'type:email, priority:mid, platform:stibee, sender:letter@smallbrander.co.kr', 'https://www.google.com/s2/favicons?domain=smallbrander.co.kr&sz=128'),
('주말랭이', '전국 팝업스토어 및 로컬 핫플레이스 정보 제공', '로컬/라이프', 'https://weekendr.co.kr', 'type:email, priority:mid, platform:stibee, sender:letter@weekendr.co.kr', 'https://www.google.com/s2/favicons?domain=weekendr.co.kr&sz=128'),
('밑미 (meet me)', '자아 성찰 및 긍정적인 삶을 위한 리추얼 콘텐츠', '로컬/라이프', 'https://nicetomeetyou.kr', 'type:email, priority:low, platform:self, sender:letter@nicetomeetyou.kr', 'https://www.google.com/s2/favicons?domain=nicetomeetyou.kr&sz=128'),
('씨로켓', '콘텐츠와 커머스의 경계를 분석하는 리테일 전략', '로컬/라이프', 'https://c-rocket.news', 'type:email, priority:low, platform:self, sender:letter@c-rocket.news', 'https://www.google.com/s2/favicons?domain=c-rocket.news&sz=128');
```

---

## 4. 운영 지침 (Maintenance Instruction)

1.  **플랫폼 자동 인식:** 사이트 추가 시 URL 도메인에 `maily.so`, `stibee.com`이 포함되면 자동으로 `platform` 태그를 할당한다.
2.  **썸네일 안정화:** `thumbnail_url`은 반드시 Google Favicon API를 통해 호출하여 404 에러를 최소화한다.
3.  **데이터 정합성:** `type:email`인 경우 반드시 수신함 파싱을 위한 `sender` 정보가 포함되어야 하며, `type:rss`인 경우 실제 피드 주소인 `rss` 값이 포함되어야 한다.
4.  **우선순위 관리:** `priority:high` 소스는 에이전트 요약 엔진의 가중치를 2.0으로 설정하여 분석 결과의 상단에 배치한다.

---

