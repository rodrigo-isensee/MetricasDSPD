---
tipo: qa
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/coletor-allow-list
commit: 7eab8e0
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-15
---

# QA: K-084, allow-list do coletor do BusinessMap

Links: ADR 0020 (itens 4a, 4b, 4c, 4d, 4f), review `docs/reviews/k084-coletor-allow-list.md` (aprovado, volta 2, 9b7f0d3), segurança `docs/security/k084-coletor-allow-list.md` (aprovado; achados B-K1, B-K2, B-K3 e I-1 a I-5 fora deste cartão), contrato `docs/contratos/fontes.md`, `docs/architecture/server.md`.

## Veredito
**Aprovado.** Nenhum bug aberto. Todas as obrigações de proteção de pessoa e de texto livre na fronteira têm evidência com o papel real do Postgres (`dspd_coletor`, `dspd_webhook`). O commit `d0bce7f` é o HEAD da branch com os testes do QA (só `server/tests/`, nenhum código de produção alterado); o código de produção testado é o de `9b7f0d3`.

Revalidado em 2026-10-15 no HEAD `7eab8e0` (atualização com a `develop`, só docs): ver a seção final.

## Escopo
Diff `origin/develop...HEAD`: `allow-list.ts`, `responsaveis.ts`, `staging.ts`, `webhook.ts`, `index.ts` e os testes dos autores. Fora do escopo: cliente da API e worker (não existem), demais `stg_` (B-K3), forma dos campos (B-K1), erro do jsonb no coletor (B-K2): pré-condições dos próximos cartões, já registradas pela segurança.

## Obrigação → teste → resultado
`dev` = testes dos autores; `qa` = `server/tests/allow-list.qa.test.ts` (29, unidade) e `server/tests/allow-list.qa.pg.test.ts` (8, Postgres real).

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| M-1, 4a: `stg_card` só com a lista fechada | dev `allow-list.test.ts`, `responsaveis.pg`; qa unit "200 chaves desconhecidas" e "proibido aninhado"; qa pg "stg_card com campos extras" | `owner_user_id`, `co_owner_ids`, `reporter`, `description`, `discard_comment`, `subtasks`, texto em `block_reason`, `linked_cards` e `custom_fields`; conferido na linha inteira da tabela (`t::text`), não só no jsonb | passou |
| Chaves de protótipo e entrada hostil | qa unit `__proto__`, `constructor`, `prototype`; entradas não objeto (7 formas) | sem poluição de `Object.prototype`; registro vazio | passou |
| Campo que vira objeto ou vetor numa chave permitida | qa unit (`title`, `deadline`, `size`, `card_id` de vínculo) | só escalares passam; o resto é descartado | passou |
| 4d: campo customizado fora do domínio | dev `allow-list.test.ts`; qa unit (sem domínio: lista vazia) | texto recebido nunca vira valor (`desconhecido`) | passou |
| M-3, 4c: `stg_revision` | dev; qa unit; qa pg "stg_revision fora de ordem e com proibidos" | `user_id`, `owner_user_id`, `co_owner_ids`, `subtasks`, `author` fora; payload exato conferido | passou |
| M-2, 4f: webhook grava só o registro | dev `webhook.test.ts`, `webhook.pg`; qa pg "campos extras, proibidos e texto livre" | chaves gravadas = `evento`, ids de posição, instante; corpo (autor, e-mail, comentário, aninhado profundo) ausente da linha | passou |
| 4f: webhook de tipo desconhecido | qa unit (11 formas: maiúsculo, misto, espaço, quebra de linha, prefixo, vazio, vetor, número, nulo, objeto, `card_deleted`); qa pg (6 tipos pela API) | 202, nada em `stg_webhook_evento`, nada na outbox (contagem igual antes e depois); tipo só vale no campo `evento`, não dentro de `card` nem `anterior` | passou |
| Log do receptor sem texto livre | dev; qa unit `tipoParaLog` (7 entradas hostis, 41 caracteres, quebra de linha) | só forma de identificador, senão `invalido` | passou |
| Webhook inválido | qa pg: `\u0000`, JSON truncado, `[]` | 400 e nada gravado | passou |
| Dado fora de ordem (webhook) | qa pg: nova, depois velha, depois reenvio da nova | duas linhas, ordem de chegada, reenvio não duplica, nada sobrescrito | passou |
| Dado fora de ordem (`stg_card`) | qa pg: revisão 5, depois 4, depois 4 com mudança só em campo fora da lista | cadeia `anterior_sk`; a mudança fora da lista dá `ja_existente`; append-only | passou |
| Dado fora de ordem (`stg_revision`) | qa pg: 3, 2, 3 | cada revisão uma vez; `troca_responsavel` correto | passou |
| Dado fora de ordem (responsáveis) | dev `responsaveis.test.ts` e `.pg` (igual e anterior) | nada gravado e projeção não diverge do histórico | passou |
| Hash de dedupe estável | qa unit: ordem das chaves em todos os níveis; ordem dos vínculos muda o hash | dado é dado, chave é só chave | passou |
| 4b: responsáveis fora da staging | dev `.pg`; qa unit (repetidos, fora de ordem, tipo estranho, só dono vazio) | ids só em `dim_card` e `dim_card_versao`; staging sem `4242`, `owner_user_id` | passou |
| Papéis sem UPDATE nem DELETE na staging | qa pg: `dspd_coletor` em `stg_card` e `stg_revision`; `dspd_webhook` em `stg_webhook_evento` | `permission denied` | passou |
| Contrato e documentação | `docs:check` no `pronto` do review | `fontes.md`, `server.md` | passou |

