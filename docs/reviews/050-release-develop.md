---
tipo: review
contrato: 1
pedido: 050-release-develop
branch: docs/promocao-2026-10-29
commit: 311691bace0582d80ea06ffc12f20096f1248b87
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-29
---

# Review da promoção develop para homolog (pedido 050, etapa E1.0)

Candidata: `develop` em `311691bace0582d80ea06ffc12f20096f1248b87`. Critério: `docs/engineering/fluxo-homologacao.md` §4. Este parecer confere que cada um dos 20 PRs de `origin/homolog..origin/develop` (#145 a #164) tem review aprovado e resume o que entra, os riscos e o rollback. Não relê código já revisado nem roda suíte (regra 5 da economia de tokens). Os pareceres de QA, devops e segurança da promoção saem em `docs/qa/`, `docs/devops/` e `docs/security/` com o nome `050-release-develop.md`.

## Achados
(nenhum)

## PR x review
Head revisado é o `commit` do frontmatter do parecer. Onde o head do PR é posterior, conferi que o revisado é ancestral do head do PR e que o delta fora de `docs/` é só merge da `develop` (código já revisado em outro PR da tabela) ou nada.

| PR | O que entra na homolog | Review (arquivo, head revisado) | Veredito |
|---|---|---|---|
| #164 | Contrato da O23 sem lacunas, regras decididas pelo dono (K-180) | `docs/reviews/051-o23-regras.md` (38bbb94) | aprovado |
| #163 | Página de contrato da O23 (K-180, K-093), só documentação | `docs/reviews/048-ajustes-back.md` (95aa669; delta até o head do PR: só o próprio parecer) | aprovado |
| #162 | Registro da versão 0.30.5 do Forge (`.forge/versao`) | `docs/reviews/049-forge-0-30-5.md` (5d7c199); a linha de registro foi lida por este parecer | aprovado |
| #161 | Cadastro de membros em mock e T14 sem agregado dedutível (K-112, K-130) | `docs/reviews/048-t14-desenho.md` (230b4e9) | aprovado |
| #160 | Política do Dependabot nas práticas (K-169), documentação | `docs/reviews/047-dependabot.md` (6983dd8) | aprovado |
| #159 | E2E do portão da homolog em 2 partes com agregador (K-144, K-172) | `docs/reviews/047-portao-e2e.md` (359cec1; delta: merge da `develop` com #157, mais o teste do #158) | aprovado |
| #158 | Correção do teste `SELECT *` que estourava 30 s (K-150) | `docs/reviews/047-select-timeout.md` (1ea0a96; delta até o head do PR: só pareceres) | aprovado |
| #157 | CLAUDE.md: "enviada" lido como PR para a `develop` (K-162) | `docs/reviews/026-claude-md-enviada.md` (d4ba797; delta: merge do #158) | aprovado |
| #156 | Trava de suíte única comum a todas as worktrees | `docs/reviews/045-suite-unica.md` (b03159c) | aprovado |
| #155 | Textos da especificação do lote 3 das métricas também disponíveis (K-154), documentação | `docs/reviews/026-textos-lote3.md` (f61fae8) | aprovado |
| #154 | E2E da CI dividida em 2 partes dentro do teto de 30 min | `docs/reviews/044-e2e-em-partes.md` (19549b9) | aprovado |
| #153 | `homolog-aprovada` sem espera paga e reavaliação por `workflow_run` (041, K-108) | `docs/reviews/041-homolog-aprovada.md` (a411f9f; delta: merge do #154) | aprovado |
| #152 | Métricas operacionais do lote 3 (O19 a O26) no painel Operacional | `docs/reviews/026-lote3-operacionais.md` (172d008; delta: merges do #151, #153 e #154) | aprovado |
| #151 | Atualização do Forge para 0.30.3 | `docs/reviews/042-forge-0-30-3.md` (2a4a200; delta: merges do #153 e #154) | aprovado |
| #150 | Estabilização dos testes do 041 (F4, helper único, Monte Carlo, CLS) | `docs/reviews/041-estabilidade.md` (c61b6c1) | aprovado |
| #149 | Devolve o verde à `develop` após o Dependabot (K-151) | `docs/reviews/151-develop-verde.md` (0ece31d; delta: merges da `develop`) | aprovado |
| #148 | Proteção da `develop` pelo ruleset 25003880 com 9 checks (K-148), documentação | `docs/reviews/042-protecao-develop-r2.md` (d2c21ef; a r1 reprovada foi resolvida na r2) | aprovado |
| #147 | Dependabot: `react-router` 7.18.4 para 8.5.0 (`web/package.json` e lockfile) | sem parecer próprio; diff lido por este parecer (salto de major, ver riscos) | aprovado |
| #146 | Dependabot: `@tanstack/react-query` 5.104.2 para 5.104.5 | sem parecer próprio; diff lido por este parecer (patch) | aprovado |
| #145 | Dependabot: `typescript-eslint` 8.71.2 para 8.72.0 (raiz e `server`) | sem parecer próprio; diff lido por este parecer (minor) | aprovado |

Nada de segurança novo identificado no diff dos PRs; o parecer de segurança da promoção é próprio (E1.4). As regras invioláveis (sem métrica individual, sem mistura BusinessMap e Acelerato, sem dado de pessoa) foram conferidas nos reviews de #152 e #161.

## Riscos
- **`react-router` 8.5.0 (#147), salto de major.** O #149 (K-151) devolveu o verde da `develop` depois dos três Dependabot; o QA dele aprova. Risco residual: regressão de roteamento só visível nos E2E do portão; check vermelho não se contorna.
- **Workflows de CI mudaram bastante** (#153, #154, #159: E2E em 2 partes com agregador, `homolog-aprovada` e `homolog-reavalia`). O portão da homolog roda essas versões pela primeira vez; o parecer do devops (E1.3) cobre. Falha de workflow na primeira rodada é provável o suficiente para reservar tempo de ajuste, vira correção em cartão e não afrouxamento do critério.
- **T14 com contrato incompatível (#161, K-130):** o `total` e as bases somam só os visíveis, e o bloco oculto passa a ser união por `oculto`. Aceito pelo dono (T14-M1 = B e Q-T14-12 = B, sem consumidor publicado); entra como mudança de critério de cálculo no CHANGELOG.
- **CLS e instabilidade E2E herdados** (K-133, K-132): seguem como pendências aceitas pelo dono; podem aparecer como falha intermitente. Reexecução só com autorização de custo (R-CUSTO).
- Sem migração de banco nem mudança de coleta nesta promoção (critério 3 do §4 não se aplica). As branches do 048 em andamento e o K-178 ficam fora.

## Rollback
Pelo §9 do fluxo: cada promoção é um merge commit único; reverter é `git revert -m 1 <merge da promoção>` por PR (para `develop`, depois `homolog`), nunca reset nem force. Sem migração, não há reversão de esquema nem de dado. Reversão parcial é possível por PR, porque cada um entrou como squash único: #152 (painel O19 a O26), #161 (T14) e #147 (`react-router`) são os mais prováveis. Atenção: o #153 e o #154 se apoiam (o `ci.yml` de um depende do outro), então se revertem juntos.

## Parecer
Aprovado. Os 20 PRs têm review aprovado (ou diff lido, no caso dos três Dependabot e do registro do Forge). Segue para a versão `0.2.0` e o CHANGELOG (E2), depois para os pareceres de QA, devops e segurança, e então para o PR `docs/promocao-2026-10-29` na `develop` e o PR `develop` para `homolog`.
