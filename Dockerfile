# MPLAD SENTINEL — Production Dockerfile
# Node.js 22 LTS with native node:sqlite support

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Step 1: Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Step 2: Build the Next.js application & backend intelligence
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Step 3: Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and database artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/data ./data

# Ensure data directory has write permissions for auditor reviews & notes
RUN chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start"]
