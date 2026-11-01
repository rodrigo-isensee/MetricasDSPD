---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f4-projetor
commit: 783612d50dc4da48d04ab19eb4e91b6abc727a09
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-31
---
# Review: 052-integracao-businessmap (E2.59, F4 do plano 052, normalizador e projetor, T2.4, K-182)

**Veredito: reprovado** em `783612d`, por dois bloqueantes:
- A1: o nível (granularidade) depende de haver time no workflow. Com a carga real de times (`0019`), todo card de frente (workflow de iniciativa) e de projeto (quadro 35) perde o nível e some da leitura da API. Isso contraria a H-1.
- A2: o PR carrega três comportamentos (projeção da F4, A3 e A6 do review da F3). A decisão M14 pede um por PR.

O resto confere com a seção F4 do plano: marcos só pela biblioteca, idempotência, reconstrução (DT-1), grants e I-2. Os recomendados A3 a A7 não devolvem. A3 e A4 precisam de destino antes da F6.

## Escopo e o que foi lido

Delta `dd15c93..783612d`, 3 commits (`369d018`, `50b8b51` e `783612d`): 23 arquivos, 1836 linhas a mais e 20 a menos. Li o delta inteiro e a seção "F4. Normalizador e projetor (T2.4)" do plano (linhas 172 a 178), mais as decisões H-1, H-23 e §10. Para conferir contra o que já existe, li também:
- `0005_bm_historico.ts`: chaves únicas e append-only de `evt_card`, `fato_transicao` e `dim_card_versao`;
- `0006_bm_projecoes.ts`: `dim_card`;
- `0018` e `0019`: `ref_time_workflow` e a carga inicial de times;
- `responsaveis.ts` (`COLUNAS_VERSAO`), `descartado.ts`;
- `metricas/repositorio.ts` e `mapa.ts`: como a API lê `dim_card` e `fato_transicao`;
- `contratos/src/comum.ts` (`TIPOS_CARD`).

Execuções (prioridade baixa, uma suíte por vez):
- `vitest run` em 7 arquivos do server tocados pelo delta (normalizador, projetor sem PG, times, transições, coleta, comando, config): 96 testes, todos passaram;
- `marcos.test.ts` da biblioteca: 10 testes, todos passaram;
- `pnpm run docs:check`: ok (825 páginas, 69 métricas, 2 eventos).

O `pronto` (rc=0, cobertura 100%) e o `test:pg` (22 arquivos, 146 testes) ficam com o relatório do autor e com o QA (E2.61). Cito e não refaço. O `praticas.md` não tem regra "decidida por: `<comando>`", então não há saída de ferramenta a citar.

A segurança deu parecer em `9418d4c` e `88983e0` (`docs/security/052-f4-projetor.md`, aprovado, recomendados A1 e A2). Cito e não refaço: grants de `responsaveis`, a reconstrução, o guard de times e o `bm:projetar`. Não li o `.env` e não chamei o BusinessMap.

## Conferência contra o plano e as decisões

- **`derivarMarcos` e `direcaoDaTransicao` (T2.5).** Ficam em `packages/metricas/src/businessmap/marcos.ts`, são puras e ordenam com `ordenarNeutro`. O normalizador só chama a biblioteca e não deriva marco por conta própria. As regras conferem:
  - H-9: compromisso = primeira entrada na seção 2;
  - H-23: sem seção 2, a primeira entrada em `trabalho` ou `homologacao` da seção 3; entrega na 5 se pulou a 4, pelo papel `entrega`;
  - 4.1: início = primeira entrada em execução de `trabalho` ou `homologacao`;
  - H-10: entrega pelo papel `entrega`, nunca "Descartado";
  - H-11: descarte na primeira entrada em "Descartado".

  A direção só dá retorno dentro do mesmo workflow e com as duas ordens conhecidas, sem inferir. Os testes cobrem as bordas: card sem passo, reabertura, coluna sem referência e "Descartado" em seção de execução. Ver A7.
