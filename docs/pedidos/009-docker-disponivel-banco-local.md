# Pedido 009 — Docker disponível: desbloquear e validar o banco local

Solicitante: Rodrigo Isensee · Data: 2026-10-10 · Responsável: Jarvis

## Contexto
O **Docker Engine 29.9 e o Docker Compose v5.6 estão instalados no WSL** (serviço ativo, inicia com o Ubuntu). O usuário `rodrigoisensee` está no grupo `docker`. Isso remove o bloqueio do cartão **K-017** ("depende do usuário: Docker").

**Atenção:** sessões abertas antes da instalação não têm o grupo `docker` carregado. Se `docker ps` falhar com permissão negada, rode os comandos com `sg docker -c "<comando>"` (ex.: `sg docker -c "npm run db:up"`) — não use `sudo`. Uma sessão nova do Claude Code já funciona sem isso.

## O que fazer
1. Mover **K-017** de Bloqueado de volta para a coluna de origem e registrar no histórico.
2. Subir o ambiente conforme o `README.md`: `.env` a partir do `.env.example` com senhas **apenas de desenvolvimento local** (geradas, nunca reais; `.env` não é versionado), `npm run db:up`, `npm run db:migrate`, `npm run db:seed`.
3. Rodar `npm run test:mysql`: os testes de banco que estavam pulados por falta de ambiente agora precisam **executar e passar**. Nenhum teste pulado por "pendente de ambiente" pode restar.
4. **Performance do banco** (orçamento da ADR 0003): carregar volume equivalente a 2 anos, medir as consultas principais dos painéis (p95 < 500 ms), registrar o `EXPLAIN` de cada uma e confirmar índices para todos os filtros. Resultado na ata de alinhamento.
5. Conferir as migrações: aplicar do zero, desfazer e reaplicar sem erro.
6. Code review do `tech-lead` e **parecer do QA** sobre os resultados; o que falhar volta ao `node-backend`.
7. Entregar por pull request, como sempre. A `main` continua sendo validada pelo usuário.

## Nota do Jarvis (2026-10-10 16:33)
Renumerado de 008 para 009 (o 008 é "exportar métricas"). Escrito antes da troca para **PostgreSQL + pnpm** (ADR 0014): onde diz MySQL/npm leia Postgres/pnpm (`pnpm run test:pg`). Situação: itens 1, 2, 3 e 5 cumpridos (31 testes `*.pg.test.ts` executados no postgres:17 do Compose, migrações up→down→up, nenhum pulado por ambiente); item 4 (volume de 2 anos, p95 < 500 ms, EXPLAIN por consulta de painel) fica no cartão S-11 (módulo `metricas`), onde as consultas existirão; item 6 (review e QA) segue o fluxo normal.
