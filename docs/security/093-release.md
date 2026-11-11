---
tipo: revisao-seguranca
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release
commit: ce704f9b61bb23ae2b1e197d50b71394f4dbf622
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: release 093 (develop em c6e5fd8f contra a homolog)

Propósito: conferir o delta `origin/homolog..c6e5fd8f` (22 arquivos, +647 -158: PR 298, lote 6b do 075, e PR 302, retrospectivas) e o CHANGELOG `ce704f9b` da branch `docs/093-release`. A base é o parecer do lote, `docs/security/075-l6b-publicacao-real.md` (aprovado sobre `bd76128a`). Revisão estática: nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
Projeção lida pela API (`R-SEGURANCA`): `BLOQUEIOS_COM_DADO_REAL = true` (`packages/contratos/src/origem.ts:58`) leva o conteúdo real de `fato_bloqueio` para BLOQUEADOS, O1, O2, O5 e O19 na API, na exportação e na tela.

## Resultado
- **Patch mesclado igual ao revisado: conforme.** As linhas alteradas de `129fc3d5..bd76128a` e do squash `c6e5fd8f^..c6e5fd8f`, sem `docs/qa`, `docs/reviews` e `docs/security`, são idênticas (comparação por `diff`, sem saída). O parecer do lote vale para o código da release.
- **Produção alterada só na publicação: conforme.** O código de produção muda em três pontos: o interruptor e o mapa real (`packages/contratos/src/origem.ts`), a data `DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'` (`packages/metricas/src/core/criterios.ts:127`) e dois comentários em `server/src/modulos/metricas/servico.ts:322-324`. Sem diff em `.github/`, `server/migrations`, `server/src/plataforma` (GRANTs e LGPD), `package.json` nem `pnpm-lock.yaml`: nenhum workflow, migração, GRANT ou dependência nova.
- **Sem dado de pessoa nem texto livre do motivo: conforme.** A leitura (`lerBloqueios`), o mapeamento (`motivoPublicado`, que troca motivo fora do domínio por "não classificado") e os schemas das cinco métricas não mudaram (ver o parecer do lote). A exportação monta os blocos a partir da mesma resposta da API, sem diff. A tela só consome os contratos (`web/` muda só em testes).
- **Sem avaliação individual: conforme.** BLOQUEADOS lista cards, O19 agrega por motivo, O5 por tipo, O1 por coluna, O2 por item; nenhuma agregação por pessoa ou time nova. O piso de 20 itens nos percentis segue pela biblioteca.
- **BusinessMap e Acelerato separados: conforme.** O 6b lê só o esquema `bm`; nada do Acelerato entra.
- **T2.6: conforme.** Versão de critério com data 2026-11-01 e corte da série do O1 em `null`, registrada no CHANGELOG em "Mudanças de critério de cálculo".
- **PR 302 e CHANGELOG: conforme.** Só documentação. Uma busca por apikey, token, senha, password, secret e e-mail nas linhas adicionadas achou só menções em prosa (custo em tokens, texto de pareceres), sem segredo nem e-mail.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH. Não rodei nenhum deles; sem dependência nova, eles ficam com o CI.

## Achados
- A1 (recomendado) server/tests/painel-real-f6.test.ts:339 · o A1 do parecer do lote 075 segue aberto na release: a regex PESSOA do S6 não cobre bloquead[oa]_?por, quem, coment nem observ; vale ter um cartão para o QA ou o node-backend, sem bloquear a release.

## Plano em cartões
Nenhum bloqueante. A1 ao qa-engineer (ou node-backend), num cartão próprio, se o tech-lead concordar.

## Riscos aceitos
Nenhum.
