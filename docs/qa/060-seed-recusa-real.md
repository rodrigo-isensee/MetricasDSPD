---
tipo: qa
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-seed-recusa-real
commit: f0299b00a29502ae54df9bb396622033c39e00d4
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA: P1 do plano 060-sem-mock, o seed nunca grava na base real (E2.6, K-195)

Links: plano `docs/architecture/060-sem-mock.md` (item P1), review `docs/reviews/060-seed-recusa-real.md`, segurança `docs/security/060-seed-recusa-real.md`, devops `docs/devops/060-seed-recusa-real.md`.

**Parecer: aprovado**, sem bug aberto, sobre a ponta `f0299b0` (código em `63a9d91`; os commits depois dele só trazem pareceres). Escopo `completo` contra a base `d05bbfc`. Só o banco de teste `metricas_test` foi usado; o `.env` não foi aberto (o `test:pg` rodou direto pelo pacote do server, com `PG_TESTE_URL` explícita, sem o `scripts/test-pg.sh`, que carrega o `.env`).

## Achados
- A1 (recomendado) server/src/plataforma/db/seed.ts:241 · a contagem de itens reais (`cards > 0`) nunca decide sozinha: o mutante que a tira sobrevive, pois `atualizado_por_coleta_id` é NOT NULL e o item real sempre vem com coleta real. É defesa em profundidade; não devolve.

## Critério → teste → resultado
Obrigações: os quatro casos do P1 do plano, mais a ausência de chamadores do `db:seed` e a documentação. Testes do autor em `server/tests/seed-recusa-real.pg.test.ts` (7), `esquema-com-seed.test.ts` (6) e `guarda-seed.test.ts`; nenhum teste novo meu foi preciso, pois cada caso já tem prova e a mutação cobriu o resto.

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Seed recusado com coleta real (P1, caso 1) | `seed-recusa-real.pg`: coleta real só no BM, só no Acelerato, seed seguido de coleta real, card gravado por coleta real | esquema vazio × 1 linha real; nada gravado em nenhum esquema; mensagem só de tabela e contagem | passou |
| Seed aceito em esquema vazio (caso 2) | `seed-recusa-real.pg` (semeado, depois `ja_semeado`) | vazio; idempotência | passou |
| Sem `PG_SEED_URL` falha na partida (caso 3) | `seed-recusa-real.pg`: CLI com `PG_MIGRADOR_URL` definida e sem `PG_SEED_URL`, rc diferente de 0, URL ausente da saída | fallback removido | passou |
| Coleta recusada com seed (caso 4) | `seed-recusa-real.pg` e `esquema-com-seed.test.ts`: coleta, projetor, comando e worklog do BM; coletor e projetor do Acelerato; API não chamada, nada escrito | antes de qualquer escrita; contagem zero | passou |
| Nenhum script ou workflow chama `db:seed` | `grep` em `.github`, `scripts`, `tools`, `package.json`: só `restauracao.yml:54` e `homolog:subir` (`comandos.ts`) chamam o `seed` do server, ambos com `PG_SEED_URL` | n/a | passou |
| Documentação atualizada | README:18, `server.md:109` e `:150`, `homologacao.md`, `.env.example`; `docs:check` ok (887 páginas) | n/a | passou |

## Execução real
- `test:pg` (fora do sandbox, banco `metricas_test`): `Test Files 33 passed (33)`, `Tests 231 passed (231)`.
- `pnpm run pronto`: rc=0 (web, tools e `docs:check: ok (887 páginas Markdown, 69 métricas, 2 eventos)`). O sandbox deixa a trava em `/tmp` e a porta do PostgreSQL fechadas, então `test:pg` e `pronto` rodaram sem sandbox.
- Vermelho antes do verde: os três testes novos copiados para uma worktree descartável na base `d05bbfc`: `seed-recusa-real.pg` 6 de 7 falharam (a base resolve `semeado`/`ja_semeado` onde devia recusar; o aceito em esquema vazio passa nos dois lados); `esquema-com-seed` 6 de 6 falharam; `guarda-seed` não carrega (`Cannot find module .../guarda-seed.js`). Worktree removida.
- Mutação manual no código alterado (restaurado por `git checkout`, árvore limpa): M1 tira `cards > 0` da guarda do seed: sobrevive (A1, equivalente na prática); M2 tira `coletas > 0`: morre (3 testes); M3 muda `n > 0` da coleta do BM para `n > 99`: morre (1 teste).

## Bugs
Nenhum. Fora da conclusão, já registrados pelo review (A1 a A4) e pela segurança (A1): travas diferentes e coleta sem a trava `dspd:seed`, recusa do Acelerato sem contagem, webhook do BM em esquema com seed; seguem como recomendados do review.
