---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1b-dominios
commit: 04cc9c9b47ab12efe6f106922ab239ad57e91485
parecer: aprovado
resultado: aprovado. Delta 5ec7d8e8..04cc9c9b é só o merge da develop; os 3 arquivos do D1b (JSON, dominio-acelerato.ts, teste) idênticos ao aprovado; o D1b convive com o primeiro atendimento da develop. A1 segue aberto, recomendado.
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-15
---
# QA: 099 D1b, domínios cpe_* e etapa_fluxo (E3.260)

Código testado: 5ec7d8e8, diff contra origin/feature/099-d1a-fluxo-chamado (CI do autor, run 43669474477, verde). Obrigações: os 5 domínios `cpe_*` com a grafia literal da B6-d em UTF-8, sem de-para; `etapa_fluxo` com as 114 chaves da B5-a; `CAMPOS_DOMINIO` com os 6 nomes; `versao_criterio` nova.

## Veredito
Aprovado. Conferi o JSON contra `resposta-b6d-utf8.md` e `resposta-b5a.md` por script (sem valor a mais nem a menos, grafia exata, ordem de primeira aparição). Rodei `dominio-acelerato.test.ts` (35 passam, `--maxWorkers=2`) e 8 mutantes por cópia, restaurando o original. Um mutante sobrevive: o rótulo de `etapa_fluxo` não é fixado por teste (A1, baixo, vira cartão).

## Achados
- A1 (recomendado) server/tests/dominio-acelerato.test.ts:281 · rótulo de etapa_fluxo não é conferido contra a B5-a: trocar "Encerrado" por "Fechado" na chave 3316 passa a suíte (mutante M8 sobrevive). Fixar chave→rótulo, ao menos por amostra.

## Conferência contra a fonte
| Domínio | Esperado (B6-d / B5-a) | JSON | Resultado |
|---|---|---|---|
| cpe_avaliacao_problema | 2 valores | 2, igual | igual |
| cpe_motivo_escalacao | 4 valores | 4, igual | igual |
| cpe_motivo_encerramento | 10 grafias distintas (3308, 3316, 3320, 3328; "Solução definitiva validada" e "Não é problema" são entradas próprias) | 10, igual, codigo = rotulo | igual |
| cpe_motivo_pendencia | 4 valores | 4, igual | igual |
| cpe_prioridade_ajustada | Sim, Não | igual | igual |
| cpe_tipo_prioridade | "Feito!" e "Feito" são marcadores, decisão do dono: sem domínio | ausente | conforme o pedido |
| etapa_fluxo | 114 linhas, 114 chaves distintas | 114, mesmo conjunto, todos os rótulos iguais | igual |
| Categoria de solução | fora do escopo do brief (sem domínio cpe_*) | ausente | n/a |

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Um `cpe_*` por campo de etapa `lista`, e só eles | "o esquema aceita um domínio cpe_*…" | conjunto fechado dos 6 nomes | passa |
| Valores literais, uma entrada por grafia, codigo = rotulo | "cpe_*: os valores literais da B6-d…" | grafias que só diferem na caixa; acento | passa |
| `cpe_tipo_prioridade` sem valores; lista vazia recusada; sem e-mail | "cpe_tipo_prioridade não tem valores…" | vazio; dado de pessoa | passa |
| 114 chaves numéricas distintas, na ordem das fases | "etapa_fluxo: 114 chaves…" | mínimo e máximo exatos, duplicata | passa |
| Ordem entre encerramento e etapas vizinhas | "o encerramento vale depois de…" | ordem | passa |
| Mesmo nome em workflows diferentes fica junto | "etapa de mesmo nome…" | contiguidade | passa |

## Mutantes no domínio (cópia restaurada a cada um)
| Id | Mudança | Resultado |
|---|---|---|
| M1 | valor extra em `cpe_avaliacao_problema` | morreu |
| M2 | "Duplicado" removido de `cpe_motivo_encerramento` | morreu |
| M3 | "área" sem acento em `cpe_motivo_pendencia` | morreu |
| M4 | grafia "Não é problema" fundida (removida) | morreu |
| M5 | rótulo diferente do codigo em `cpe_prioridade_ajustada` | morreu |
| M6 | chave 3316 trocada por 3317 em `etapa_fluxo` | morreu |
| M7 | `cpe_tipo_prioridade` com e-mail | barrado na carga (o arquivo nem carrega, "no tests"); conta como barrado |
| M8 | rótulo da chave 3316 trocado | SOBREVIVEU (A1) |

## Prova
Vermelho antes do verde: o teste novo só afirma dados do JSON do próprio head; os mutantes M1 a M6 mostram a falha com o dado fora da fonte.

## Delta 04cc9c9b (merge da develop 204924b2)
O `forge-check parecer delta` lista no domínio: CHANGELOG.md, normalizador.ts, projetor.ts e acelerato-projetor.test.ts, todos vindos da develop (lote D4, S1). Conferi: o diff 5ec7d8e8..04cc9c9b nos 3 arquivos do D1b (acelerato-dominio.json, dominio-acelerato.ts, dominio-acelerato.test.ts) sai vazio. O D1b mexe só em domínio de referência e versao_criterio; o D4 só soma primeiro_atendimento_em à LinhaProjecao e à lista ATRIBUTOS. Conjuntos disjuntos, sem símbolo comum. O controle.ts filtra ref_versao_criterio por starts_with(referencia, $3); a referência nova do D1b é texto de cadastro e não afeta esse filtro.
- Rodei dominio-acelerato.test.ts: 35 passam. Rodei vitest com os filtros acelerato, normalizador e projetor: 23 arquivos, 525 passam, 84 pulados (exigem banco; valem pelo CI). Nenhum teste foi pulado por mim.
- CI do head 04cc9c9b: testes success (run 132828231152), banco success (132828270636), build, seguranca e openapi success. A suíte inteira vale pelo CI, não pelo local.
- A1 (rótulo de etapa_fluxo não fixado, baixo) segue aberto como cartão, sem bloqueio.
