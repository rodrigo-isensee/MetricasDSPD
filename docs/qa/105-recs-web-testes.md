---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-recs-web-testes
commit: 9592ebe2ef9f9bbe86c1019ec7190abe3856dd84
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: recomendados do S1 e do T2 (testes da tela, E3.62)

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| T2 com n = 20 não é amostra insuficiente (mínimo 20) | ramos.test.tsx: "n = 20 sem SLE publicado" | limite inferior do mínimo (20) | passou |
| T2 com n = 19 é amostra insuficiente, "19 de 20 itens mínimos" | ramos.test.tsx: "n = 19" | logo abaixo do mínimo | passou |
| Texto do S1 cita exatamente os prazos corridos de ALVOS_PADRAO | notas.test.ts: "prazos corridos" | unidade por prazo (P1 ambos, P2 primeiro atendimento) | passou |
| Demais prazos são úteis, como o texto diz | notas.test.ts: "demais prazos são úteis" | contagem total de prazos menos 3 | passou |

## Cenários e resultado real
- Ambiente: worktree desanexada em 9592ebe2 (diff só de testes e CHANGELOG).
- `vitest run` dos dois arquivos: 2 arquivos, 18 testes, todos passaram.
- Mutante 1 (`c.n >= 20` vira `c.n > 20` em CartaoT2.tsx:72): cai o teste "n = 20". Morreu.
- Mutante 2 (unidade de P2 primeiro atendimento 'corrido' vira 'util' em modelo.ts:146): caem os 2 testes de notas.test.ts. Morreu.
- Os mutantes foram aplicados e revertidos; árvore limpa.
- CI do head 9592ebe2, run 43767575514: concluiu com sucesso.
