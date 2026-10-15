---
tipo: qa
contrato: 1
pedido: e2e-if-a
branch: fix/e2e-if-a
commit: 6aed3cc
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
aceite_usuario: sim
data: 2026-10-14
---

# Parecer de QA - E2E IF-A: orçamento de tempo próprio (K-083)

Links: review `docs/reviews/e2e-if-a.md` (aprovado, commit 757d732); bug `docs/qa/bugs/IFA-001-nao-afetado-sem-verificacao-em-operacional-e-estrategico.md`.

## Escopo
- Mudança testada: `test.setTimeout(120_000)` no teste IF-A de `e2e/tests/intensivo-filtros.spec.ts` (commit 757d732). HEAD testado 6aed3cc (só acrescenta o review). A asserção não mudou (`expect(divergentes).toEqual([])`, anotação `verificados`).
- Coberto: o spec `intensivo-filtros.spec.ts` inteiro (119 testes) rodado duas vezes; a mutação da asserção do IF-A; o tempo de cada rota do IF-A.
- Não coberto: o restante da suíte E2E (`pnpm run pronto` e lighthouse têm outro escopo); segurança, pipeline e IaC (fora do diff, sem alcance); IF-A não é alterado em produção (sem código de produto no diff).

## Ambiente
- Worktree `/home/rodrigoisensee/MetricasDSPD-fix-if-a`, branch `fix/e2e-if-a`, Chromium headless (Playwright) com libs locais (`scripts/setup-chromium-local.sh`), `vite preview` na porta 4173 (sem reuso de servidor de outros agentes; 4173 e 4174 estavam livres).
- Execução com `flock /tmp/metricas-pesado.lock nice -n 19`. Outros processos pesados (`pronto`, `lighthouse`) disputavam a máquina durante a rodada 1: isso afetou o IF-U (ver instabilidade).

## Resultados

### Rodadas do spec inteiro (`tests/intensivo-filtros.spec.ts`)
| Rodada | Resultado | Duração | Observação |
|---|---|---|---|
| 1 | 118 passed, 1 failed | 6.1 min | falhou IF-U-operacional (timeout de 30 s, o teste levou 31.8 s) |
| 2 | 119 passed, 0 failed | 4.5 min | verde |

Rodada extra (JSON, só `-g "IF-A"`): 4 passed, 0 failed, 46.4 s.

### Tempos do IF-A (com teto de 120 s)
| Rota | Rodada 1 | Rodada 2 | Rodada JSON | Cartões verificados |
|---|---|---|---|---|
| /operacional | 3.0 s | 2.7 s | 3.4 s | 0 (ver IFA-001) |
| /operacional?cadencia=semanal | 43.8 s | 41.5 s | 30.2 s | 7 |
| /tatico | 29.3 s | 28.2 s | 26.7 s | 7 |
| /estrategico | 4.4 s | 3.9 s | 4.3 s | 0 (ver IFA-001) |

A semanal passou de 30 s em 3 de 3 rodadas, e o /tatico ficou entre 26 e 29 s. O teto de 120 s dá folga de cerca de 2,7 vezes sobre o pior caso observado (43.8 s). Isso confirma o diagnóstico do review: o estouro vinha do orçamento padrão de 30 s para o teste inteiro.

### Mutação da asserção (verificação de que a asserção continua efetiva)
- Mutação: `if (outro?.base !== c.base)` → `if (outro?.base === c.base)` em `e2e/tests/intensivo-filtros.spec.ts`.
- Rodada 1 (`-g "IF-A /operacional:"`): passou. Motivo: nenhum cartão verificado nessa rota (IFA-001). Não prova nada sobre a asserção.
- Rodada 2 (`-g "IF-A /tatico"`): **falhou** (1 failed, 23.9 s). Mensagens: `T5 diz "Não afetado por: Sistema", mas a base muda ...`, e as demais 6 cartões do /tatico.
- Revertido com `git checkout --`; `git status` limpo na worktree. A asserção está como no commit 757d732.

### Vermelho antes do verde
Não se aplica a um teste novo: o diff só ajusta o orçamento de tempo de um teste existente. A falha original é a da CI (31,7 s e 30,9 s na semanal contra 30 s, citadas no review); não reproduzi a CI, mas os tempos locais medidos aqui (26 a 44 s no IF-A) reproduzem a faixa que estoura o padrão.

## Critério → teste → resultado
| Critério (obrigação) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA: o IF-A conclui dentro do orçamento nas rotas reais (sem estourar 30 s em /operacional semanal e /tatico) | IF-A `/operacional?cadencia=semanal`, `/tatico` (2 rodadas + 1 JSON) | tempo total do teste com muitos cartões (limite = 120 s) | aprovado (43.8 s no pior caso) |
| R: "Não afetado por X" é verdade (tabela 2.2 x cálculo) | IF-A `/tatico`, `/operacional?cadencia=semanal` | rótulo com 1 e com várias chaves (Tipo, Sistema) | aprovado; falha quando a comparação é invertida (mutação) |
| R: "Não afetado por X" é verdade, nas rotas de cartões não aplicáveis | IF-A `/operacional`, `/estrategico` | estado sem cartão "Não afetado por" | **passa sem verificar nada** (IFA-001) |
| Asserção preservada (determinismo, anotação `verificados`) | conferência do diff e da mutação | n/a | aprovado |
| Gates: nenhum outro teste com timeout alterado | diff `origin/develop...HEAD` (uma linha + comentário) | n/a | aprovado |
| Acessibilidade | n/a (teste de texto e dados, sem tela nova) | n/a | n/a |
| Permissão e falha de API | n/a (IF-A roda sobre o mock, sem perfil de permissão) | n/a | n/a |

## Instabilidade observada
- IF-U-operacional (`intensivo-filtros.spec.ts:348`, não é o IF-A nem está no diff) falhou na rodada 1 por timeout de 30 s (31.8 s), com a máquina disputada por `pronto` e `lighthouse`. Passou na rodada 2. Não foi uma falha de asserção: o teste navega por ida, volta, avanço e uma nova aba, e estoura o orçamento padrão sob carga. Não é regressão desta mudança.
- Não usei `retry` nem `skip`. Recomendação ao `qa-engineer`: dar ao IF-U o mesmo orçamento explícito do IF-A (ou medir sob carga controlada) em outro ciclo. Registrado como risco, não como bug, porque não houve asserção falha.

## Bugs abertos
- IFA-001 (média): `IF-A /operacional` e `IF-A /estrategico` não verificam nenhum cartão. O teste passa em branco nessas rotas. Pré-existente, não causado por este diff. Aberto: `docs/qa/bugs/IFA-001-nao-afetado-sem-verificacao-em-operacional-e-estrategico.md`.

## Veredito
**Aprovado** para a mudança de timeout (757d732). A correção faz o que o review diz: o IF-A passa com folga nas rotas que estouravam, a asserção continua efetiva em /tatico (verificada por mutação), e nenhum teste foi pulado. Há um bug médio aberto (IFA-001), pré-existente e fora deste diff; por isso `aceite_usuario: sim`: o usuário decide se aceita a sair assim ou se pede a correção antes da release. O IFA-001 não bloqueia o merge desta mudança, mas a afirmação "IF-A cobre 'Não afetado por' no operacional" não é verdadeira hoje.

Decisão ao usuário (R-DECISAO): definir com qual conjunto de filtros o /operacional default deve ter cartões "Não afetado por" para o IF-A cobrir essa rota (regra de negócio, não resolvida por inferência).
