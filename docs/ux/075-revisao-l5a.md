---
pedido: 075-bloqueios-reais
branch: feature/075-l5a-tela
commit: 7724d087ede7b1b881899cd71d104eb51eb31abd
etapa: E1.10 (ux-designer), lote 5a
---

# Revisão de interface do lote 5a: motivo "não classificado"

Veredito: aprovado com ressalvas. Nenhum achado crítico ou alto; dois médios e três baixos, nenhum bloqueia o PR.

Escopo: BLOQUEADOS, coluna "Bloqueado" do O2 e O19, contra `docs/ux/075-bloqueios-reais.md` (nota de 14:21). CA-6 a CA-9 e CA-12 são do lote 5b e ficaram fora.
Método: leitura de `MotivoBloqueio.tsx`, `CartaoBloqueados.tsx`, `CartaoO2.tsx`, trecho do O19 em `operacionais.tsx` e `motivo-nao-classificado.test.tsx` na worktree, só leitura. Sem Bash na delegação, não confirmei o HEAD da worktree nem rodei testes, nem medi contraste dos tokens (`text-texto-2`, série 7); ficam como verificação do QA.

## Conferência contra a especificação

| Ponto | Resultado |
|---|---|
| Marca (texto, ícone, leitor de tela) | Conforme: texto exato, itálico, `text-texto-2`, ícone `info` com `aria-hidden`; o texto basta para leitor de tela (CA-1, CA-4). |
| BLOQUEADOS: leitura e apoios | Conforme: "por motivo não classificado"; apoio do motivo só quando há o valor; apoio de precisão sempre; tabela com `aria-describedby`; sem filtro por motivo; sem coluna de pessoa (CA-3, CA-5, CA-10, CA-11). |
| O2 só com a coluna "Bloqueado" | Conforme: sem distribuição por motivo; a coluna mostra o motivo com marca e apoio ligado à tabela (CA-1, CA-2, CA-4). |
| O19: ordem, hachura, legenda | Conforme: "não classificado" por último em barras e tabela, série hachurada própria, legenda só quando ele existe, soma no total (CA-2, CA-4). |
| CA-5 | Conforme nas três telas: nenhum campo ou rótulo de pessoa. |

## Achados

- (médio) O19, leituraO19 em operacionais.tsx: a leitura cita o maior motivo classificado e omite o "não classificado", mesmo quando ele domina (70 de 100 dias no teste). Cita o topo sem dizer a lacuna e engana. Sugestão: acrescentar "X% sem classificação". (CA-2)
- (médio) O19, barras: o rótulo do eixo "não classificado · N bloqueios" é texto puro, sem itálico nem ícone; só hachura e legenda distinguem. Aceitável no texto, mas a marca do eixo diverge da tabela. Sugestão: igualar o rótulo ou registrar a exceção. (CA-4)
- (baixo) O19, leituraO19: se só existir "não classificado", a leitura diz "não classificado somou N dias", soando como motivo de negócio. Sugestão: "bloqueio sem motivo classificado somou N dias". (CA-1)
- (baixo) Teste do O19: o título cita legenda hachurada, mas nada afirma a série hachurada nem a legenda; o `aria-describedby` do O19 e do O2 também não é verificado. Sugestão: afirmar ambos. (CA-4)
- (baixo) O2: o apoio do motivo só aparece se houver "não classificado" entre os 10 itens listados, não no total; com a ordenação por "Sem mover há" ele pode sumir e voltar. Aceitável; registrar no QA. (CA-1)
