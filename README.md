# AI Searchify

An intelligent, web-powered research assistant built with **Next.js 16**, **React 19**, and the **Vercel AI SDK**. It uses **Google Gemini 3.1 Flash Lite** to answer questions by searching the web in real time via the **Tavily API**, delivering source-backed answers with citations.

## Features

- **Real-time web research** — fetches current information from across the web before answering
- **Streaming responses** — see results as they're generated
- **Markdown rendering** — rich responses with links, lists, and formatting
- **Source citations** — every answer includes URLs for verification
- **Responsive UI** — sidebar on desktop, compact header on mobile
- **Terminal UI (TUI)** — run the agent directly from the command line for testing
- **Docker support** — production multi-stage build and development setup

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org) 16.2.10 (App Router) |
| UI Library | [React](https://react.dev) 19.2.4 |
| Language | [TypeScript](https://www.typescriptlang.org) (strict mode) |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| AI SDK | [Vercel AI SDK](https://sdk.vercel.ai) 7.0.28 |
| LLM | Google Gemini 3.1 Flash Lite (`@ai-sdk/google`) |
| Web Search | [Tavily](https://tavily.com) (`@tavily/core`) |
| Icons | [Lucide React](https://lucide.dev) |
| Font | Inter (via `next/font`) |
| Runtime | Node.js 24 (Alpine in Docker) |

## Project Structure

```
ai-searchify/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts       # POST /api/chat — agent streaming endpoint
│   │   ├── globals.css             # Tailwind v4 entry point
│   │   ├── layout.tsx              # Root layout with Inter font & metadata
│   │   └── page.tsx                # Chat UI (sidebar, messages, input)
│   └── lib/
│       ├── agent.ts                # ToolLoopAgent: Gemini + Tavily web search
│       └── dev.ts                  # Terminal UI for local agent testing
├── public/                         # Static assets
├── Dockerfile                      # Multi-stage production build
├── Dockerfile.dev                  # Development build
├── docker-compose.yml              # Docker Compose for dev & prod
├── next.config.ts                  # Next.js config (standalone output, React Compiler)
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS with Tailwind v4
├── eslint.config.mjs               # ESLint 9 flat config
├── package.json
└── .env.example                    # Required environment variables
```

## Quick Start

### Prerequisites

- Node.js 24+
- npm
- API keys for [Google Gemini](https://aistudio.google.com/apikey) and [Tavily](https://tavily.com)

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-searchify
npm install
```

### 2. Configure environment

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key |
| `TAVILY_API_KEY` | Tavily web search API key |

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Docker

### Production

Multi-stage build that produces a minimal standalone image:

```bash
docker build -t ai-searchify .
docker run -p 3000:3000 --env-file .env ai-searchify
```

The Dockerfile uses three stages:
1. **deps** — installs production dependencies with `npm ci`
2. **builder** — runs `next build` with standalone output
3. **runner** — copies only the standalone build to a minimal Alpine image under a non-root user

### Development

Hot-reload enabled via a bind mount:

```bash
docker compose up dev
```

### Building & running production with Compose

```bash
docker compose up prod
```

## CLI (Terminal UI)

Test the agent directly in the terminal without the browser:

```bash
npx tsx src/lib/dev.ts
```

This launches an interactive TUI powered by `@ai-sdk/tui` — useful for debugging the agent's tool-use loop.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production (standalone output) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Architecture

### Agent Loop

The core agent lives in `src/lib/agent.ts`:

1. User submits a question via the chat UI or TUI
2. `api/chat/route.ts` receives the message and creates an `AgentUIStreamResponse`
3. The `ToolLoopAgent` (max 5 steps) invokes Gemini 3.1 Flash Lite
4. The model decides to call the `webSearch` tool (Tavily API with `advanced` depth, up to 5 results)
5. Search results are returned to the model, which synthesizes a response with citations
6. Response streams back to the client as a Markdown-formatted message

### API Endpoint

`POST /api/chat` accepts `{ messages: [...] }` and returns a streaming `text/event-stream` response.

## Environment Notes

- `.env` is git-ignored (per `.gitignore`). Use `.env.example` as a template.
- The React Compiler is enabled in `next.config.ts` for automatic memoization.
- Tailwind CSS v4 uses the new `@import "tailwindcss"` syntax (no `tailwind.config.js` needed).

## Best Practices

- **Security:** Never commit `.env` with real API keys. The `.env.example` template is provided for reference.
- **Docker:** The production Dockerfile uses a non-root user and copies only the standalone build output — no source code or dev dependencies in the final image.
- **TypeScript:** Strict mode is enabled. Path alias `@/*` maps to `./src/*`.
- **Agent instructions:** The agent is explicitly instructed to always search before answering, cite sources, and respond in the user's language.
