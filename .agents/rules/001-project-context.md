---
trigger: model_decision
description: 워크플로어 전용 지침
---

### 2️⃣ 현재 프로젝트 전용 룰 (`.agent/rules/001-project-context.mdc`)

이 파일은 프로젝트를 새로 만들 때마다 그 프로젝트의 특성에 맞게 `[ ]` 안의 내용을 수정해서 쓰시면 됩니다.

```markdown
---
description: 현재 프로젝트의 기술 스택, 제약 조건 및 개발 단계
globs: *
alwaysApply: true
---

# 🏗️ Project Context & Rules

## 1. PROJECT OVERVIEW
- **프로젝트 명:** [예: 제주 문화 트렌드 대시보드]
- **핵심 목적:** [예: 행사 기획자를 위한 데이터 분석 및 시각화 제공]

## 2. TECH STACK
- **Framework & Language:** [예: Next.js 14 App Router, TypeScript]
- **Styling:** [예: Tailwind CSS, Framer Motion]
- **Database:** [예: Supabase]

## 3. CORE CONSTRAINTS
- [예: 모든 API 키는 `.env.local`에 저장할 것]
- [예: 크롤링 금지, 공식 KOPIS 및 데이터랩 API만 활용할 것]

## 4. CURRENT PHASE
- **Phase:** [예: 기획 및 초기 아키텍처 설계 / 기능 개발 진행 중]