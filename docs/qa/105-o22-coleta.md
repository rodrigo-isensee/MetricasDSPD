---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o22-coleta
commit: 6a8adeea58e1f14cea78b94cce60a83cbaf372e1
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: O22 B7a, coleta do primeiro toque (fronteira, normalizador, leitura)

Propósito: dizer se o B7a cumpre a ADR 0020 revisão 6 e os casos de abuso 1 a 12 e 15 do modelo de ameaças (`docs/security/105-o22-primeiro-toque-ameacas.md`). Público: tech-lead, node-backend, Jarvis. Sem migração nem carga (B7b): os casos 13 e 14 (papel no banco) ficam para lá. Sem PR para a branch: a suíte inteira fica para o CI do PR.

## Achados
- A1 (recomendado) packages/metricas/src/coletor/contaComoToque.ts:1 · resolvido no head 6a8adeea: `format:check` passa e o job `rapida` está verde.
- A2 (recomendado) server/src/plataforma/http.ts:22 · resolvido: `CONSULTA_VAZIA` recusa qualquer parâmetro em `/cards/{id}/comments`, com teste que fixa.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| R-T1, casos 1 a 3: `/cards/comments` só com `card_ids` (1 a 200) e `page`, recusa antes da rede | toque-fronteira.test.ts "caso 1 e 2", "caso 3"; "spike F1 não aceita parâmetro algum" | vazio, 200 ok, 201, id vazio, texto, parâmetro extra, consulta vazia em `/cards/{id}/comments` | passou; M7 e M13 morreram |
| R-T3, caso 4: revisões só com `page`; `/revisions/{n}` recusado | toque-fronteira.test.ts "caso 4" | parâmetro extra, sufixo `/{n}` | passou; M6 morreu |
| R-T4, casos 6 e 8: corte por `CAMPOS_TOQUE`, só escalares | toque-fronteira.test.ts "CAMPOS_TOQUE e o corte", "chave desconhecida e todas as chaves" | chave desconhecida, objeto e lista no lugar de escalar | passou; M1 e M2 morreram |
| R-T2, caso 5: comentário fora do lote descartado e contado, sem valor | toque-leitura.test.ts "caso 5" | card em número e em texto, item não objeto | passou; M4 morreu |
| R-T6, caso 7: erro só com caminho e código; redact no topo, em um e dois níveis e em array | toque-fronteira.test.ts "A3 e caso 7"; toque-leitura.test.ts "falha HTTP", "falha de formato"; log.test.ts (inclui "chave no topo", 8 chaves) | marcador em type e value, corpo da resposta, array, chave no topo | passou; M5, M9 e M14 morreram |
| R6-4, casos 9 e 10: conferência da lista, `leitura_incompleta` com motivo, nunca `sem toque` | toque-fronteira.test.ts "conferência da lista", "nunca vira sem toque"; toque-leitura.test.ts "lista que não bate" | buraco, repetição, curta, longa, vazia com revision 1 ou 2, sem `replaced_at` | passou; M3 e M11 morreram |
| Caso 11: falha HTTP no meio do card não deixa resultado | toque-leitura.test.ts "caso 11" | falha a meio | passou (gravação é do B7b) |
| R-T8, caso 15: lote acima do teto de bytes dividido | toque-leitura.test.ts "caso 15" | lote de 1 card que sozinho passa do teto | passou; M10 morreu |
| R6-5, caso 12: `contaComoToque` | contaComoToque.test.ts (26 testes, 5 property) | 0, negativo, decimal, texto, nulo, ausente, external, 12 dígitos, não lança | passou; M8 morreu |
| R-T5, A4 (parte estática): colunas e tabelas do toque fora do papel da aba Apontamento, pulando só `estado` e `motivo` nas `ctl_` | toque-grants-estatico.test.ts | lista do papel | passou (negar no banco é do B7b) |

## Cenários e resultado real
- Rodada anterior (head 3c2ddba0): 11 mutantes à mão, 11 mortos; vermelho antes do verde à mão porque `forge-testes --vermelho` não fez veredito (o diff traz os testes e ele os reverte junto). Reprovada só pelo formato (A1).
- Revalidação do delta 3c2ddba0..6a8adeea (`forge-check parecer delta`; domínio: contaComoToque(.test).ts, http.ts, log.ts, log.test.ts, toque-fronteira.test.ts, toque-grants-estatico.test.ts, CHANGELOG).
- Local no head 6a8adeea: `pnpm run format:check` limpo, `pnpm run typecheck` passa, 113 testes do servidor (5 arquivos) e 26 do pacote metricas verdes.
- Mutação do delta à mão (aplicar, rodar, reverter; árvore limpa depois): M13 `CONSULTA_VAZIA` trocada por `CONSULTA_PERMITIDA` em http.ts, morreu (teste "spike F1 não aceita parâmetro algum"); M14 `user_id` removido do redact do topo em log.ts, morreu (log.test.ts "user_id no topo"); M15 `evento_id` somado às genéricas puladas da guarda das `ctl_`, sobreviveu e é equivalente: `evento_id` não está nas colunas do papel dessas duas tabelas, então pular ou não dá o mesmo resultado.
- Vermelho antes do verde: os dois testes novos falham com M13 e M14, que repõem o comportamento da volta anterior.
- CI do head 6a8adeea, run 43866989872: `rapida`, `seguranca`, `build`, `imagem`, `openapi`, `banco` e `testes` verdes; `perf` e `e2e` pulados. A suíte inteira do PR fica para o CI dele.
- Não coberto aqui (de outras etapas): casos 13 e 14 e a carga real (B7b); P1 do plano (qual item de revisão traz o autor) só se prova com dado real.

## Pronto?
Sim para o B7a: sem bloqueante, A1 e A2 resolvidos, CI do head verde.
