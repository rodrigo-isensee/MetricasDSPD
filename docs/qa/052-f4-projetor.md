---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f4-projetor
commit: 4f54b8a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-31
---
# QA: F4 do coletor do BusinessMap, normalizador e projetor (pedido 052, E2.61, K-182)

Links: plano `docs/architecture/features/052-integracao-businessmap.md` (F4), review `docs/reviews/052-f4-projetor.md` (código aprovado em e1e5f86; reprovado só pelo A2, forma do PR), segurança `docs/security/052-f4-projetor.md` (aprovado em d681a80), roteiro `docs/qa/052-f4-roteiro-20-cards.md`.

**Parecer: aprovado**, sem bug aberto, sobre o commit `4f54b8a` (e1e5f86 mais o arquivo de teste do QA; o código de produção é o de `7a1907a`, e os commits entre os dois só somam pareceres). A projeção, a idempotência, a reconstrução, os marcos pela biblioteca, a granularidade, as datas e os papéis passaram contra PostgreSQL real. O A2 do review (um comportamento por PR) é decisão do dono e não muda código; o A7 (card que volta da seção 3 para a 2) é pergunta ao dono: **depende da resposta**, não o trato como bug nem como aprovado.

## Escopo e método
Tarefa de dados, sem UX nem contrato de API. As obrigações são o "Pronto" da F4 do plano, as decisões H-1, H-2, H-7, H-9, H-10, H-11, H-23, U-1 e U-2 e a ADR 0020. Caixa-preta: staging gravado pelos gravadores da F3 (a allow-list vale), banco real do Compose com schemas de teste (removidos no teardown), papéis reais `dspd_coletor`, `dspd_api` e o dono. Nenhuma chamada ao BusinessMap real; o `.env` não foi aberto nem impresso (só carregado pelo script de teste do repositório).

Testes do QA: `server/tests/projetor-businessmap-qa.pg.test.ts` (6 testes, arquivo novo, quadro próprio 9301; não reaproveita o arquivo do autor, `projetor-businessmap.pg.test.ts`, com 16 testes que rodei como estão). O que o autor já provava (idempotência, SCD2, H-1, H-2, H-7, H-11 e H-23 no banco, DT-1, grants de `responsaveis`) não foi repetido; o QA cobre o que faltava.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Projeção idempotente: rodar duas vezes não duplica nem altera fato, evento nem versão | autor, `idempotência`; QA-5 (depois de duas reconstruções) | passou | segunda rodada igual |
| Reconstrução preserva `dim_responsavel`, sem chamar `/users` | autor, DT-1 | passou | tabela limpa só `dim_card` |
| Reconstruir duas vezes deixa marcos, nível e equipe iguais e não cria fato, evento nem versão | QA-5 | passou | repetição da reconstrução |
| Marcos pela biblioteca (H-9, H-10), primeira entrada, mesmo com a gravação fora da ordem do tempo e a cadeia origem a destino em ordem cronológica | autor, H-9 e H-10; QA-2 | passou | transição gravada de trás para a frente; reentrada |
| H-11: Descartado, mesmo na seção 4 e com papel de entrega, não entrega e grava o descarte | autor, H-11; QA-3 (coluna com papel `entrega` e `eh_descarte`) | passou | coluna de seção 4 com papel de entrega |
| H-23: pulou a seção 2 ou 4 | autor, H-23 | passou | seção ausente |
| Granularidade pela H-1: frente e projeto sem time, story com time, workflow fora (H-7) | autor, A1 do review, H-1 e U-2, H-7 | passou | story sem time fica fora; frente sem time entra |
| U-2: tipo, nível e equipe do dia do evento | autor, U-2 e A6 | passou | mudança de workflow antes da entrega |
| Datas com `Z`, com `+00:00`, com `-03:00` e sem fuso (forma com espaço) gravam o mesmo instante | QA-1 | passou | `Z` explícito contra a constante do fuso padrão |
| Papéis: `dspd_api` não lê responsáveis de `dim_card` e `dim_card_versao` | autor, grants | passou | permissão por coluna |
| Papéis: `dspd_api` não lê `stg_card`, `stg_revision` nem `dim_responsavel` e não escreve na projeção | QA-6 | passou | 42501 em cada acesso |
| Abuso (ADR 0020): descrição, comentário de descarte, e-mail, nome e ids de pessoa do card e da transição não chegam a nenhuma tabela do BusinessMap | QA-4 | passou | marcador em 8 campos de pessoa e texto livre, varrendo todas as tabelas base do schema |
| Coletor só insere nos fatos e versões | autor, UPDATE e DELETE negados | passou | append-only |
| Nenhum acesso ao BusinessMap real | servidor falso sem pedidos (DT-1); QA sem cliente HTTP | passou | zero chamadas |

