# Pedido 096: passo de critérios do apontamento carrega o .env sozinho

- **Modo:** implementar
- **Objetivo:** na implantação do apontamento, `pnpm --filter @metricas-dspd/server exec tsx src/entradas/criterios-apontamento.ts <data>` falha com "Configuração inválida (variáveis: PG_MIGRADOR_URL)" porque não lê o .env, ao contrário do db:migrate e dos bm:*. O dono precisou carregar o .env à mão. Criar um script do pacote que carregue o .env do mesmo jeito dos bm:* e corrigir o roteiro de implantação do 089 para usá-lo.
- **Clareza:** 0 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Origem:** relato da sessão "WSL ativação" ao implantar o apontamento a pedido do dono (2026-11-11 12:37).

## Escopo
- E1. Script `bm:criterios-apontamento` no `server/package.json`, carregando o .env como os bm:* já fazem, sem ler credencial no código · `técnico`
- E2. Roteiro de implantação do 089 passa a usar o script novo · `técnico`

## Etapas
- E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*.
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA.
- E1.4 (tech-lead): PR para a develop; o merge é do dono.
- E1.5 (agile-coach): retrospectiva curta.

## Fora do escopo
- Rodar o script contra a base real (é do dono) · `técnico`
- Subir api e web da demo · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 12:37: pedido aberto pelo Jarvis (K-270).
