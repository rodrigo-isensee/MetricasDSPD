# Retrospectiva do pedido 101: release dos filtros do 097 e do sem simulado do 099 (2026-11-12)

Fontes: `docs/pedidos/101-release-filtros-sem-simulado.md` (Histórico inteiro), `docs/kanban/conferencias.md` (16 linhas do 101), `docs/kanban/historico.md` (sem linha de K-275), `docs/kanban/melhorias.md`, e `gh pr view` dos PRs 360 e 361. Horas no relógio local (-03:00); o merge do PR 360 foi às 15:33Z, ou seja, 12:33. Processo, nunca pessoa. Retrospectiva curta: sem a linha de base M14b completa.

## 1. Dados do fluxo
| Marco (-03:00) | Hora | Intervalo |
|---|---|---|
| Pedido aberto | 03:20 | |
| Release começa (E1.1 delegada, develop em ea826a9c) | 07:39 | 4h19 (fila de merges da develop) |
| E1.1 review e E1.2 segurança aprovados | 07:55 | 16 min |
| QA reprovado (db5a0713) | 10:00 | 2h05 (QA interrompido por reinício às 09:11) |
| PR 357 (specs e2e) mesclado | 10:30 | 30 min |
| QA, review e segurança revalidados | 10:41 a 10:45 | 15 min |
| PR 358 (docs/101-release) mesclado na develop | 11:05 | 20 min |
| PR 359 (develop para homolog) mesclado, portão verde | 11:51 | 46 min |
| PR 360 (homolog para main) aberto pelo tech-lead | 11:53 (criado) | 2 min |
| PR 360 mesclado pelo dono | 12:33 | 40 min de espera do dono |

- **Pedido aberto até a main: 9h13** (03:20 a 12:33). **Partida da release até a main: 4h54** (07:39 a 12:33). Pedido aberto até a develop (PR 358): 7h45; partida da release até a develop: 3h26. Meta de 30 min do relógio "pronto para fazer": **não atingida e não medida pela linha `relogios:`** (K-275 sem linha no `historico.md`).
- **Cycle time, lead time e vazão de K-275: não medidos.** O histórico não tem nenhuma linha do cartão; é a mesma lacuna das retrospectivas 065, 067, 068 e 071. Vazão: 1 pedido, 27 PRs no CHANGELOG (329 a 356, sem o 332) mais 357, 358, 359, 360 e 361.
- **Retrabalho:** 1 devolução de portão (QA da release reprovado por 6 testes do e2e chromium-api com spec velho, sem defeito de produto; A1 FA5-04 e FA5-16, A2 TT-02, A3 CT-58, A4 CT-59), corrigida na E1.9 (PR 357, chromium-api 69 de 69) e revalidada. Pareceres da release: **6** (review, segurança e QA, cada um duas vezes), contra 3 no 071 (meta <= 5 do 068: **não atingida** por causa do spec velho). Retrabalho de conferência: **0 briefs reprovados em 16** (todos `aprovado` na primeira); as 3 conferências de entrega do Histórico (05:21, 07:51, 10:05) constam como conferidas, o veredito por linha não está em `conferencias.md` sob o nome do 101: **não medido**.
- **Estabilidade (DORA):** 1 release para a main (PR 360), mais 358 e 359 do pedido. Falha, reversão ou hotfix: nenhum. Escape: nenhum bug depois do parecer final; o A4 do QA era anterior à release. Lead time de mudança por PR: **não medido**. Velocidade: a release saiu no mesmo dia; estabilidade mantida (zero falha), com um controle furado achado antes da main (a CI não roda o chromium-api, ver K-301).
- **Clareza:** sem seção "Registro de clareza" no pedido, logo `PERGUNTA:`, `NAO-ENTENDI:`, `ESCOPO+:` e `DEVOLVIDA:` **não medidas**. Marcas: 1 `confirmado`, 1 `técnico`, 0 `delegado` (0%), 0 suposição; 0 perguntas na fila. `ERRO-JARVIS:` no Histórico: **1** (brief de merge do E1.5 com a linha padrão "o único merge é na develop").
- Custo em tokens, esperas, escape e afrouxamentos (M14b): não rodados; **não medidos**.

## 2. O que funcionou
- **Pareceres em série no mesmo commit, sem bypass.** Review, segurança e QA aprovados no mesmo head (5d7fe1aa); os PRs 357, 358 e 359 mesclados com checks verdes e sem `--admin`; a main ficou com o dono (PR 360, 40 min de espera).
- **Briefs sem reprovação:** 16 de 16 aprovados na primeira conferência (no 071 foram 7 de 15 reprovados). A lição de congelar a develop durante a release foi cumprida depois das 07:39.
- **O QA pegou 6 specs velhos antes da main** e separou A4 (anterior à release) de A1 a A3 (herdados do 099). Nenhuma guarda foi afrouxada na correção (review 9fa47232).
- **Decisão do dono com versão e regra clara:** "faca suas recomendacoes" (10:09) virou a regra de banco de teste, com cartão K-301 para o `praticas.md`.
- **Portão da homolog verde de primeira** (run 43237822780: qualidade, banco, migração, smoke, e2e 1 e 2, perf).

