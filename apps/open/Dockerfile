FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable
ARG NPM_CONFIG_REGISTRY
RUN npm config set registry ${NPM_CONFIG_REGISTRY}
WORKDIR /app

FROM base AS builder
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile
RUN pnpm --filter zeroweb-app-open build

FROM nginx:alpine
COPY --from=builder /app/apps/open/dist /usr/share/nginx/html
