---
tipo: qa
contrato: 1
pedido: 050-release-develop
branch: develop
commit: 6aa0ac38c35e8298f50511077527368b53ca08f7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-29
---

# QA da promoção develop para homolog (pedido 050, etapa E1.2)

Propósito: dar o parecer de QA da candidata `develop` (`311691bace0582d80ea06ffc12f20096f1248b87`) à `homolog`, critério de promoção do `docs/engineering/fluxo-homologacao.md` §4, para a release que leva as operacionais O19 a O26 à `main`. Esta etapa é de conferência dos pareceres e da CI: não rodei suíte local (a CI do PR de promoção e o portão da `homolog` rodam a suíte completa, o E2E e o `perf`).

**Parecer: aprovado.** Os 20 PRs de `origin/homolog..origin/develop` (#145 a #164) estão cobertos: 13 têm parecer de QA aprovado, sem bug crítico, alto, médio nem baixo aberto; 7 são isentos de parecer de QA pelo motivo dado na tabela (Dependabot, registro do Forge ou só documentação). A CI do push na `develop` no head `311691b` está `success`. Nenhuma ressalva aberta.

Volta E1.6: a candidata passa a ser o commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`, que sobre a `develop` `311691b` só acrescenta `CHANGELOG.md` e muda o `version` do `package.json` (mais o parecer de review em `docs/reviews/`), sem código; o veredito não muda e não rodei suíte.

## Achados
(nenhum)

## Conteúdo da promoção
`git log --oneline origin/homolog..origin/develop` (20 commits):
- `311691b` docs(contratos): O23 sem lacunas, regras decididas pelo dono (K-180) (#164)
- `739bdbf` docs(contratos): página de contrato da O23 (K-180, K-093) (#163)
- `c292908` chore(forge): registra versão 0.30.5 (K-179) (#162)
- `7c94348` feat(t14): cadastro de membros em mock e T14 sem agregado dedutível (K-112, K-130) (#161)
- `07f43b9` docs(praticas): política do Dependabot, mesclado um por vez com checks verdes (K-169) (#160)
- `be0a8d7` ci(homolog): E2E do portão em 2 partes com agregador (K-144, K-172) (#159)
- `d9a7ea0` docs(claude-md): registrar leitura de 'enviada' como PR para a develop (K-162) (#157)
- `efbc087` test(server): corrige o teste SELECT * que estoura 30 s (K-150) (#158)
- `4137981` docs(ux): textos da especificação do lote 3 das métricas também disponíveis (K-154) (#155)
- `7873c18` feat(engenharia): trava de suíte única comum a todas as worktrees (#156)
- `d7c74b4` feat(web): métricas operacionais do lote 3 (O19 a O26) no painel Operacional (#152)
- `d55db80` chore(forge): atualiza o Forge para a versão 0.30.3 (#151)
- `f138c80` ci(homolog): homolog-aprovada sem espera paga e reavaliação por workflow_run (041, K-108) (#153)
- `53675ec` ci(e2e): divide a E2E da CI em 2 partes dentro do teto de 30 min (#154)
- `9cc84d3` test(e2e): estabilizar os testes do 041 (F4, helper único, Monte Carlo, CLS) (#150)
- `7b5732d` fix(web): devolve o verde à develop após o Dependabot (#149)
- `3bf1b5e` chore(deps-dev): Bump typescript-eslint (#145)
- `4bbfcd3` chore(deps): Bump react-router from 7.18.4 to 8.5.0 (#147)
- `dba3314` chore(deps): Bump @tanstack/react-query (#146)
- `16e2617` docs(homologacao): proteção da develop pelo ruleset 25003880 com 9 checks (K-148) (#148)

## PR x parecer de QA x ressalvas
| PR | Parecer de QA | Veredito, bugs (crít/alto/médio/baixo) | Ressalvas abertas |
|---|---|---|---|
| #145, #146, #147 Dependabot (typescript-eslint, react-query, react-router) | sem parecer por PR: PR de dependência aberto pelo Dependabot, sem código autoral; a regra de tratamento está em `docs/qa/030-prs-do-dependabot-para-develop.md` e o verde foi devolvido pelo #149. Isento pelo R-QA (sem código do time); os checks do PR protegem a `develop` | não se aplica | nenhuma |
| #149 verde da `develop` após o Dependabot | `docs/qa/151-develop-verde.md` (3d648cb) | aprovado, 0/0/0/0 | nenhuma |
| #148 proteção da `develop` (K-148) | sem parecer de QA: só documentação (`fluxo-homologacao.md` e pareceres de review, devops e segurança), sem código nem teste. Isento pelo R-QA | não se aplica | nenhuma |
| #150 estabilizar os testes do 041 | `docs/qa/041-estabilidade.md` (89a0bb2) | aprovado, 0/0/0/0 | nenhuma |
| #153 homolog-aprovada (K-108) | `docs/qa/041-homolog-aprovada.md` (89a0bb2) | aprovado, 0/0/0/0 | nenhuma |
| #154 E2E da CI em 2 partes | `docs/qa/044-e2e-em-partes.md` (ef310bf) | aprovado, 0/0/0/0 | nenhuma |
| #151 Forge 0.30.3 | `docs/qa/042-forge-0-30-3.md` (9a32f8b) | aprovado, 0/0/0/0 | nenhuma |
| #152 métricas operacionais do lote 3 (O19 a O26) | `docs/qa/026-lote3-operacionais.md` (ad30234, reteste) | aprovado, 0/0/0/0 | nenhuma |
| #156 trava de suíte única | `docs/qa/045-suite-unica.md` (b03159c) | aprovado, 0/0/0/0 | nenhuma |
| #155 textos do lote 3 (K-154) | `docs/qa/026-textos-lote3.md` (2a4191a) | aprovado, 0/0/0/0 | nenhuma |
| #157 CLAUDE.md, leitura de "enviada" (K-162) | `docs/qa/026-claude-md-enviada.md` (4c41682) | aprovado, 0/0/0/0 | nenhuma |
| #158 teste SELECT * (K-150) | `docs/qa/047-select-timeout.md` (8aa7684) | aprovado, 0/0/0/0 | nenhuma. A1 recomendado (retries do Playwright) está no parecer do 047-portao-e2e, informativo |
| #159 E2E do portão em 2 partes (K-144, K-172) | `docs/qa/047-portao-e2e.md` (359cec1) | aprovado, 0/0/0/0 | A1 (recomendado, não bloqueante): `retries: CI ? 1 : 0` em `e2e/playwright.config.ts:27`, anterior ao pedido; destino devops-engineer se o dono quiser portão sem retry |
| #160 política do Dependabot (K-169) | sem parecer de QA: só documentação (`praticas.md` e reviews). Isento pelo R-QA | não se aplica | nenhuma |
| #161 T14 em mock e `oculto` (K-112, K-130) | `docs/qa/048-t14-desenho.md` (aae3901) | aprovado, 0/0/0/0 | nenhuma |
| #162 registro do Forge 0.30.5 (K-179) | `docs/qa/049-forge-0-30-5.md` (2b395a8) | aprovado, 0/0/0/0 | nenhuma |
| #163 contrato da O23 (K-180, K-093) | sem parecer de QA: só documentação (`docs/contratos/metricas/` e review). Isento pelo R-QA | não se aplica | nenhuma |
| #164 O23 sem lacunas (K-180) | sem parecer de QA: só documentação (contrato e review). Isento pelo R-QA | não se aplica | nenhuma |

Total de bugs abertos da promoção: 0 crítico, 0 alto, 0 médio, 0 baixo. Pedido do dono (2026-10-29, "suba tudo que estiver pronto na homol"): as branches do 048 em andamento e o K-178 ficam fora e não estão na candidata.

## Critério -> verificação -> resultado
| Critério | Verificação | Fronteira protegida | Resultado |
|---|---|---|---|
| Promoção, item 4: parecer de QA da candidata em `docs/qa/` | este arquivo, sobre `311691b` | candidata sem parecer | passou |
| Cada PR de código incluído tem parecer de QA aprovado | leitura do frontmatter dos 12 pareceres na tabela | PR de código sem QA (R-QA) | passou (os 8 isentos são Dependabot ou só documentação, ver tabela) |
| Nenhum bug crítico, alto ou médio aberto | contagem nos frontmatters: 0/0/0 em todos | defeito grave aberto na promoção | passou |
| Ressalvas listadas | tabela acima: só a recomendação A1 do #159 | pendência sem dono | passou |
| CI do push na `develop` no head `311691b` | `gh run view 40891567526`: headSha 311691bace0582d80ea06ffc12f20096f1248b87, conclusão success, https://github.com/rodrigo-isensee/MetricasDSPD/actions/runs/40891567526 (um run anterior, 40891487617, do mesmo push, foi cancelado por concorrência e não conta) | head sem CI verde | passou |
| Regras invioláveis (sem métrica individual, sem mistura BusinessMap/Acelerato) | herdado dos pareceres de 026 (O19 a O26) e 048 (T14 sem agregado dedutível) | métrica por pessoa, comparação entre times | passou, por herança; não retestado aqui |

## Fora deste parecer
Suíte completa, E2E, `perf` e acessibilidade rodam na CI do PR de promoção e no portão da `homolog`. Review da promoção, versão e tag, e o PR de release para a `main` são do tech-lead; os pareceres de devops e segurança são dos respectivos agentes.