## Execução (resultado real)
| Suíte | Resultado |
|---|---|
| `scripts/test-pg.sh` (Postgres do Compose) em 1f546c2, antes dos testes do QA | 61 de 68 passaram; os 7 que falharam são todos de `pesquisa.pg.test.ts` (`permission denied for database`, papel `dspd_pesquisa`), **ambiente, anterior a esta entrega**. Os `.pg` do K-084 (`responsaveis`, `staging`, `webhook`, `catalogo`) passaram |
| `test:pg` em d0bce7f, com os 8 casos novos | 69 de 76 passaram; mesmas 7 falhas de `pesquisa.pg`; **os 8 do QA passaram** |
| Unidade do `server` (`vitest --project unit`) | 25 arquivos, **476 passaram**, 0 falharam; `tsc --noEmit` limpo |
| Unidade dos testes do diff (`allow-list`, `responsaveis`, `webhook`, `staging`, `eventos.catalogo`) | 5 arquivos, 70 passaram |
| `pnpm run pronto` | rodado pelo tech-lead na revisão (EXIT=0, cobertura de 100%, `docs:check` ok); não repetido |

## Vermelho antes do verde e mutação
- **Vermelho contra o código anterior:** `git checkout $(git merge-base origin/develop HEAD) -- server/src/modulos/businessmap/staging.ts server/src/modulos/businessmap/webhook.ts` (o `staging` e o `webhook` de antes do K-084) e `test:pg`: **6 dos 8 testes do QA falharam** (webhook de tipo desconhecido, webhook com proibidos, webhook fora de ordem, `stg_card` com proibidos, `stg_card` fora de ordem, `stg_revision`). Os 2 que continuaram verdes (`\u0000` e JSON inválido dão 400; o coletor sem UPDATE e DELETE) guardam comportamento que já existia. Restaurado com `git checkout HEAD --`, árvore limpa.
- **Mutação no `allow-list.ts`** (5 mutantes, arquivo restaurado depois de cada um): `owner_user_id` dentro de `CAMPOS_CARD` (morreu, 1 falha, depois de o teste ganhar o campo escalar no topo; na primeira rodada **sobreviveu** porque o fixture do QA só trazia o campo aninhado, e o corpo do teste foi corrigido); `card_deleted` entre os tipos gravados (morreu); `author` copiado para o registro do webhook (morreu); `tipoParaLog` sem a regex (morreu); vínculo inteiro em vez de `(card_id, link_type)` (morreu). Nenhum sobrevivente.

## Bugs
Nenhum aberto. Os achados B-K1 (forma das strings nas chaves permitidas), B-K2 (erro do jsonb ecoando trecho no log do coletor) e B-K3 (demais `stg_` sem lista) são do parecer de segurança, baixos e pré-condição dos próximos cartões; este QA não os reabre.

## Riscos e observações
1. **B-K1 continua observável:** um id de card com texto livre (por exemplo `"card_id": "qualquer texto"`) passa como escalar na chave permitida. Não escrevi teste que trave isso, para não fixar um comportamento que a segurança quer mudar. O cartão que fechar B-K1 deve levar o teste de forma.
2. O formato real do webhook do BusinessMap ainda não foi lido (I-1): se o campo do tipo não for `evento` com valor `card_moved`, todo evento é ignorado com 202. Os testes do QA provam que isso falha fechado, não que o formato está certo.
3. `responsaveis.ts`: a leitura da vigente e o `UPDATE` são duas instruções (observação do review); só importa quando houver mais de um coletor no mesmo card.
4. Os 7 testes de `pesquisa.pg` falham no Postgres local por permissão do papel `dspd_pesquisa`; é anterior e de ambiente, e o job `banco` da CI é o portão.
5. Os arquivos novos do QA não passam no `prettier --check`; os testes dos autores (por exemplo `allow-list.test.ts`) também não, então o `pronto` não os verifica.

## Revalidação: atualização com a develop (só docs)
- Data: 2026-10-15. Parecer original no commit `d0bce7f`; HEAD revalidado: `7eab8e0` (branch `fix/coletor-allow-list`, worktree `MetricasDSPD-k084`). O campo `commit:` passa a ser o HEAD testado.
- Motivo: a `develop` recebeu só documentação (PR #76) e a branch a mergeou (`d81a6cb`). O `forge-check pr` acusava o parecer como desatualizado por causa de `docs/alinhamentos/2026-10-14-revisao-desenho-011.md`, que não é caminho livre (LIVRES).
- Código e teste: `git diff d0bce7f 7eab8e0 --stat -- server packages web e2e` vazio. Os 19 arquivos que mudaram desde o parecer são de `docs/` e `KANBAN.md` (alinhamento, ADR 0003 e 0020, arquitetura, integração, kanban, pedido, UX, revisão e segurança). Nenhum código de produção, teste, migração, fixture ou configuração de pronto mudou.
- Unidade do `server` em `7eab8e0` (`npx vitest run --project unit`, com `flock /tmp/metricas-pesado.lock nice -n 19`): 25 arquivos, **476 passaram**, 0 falharam. Igual ao parecer original.
- Não reexecutei `test:pg` nem `pronto`: o código testado é idêntico ao de `d0bce7f` (mesmo resultado de 69 de 76, mesmas 7 falhas de `pesquisa.pg` de ambiente).
- Veredito mantido: **aprovado**, zero bugs abertos.
