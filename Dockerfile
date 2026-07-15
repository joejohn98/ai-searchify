# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser


COPY --from=builder --chown=myuser:myuser /app/.next/standalone ./
COPY --from=builder --chown=myuser:myuser /app/.next/static ./.next/static
COPY --from=builder --chown=myuser:myuser /app/public ./public

USER myuser

EXPOSE 3000

CMD ["node", "server.js"]