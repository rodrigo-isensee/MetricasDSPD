---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/k286-mapa-diario-equipe
commit: 62a622abf9abecc9813c01e3a6ca015e21d21cb4
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: K-286, mapa diário do Apontamento recortado pela Equipe (097, E3.3)

Revalidação da volta 1 (62a622ab), que atende à revisão de UX. O parecer anterior aprovou dfba8a37 (diff completo, mutação M1 a M3 na biblioteca, e2e e acessibilidade). A suíte inteira é do CI do PR (check-run `bateria` do mesmo sha); aqui só os testes tocados, sem banco.

## Delta

`forge-check parecer delta` do parecer anterior, `dfba8a37..62a622ab`: no domínio do QA entram 5 arquivos, todos em `web/src/features/apontamento/`: `ApontamentoPage.tsx`, `components/CartaoDiario.tsx`, `dados.tsx`, `mapa-diario-equipe.test.tsx` (novo) e `textos.ts`. Biblioteca e servidor não mudaram. O delta não muda o veredito: aprovado. O A1 do parecer anterior segue como recomendado, porque a biblioteca não mudou.

## Critério → teste → resultado (delta)

| Critério (revisão de UX) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1: "Como ler" não diz que o cartão ignora os filtros; cita a Equipe e o dia inteiro | `mapa-diario-equipe.test.tsx` "A1" | n/a | passou |
| A2: equipe sem ninguém na janela mostra vazio próprio e o botão Remover filtro Equipe limpa a URL e devolve o mapa | "A2: equipe sem ninguém..." | vazio (linhas = 0), botão por nome acessível | passou |
| A2: sem Equipe, nenhum vazio da equipe | "A2: sem filtro de equipe..." | filtro ausente | passou |
| A3: com Equipe, a dica do atípico diz que o dia é avaliado inteiro | "A3: com a Equipe ativa..." | n/a | passou |
| A3: sem Equipe, a dica não traz a frase | "A3: sem Equipe..." | filtro ausente | passou |
| A4: nome da grade cita a equipe (nunca pessoa) | "A4: o nome da grade..." | nome acessível | passou |
| A4: sem Equipe, o nome da grade não cita equipe | "A4: sem Equipe..." | filtro ausente | passou |

## Execução

- `web`, `vitest run src/features/apontamento`: 12 arquivos, 182 passaram (175 do parecer anterior + os 7 testes novos conferidos acima).
- Árvore da worktree sem alteração minha depois das mutações (restaurada a cada uma).

## Mutação no texto do vazio (restaurada em seguida)

| Mutante | Resultado |
|---|---|
| M4: `CartaoDiario.tsx`, o botão Remover filtro Equipe deixa de renderizar (`equipes.length > 0 &&` vira `false &&`) | morreu: "A2: equipe sem ninguém..." caiu |
| M5: `CartaoDiario.tsx`, o texto do vazio com Equipe vira "Nenhum apontamento nesta janela. Troque..." | morreu: "A2: equipe sem ninguém..." caiu (1 falhou, 6 passaram) |

Vermelho antes do verde: os testes novos são de regra e M4 e M5 provam que falham sem a implementação.

## Achados

- A1 (recomendado) packages/metricas/src/businessmap/apontamento/apontamento.test.ts:350 · M3 do parecer anterior segue sobrevivente: nenhum teste afirma, via `calcularApontamento` ou rota, que o atípico do mapa não muda com a Equipe. Código correto (index.ts:58,72); falta a guarda.
