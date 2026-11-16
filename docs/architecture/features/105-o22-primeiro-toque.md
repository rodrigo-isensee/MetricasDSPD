---
tipo: plano-tecnico
contrato: 1
pedido: 105
estado: proposta
ux: docs/contratos/metricas/O22.md
adrs: [0014, 0020, 0022, 0026]
agentes: [node-backend, react-frontend, qa-engineer, tech-lead, security-engineer, ux-designer]
gatilhos_seguranca: [dados-pessoais, credencial-externa, banco]
---

# 105 · O22: coleta do primeiro toque com dado real (lote B6)

Etapa E7.144 (software-architect), pedido 105. Público: security-engineer (modelo de ameaças sobre este texto), tech-lead, node-backend, qa-engineer. Base: worktree `/home/rodrigoisensee/MetricasDSPD-059`, branch `docs/105-o22-adr` (sobre a `develop`). Fonte do desenho: plano do O22, versão 3 (`/home/rodrigoisensee/pedidos-assistente/plano-o22.md`, fora do repositório; leitura do spike B5b). Decisão de arquitetura e lista fechada: **ADR 0020, revisão 6** (proposta). Modelo físico: `data-model.md` §3.1, §3.3, §6, §8 e §9.

**Conferência com a constituição:** o projeto não tem `docs/constituicao.md`. Conferido contra as regras invioláveis do `CLAUDE.md`: **conforme**. Nada de pessoa ou texto chega à base (allow-list na fronteira, ADR 0020 R6-3); o O22 continua por tipo de demanda, sem pessoa, sem comparação entre times e sem estatística abaixo de 20 itens; só BusinessMap; cálculo de tempo e percentil pela biblioteca (T2.5); staging append-only; mudança de critério registrada (ADR 0020 R6-10, T2.6). O ponto "Fora do escopo" do pedido ("O22: sem fonte por privacidade") foi revisto pelo dono em 2026-11-16 05:54 (O22 entra no escopo).

**Afrouxa?** Sim: `CAMINHOS_PERMITIDOS` ganha `/cards/comments` (decisão do dono de 05:54, com revisão de segurança obrigatória). Nada em `docs/regras/` nem em `tests/config.json`. Detalhe e controles compensatórios na ADR 0020, R6 "Afrouxa?".

## 1. Resumo
O O22 mede o tempo da criação do card até o primeiro toque. Decisões do dono (pedido 105): toque = primeira atualização de qualquer tipo (movimento, edição ou comentário) com autor, estritamente depois da criação (05:54 e 07:05); não há contas de automação, e regra sob conta de pessoa conta (07:05); comentário externo não conta e o passado de 12 semanas é carregado (07:07).

Fontes: `GET /cards/{id}/revisions` (uma chamada por card com `revision ≥ 2`; a lista traz as revisões 1 a `revision − 1`, só com `replaced_at`, `revision` e `user_id`) e `GET /cards/comments` em lote de até 200 cards. O `user_id` e o autor do comentário só existem em memória até `contaComoToque`; o texto do comentário nunca passa da fronteira. Na base: `stg_toque_instante` (instante e booleano por evento), `ctl_toque_leitura` (card lido, autor pendente ou leitura incompleta) e, projetados, `dim_card.primeiro_toque_em` e `dim_card.toque_situacao`.

## 2. Fonte e regra
| Passo | O que acontece | Onde |
|---|---|---|
| 1 | Listagem `/cards` com `card_ids` e `fields` mínimos: `revision` fresco do lote | cliente HTTP, consulta já fechada |
| 2 | `/cards/comments?card_ids=<até 200>&page=n`, todas as páginas; corte por `CAMPOS_TOQUE` | `allow-list.ts` |
| 3 | `/cards/{id}/revisions` por card com `revision ≥ 2`, sem consulta; corte por `CAMPOS_TOQUE` | `allow-list.ts` |
| 4 | Conferência da lista: começa em 1, sem buraco nem repetição, termina em `revision − 1`, todo item com `replaced_at` válido; se não bater, relê `revision` do card uma vez | normalizador do toque |
| 5 | Evento `r<n>` (n de 2 a `revision − 1`): instante = `replaced_at` do item `n − 1`, autor = `user_id` do item `n` (`AUTOR_DO_TOQUE`); `r<revision>` não é gravado (autor não listado) | normalizador |
| 6 | `conta_como_toque = contaComoToque(autor)`; descarta `user_id` e `author` | `packages/metricas/src/coletor/` |
| 7 | Estado: `lido`, `autor_pendente` ou `leitura_incompleta`; eventos e controle numa transação | coletor |
| 8 | Projeção: `primeiro_toque_em` e `toque_situacao` | projetor |

