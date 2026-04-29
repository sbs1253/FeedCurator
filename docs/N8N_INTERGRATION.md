# n8n MCP 및 n8n Skills 설치 계획

이 문서는 프로젝트에 n8n MCP 서버와 n8n Skills를 통합하기 위한 상세 계획을 담고 있습니다.

## 1. 개요

- **n8n-mcp**: n8n 워크플로우, 노드, 실행 데이터를 Model Context Protocol을 통해 AI 에이전트에게 제공하는 서버입니다.
- **n8n-skills**: n8n 워크플로우를 더 정확하고 효율적으로 작성하기 위한 7가지 전문 지침 세트입니다.

## 2. 주요 변경 사항

### Antigravity 설정 (mcp_config.json)

- `mcpServers` 섹션에 `n8n-mcp` 설정을 추가합니다.
- `npx n8n-mcp` 명령어를 사용하여 실행되도록 구성합니다.

### 프로젝트 파일 구조

- `docs/skills/n8n/`: n8n 관련 기술 지침(Markdown) 파일을 저장합니다.
- `.env.local`: n8n API 접근을 위한 환경 변수를 추가합니다.

## 3. 설치 단계

### 단계 1: n8n-mcp 서버 등록

`mcp_config.json`에 다음 설정을 추가합니다:

```json
"n8n-mcp": {
  "command": "npx",
  "args": ["-y", "n8n-mcp"],
  "env": {
    "N8N_API_KEY": "YOUR_API_KEY",
    "N8N_BASE_URL": "YOUR_N8N_URL"
  }
}
```

### 단계 2: n8n Skills 다운로드

`czlonkowski/n8n-skills` 저장소에서 다음 7가지 핵심 기술 파일을 `docs/skills/n8n/` 폴더로 복사합니다:

1. `n8n-expression-syntax.md`
2. `n8n-mcp-tools-expert.md`
3. `n8n-workflow-patterns.md`
4. `n8n-validation-expert.md`
5. `n8n-node-configuration.md`
6. `n8n-code-javascript.md`
7. `n8n-code-python.md`

### 단계 3: 환경 변수 설정

`.env.local` 파일에 n8n 관련 설정을 추가하여 로컬 개발 환경에서도 접근 가능하도록 합니다.

## 4. 사용자 확인 사항 (Open Questions)
>
> [!IMPORTANT]
> n8n MCP 서버를 활성화하려면 다음 정보가 필요합니다. 승인 시 함께 알려주시면 설정을 완료하겠습니다:
>
> 1. **n8n API Key**: n8n 설정의 'Personal API Keys'에서 생성한 키
> 2. **n8n Base URL**: 사용 중인 n8n 인스턴스의 주소 (예: <https://n8n.yourdomain.com>)

## 5. 검증 계획

- `npx n8n-mcp` 명령어가 정상적으로 실행되는지 확인합니다.
- Antigravity에서 n8n 관련 도구(workflows_list 등)가 인식되는지 테스트합니다.
- 워크플로우 작성 시 n8n Skills의 지침이 올바르게 적용되는지 확인합니다.
