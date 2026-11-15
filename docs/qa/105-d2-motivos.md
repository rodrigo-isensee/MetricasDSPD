---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/099-d2-motivos-sust
commit: 03ad3399be37e984bcd5f6abab0663485907f06a
parecer: aprovado
resultado: aprovado, com 2 recomendações (S3 sem a nota de Não igual a vazio; revisão de UX da linha foraDoFluxo)
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: D2, S5, S6 e S7 com dado real (pedido 105, E6.4)

Testado até 03ad3399 (a ponta de CI verde: depois do aebccf9b entraram cobertura do server, paridade do acelerato-l9c pg e as páginas e fotografias dos contratos). Diff conferido contra `origin/feature/099-d1b-dominios` (40 arquivos). Decisões do dono: P1 = B (cinco fluxos do PROC), P2 = A (de-para só dos pares óbvios), P3 = A (faixa Outro separada de Não informado).

## Achados

- A1 (recomendado) server/src/modulos/metricas/servico.ts:348 · O S3 passou a publicar `ajustesManuais` (só "Sim" conta) e não leva a nota de Não igual a vazio; o S7 leva. Mesma ambiguidade do mesmo campo: por consistência, o S3 deve ter a nota (publicação, sem recálculo).
- A2 (recomendado) web/src/features/sustentacao/components/comuns.tsx:19 · A linha NotaForaDoFluxo é elemento novo na tela do S5, S6 e S7 (texto e ícone), sem passada do ux-designer: pede revisão de UX (texto, posição, leitor de tela).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| P1 = B: só os cinco fluxos do PROC entram; os de fora são contados | d2-motivos.test.ts (S5, S6, S7); mutante M1 | fluxo nulo, de outro fluxo, lista ausente (mock: tudo entra) | passou |
| P2 = A: de-para só caixa e vírgula | d2-motivos.test.ts (de-para); mutante M2 | Solução Definitiva Validada, Encerrado com Contorno e Plano de Ação e Não é Problema ficam Outro; vazio e só espaços = null | passou |
| P3 = A: Outro separado de Não informado | d2-motivos.test.ts (S5, S6); mutante M3 | Outro nunca soma a naoInformado; soma dos faixas + naoInformado = n | passou |
| Abaixo de 20 não publica | d2-motivos.test.ts (S5 n = 10, S6 taxa) | n = 10 e n = 24/25 | passou |
| Risco de estouro de SLA sai com n = 0 e nota s5-risco-sla-sem-fonte | d2-motivos.test.ts; painel-real-f6.test.ts | faixa zerada, fim da lista | passou |
| Notas s5-risco-sla-sem-fonte e s7-nao-igual-vazio, notaExcecaoSla desacoplada | painel-real-f6.test.ts, qa-f6-painel.test.ts | com e sem amostra | passou |
| Sem lista fluxo_proc na base real: sem dado real com motivo | painel-real-f6.test.ts (servico.ts:292) | lista ausente | passou |
| Duas versões de critério e AJUSTE_PRIORIDADE_COM_FONTE = true | origem.test.ts (contratos), servico | S3 publica ajustes | passou |
| foraDoFluxo no contrato e na tela | contratos 225 testes; sustentacao.test.tsx | zero some a linha | passou |
| Banco: lerFluxosProc, fluxo em dim_chamado | acelerato-l9c.pg, qa-sust-real.pg (CI `banco`) | lista vazia | passou (CI) |

## Provas de execução
- CI do sha 03ad3399: run 43728259776 `CI` success; check-runs banco, build, openapi, rapida, imagem, filtro, seguranca, testes = success; e2e, e2e-parte, perf = skipped.
- Local (meus cenários): metricas/acelerato 35 de 35; contratos 225 de 225; server painel-real-f6 e qa-f6-painel 52 de 52; web sustentacao e coleta 91 de 91.
- Vermelho antes do verde: `forge-testes --vermelho` não rodou (hook barrou o comando; a ferramenta é do repositório do Forge). Substituto: os três mutantes abaixo removem a implementação nova e o teste novo cai em cada um (equivale a rodar sem a implementação).
- Mutação no diff (feita à mão, um mutante por vez, árvore revertida a cada um, 35 testes de `src/acelerato`):
  - M1 tirar o filtro de fluxo do PROC (`separarPorFluxoProc`, `dentro = [...xs]`): morreu, 3 falhas (S5, S6, S7).
  - M2 mapear Solução Definitiva Validada para Resolução definitiva (`motivos.ts`): morreu, 2 falhas (de-para e S6).
  - M3 somar Outro a naoInformado (`s5.ts`): morreu, 1 falha (S5).
  - Sobreviventes: nenhum.

## As três escolhas do autor
1. `fluxo_proc` dentro do JSON do domínio: aceito. `CAMPOS_DOMINIO` ganhou `fluxo_proc`, a regra do arquivo descreve o campo, `lerFluxosProc` lê só o vigente, e sem a lista o serviço devolve sem dado real com `MOTIVO_FLUXOS_PROC_NAO_CARREGADOS`, sem presumir. Exige que o dono rode o `ac:ref-sync` antes do painel mostrar dado: o motivo já diz isso.
2. Nota `excecao-sla-sem-fonte` desacoplada do interruptor: aceito. A exceção de SLA segue sem fonte, e ligar o ajuste de prioridade não pode apagar essa ressalva do S2 e da tendência (servico.ts, `comNotaExcecaoSlaSemFonte`).
3. S3 sem a nota de Não igual a vazio: deveria ter, por consistência com o S7 (A1, recomendado, não bloqueia: o dado do S3 não está errado, só falta a ressalva).

## Regras invioláveis
- Biblioteca compartilhada: S5, S6 e S7 em `packages/metricas`, usando `baseAmostral`, `taxa` e `pctOuNulo`; o servidor só publica notas. Sem cálculo próprio.
- Abaixo de 20 não publica: pct e taxa nulos com n menor que 20 (testado).
- Sem pessoa: nenhuma coluna nova de pessoa; `fluxo` e motivos são domínios fechados, sem título, descrição ou usuário.
- Acelerato sem BusinessMap: nenhum import ou dado do BusinessMap nos três cálculos; `lerFluxosProc` lê o esquema `ac`.
- Mudança de critério: duas versões com data 2026-11-15 em `core/criterios.ts`, em `VERSOES_DA_BIBLIOTECA`.
- Nenhuma métrica proibida (7.1) ou visão individual.

## Observações
- `packages/metricas/src/acelerato/s6.ts:41`: o comentário "Fechados sem motivo de encerramento" ficou acima de `foraDoFluxo` em vez de `naoInformado` (cosmético, sem efeito; vale corrigir quando o arquivo for tocado de novo).
- A linha nova na tela pede revisão de UX (A2).

## Ressalvas do ambiente
- `forge-check docs` e o push seguem o procedimento do brief; resultado no relatório.
