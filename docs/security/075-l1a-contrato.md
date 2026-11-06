---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l1a-contrato
commit: 5f51fdcd72e9962e6fcbd3b63e41038cb73c8785
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-06
---
# Review de segurança: lote 1a do pedido 075, contrato aceita o motivo "não classificado" (E1.7, K-204)

Propósito: parecer de segurança do lote 1a (diff `6754df7...5f51fdc`): BLOQUEADOS, O2 e O19 passam a aceitar o 8º valor de motivo. Gatilho: contrato da API (controle 10 do modelo de ameaças do 075). Público: node-backend (dono), tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado** em `5f51fdc`. Nenhum bloqueante. Revisão estática: li o diff inteiro e rodei só a suíte do pacote `packages/contratos` (11 arquivos, 213 testes verdes, 2 workers). Não rodei a CI, o `docs:check` nem o `openapi:verificar` (a prova deles é a CI do push, conferida pelo brief). Lacuna de ferramenta: sem `gitleaks` nem SAST nesta rodada; o diff não traz segredo nem dependência nova.

## O que foi verificado
- **Controle 10, nenhuma chave nova.** O diff dos schemas (`schemas.ts:101`, `:135`; `tambem.ts:71`) troca só o argumento do `z.enum`; nenhum campo foi criado, renomeado nem removido. Os diffs de `openapi.json`, das três fotografias e das três páginas de contrato acrescentam apenas a linha `"não classificado"` ao enum de motivo (e a data de revisão). Nenhum campo de pessoa nem "bloqueado por".
- **Motivo como constante fechada por enum.** `comum.ts:108-111`: `MOTIVO_NAO_CLASSIFICADO` é literal `as const`, e `MOTIVOS_BLOQUEIO_PUBLICADOS` é a lista dos 7 mais ele, sem `z.string()` nem aceitação de texto. O teste (`motivo-nao-classificado.test.ts:30-33`) recusa um nono valor e a variante `Não classificado`, nos três contratos. O texto não carrega pessoa nem texto livre da fonte.
- **CA-075-11 sobre os schemas.** O teste `:35-44` percorre as chaves de `resultadoBloqueados`, `resultadoO2` e `resultadoO19` e exige zero chave com segmento de pessoa. Passou. Cobre os três schemas deste lote; as rotas e a exportação ficam para os lotes que as tocam.
- **Escopo do diff.** `estado.ts` e `modelo.ts` em `packages/metricas` só alargam o tipo (`MotivoBloqueioPublicado`), sem lógica. O diff não toca `allow-list.ts`, `coleta.ts`, `grants.ts`, `lgpd.ts`, migração nem `aceitas.json` (entrada de uso único removida, sem diferença no fim da branch, como o plano pede).
- **Consumidores.** `MOTIVOS_BLOQUEIO` e `MotivoBloqueio` não aparecem em `web/src` nem em `server/src` (busca no HEAD): nenhum consumidor exaustivo sobre o motivo quebra; confirmo a premissa do plano.

## Achados
- A1 (recomendado) packages/contratos/src/motivo-nao-classificado.test.ts:8 · A regex de pessoa não inclui "bloqueado por"/"bloqueadoPor", que o CA-075-11 também proíbe; acrescentar o termo quando as rotas entrarem. Sem risco hoje: nenhuma chave assim existe.
- A2 (recomendado) packages/contratos/src/motivo-nao-classificado.test.ts:36 · O percurso de chaves não desce em união nem em união discriminada; os três schemas não as usam hoje. Cobrir `options` se um deles ganhar variante.