## 3. O que atrapalhou (fatos)
- **QA da release reprovado por specs velhos do e2e chromium-api.** Nenhum job da CI roda o chromium-api (`ci.yml:191` roda só `test:chromium`), então 6 specs desatualizados pelo 099 passaram em todos os PRs e só o QA da release os pegou, 2h05 depois do início (inclui uma instância do QA perdida por reinício da sessão às 09:11, sem parecer gravado). Custo: 1 volta E1.9 (PR 357), 3 revalidações de parecer, cerca de 1h de relógio (10:00 a 11:05). Já registrado como A5 do QA e cartão K-301.
- **Teste de banco fora do sandbox.** O chromium-api só rodou contra o banco `_test` fora do sandbox (loopback do Postgres bloqueado), e o `docker compose` do script recriou o container `metricasdspd-postgres-1`; nunca a base real. Virou a regra do dono de 10:09: a prova de banco é o CI do PR, e teste local fora do sandbox só por comando fixo autorizado uma vez; até lá nenhum agente contorna o sandbox. Conferência do container: do dono. Custo: a prova de 69 de 69 do autor não é reproduzível em CI (ver K-301).
- **PR 360 BLOCKED pela proteção da main.** O GitHub mostrou BLOCKED com todos os checks verdes, `homolog-aprovada` inclusive (E1.6, 12:13). A causa exata não foi registrada (a leitura de hoje devolve `mergeStateStatus` UNKNOWN, já mesclado); o dono mesclou às 12:33 sem o time ter a explicação. **Causa não medida.**
- **Merge com check ainda pendente, recorrente.** (a) 07:37: o dono mesclou os PRs 356 e 351 enquanto os dois agentes de merge esperavam; o 351 entrou com o e2e pendente e o push da develop pula o e2e, então nenhum e2e rodou sobre ea826a9c (A1 do review, A3 recorrente). (b) PR 361 (K-290, COMP-12 no O17, base develop) mesclado pela conta do dono às 15:33:54Z, 33 s depois do PR 360, quando um check ainda constava pendente (dado do brief; hoje os checks do PR 361 listam SUCCESS, e `e2e-parte`, `perf`, `banco` e `e2e` aparecem também como SKIPPED, por serem jobs de outro evento). O mérito foi conferido depois; o controle de "merge só com checks verdes" não valeu nos dois casos.
- **Head do merge diferente do head aprovado.** No PR 358 o head mudou durante a espera por um merge da develop feito fora da delegação (9efb8ae1); diff igual, pareceres válidos (`forge-check pr`), mas o merge usou outro head.
- **Brief de merge contradiz a etapa.** O brief da E1.5 trazia "o único merge é na develop", e a etapa era develop para homolog (ERRO-JARVIS 11:51); o gerador do modo merge não usa a base do PR.
- **G1 (sem-mock) não roda no job build da CI nem da homolog** (A2 do review, A1 da segurança). Só roda no QA local; entra no K-301.
- **Quadro incompleto, de novo:** K-275 sem nenhuma linha no `historico.md`; cycle time não medido pela sexta retrospectiva.

## 4. Ação (uma) e linhas `MELHORIA:`
Ação única desta retrospectiva (1 causa nova): **a CI rodar o chromium-api e a G1 (K-301)**, causa do único retrabalho de portão do pedido. Responsável: tech-lead (K-301, devops). Medida: specs velhos achados só no QA da release = 0 nas próximas 2 releases; pareceres por release <= 5. Revisão: após a próxima release. Não abro proposta nova em `docs/kanban/melhorias.md`: o K-301 já cobre; este registro só leva o dado (6 specs, 3 revalidações, ~1h).

| Melhoria vista | Evidência | Classe | Destino |
|---|---|---|---|
| Nenhum job da CI roda o chromium-api e a G1 não roda nos jobs de build da CI e da homolog | `ci.yml:191`; pedido 101, entradas 07:55 (A2 e A1) e 10:41 (A5); 6 specs reprovados | projeto, já em K-301 | só dado; medida: specs velhos achados só no QA = 0 |
| Merge com check pendente (PR 351 às 07:39, PR 361 às 15:33Z) e head do merge diferente do aprovado (PR 358, 9efb8ae1) | pedido 101, entradas 07:39, 07:55 (A3) e 11:05; `gh pr view 361` | fábrica, vai ao Forge | o `forge-check pr` guarda o head aprovado e o brief de merge exige `--match-head-commit` desse head; checks verdes lidos na hora; medida: merges de agente com head diferente ou check pendente = 0 em 3 releases |
| Gerador do brief de merge traz a linha "o único merge é na develop" sem usar a base do PR | pedido 101, entrada 11:51 (ERRO-JARVIS; brief tech-lead-8) | fábrica, vai ao Forge | o gerador do modo merge usa a base do PR; medida: briefs de merge com base diferente da develop e a linha padrão = 0 |
| PR de release BLOCKED sem explicação registrada com todos os checks verdes | pedido 101, entrada 12:13 | projeto | o tech-lead anota a exigência que bloqueia (revisão, check ou ordem) no `fluxo-homologacao.md`; medida: PR de release BLOCKED sem causa anotada = 0 |
| Prova de banco local depende do sandbox e recria o container do dono | pedido 101, entradas 10:00, 10:06 e 10:09 (DECISÃO DO DONO) | projeto, já em K-301 | só dado; a regra do dono já vale |
| K-275 sem linhas no `historico.md`, cycle time não medido pela sexta retrospectiva | `docs/kanban/historico.md` (nenhuma linha de K-275); retrospectivas 065, 067, 068, 071 | projeto | Jarvis grava `forge-check movimento` nas colunas de K-275; medida: cartões da release com >= 4 linhas |

Provas deste registro: números vêm de `git`, `gh pr view 360`, `gh pr view 361` e do Histórico do pedido citado acima; o que não tem comando está marcado "não medido".
