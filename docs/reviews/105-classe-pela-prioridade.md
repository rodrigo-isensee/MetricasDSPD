---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-classe-pela-prioridade
commit: 8ec2598ede86bccdf3de8fbf8538fe2f8aa1d0a1
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: classe pela prioridade nativa do BusinessMap (E7.100, E7.161; review E7.173)

## O que foi conferido
- Diff `2c56d33b...8ec2598e`: 2 commits (back-end `44e8d62d`, tela `8ec2598e`), 74 arquivos, 1680 linhas de código e teste fora de `docs/` e `.md` (orientação M14: 150). Um comportamento (troca do eixo de separação), mas o volume pede `teto: excedido, <n> linhas, <motivo>` no corpo do PR quando ele for aberto.
- **Eixo.** `NIVEIS_PRIORIDADE_BM` (`packages/contratos/src/comum.ts:88`) com nome próprio, separado de `PRIORIDADES` P1 a P5 do Acelerato: as fontes não se misturam. `schemas.ts:51` troca o domínio de `classe` num ponto só; `semPrioridade: { n }` entra em T1, T2, T4, O6 e T6 (`schemas.ts`) e no O24 (`tambem.ts`).
- **Sem prioridade nunca é Média.** `semPrioridadeDe` (`businessmap/comum.ts:104`) filtra `prioridade === null`; cada métrica conta à parte e não soma a nível nenhum (`prioridade.test.ts`: base 78 com 7 nulos fora). `mapa.ts:23` (`nivelDePrioridade`) faz valor fora dos quatro níveis virar nulo; `normalizador.ts:335` grava `severidade ?? null` sem mapa; `allow-list.ts:73` tira `severidade` das colunas de lista (uma fonte só, o `priority` nativo). Testes em `metricas.mapa.test.ts` e `normalizador-businessmap.test.ts`.
- **Menos de 20 por nível sem somar.** Cada nível chama `estatistica`/`amostraBM` com o próprio `n`; fronteira 19/20 testada em T1, T4, O6 e T6 por nível.
- **T4 nunca agregado.** `classes` só traz os quatro níveis; `semPrioridade` fica fora de `classes`; teste afirma as chaves do resultado.
- **O24 na fila da Média** (`o24.ts:45`, `:104`); `tambem.ts` do mock acompanha.
- **T2:** `sle` do mock passa para Crítica, Alta e Média (Baixa sem SLE); na base real o SLE por nível não existe e o cartão diz "SLE ainda não definido para esta prioridade" (`CartaoT2.tsx:73`), com a observação nas notas (`tatico/notas.ts:22`).
- **Mapa real.** T1, T2, T4 e T6 entram em `METRICAS_ORIGEM_REAL` (`origem.ts:35-38`) com a decisão P-7 citada.
- **Versão de critério.** `105:classe-pela-prioridade` substitui `105:classe-por-etiqueta` (nunca gravada) em `criterios-classe-servico.ts:13`, com descrição, motivo e as seis métricas; a vigência é a do dia em que o eixo vai ao ar (entrada recebe a data). Atende T2.6.
- **Pessoa:** nada de pessoa no diff; nenhuma coluna nova lida pela API.
- **Contrato e fotografias:** `docs/api/openapi.json` e `docs/contratos/metricas/*.md` atualizados; job `openapi` verde.
- **Tela.** `SemPrioridade.tsx` em T1, T2, T4, T6, O6 e O24, sempre visível; rótulos "Prioridade"; aba padrão `media`.
- Sonda S1 rodada num teste temporário em `packages/metricas` (apagado depois; árvore limpa).

