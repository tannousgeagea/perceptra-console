FROM node:20-alpine AS deps

LABEL maintainer="tannousgeagea@hotmail.com"
LABEL com.perceptra.version="1.1b1"

WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Development ───────────────────────────────────────────────────────────────
FROM deps AS dev
COPY . .
CMD ["npm", "run", "dev"]

# ── Production build ──────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN npm run build

# ── Production serve ──────────────────────────────────────────────────────────
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
