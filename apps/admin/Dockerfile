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
WORKDIR /app/apps/admin
ARG BASE_URL
RUN pnpm build --base=${BASE_URL}

FROM nginx:stable-alpine
ARG BASE_URI
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html/${BASE_URI}
VOLUME [ "/etc/nginx/conf.d", "/usr/share/nginx/html/${BASE_URI}metadata" ]
