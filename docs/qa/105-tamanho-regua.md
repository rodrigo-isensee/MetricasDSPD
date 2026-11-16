---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-tamanho-regua
commit: 62254d39142a86cb56d89ec38615643fd8d623eb
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---

# QA: O8 por tamanho pela régua de seis faixas de cada time (E7.132)

parecer: aprovado, sem bloqueante. Testado em 0ccb21ef (o head posterior d295045c só soma `docs/security/105-tamanho-regua.md`). Dois recomendados.

## Diff contra a obrigação
Obrigações: as decisões do dono de 16/11 (CA-1 a CA-8 abaixo). O diff (23 arquivos de 2c56d33b a 0ccb21ef) não saiu delas: allow-list, arquivo de domínio, normalizador, projetor, biblioteca do O8, contrato e tela. Nenhuma métrica com cálculo próprio (o O8 segue na biblioteca); BusinessMap e Acelerato não se misturam.

## Critério -> teste -> resultado
| CA | Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|---|
| CA-1 | tamanho vem do `size` nativo pela régua do time (63 linhas `time_id:size`) | `normalizador-businessmap.test.ts` (tamanhoPelaRegua), `dominio-businessmap.test.ts` (arquivo versionado, 63 linhas, uma faixa por chave) | meio ponto (`26:0.5`), `1.50` = `1.5` | passa |
| CA-2 | sem size, size fora da régua ou time sem régua = nulo contado, nunca M | normalizador (notas `size_sem_valor`, `size_fora_da_regua`, `time_sem_regua`) | vazio, valor logo fora da régua, time sem régua | passa; mutantes M1, M1b, M5 morrem |
| CA-3 | seis faixas sempre, mesma ordem; faixa sem entrega com n 0 e mediana nula (nunca 0) | `o8.test.ts` (seis faixas) | faixa vazia | passa; M2, M6 morrem |
| CA-4 | abaixo de 20 não publica; 20 publica | `o8.test.ts` (fronteira 19/20) | 19 e 20 | passa; M3 morre |
| CA-5 | um valor em uma faixa só (chave em duas faixas sai) | `dominio-businessmap.test.ts` (leitura desconfia do banco) | chave duplicada | passa; M4 morre |
| CA-6 | demais times "sem tamanho registrado"; régua só de times da referência | `dominio-businessmap.test.ts` (reguaSoDeTimesDaReferencia) | time desconhecido | passa; M5b morre |
| CA-7 | histórico e critério: `105:tamanho-pela-regua-do-time` afeta O8; `tamanho_declarado` fora das colunas de campo customizado (allow-list) | `dominio-businessmap.test.ts`, `o8-motivo-por-tamanho.test.ts`, projetor | allow-list mais restrita | passa |
| CA-8 | tela: seis faixas, "sem entregas neste tamanho", insuficiente abaixo de 20, nota da régua, sem comparar times | `ramos.test.tsx` (duas provas E7.128) | faixa ausente, "Sem tamanho" por último | passa |

Régua conferida contra o plano 2a (7 times, 63 linhas, cortes por sexto, um valor em uma faixa só): confere (26: P, P, P, GG, XG...; 38, 42, 6, 5, 18, 14 idem).

## Execução (local, só os meus cenários; a suíte inteira é do CI)
- `packages/metricas` o8.test.ts + complementares.test.ts: 34 passam.
- `server` dominio-businessmap.test.ts + normalizador-businessmap.test.ts: 169 passam.
- `web` ramos.test.tsx: 33 passam. `packages/contratos` o8-motivo-por-tamanho.test.ts: 8 passam.
- CI: o run de 0ccb21ef (push 43849454516 e PR 43849850199) foi cancelado pelo push do parecer de segurança (d295045c); nenhum check-run `bateria` verde do mesmo sha existe, então não afirmo CI verde. O run de d295045c (43851115412) estava na fila ao fechar; a suíte inteira fica para o CI do PR. O job `banco` do 0ccb21ef não rodou aqui; o teste pg do domínio (`dominio-businessmap.pg.test.ts`) foi atualizado no diff, e o bug 105-001 (arquivo untracked de outra branch) não é deste pedido.

