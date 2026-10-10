# Imagem única do servidor (ADR 0014): várias entradas (api, worker, migrar) pelo comando.
# Contexto de build: a RAIZ do repositório.  docker build -f server/Dockerfile -t metricas-dspd-server .
FROM node:24-slim AS deps
ENV CI=true
RUN corepack enable
WORKDIR /repo
COPY . .
# Só o servidor e os pacotes workspace de que ele depende; versões fixadas pelo pnpm-lock.yaml.
RUN pnpm install --frozen-lockfile --filter "@metricas-dspd/server..."

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=deps --chown=node:node /repo/node_modules ./node_modules
COPY --from=deps --chown=node:node /repo/packages ./packages
COPY --from=deps --chown=node:node /repo/server ./server
COPY --chown=node:node package.json pnpm-workspace.yaml ./
USER node
WORKDIR /repo/server
EXPOSE 3000
# Padrão: a API. O Compose troca o comando para o worker e para a migração.
CMD ["node", "--import", "tsx", "src/entradas/api.ts"]
