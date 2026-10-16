# K-097: levantamento de payload antigo nas tabelas stg_

Data do levantamento: 2026-10-15 (pedido 011, decisão "Dados antigos = A" de 2026-10-16).
Método: contagem de registros e nomes das chaves do `jsonb` (`jsonb_object_keys`), por `docker exec` no psql do próprio contêiner, com papel administrador local. Nenhum conteúdo foi lido, nada foi alterado ou apagado. Tabelas sem coluna `jsonb` (`stg_card_presenca`, `stg_webhook_processamento`) só foram contadas.

## Resultado

Nenhuma tabela `stg_` dos três ambientes tem registro. Não há payload antigo, e portanto não há chave proibida a listar.

| Ambiente | Banco | Tabelas stg_ (todos os schemas) | Com registros | Registros | Chaves do jsonb | Chaves proibidas (`discard_comment`, `owner_user_id`, `co_owner_ids`, `user_id`, texto livre) |
|---|---|---|---|---|---|---|
| Dev local (`metricasdspd-postgres-1`) | `metricas` | 11 (9 com `payload` jsonb, 2 sem) | 0 | 0 | nenhuma (sem linhas) | ausentes |
| Dev local | `metricas_test` | 34 jsonb + 4 sem payload, em 12 schemas com prefixo de teste (`t*_dspd_bm`, `t*_dspd_ac`) | 0 | 0 | nenhuma | ausentes |
| Homologação local (`metricasdspd-homolog-postgres-1`) | `metricas` | 11 (9 com `payload` jsonb, 2 sem) | 0 | 0 | nenhuma | ausentes |
| Homologação local | `metricas_test` | 0 | 0 | 0 | nenhuma | ausentes |

Tabelas verificadas por schema (`dspd_bm`): `stg_card`, `stg_revision`, `stg_vinculo`, `stg_custom_field`, `stg_coluna`, `stg_bloqueio`, `stg_webhook_evento`, `stg_card_presenca`, `stg_webhook_processamento`. Em `dspd_ac`: `stg_chamado`, `stg_etapa`.

Observações:
- Os ambientes carregam só o seed mock, que escreve direto nas tabelas analíticas e não passa pela staging. Por isso as `stg_` estão vazias.
- O contêiner de homologação estava parado; foi iniciado só para a leitura e parado de novo. O volume não foi alterado.
- Verificação adicional (K-096): `fato_transicao.usuario` não tem nenhum valor não nulo. Dev `metricas`: 0 linhas. Homologação `metricas`: 46.425 linhas, 0 com `usuario`. `metricas_test`, dois schemas de teste vivos: 46.425 linhas cada, 0 com `usuario`.
- Os demais campos de pessoa analíticos (`dim_card.responsaveis`) não faziam parte do escopo deste cartão.

## Conclusão

Não há dado de pessoa em staging nos bancos locais. A recriação do ambiente, prevista na decisão do usuário para o caso de achado, não é necessária. Parecer do security-engineer continua devido conforme a decisão.