## Resultado real
- Suíte `.pg` do server, pela raiz (`pnpm run test:pg`, `nice -n 19`, única suíte rodando, PostgreSQL 17 do Compose): antes do arquivo novo, 22 arquivos e 147 de 147; com ele, **23 arquivos e 153 de 153**, rc=0.
- Suíte unitária do server (`vitest run --project unit`): 52 arquivos e 1038 testes passaram. `tsc --noEmit` do server e `eslint` do arquivo novo: sem saída. O `pronto` completo não foi repetido: o delta é teste e documento do QA; o do autor segue como registrado na E2.63 (rc=0).
- Vermelho antes do verde: o arquivo novo contra a base `dd15c93` (cópia descartável sem `projetor.ts`, que a base não tem) não carrega, `tests/projetor-businessmap-qa.pg.test.ts` falha com "Test Files 1 failed, no tests". É vermelho por ausência, como na F3: a F4 inteira é nova. No HEAD, os 6 testes passam. O `forge-testes` não se aplica (projeto, não o Forge); vale a forma da stack, em cópia, sem tocar a árvore do autor.
- Mutação no código do diff, manual, em cópia descartável fora do repositório (`praticas.md` não define ferramenta; 6 mutantes, cada um revertido): todos morreram.

| Mutante | Arquivo | Morreu em |
|---|---|---|
| M1 `Z` explícito lido como `-03:00` | normalizador.ts | QA-1 |
| M2 transições sem ordenar pelo instante | normalizador.ts | QA-2 |
| M3 `description` na allow-list do card | allow-list.ts | QA-4 |
| M4 entrega aceita coluna de descarte (tira `!c.eh_descarte` de `concluido_em`) | marcos.ts | QA-3 |
| M5 fato de transição com `DO UPDATE` no lugar de `DO NOTHING` | projetor.ts | QA-1 a QA-5 (o banco nega o UPDATE ao coletor; mutante bruto, morre por erro) |
| M6 constante do fuso padrão em `-03:00` | normalizador.ts | QA-1 e QA-2 |

Sem sobrevivente. QA-6 (papéis) não tem mutante: o GRANT mudaria numa migração e a prova do papel já existe no autor (grants de `responsaveis`); registro como lacuna conhecida, sem achado.
- Roteiro dos 20 cards: as consultas SQL do documento rodaram contra o banco migrado (sem erro de coluna, tabela ou sintaxe, incluindo as duas novas: entrega pulada e casos reais da lista de conferência). Troquei `nome = 'Descartado'` por `eh_descarte`, `eh_subtarefa` por `granularidade IS NOT NULL` (Sprint e workflow fora ficam nulos) e a tabela de níveis para `story`, `frente` e `projeto`; corrigi a soma da amostra (20, não 16). O passo de sorteio fica marcado para depois da carga real do dono (E2.58). Sem nome de pessoa nem título em nenhuma consulta.
- Nenhum teste foi marcado como skip; não houve teste instável.

## Observações (não devolvem)
- **A7 do review** (card que vai da seção 3 para a 2 com compromisso depois do início): pergunta ao dono. Está no roteiro como armadilha da conferência; nenhum teste meu o fixa, para não decidir a regra por inferência.
- O título do card chega à API (A1 da segurança, L-2): decisão do dono; o roteiro nunca consulta `titulo`.
- A8 do review (comentário de `normalizador-businessmap.test.ts:11`): não toquei o arquivo; fica para a F5.
- O critério T2.4 (20 cards com os 4 marcos conferidos pelo dono) **não está cumprido**: depende da carga real e do sorteio, fora desta etapa. A F4 não se dá por pronta no plano antes dele.

## Achados
- A1 (recomendado) docs/qa/052-f4-roteiro-20-cards.md:29 · pergunta ao dono sem resposta: o critério T2.4 vale com entrada, compromisso, entrega e descarte, ou com início no lugar do descarte; e a tolerância de 1 minuto da seção 5 é proposta. O roteiro cobre os dois enquanto não houver resposta.
- A2 (recomendado) packages/metricas/src/businessmap/marcos.ts:50 · A7 do review aberto: o caso da volta da seção 3 para a 2 depende da resposta do dono; o QA não o trata como bug nem como aprovado.
- A3 (recomendado) server/tests/projetor-businessmap-qa.pg.test.ts:156 · o teste de papéis (QA-6) não tem mutante: abrir um GRANT ao `dspd_api` exige migração, e a prova do papel está só nos testes de grants do autor; revisar se a F6 mexer em GRANT.
