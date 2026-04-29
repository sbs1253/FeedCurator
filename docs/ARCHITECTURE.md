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
- **Integration**: Managed via `n8n-mcp` for agentic workflow design and validation.

## Agent Skills
The AI agent utilizes two types of skills to ensure production-grade development.

### 1. System Agent Skills (12 Skills)
These skills provide specialized expertise in modern web development and Korean language processing.
- **find-skills**: Discovery and installation of new agent capabilities.
- **frontend-design**: Production-grade UI/UX design and implementation.
- **grammar-checker**: Korean grammar, spelling, and spacing validation.
- **humanizer**: Converting AI-generated Korean text into natural, human-like writing.
- **style-guide**: Maintaining consistent tone and terminology across documents.
- **next-best-practices**: Next.js (App Router) architectural and performance patterns.
- **next-cache-components**: Next.js 16 Cache Components (PPR, use cache).
- **shadcn**: Managing and styling shadcn/ui components.
- **tailwind-design-system**: Scalable design systems with Tailwind CSS v4.
- **tailwind-v4-shadcn**: Integration patterns for Tailwind v4 and shadcn/ui.
- **vercel-react-best-practices**: React performance optimization guidelines.
- **web-design-guidelines**: Web accessibility and UI/UX best practices audits.

### 2. Domain-Specific n8n Skills (7 Skills)
Technical guidelines for automation are stored in `docs/skills/n8n/`.
- `n8n-expression-syntax.md`: Expression mapping and syntax rules.
- `n8n-mcp-tools-expert.md`: Best practices for n8n-mcp tools.
- `n8n-workflow-patterns.md`: Standard architectural patterns.
- `n8n-validation-expert.md`: Error interpretation and fixing guide.
- `n8n-node-configuration.md`: Operation-aware configuration rules.
- `n8n-code-javascript.md`: JavaScript Code node development standards.
- `n8n-code-python.md`: Python Code node standards and limitations.

## Documentation Structure
- `docs/PLANNING.md`: Feature implementation plans.
- `docs/CHANGELOG.md`: Project history and changes.
- `docs/N8N_INTERGRATION.md`: n8n setup and integration guide.
- `docs/skills/`: Domain-specific technical guidelines for AI agents.
