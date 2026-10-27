---
tipo: review
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: feature/042-protecao-develop
commit: d2c21ef23b83d551e31f93239535c6bbab479832
parecer: aprovado
revisor: tech-lead
data: 2026-10-27
---

# Code review r2: proteção da develop pelo ruleset 25003880 (042, K-148, E4.3)

**Veredito: aprovado.** O A1 do r1 está resolvido: as seções 4, 5, 12 e 14 agora remetem à seção 15, e o documento passa a descrever uma única proteção da `develop`. A seção 15 descreve o ruleset real, conferido por GET, e lista os nove checks da decisão B. Os recomendados A2 a A4 foram tratados no texto.

## Delta lido

`forge-check delta --parecer docs/reviews/042-protecao-develop-r1.md` (intervalo `90e8dcc..d2c21ef`). Li só o que ele lista em `docs/engineering/fluxo-homologacao.md`: linhas 44, 48, 68, 149, 180-181, 195, 197, 199, 201, 203-208, 210-213, 215 e 217. Também li o diff de `docs/devops/042-protecao-develop.md` entre `a9b3520` e `3efb7b4`. Os commits do `security-engineer` (`3f2afd2`, `d2c21ef`) não são refeitos aqui. Ficou como "já lido" no r1 o resto do documento, a lista de jobs do `ci.yml` e os checks do #142.

## Conferência

- **A1 (bloqueante no r1): resolvido.** Linha 44: a `develop` remete à §15, com os nove checks e sem `perf`. Linha 48: o gate 1 lista os nove. Linha 68: ruleset, PR obrigatório, squash, nove checks e `strict` ligado. Linhas 180-181: a §14 remete à §15 e não traz mais lista própria. A linha 149 (§12) também foi alinhada.
- **Seção 15 contra o ruleset real.** Fiz a leitura por `gh api repos/rodrigo-isensee/MetricasDSPD/rulesets/25003880`, só GET. O ruleset está `enforcement: active` e o alvo é `refs/heads/develop`. As regras são `deletion`, `non_fast_forward`, `pull_request` (0 aprovações, `allowed_merge_methods: ["squash"]`) e `required_status_checks` (`strict_required_status_checks_policy: true`, com `rapida`, `testes`, `build` e `e2e`). O bypass é o `RepositoryRole` 5 (administrador), em modo `pull_request`. A linha 201 bate com tudo isso. As linhas 203 e 210-213 listam os nove checks da decisão B e os cinco que faltam. O PUT na proteção clássica saiu.
- **A2: tratado.** A linha 205 registra que é um risco não provado, e a linha 215 põe a prova na conferência depois da aplicação (o merge bloqueado com o `e2e` do PR em curso).
- **A3: tratado.** A linha 204 e o parecer de devops dizem que o `skipping` do `banco` vale só para o run de PR.
- **A4: tratado.** A linha 206 diz que o `seguranca` continua informativo e que torná-lo bloqueante é decisão do dono.
- **Parecer de devops.** O campo `commit` foi para `a9b3520` e o texto acompanha a decisão B. O rollback agora é feito pelas Settings do ruleset.

## Regras de ferramenta

`forge-check docs`: nada sobre os arquivos do delta. Ele acusa o formato do bloco `## Achados` do r1, que é deste revisor (achados com mais de 300 caracteres). O r2 o substitui. O teto M14 não se aplica: há 0 linhas de código ou teste, porque a branch só tem `.md` (`git diff --numstat --no-renames e342a2c...HEAD`). Pela `R-QA`, a entrega está isenta de QA: é só documentação, fora do controle. Pareceres de segurança: `docs/security/042-protecao-develop.md` e `docs/security/042-protecao-develop-r2.md`, ambos aprovados e não refeitos aqui.

## Achados

- A5 (recomendado) docs/engineering/fluxo-homologacao.md:207 · O GET do ruleset devolve `current_user_can_bypass: pull_requests_only`. O token do `gh` usado pelos agentes tem papel de administrador e pode mesclar sem os checks. Vale trocar "confirmar" por esse fato e abrir um cartão para o security-engineer.
