Agente destino: forge:tech-lead
Pedido: 045-suite-unica-com-trava
Tipo: codigo
Branch: feature/045-suite-unica   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: merge-integracao

## Objetivo
Etapa E1.5 do pedido 045 (cartão K-163): fechar a branch e levá-la à develop. O QA (E1.4) aprovou sem bloqueante; o parecer está sem commit na worktree `/home/rodrigoisensee/MetricasDSPD-045`. Ajuste a forma do parecer de review, commite os dois pareceres, rode o `pronto`, abra o PR para a develop e faça o merge com os checks verdes. Trabalhe só nessa worktree.

## Ler
- `docs/qa/045-suite-unica.md` da worktree, só o veredito e a seção `## Achados`.
- `docs/reviews/045-suite-unica.md` da worktree, seção `## Achados`.
- No `R-REVIEW` do Forge (`/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/docs/regras/R-REVIEW.md`), só o formato da linha de achado e o registro de autoria.
- `docs/engineering/praticas.md` da worktree, só a seção de commits e a de pull request.

## Entregar
- (E1.5) No parecer de review `docs/reviews/045-suite-unica.md`, só a forma, que o `forge-check` apontou: o achado A1 em uma linha de até 300 caracteres (o detalhe pode ficar fora do bloco `## Achados`), a linha "Nenhum bloqueante." no formato do `R-REVIEW` e o registro de autoria que o `R-REVIEW` pede. O conteúdo dos achados e o veredito (aprovado) não mudam.
- (E1.5) Um commit com `docs/qa/045-suite-unica.md` (sem editar o conteúdo; o qa-engineer citado como autor no corpo) e `docs/reviews/045-suite-unica.md`, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-163`; `git add` explícito por caminho. Antes do commit, o `pnpm run pronto` completo (é o commit final da branch). Push sem `--force`.
- (E1.5) PR da `feature/045-suite-unica` para a `develop` (squash), com o título no padrão do projeto, o resumo da trava e o link dos três pareceres (review, segurança e QA) no corpo. Merge depois de todos os checks exigidos pela proteção da develop ficarem verdes; sem `--admin`. Se um check falhar, não re-execute: pare e relate o check e o motivo.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (já entregues no E1.1 e no E1.3).

## Fora do escopo
- "E1.1 (forge:node-backend): a trava nos scripts (E1) e a documentação (E2), na branch `feature/045-suite-unica`, com os testes do script." · etapa de outra delegação; já entregue (b03159ce0f7795da5686c29ce6f72403c8fb17fd)
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue (8cdb5abf85737f04047350e964e389b64b3fdeab)
- "E1.3 (forge:security-engineer): parecer de segurança dos scripts (E3), junto com o code review." · etapa de outra delegação; já entregue (8cdb5abf85737f04047350e964e389b64b3fdeab; autoria registrada no brief security-engineer-2)
- "E1.4 (forge:qa-engineer): parecer de QA: duas suítes disparadas juntas em worktrees diferentes rodam uma depois da outra, e o `pronto` sozinho continua verde." · etapa de outra delegação; já entregue (aprovado; parecer sem commit, o commit é deste brief)
- "E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Os achados recomendados do QA (A1 órfão segurando a trava, A2 espera sem teto, A3 o `pronto` não roda o e2e): não se corrigem aqui. Editar os scripts, o `package.json`, a documentação ou o parecer de segurança; rodar a `test:e2e` (o QA já rodou: 746 passed); apagar a branch ou a worktree depois do merge (delegação própria, MELHORIA da retro do 041); o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0003: orçamento de performance; nada a decidir aqui.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:41, Histórico do pedido): os pareceres de review e de segurança foram commitados no E1.2 sem `pronto`; o `pronto` completo roda no QA (E1.4) e antes do commit final do E1.5.
- A trava da própria branch serializa as suítes: outra worktree pode estar rodando o `pronto` (pedido 026); se o seu `pronto` esperar a trava, espere, sem matar processo.
- O hook do Forge barra qualquer comando de Bash com o nome do lançador da trava, e também `$`, crase, chaves e `?`: escreva comandos literais, um por linha. Se `pnpm` ou `node` faltarem no PATH, use `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin/`.
- A `main` é do usuário: o PR é só para a `develop`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-045 status --porcelain` · espera: linhas=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-045 diff --name-only 8cdb5abf85737f04047350e964e389b64b3fdeab HEAD` · espera: linhas=2
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-045 run pronto` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-045 ls-remote origin refs/heads/feature/045-suite-unica` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-045 rev-parse HEAD`
- PQ-5 (pr): `gh pr view feature/045-suite-unica --json number,baseRefName,state` com `baseRefName` igual a `develop`
- PQ-6 (merge): `gh pr view feature/045-suite-unica --json state,mergeCommit` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
