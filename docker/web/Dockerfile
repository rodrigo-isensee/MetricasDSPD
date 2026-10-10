# SPA servida por nginx, com proxy de /api para a API. Contexto de build: a RAIZ do repositório.
FROM node:24-slim AS build
ENV CI=true
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter "@metricas-dspd/web..." && pnpm --filter @metricas-dspd/web build

FROM nginx:alpine
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/web/dist /usr/share/nginx/html
EXPOSE 80