Regras completas: ADR 0020 R6-3 a R6-6. A constante `AUTOR_DO_TOQUE` segue a leitura literal da OpenAPI (o `user_id` do item `n` é quem fez a revisão `n`). O experimento P1 do plano do O22 (o dono cria um card de teste e um colega o move) confirma ou troca essa leitura; não bloqueia a construção (critério de reversão (iv) da R6).

## 3. Módulos afetados
**Back-end (`server/`)**
- `src/plataforma/http.ts`: caminho `/^\/cards\/comments$/` e `CONSULTA_COMENTARIOS` (`card_ids` obrigatório, `page`), com comentário de código citando pedido 105 e ADR 0020 R6; nenhum outro caminho.
- `src/modulos/businessmap/allow-list.ts`: `CAMPOS_TOQUE` (revisão e comentário) e a função de corte.
- Normalizador do toque (arquivo novo em `src/modulos/businessmap/`): conferência, eventos, estado, `AUTOR_DO_TOQUE`.
- Coletor: leitura em lotes, gravação de `stg_toque_instante` e `ctl_toque_leitura`, incremental com teto (`TETO_TOQUE_POR_EXECUCAO`), comando `bm:carga-toque` com janela e resumo de contagens.
- Projetor: `dim_card.primeiro_toque_em` e `toque_situacao`.
- `src/plataforma/db/grants.ts`: `TABELAS_FORA_DA_API` += `dspd_bm.ctl_toque_leitura`.
- Logger: `redact` com `user_id`, `author`, `text`, `attachments` em um e dois níveis.
- Repositório e serviço do O22: leem as duas colunas novas e repassam situação e instante à biblioteca.

**Biblioteca (`packages/metricas/`)**
- `src/coletor/`: `contaComoToque`, com property test (ADR 0020 itens 2 e 3).
- `src/businessmap/o22.ts`: `>` em vez de `>=`, `primeiroToque` com a situação (fora do cálculo ≠ sem toque), nota de contagem.
- `src/core/criterios.ts`: `VERSAO_CRITERIO_O22_PRIMEIRO_TOQUE`; O22 em `METRICAS_ORIGEM_REAL`.

**Front-end (`web/`)**: cartão do O22 com o aviso (automação sob conta de pessoa, comentário externo) e a nota "N cards fora do cálculo: X com leitura incompleta, Y com o autor da primeira atualização ainda não disponível". Texto revisado pelo `ux-designer` no B8.

## 4. Modelo de dados (migração do B7b)
- `dspd_bm.stg_toque_instante` (append-only, gatilho `proibir_alteracao`, `SELECT, INSERT` do `dspd_coletor`).
- `dspd_bm.ctl_toque_leitura` (só `INSERT`, fora do `dspd_api`).
- `dspd_bm.dim_card`: `primeiro_toque_em`, `toque_situacao` (lidas pela API).
- `ctl_coleta.tarefa`: valor `carga_toque` no `CHECK`.
- Nenhuma entrada em `COLUNAS_PESSOA`; nenhuma coluna nova casa `SEGMENTO_PESSOA` (por isso `conta_como_toque`, não `por_pessoa`).
- `down` reversível: remove as duas tabelas, as duas colunas e o valor do `CHECK` (só antes de carga real; depois da carga, a remoção de staging segue a regra de migração revisada do §1).

## 5. Contrato front e back (alto nível)
Sem rota nova. O DTO do O22 em `GET /api/metricas` ganha, se o B8 precisar, a contagem dos cards fora do cálculo por motivo (`leituraIncompleta`, `autorPendente`, `naoLido`), inteiros sem pessoa. Forma final com o node-backend e a política de mudança de contrato (`docs/api/metricas.md`).

## 6. Custo e operação
- Carga do passado: cerca de 3.450 a 3.750 chamadas de revisões, 20 a 60 de comentários e cerca de 20 de listagem; cerca de 6 h 30 a 7 h a 550/h, em 7 ou 8 janelas de 1 h (1 ou 2 noites). Coleta diária não roda junto (mesma trava de fonte).
- Incremental: 50 a 150 chamadas por dia, com teto por execução.
- **Portão de carga (B7b):** 50 cards sorteados, metade arquivados ou descartados; passa com lista = `revision − 1` em todos e zero erro HTTP nos arquivados (ADR 0020 R6-8). Só depois a carga inteira (B7c, operação do Jarvis, depois do merge na `main`).

