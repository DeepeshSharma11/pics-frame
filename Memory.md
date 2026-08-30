# Project Memory

## Structure
- `frontend/`: Next.js 16 (App Router, TypeScript, Standalone Output)
  - `src/app/layout.tsx`: Configured with `suppressHydrationWarning` on `<html>` and `<body>` to prevent browser extension attribute mismatch
  - `src/app/page.tsx`: Embedded footer credit badge
  - `package.json`: Author metadata
- `backend/`: FastAPI backend with author OpenAPI contact info
- `LICENSE`: MIT License (Deepesh Sharma, CTO & Co-Founder FociTech)
- `docker-compose.yml`: Multi-container orchestration
- `.gitignore`: Complete credential protection

## Status
- React hydration warning from browser extensions (`webcrx`) resolved with `suppressHydrationWarning`.
- Clean production builds and tests passing.
