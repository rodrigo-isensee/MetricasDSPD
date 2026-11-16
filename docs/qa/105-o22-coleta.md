---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o22-coleta
commit: 3c2ddba09a13f4bcaf94644e6c3003cb09f0f3c2
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: O22 B7a, coleta do primeiro toque (fronteira, normalizador, leitura)

Propósito: dizer se o B7a cumpre a ADR 0020 revisão 6 e os casos de abuso 1 a 12 e 15 do modelo de ameaças (`docs/security/105-o22-primeiro-toque-ameacas.md`). Público: tech-lead, node-backend, Jarvis. Sem migração nem carga (B7b): os casos 13 e 14 (papel no banco) ficam para lá. Sem PR para a branch: a suíte inteira fica para o CI do PR.

## Achados
- A1 (bloqueante) packages/metricas/src/coletor/contaComoToque.ts:1 · `pnpm run format:check` falha (job `rapida` do CI, run 43857367907) em contaComoToque.ts e contaComoToque.test.ts; o `typecheck` seguinte fica pulado. Rodar prettier --write nos dois e reenviar.
- A2 (recomendado) server/src/plataforma/http.ts:22 · `/cards/{id}/comments` segue aberto com a consulta genérica (A6 do parecer de segurança, não aplicado; o autor diz que quebrava o spike F1). Sem teste que fixe isso; registrar a decisão do arquiteto.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| R-T1, casos 1 a 3: `/cards/comments` só com `card_ids` (1 a 200) e `page`, recusa antes da rede | toque-fronteira.test.ts "caso 1 e 2", "caso 3" | vazio, 200 ok, 201, id vazio, texto, parâmetro extra | passou; mutantes M7 morreu |
| R-T3, caso 4: revisões só com `page`; `/revisions/{n}` recusado | toque-fronteira.test.ts "caso 4" | parâmetro extra, sufixo `/{n}` | passou; M6 morreu |
| R-T4, casos 6 e 8: corte por `CAMPOS_TOQUE`, só escalares | toque-fronteira.test.ts "CAMPOS_TOQUE e o corte", "chave desconhecida e todas as chaves" | chave desconhecida, objeto e lista no lugar de escalar | passou; M1 e M2 morreram |
| R-T2, caso 5: comentário fora do lote descartado e contado, sem valor | toque-leitura.test.ts "caso 5" | card em número e em texto, item não objeto | passou; M4 morreu |
| R-T6, caso 7: erro só com caminho e código; redact em um e dois níveis e em array | toque-fronteira.test.ts "A3 e caso 7"; toque-leitura.test.ts "falha HTTP", "falha de formato"; log.test.ts (16 casos) | marcador em type e value, corpo da resposta, array | passou; M5 e M9 morreram |
| R6-4, casos 9 e 10: conferência da lista, `leitura_incompleta` com motivo, nunca `sem toque` | toque-fronteira.test.ts "conferência da lista", "nunca vira sem toque"; toque-leitura.test.ts "lista que não bate" | buraco, repetição, curta, longa, vazia com revision 1 ou 2, sem `replaced_at` | passou; M3 e M11 morreram |
| Caso 11: falha HTTP no meio do card não deixa resultado | toque-leitura.test.ts "caso 11" | falha a meio | passou (gravação é do B7b) |
| R-T8, caso 15: lote acima do teto de bytes dividido | toque-leitura.test.ts "caso 15" | lote de 1 card que sozinho passa do teto | passou; M10 morreu |
| R6-5, caso 12: `contaComoToque` | contaComoToque.test.ts (26 testes, 5 property) | 0, negativo, decimal, texto, nulo, ausente, external, 12 dígitos, não lança | passou; M8 morreu |
| R-T5, A4 (parte estática): colunas e tabelas do toque fora do papel da aba Apontamento | toque-grants-estatico.test.ts | lista do papel | passou (negar no banco é do B7b) |

## Cenários e resultado real
- Ambiente: worktree desanexada em 3c2ddba0, local. Os 6 arquivos de teste do diff: 104 testes no servidor e 26 no pacote metricas, todos verdes.
- Vermelho antes do verde (à mão, porque `forge-testes --vermelho 369cb3d7` não fez veredito: saída `nenhum teste prova a mudança`, pois o diff traz os testes e ele os reverte junto, `módulos=` vazio). Fontes da base com os testes do HEAD: `tests/toque-fronteira.test.ts` e `tests/toque-leitura.test.ts` falham por módulo ausente; `contaComoToque.test.ts` falha por módulo ausente; com `http.ts`, `log.ts` e `allow-list.ts` da base: 45 testes falham (log.test.ts nos 16 caminhos de redact novos, http.test.ts "todo pedido ... é GET").
- Mutação à mão no diff (aplicar, rodar, reverter; árvore limpa depois), 11 de 11 mortos: M1 user_id no resultado, M2 `text` passando pela fronteira, M3 lista com buraco aceita, M4 comentário de outro card contado, M5 erro com o corpo da resposta, M6 revisões aceitam `board_ids`, M7 `card_ids` opcional, M8 comentário external conta, M9 redact de `*.*.text` removido, M10 sem divisão por bytes, M11 lista longa aceita. Controle sem mutação (M12): sobreviveu, como esperado.
- Autocheck: `pnpm run typecheck` passa; `pnpm run format:check` falha (A1).
- CI do head 3c2ddba0, run 43857367907: `rapida` falhou (format:check); `seguranca`, `build`, `imagem`, `openapi`, `banco` passaram; `testes` ainda em andamento quando este parecer foi escrito; `e2e`, `perf` pulados. Não afirmo CI verde.
- Não coberto aqui (de outras etapas): casos 13 e 14 e a carga real (B7b); P1 do plano (qual item de revisão traz o autor) só se prova com dado real.

## Pronto?
Não. Um bloqueante de formatação, de correção trivial. Revalidação: `forge-check parecer delta docs/qa/105-o22-coleta.md` e o check `rapida` verde no novo head.
