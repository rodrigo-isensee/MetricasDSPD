---
tipo: qa
contrato: 1
pedido: 011-fase2-operacionais
branch: feature/011-fase2-operacionais-v2
commit: b99ee1f
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-17
---

# QA: back da fase 2 do pedido 011, lote 3 (operacionais: O22 e O26)

Links: plano `docs/qa/011-back-plano.md` (sem seção própria para O22 e O26, que são da fase 2; os casos saem da especificação), arquitetura `docs/architecture/features/metricas-tambem-disponiveis.md` §2 (O22, O26) e §3, review `docs/reviews/011-fase2-operacionais.md` (aprovado, rodada 2, sobre `d5b02d8`), segurança `docs/security/011-fase2-operacionais.md` (aprovado, revalidado sobre `d5b02d8`).

**Veredito: aprovado.** Zero bug aberto. Escopo incremental: o que o lote acrescenta à develop `8516ff8` (O22, O26 e `houveTroca`/`contarPassagens`). Os testes de produto já existem, escritos pelo autor; o QA conferiu a cobertura por obrigação, aplicou mutantes e não encontrou caso do plano sem teste, então **nenhum teste novo foi escrito** (e nada a registrar de vermelho antes do verde).

## Execução
- `pnpm run pronto` na raiz da worktree, sobre `b99ee1f`: **rc=0**, 5m40s. Antes: `uptime` load 0,12 e `free -m` com 6,5 GB disponíveis.
- metricas 1090, mock 244, contratos 160, server 591 passaram (84 pulados, os que exigem banco real, preexistentes), web 1047, tools-docs 102, homolog 73, pesquisa 33, spec-check 14. Cobertura 100% por pacote; `docs:check` ok (69 métricas).
- Nenhum teste foi marcado `skip` por este lote.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| D-9', CA-43 (O22: primeiro toque em dias úteis, P50/P85/P95 e histograma de faixas fixas, limites inclusivos à esquerda) | `o22.test.ts:81` | faixas 0-0,5, 0,5-1, 1-2, 2-5, 5-10, 10+ | passou |
| Regra dos 20 (O22: abaixo de 20 tocados do tipo, só "k de n" e histograma nulo) | `o22.test.ts:96` | 19 e 20 | passou |
| Regra 7 (um bloco por tipo; 20 em um tipo não destrava o outro) | `o22.test.ts:108`, `:118` | 19/20 em tipos distintos; filtro de tipo | passou |
| D-9' primeiro toque válido: depois da criação, até a data de corte, dentro da janela de 12 semanas | `o22.test.ts:129` | toque antes da criação, no futuro e fora da janela | passou |
| "Ainda sem toque" é retrato de hoje: só aberto com campo nulo; entregue e arquivado fora; idade do mais antigo | `o22.test.ts:157` | nulo (sem toque) x ausente (sem dado) | passou |
| Sem extensão: vazio no schema, nunca erro; bug interno fora | `o22.test.ts:71`, `:188` | extensão ausente | passou |
| P6 (O22: nada de pessoa nem de texto) | `o22.test.ts:194` e varredura de `regras.property.test.ts` | schema estrito | passou |
| D-5' = B, CA-38 (`houveTroca`: só quando alguém sai e outro entra, ou o conjunto é substituído) | `houveTroca.test.ts:30` | substituição total | passou |
| D-5' = B (co-responsável incluído sem saída não conta; só saída não conta; mesmo conjunto com outro dono não conta) | `houveTroca.test.ts:15`, `:20`, `:25` e propriedades `:36`, `:49` | entrada só, saída só, igualdade | passou |
| Q-a = 1 passagem (`{A,B} -> {C,D}` numa revisão conta 1) | `houveTroca.test.ts:64` | substituição de vários | passou |
| Q-b = conta (`{A} -> {} -> {B}` conta 1; vazio nunca é referência; voltar ao mesmo responsável não conta) | `houveTroca.test.ts:68`, `:72`, `:81`, `:86` | conjunto vazio no meio, no começo e só vazios | passou |
| Sequência mista de revisões | `houveTroca.test.ts:76` | entrada, saída, troca, dono | passou |
| ADR 0020 (identidade não é pública: fora de índice, de `businessmap` e de `exports`; devolve só booleano e inteiro) | `houveTroca.test.ts:102`, `:112` | pontos de entrada públicos | passou |
| O26: sem `passagens` vai a `semDado`, nunca a "0 passagens"; ausente, negativo ou fracionário é sem dado | `o26.test.ts:49`, `:110` | undefined, -1, 1,5 | passou |
| O26: faixas 0, 1, 2, 3 e 4+ (4, 5 e 6 juntas) | `o26.test.ts:60` | 3/4 e 4/6 | passou |
| Regra dos 20 (O26: histograma sempre; percentual e P85 só com 20) | `o26.test.ts:77`, `:93` | 19/20 por tipo e por faixa; ciclo por faixa sem mistura | passou |
| Regra 7 (O26: um bloco por tipo), período, filtro, bug interno fora | `o26.test.ts:123`, `:132` | tipo, período | passou |
| P6 (O26: só inteiros e tempos; chaves do bloco fechadas) | `o26.test.ts:154` e varredura de `regras.property.test.ts` | lista exata de chaves | passou |

## Mutação no diff (manual, `packages/metricas`)
Sem Stryker (teto de recursos); cinco mutantes, um por vez, rodados contra `houveTroca`, `o22`, `o26` e `regras.property` (393 testes). Restaurado por cópia após cada um; `git status` limpo.
| Mutante | Falha observada |
|---|---|
| `houveTroca`: tirar o retorno de "ninguém saiu" (só entrada passa a contar) | 4 falhas em `houveTroca.test.ts` |
| `contarPassagens`: conjunto vazio vira referência (Q-b quebra) | 2 falhas, entre elas `:68` |
| `contarPassagens`: `passagens += r.size` (conta por pessoa, Q-a quebra) | 2 falhas, entre elas `:64` |
| `o22`: aceitar toque anterior à criação | `o22.test.ts:129` |
| `o26`: sem teto da faixa 4+ | `o26.test.ts:60` |
Nenhum sobrevivente.

## Observações (sem bug)
- O comando de pronto não foi repetido após os mutantes: o código de produção ficou idêntico a `b99ee1f` (conferido por `git status`).
- Mock apenas: a coleta real do O22 (`stg_comentario_instante`) e do O26 (revisões) é da fase 3; aqui só se valida o cálculo e o contrato sobre a extensão do mock.
- A varredura P6 em `regras.property.test.ts` cobre O22 e O26 pela lista de ids; a guarda contra varredura vazia é a do bloco existente.
- Não testado aqui: front (pedido 025 em diante), promoção para a homologação (pedido 023).