## 7. Riscos, dependências e decisões em aberto
- **Arquivados não lidos no spike:** o B5b sorteou só cards ativos. Coberto pelo portão de carga.
- **Leitura do autor (P1):** se o `user_id` for de quem substituiu a revisão, troca-se a constante e relê-se a API. Efeito prático pequeno (0 de 500 revisões sem autor no spike).
- **Card encerrado com uma atualização só (P2):** fica `autor_pendente` para sempre, fora do cálculo e contado na nota. Pergunta ao dono no plano do O22 (recomendação: fora e contado).
- **"Chegada" = criação:** o desenho usa `criado_em`, como o plano versão 3 e o `o22.ts`. Se o dono definir chegada de outro jeito, os eventos guardados permitem reprojetar sem reler a API.
- **Tempo de resposta de uma pessoa por tipo:** risco residual (a) da ADR 0020 R6, para o security-engineer.
- **Dependências:** parecer do security-engineer do B6 (este texto) antes do B7a; P3 e P4 do plano do O22 ao dono (janela da carga e "Bug interno" fora) antes do B7c.
- Pergunta nova ao dono: nenhuma além de P1 a P4 do plano do O22.

## 8. Divisão de tarefas
| Lote | Agente | Conteúdo | Depende | Paralelo |
|---|---|---|---|---|
| B6 | software-architect | este plano, ADR 0020 revisão 6, `data-model.md` | B5b | — |
| B6 | security-engineer | modelo de ameaças e parecer em `docs/security/` sobre a ADR 0020 R6 e este plano | B6 arquiteto | qa-engineer prepara fixtures |
| B6 | qa-engineer | fixtures do B7 (ADR 0020 R6-11, normalizador) | — | com o security-engineer |
| B7a | node-backend | cliente, `CAMPOS_TOQUE`, normalizador, `contaComoToque`, lote de comentários, `redact` | parecer B6 | migração do B7b pode começar |
| B7b | node-backend | migração, grants, gravação, projetor, `bm:carga-toque`, incremental, portão de carga | B7a | — |
| B7c | Jarvis (operação) | carga do passado em 1 ou 2 noites | B7b na `main` | — |
| B8 | node-backend, react-frontend, ux-designer | biblioteca, serviço, versão de critério, aviso e nota do cartão | B7c | back e front em paralelo |

Portões: security-engineer no B6 e no B7a; review do tech-lead e QA em todos; `pnpm run pronto`; UX no B8.

## Critério de parada
- bloqueia: `user_id`, autor, nome, e-mail, texto ou anexo de comentário em qualquer `stg_`, `ctl_`, `dim_` ou log; ou O22 publicado com toque igual à criação, com card `nao_lido`, `autor_pendente` ou `leitura_incompleta` contado como "sem toque", com revisão descartada em silêncio por falta de instante, ou com comentário externo contado
- pessoa-na-base · campo de pessoa ou texto gravado em `stg_toque_instante`, `ctl_toque_leitura`, `dim_card` ou log · oráculo: teste de allow-list com os proibidos escritos no teste e fixture da OpenAPI mais chave desconhecida, e teste de marcador em um e dois níveis (ADR 0020 R6-11)
- sem-dado-vs-sem-toque · card não lido, `autor_pendente` ou `leitura_incompleta` entra como "sem toque" · oráculo: teste do projetor e do serviço do O22
- externo-ou-sem-autor-como-toque · comentário `external` ou revisão sem `user_id` válido vira toque · oráculo: property test de `contaComoToque` e teste do projetor
- toque-na-criacao · revisão 1 ou instante igual a `criado_em` vira toque · oráculo: teste do projetor e `o22.test.ts`
- lista-cortada · lista que não começa em 1, tem buraco, repetição ou não termina em `revision − 1` vira card lido · oráculo: teste do normalizador com os fixtures de lista com buraco, curta e longa
- instante-perdido · instante do evento `r<n>` diferente do `replaced_at` do item `n − 1` · oráculo: teste do normalizador com fixture só com `revision`, `user_id` e `replaced_at`
- caminho-aberto · cliente aceita `/cards/{id}/revisions/{n}`, `/cards/comments` sem `card_ids`, com parâmetro fora da lista ou com mais de 200 ids · oráculo: teste do cliente (`http.ts`)
- api-le-controle · `dspd_api` lê `stg_toque_instante` ou `ctl_toque_leitura` · oráculo: teste de grants (`papeis.pg.test.ts`)
- gatilho · oráculo: parecer do security-engineer em `docs/security/` no B6 e no B7a, resumo do portão de carga do B7b, `pnpm run pronto` e parecer do QA em `docs/qa/`
