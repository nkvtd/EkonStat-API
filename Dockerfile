FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json esbuild.config.js ./
COPY drizzle.config.ts ./
COPY src ./src

RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

RUN mkdir -p /app/logs
EXPOSE 8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src/infrastructure/database/migrations ./src/infrastructure/database/migrations

COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start:app"]