## Vermelho antes do verde
`forge-testes --vermelho` recusou (árvore com arquivo não rastreado de outro agente). Feito à mão: voltei à base 2c56d33b os 7 arquivos de código (o8.ts, modelo.ts, allow-list.ts, dominio-businessmap.ts, normalizador.ts, projetor.ts, fluxo.tsx) mantendo os testes do head, e restaurei depois:
- o8.test.ts: 5 falham (seis faixas, fronteira 19/20, sem tamanho, consolidado);
- server: 38 falham (régua, arquivo versionado);
- ramos.test.tsx: 2 falham (as duas provas E7.128).
Os testes novos caem sem a implementação e passam com ela.

## Mutação no código alterado (à mão, árvore restaurada em seguida)
| Mutante | Onde | Testes | Resultado |
|---|---|---|---|
| M1 size fora da régua vira M | normalizador `faixa ?? 'M'` | 14 falham | morto |
| M1b size ausente vira M | normalizador | 1 falha | morto |
| M2 faixa vazia como 0 | o8.ts `n === 0 ? 0` | 2 falham | morto |
| M3 publicar com 19 | o8.ts `publicavel(n + 1)` | 1 falha | morto |
| M4 valor em duas faixas (último ganha) | `reguaDeLinhas` | 1 falha | morto |
| M5 time sem régua entra (sem a guarda) | normalizador | 1 falha | morto |
| M5b régua de time fora da referência | projetor `reguaSoDeTimesDaReferencia` | 1 falha | morto |
| M6 "Sem tamanho" com n 0 | o8.ts filtro | 3 falham | morto |
| M7 workflow `fora` usa time_id | normalizador (`situacao === 'time'`) | 0 falham | sobrevive, equivalente nos dados atuais: workflow `fora` tem `time_id` nulo; é defesa em profundidade |

## Achados
- A1 (recomendado) server/tests/normalizador-businessmap.test.ts:1 · M7 sobrevive: falta teste de workflow `situacao: 'fora'` com `time_id` preenchido não receber tamanho (hoje só a invariante de dados protege).
- A2 (recomendado) docs/contratos/metricas/O8.md:1 · os exemplos de `porTamanho` mostram só duas faixas (PP e P), mas a regra diz seis faixas sempre; exemplo induz erro de leitura do contrato.

## Acessibilidade e teclado
Lista de texto semântica (`section` com `aria-label` por tipo, `ul/li`), sem controle novo, sem cor como único canal (cada faixa tem rótulo e texto). Sem violação nova esperada; o teste de acessibilidade automático roda no CI.

## Revalidação (volta 1, cabeça 62254d39)
parecer: aprovado. Delta de 0ccb21ef a 62254d39 lido por `forge-check parecer delta` (código, testes, contrato O8, CHANGELOG e docs de arquitetura).

- A1 (M7) resolvido: o teste novo de workflow `fora` com `time_id` preenchido (normalizador-businessmap.test.ts) mata o mutante M7 (`time?.time_id ?? null` em normalizador.ts:341): 1 falha, morto.
- A2 resolvido: nota em docs/contratos/metricas/O8.md diz que o exemplo é truncado e que a resposta traz sempre as seis faixas, "Sem tamanho" por último, faixa vazia com n 0 e mediana nula.
- Delta novo: `size` 0 vira `size_sem_valor` (teste com 0 e '0'); contagem `reguaLinhasDescartadas` no relatório do bm:projetar (teste: 2 descartadas, 0 sem régua); textos R-1 a R-3 (nota sem tamanho na régua, nota da régua explica "Sem tamanho", legenda só traz "Sem tamanho" com n > 0). Contagem fora do ref-sync, sem comparar times.
- Vermelho (à mão, código do delta voltado a 0ccb21ef, testes do head): normalizador 1 falha (size 0), projetor 1 falha (contagem), ramos.test.tsx 3 falham (R-1, R-3 e E7.128). Com o código do head tudo passa.
- Execução local (só os meus cenários): server normalizador+projetor+dominio 193 passam; web ramos.test.tsx 34 passam.
- CI: o run do head 62254d39 (43854476343) estava na fila ao fechar; sem check-run `bateria` do mesmo sha, não afirmo CI verde. A suíte inteira fica para o CI do PR.

## Achados da revalidação
- A3 (recomendado) CHANGELOG.md:8 · texto desatualizado: diz que o `bm:ref-sync` informa `reguaTimesDesconhecidos`, mas o código conta no relatório do `bm:projetar` como `reguaLinhasDescartadas`. Corrigir o nome e o comando.
