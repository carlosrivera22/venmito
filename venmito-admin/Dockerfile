# venmito-admin/Dockerfile - Alpine optimized
FROM node:23.11.0-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

FROM node:23.11.0-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
# Build with optimizations
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build --no-lint && rm -rf .next/cache

# Final stage
FROM node:23.11.0-alpine AS runner
RUN apk add --no-cache dumb-init && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy only what we need
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node_modules/.bin/next", "start"]