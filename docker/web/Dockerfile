# SPA servida por nginx, com proxy de /api para a API. Contexto de build: a RAIZ do repositório.
FROM node:24-slim AS build
ENV CI=true
RUN corepack enable
WORKDIR /repo
# Fonte dos dados da SPA (api|mock). Padrão `api` (pedido 060): o painel só lê a base real e mostra "Sem dado real" onde não há fonte.
# O mock só por --build-arg VITE_FONTE=mock explícito: o compose de homologação o declara (demonstração fictícia, com selo global).
ARG VITE_FONTE=api
ENV VITE_FONTE=$VITE_FONTE
COPY . .
RUN pnpm install --frozen-lockfile --filter "@metricas-dspd/web..." && pnpm --filter @metricas-dspd/web build

FROM nginx:alpine
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/web/dist /usr/share/nginx/html
EXPOSE 80
