---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-limpa-seed
commit: 6ff43dfd62c05101c32d5bba081dbbcb04afff7f
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-limpa-seed (comando de limpeza do seed mock da base real, E2.96, K-182)

**Veredito (E2.109, revalidação por delta): aprovado** em `6ff43df`. A volta (E2.108) resolve o A1: as versões de critério do seed dos domínios `businessmap` e `acelerato` saem do `dspd_core` com as linhas de `ref_versao_criterio_metrica`, escolhidas por campo e nunca por id, com falha fechada se alguma linha apontar para elas. O A3 também está resolvido. O A2 fica para o cartão de recomendados depois de segunda, por decisão técnica do Jarvis (2026-11-01 15:46). O teto recontado dá 761 linhas: exceção aceita, com a linha no PR.

Veredito anterior (E2.102): reprovado em `26d097c` (parecer `89073dd`), pelo A1.

## Revalidação por delta (E2.109)
`forge-check delta --parecer docs/reviews/052-limpa-seed.md` dá o intervalo `26d097c..6ff43df`. Li só o delta que ele lista:
- `server/src/plataforma/db/limpar-seed.ts`, linhas 18-19, 27, 44-45, 124-168, 170, 235-244, 263, 268 e 270-275;
- `server/tests/limpar-seed.pg.test.ts`, linhas 43-48, 68-69, 75, 77, 91-97, 100-101, 114-120, 138 e 198-226;
- `server/tests/limpar-seed.test.ts`, linhas 149-212;
- `docs/architecture/server.md`, linhas 83, 85, 95-96, 99 e 110.

Fica como "já lido" (parecer de `26d097c`, sem mudança no delta): a identificação do seed pela versão em `ctl_coleta`, a regra dos `ref_*` por regeração, a falha fechada das fontes, o gatilho append-only dentro da transação, a simulação somente leitura, `entradas/limpar-seed.ts`, `package.json` e `eslint.config.js`. Os pareceres de segurança e de QA na branch não são deste papel e não foram relidos.

**A1, resolvido.** `planejarCriterios` (`limpar-seed.ts:124-168`) seleciona `motivo = 'seed-mock'`, `dominio` em `businessmap`/`acelerato` e `referencia LIKE 'mock:%'`. O domínio `pesquisa` fica, e também a versão da carga de times da 0019 (referência própria, motivo diferente) e as versões reais. A falha fechada cobre dois casos: toda chave estrangeira para `ref_versao_criterio` (fora a da tabela de métricas) e toda coluna `versao_id` ou `incluido_por_versao_id` dos três esquemas. Isso pega `ref_time` e `ref_time_workflow` (0018 e 0019), o calendário e as tabelas da pesquisa. Conferi nas migrações: todas as colunas com esses nomes guardam versão de critério, então a busca por nome não traz um falso `ligada-a-dado-real`. O plano das versões roda antes do das fontes e a escrita só começa depois de tudo conferido. Ordem: as métricas antes das versões, e as versões antes das fontes. Cada DELETE confere a contagem prevista. A simulação devolve `criterios` sem escrever, e a saída traz só nomes de tabela e contagens (ADR 0020). Os testes provam o recorte, a ordem, a simulação, a ausência de versões do seed, as duas vias da falha fechada e a contagem divergente (unitário). No `.pg`, provam que pesquisa, versões reais e versão da carga de times ficam, que não sobra métrica órfã, que `ref_time` real ligado a uma versão do seed barra tudo e que a reaplicação é idempotente.

**A2 da segurança (entrou na volta, citado).** O `SET LOCAL lock_timeout` de 3 s vem antes do `ALTER TABLE`. Um `55P03` vira `trava` e um erro de outro código segue como erro interno. O `.pg` prova que, com a tabela presa, o comando falha em menos de 5 s, nada fica pela metade, nem no core, e o gatilho continua ativo. A conformidade fica com o parecer da segurança (E2.110).

**A3, resolvido.** `server.md:83,85` agora listam o que o seed grava, incluindo os `ref_*` e as versões de critério do `dspd_core`. A seção da limpeza traz o bloco das versões de critério, a trava curta e os limites, e diz que o PR avisa o dono de que `fato_bloqueio` e essas versões saem junto.

**Teto (decisão M14), recontado.** `git diff --numstat --no-renames origin/develop...6ff43df` (merge-base `81fcd63`), sem o texto `.md`, soma **761 linhas**: `limpar-seed.ts` 277, `limpar-seed.pg.test.ts` 234, `limpar-seed.test.ts` 213, `entradas/limpar-seed.ts` 34, `eslint.config.js` 2 e `package.json` 1. Continua um comportamento só, tirar o seed da base real: as versões de critério são parte do mesmo seed e da mesma falha fechada. A exceção está aceita, condicionada à linha no corpo do PR da E2.104: `teto: excedido, 761 linhas, comando único de limpeza do seed com a falha fechada e os testes que a provam`. Sem a linha, o PR fica bloqueado pela M14.

## Foco do parecer anterior (E2.102, em 26d097c)
Gatilho dentro da transação, identificação do seed pela versão, regra dos `ref_*` pela regeração e `fato_bloqueio` coberto pela decisão do dono: corretos, ver o parecer `89073dd`. A descrição do PR deve dizer ao dono que `fato_bloqueio` e as versões de critério do seed (businessmap e acelerato) saem junto.

## Outros pareceres e ferramentas (citados, não refeitos)
- Segurança: parecer em `docs/security/052-limpa-seed.md`, com renovação sobre a volta em curso (E2.110), em paralelo.
- Relatório da E2.108: server 1130 testes verdes e test:pg 172 verdes. O QA (E2.103) roda a suíte `.pg` depois.
- O `praticas.md` não tem regra "decidida por: `<comando>`", então não há saída de ferramenta a citar.

## Achados
- A1 (bloqueante) server/src/plataforma/db/limpar-seed.ts:211 · versões de critério do seed em dspd_core.ref_versao_criterio ficavam e viravam marcas T2.6 no FL1 real. Resolvido em 6ff43df (limpar-seed.ts:124-168), com ref_versao_criterio_metrica, falha fechada e testes .pg.
- A2 (recomendado) server/src/plataforma/db/limpar-seed.ts:168 · se o texto de um ref_* não casar (gerador mudou, DateStyle), a contagem dá 0 e as linhas do seed ficam sem aviso. Destino: cartão de recomendados depois de segunda (decisão técnica do Jarvis, 2026-11-01 15:46).
- A3 (recomendado) docs/architecture/server.md:85 · linhas 83 e 85 diziam que ref_quadro, ref_dominio e ref_alvo_prioridade ficavam fora do seed. Resolvido em 6ff43df.
- A4 (recomendado) server/src/plataforma/db/limpar-seed.ts:237 · o SET LOCAL lock_timeout vale até o fim da transação: um DELETE posterior que espere mais de 3 s por trava de linha sai como erro interno, não como trava. Desfaz tudo igual; ajuste a mensagem ou devolva o timeout depois do ALTER. Não devolve.