- **Idempotência.** Fato e evento entram com `ON CONFLICT ... DO NOTHING` pelas chaves únicas. Versão só entra se algum item de `COLUNAS_VERSAO` mudou, com `vigente_de` sempre depois da vigente. O `id_origem` `card:coluna:instante` fica estável quando a transição aberta fecha, e `transicoesDoStaging` fica com a linha mais nova por `coluna|instante`. Testes .pg em `:128` e `:145`.
- **Reconstrução (DT-1).** `TABELAS_LIMPAS_NA_RECONSTRUCAO = ['dim_card']`. `dim_responsavel` não aparece no projetor. O projetor não tem cliente HTTP, e a configuração dele não lê a chave (`config.ts`, teste em `config-businessmap.test.ts`). O teste .pg `:288` prova que a tabela fica igual e que há zero chamadas a `/users`. A diferença com o texto do plano, que fala em reconstruir também os fatos, está no A4.
- **I-2 e responsáveis.** O mapa em memória só existe com `--projetar`, nunca vai a banco nem a resultado (teste `coleta-businessmap.test.ts`) e é usado pelo `gravarResponsaveis` da F3. A ordem de precedência (coleta, depois `dim_card`, depois a versão) confere com `server.md`.
- **A3 do review da F3 (`coleta.ts:203`).** A transição inválida fica em `ctl_coleta_falha` e na contagem, sem tornar a coleta parcial. Os testes provam a marca d'água avançando em duas coletas seguidas. **CT-B do QA:** `369d018` é idêntico ao arquivo do QA em `/tmp/claude-1000/qa-052-f3/` (conferi com `diff`), e a mudança de `783612d` só troca a expectativa de `parcial` para `sucesso`, com a marca d'água e o `erro_resumo` nulo, coerente com o A3. O QA confirma na E2.61 que a intenção do caso dele segue coberta.
- **A6 do review da F3 (`coleta-comando.ts:74-77`, `coleta.ts:272`).** Na retomada, a referência recebe o `inicioCarga` da carga retomada. Está certo.
- **Suposições do autor:**
  - fuso UTC para data sem fuso: aceita como suposição registrada num lugar só, para o roteiro dos 20 cards confirmar; ver A5;
  - dia antes da primeira vigência usa a primeira: aceita. Bate com a vigência de partida da `0019` (início da carga, válida para todo o período) e fica contada em `nota_referencia_anterior`;
  - `arquivado_em` guarda o descarte: aceita. É o que `descartado.ts` lê (motivo mais `arquivado_em`, único leitor). O `archived_at` nativo segue no `evt_card` `arquivado`;
  - `dim_card.tipo` com o código da H-17: não aceita como está, ver A3;
  - guard de times aberto ao projetor: aceito. O projetor só resolve o nome do time do workflow no dia do evento, a API segue sem `ref_time`, e há teste novo. O limite do guard está no A2 da segurança.
- **Documentação.** `data-model.md` (projeção do BusinessMap) e `server.md` (`bm:projetar`, `--projetar`, A3, A6) descrevem o que o código faz. Falta alinhar o plano F4 (A4).
- **Regras invioláveis.** Só `dspd_bm`, sem cruzar com o Acelerato. Nenhuma métrica, agrupamento ou ordenação por pessoa ou por time. Staging intocado. Fatos e versões só com INSERT (teste .pg `:251`).

**Teto (decisão M14).** `git diff --numstat --no-renames dd15c93...783612d`, sem `.md`: **1844 linhas** de código e teste (1824 a mais e 20 a menos). Para a projeção da F4, aceito a exceção, como foi na F3: biblioteca, normalizador, projetor, comando e testes .pg formam um comportamento só. O PR da E2.62 leva `teto: excedido, <n> linhas, F4 do plano 052: normalizador e projetor do staging para fatos e dimensões, com marcos pela biblioteca`. O que não cabe na exceção são os comportamentos a mais (A2).

## Achados

- A1 (bloqueante) server/src/modulos/businessmap/normalizador.ts:174 · granularidade só sai com equipe; a 0019 não dá time a workflow de iniciativa nem do quadro 35, e frente e projeto ficam nulos (H-1). Exija equipe só no nível story, mantenha fora quem é `fora`; teste com workflow sem time.
- A2 (bloqueante) server/src/modulos/businessmap/coleta.ts:203 · o PR leva três comportamentos: projeção da F4, A3 (transição inválida não torna parcial, com o CT-B) e A6 (coleta-comando.ts:77). A M14 pede um por PR: separe A3 e A6 num PR a partir da develop, ou o Jarvis leva a exceção ao dono.
- A3 (recomendado) server/src/modulos/businessmap/normalizador.ts:196 · dim_card.tipo recebe código (bug_interno, produto), mas mapa.ts:40 converte para TipoCard (rótulos, como no seed), e produto não tem rótulo. Com dado real, O7, O13 e o filtro por tipo vêm vazios. Arquiteto decide antes da F6.
- A4 (recomendado) server/src/modulos/businessmap/projetor.ts:151 · fato_transicao.tipo_coluna fica congelado (DO NOTHING, append-only, reconstruir só limpa dim_card) e a API o lê (repositorio.ts:64): correção U-1 em ref_coluna não chega ao WIP nem ao CFD. Arquiteto: plano F4 (DT-1) e F6.
- A5 (recomendado) server/src/modulos/businessmap/normalizador.ts:24 · o `Z` explícito também vira FUSO_PADRAO_BM. Se a leitura real trocar a constante para -03:00, as datas com `Z` se deslocam junto. Faça o `Z` valer sempre +00:00 e use a constante só sem fuso, com teste.
- A6 (recomendado) server/src/modulos/businessmap/normalizador.ts:162 · a categoria do tipo usa a referência do dia da criação, enquanto nível e equipe usam o dia do evento medido (U-2). Use o mesmo dia do evento, ou registre o motivo no data-model.
- A7 (recomendado) packages/metricas/src/businessmap/marcos.ts:50 · um card que foi da seção 3 para a seção 2 depois fica com o compromisso posterior ao início (teste marcos.test.ts:69). A H-23 não cobre esse caso, e ele foi resolvido por inferência: vira pergunta ao dono pelo Jarvis.

## Destino sugerido (decisão técnica do Jarvis)

- A1 e A2: volta ao node-backend. Para o A2, o tech-lead abre a branch do PR separado, se o Jarvis escolher separar.
- A3 e A4: software-architect, antes da F6, porque a F6 é quem lê `dim_card.tipo` e `fato_transicao.tipo_coluna` com dado real.
- A5 e A6: podem entrar na volta do A1, porque tocam o mesmo arquivo.
- A7: pergunta ao dono. O roteiro dos 20 cards (E2.57) pode mostrar se o caso existe no quadro real.