## Suíte (CI do head, citado e não rerrodado)
Run `43860935030` (push, `8ec2598e`): **vermelho**. `build`, `testes` e `banco` em failure; `e2e` e `perf` pulados; `imagem`, `openapi`, `seguranca`, `filtro` e `rapida` verdes. O run `43847928581` do `44e8d62d` também vermelho.
- `build`: "GATE DO AUTOR: REPROVADO (hash da base mock (vs fase A))", "difere em hashBase, hashBusinessMap (antes: b6a3c384, 8d47d431; agora: ef67b23e, 1f3e6fd7)".
- `testes`: "packages/mock cobertura: ERROR: Coverage for branches (99.86%) does not meet global threshold (100%)".
- `banco`: `painel-real-f6.pg.test.ts` caso (d), "T1: expected { base: { n: 35, … } } to match object { estado: 'sem-dado-real', … }".

## Achados
- A1 (bloqueante) server/tests/painel-real-f6.pg.test.ts:112 · caso (d) ainda espera T1 "sem dado real", mas o T1 entrou no mapa real (origem.ts:35); job `banco` vermelho. Tirar o T1 da lista e afirmar o T1 real com `semPrioridade`.
- A2 (bloqueante) docs/qa/evidencias/hash-base-fase-a.json:5 · mock mudou e o hash não foi regravado; job `build` vermelho, e2e e perf pulados. Regravar (`hash-base --salvar`) e anotar o motivo. Recorrente: A1 de `105-s11.md`.
- A3 (bloqueante) packages/mock/src/businessmap/catalogos.ts:144 · cobertura de ramos do mock em 99,86% (limite 100%) com ramo novo desta entrega sem caso; testar cada ramo de `prioridadePorClasse` e o bug com severidade (`gerador.ts:413`).
- A4 (bloqueante) packages/metricas/src/businessmap/t4.ts:35 · `nDe` soma chegadas e entregas: cartão sem prioridade entregue conta 2, e a tela diz "N cartões" (`SemPrioridade.tsx:13`); S1. Contar cartões distintos ou dizer a unidade; teste com entregue.
- A5 (recomendado) web/src/components/ui/SemPrioridade.tsx:10 · faixa dá só o número absoluto, sem a parte do total nem o porquê; com 34% a 47% de nulos o leitor não vê que é grande. Sugestão: "N de M (x%) sem prioridade no BusinessMap", texto com o UX.

### Detalhe dos achados
- A1: o `painel-real-f6.test.ts` (sem banco) já foi ajustado; o gêmeo `.pg` ficou com a lista `['T1', 'T7', 'E1', 'E2', 'VISAO_GERAL', 'O26']`.
- A2: CI dá "antes: b6a3c384, 8d47d431; agora: ef67b23e, 1f3e6fd7"; registrar em `hash-base-fase-a.nota.md` (prioridade por card e SLE por nível no mock).
- A3: ramos de `prioridadePorClasse`: Urgente com Melhoria (nulo) e outro tipo (Crítica), Prioritário com Dívida técnica (Baixa) e outro (Alta), Prazo fixo, padrão.
- A4: o teste de `prioridade.test.ts:93` só usa chegadas e não pega o dobro.
- A5: no dado real (consulta do assistente, `resultado-prioridade-nula-ACHADOS.md`) a prioridade nula é 47% dos criados e 34% dos entregues de novembro, concentrada nos quadros 31, 79 e 25 e no tipo Enabler. A faixa deveria dizer a proporção e o motivo (campo de prioridade vazio no cartão no BusinessMap) e usar o rótulo "(BusinessMap)" que o plano pede. Recorte por quadro fica fora (comparação entre times).

## Sondas
- S1 · `calcularT4` com 7 stories sem prioridade, criadas e entregues na janela (fábrica `entregues(7, null)` de `prioridade.test.ts`) · espera: semPrioridade.n = 7 (cartões) · obtido: "expected 14 to be 7"

## Riscos e pendências fora do review
- Tamanho: 1680 linhas fora de `.md`; quando o PR abrir, o corpo precisa de `teto: excedido`.
- `docs/engineering/achados-recorrentes.md` não existe neste repositório; a recorrência do A2 fica registrada aqui (o brief limita o commit ao parecer).
- `classe_servico` segue na `DimCard` como coluna legada sem leitor no painel (`modelo.ts:24`); remoção é trabalho próprio.
