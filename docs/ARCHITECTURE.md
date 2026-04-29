# Project Architecture - Jeju Flow

## Overview
Jeju Flow is a cultural trend analysis dashboard for Jeju Island, integrating data from various APIs and automating workflows using n8n.

## Core Components
- **Framework**: Next.js 16 (App Router)
- **AI Integration**: Google Gemini API via `@google/genai`
- **Automation**: n8n Workflow Automation
- **Database**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui

## Automation Layer (n8n)
The project uses `n8n` for data collection, processing, and scheduled insights.
- **Skills**: Technical guidelines for automation are stored in `docs/skills/n8n/`.
- **Integration**: Managed via `n8n-mcp` for agentic workflow design and validation.

## Documentation Structure
- `docs/PLANNING.md`: Feature implementation plans.
- `docs/CHANGELOG.md`: Project history and changes.
- `docs/N8N_INTERGRATION.md`: n8n setup and integration guide.
- `docs/skills/`: Domain-specific technical guidelines for AI agents.
