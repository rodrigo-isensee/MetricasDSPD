Agente destino: forge:tech-lead
Pedido: 045-suite-unica-com-trava
Tipo: codigo
Branch: feature/045-suite-unica   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: review

## Objetivo
Etapa E1.2 do pedido 045 (cartão K-163), fechamento: commit e push dos pareceres de review e de segurança, que estão sem commit na worktree `/home/rodrigoisensee/MetricasDSPD-045`, para que o QA (E1.4) parta de pareceres registrados na branch (R-REVIEW antes do R-QA). Trabalhe só nessa worktree.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-045 status --porcelain` (deve listar só os dois pareceres).
- `docs/engineering/praticas.md` da worktree, só a seção de commits.

## Entregar
- (E1.2) Um commit com `docs/reviews/045-suite-unica.md` e `docs/security/045-suite-unica.md`, sem editar o conteúdo, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-163` e o security-engineer citado como autor do parecer de segurança no corpo; `git add` explícito por caminho. Push da branch, sem `--force`.
- (E1, E2, E3) Nada a entregar aqui: não nesta delegação (já entregues no E1.1 e no E1.3).

## Fora do escopo
- "E1.1 (forge:node-backend): a trava nos scripts (E1) e a documentação (E2), na branch `feature/045-suite-unica`, com os testes do script." · etapa de outra delegação; já entregue (b03159ce0f7795da5686c29ce6f72403c8fb17fd)
- "E1.3 (forge:security-engineer): parecer de segurança dos scripts (E3), junto com o code review." · etapa de outra delegação; já entregue (aprovado, sem bloqueante; parecer sem commit)
- "E1.4 (forge:qa-engineer): parecer de QA: duas suítes disparadas juntas em worktrees diferentes rodam uma depois da outra, e o `pronto` sozinho continua verde." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): PR para a develop e merge (só o merge; a limpeza da branch fica numa delegação própria, MELHORIA da retro do 041)." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Editar os pareceres, os scripts, o `package.json` ou a documentação; rodar o `pronto` ou outra suíte (este commit só leva pareceres e não é o commit final: o `pronto` completo roda no QA, E1.4, e antes do commit final do E1.5); o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0003: orçamento de performance; nada a decidir aqui.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:41, Histórico do pedido): substitui a de 11:31; os pareceres de review e de segurança são commitados e enviados no fechamento do E1.2, antes do QA, sem `pronto`, porque não é o commit final. O `pronto` completo roda no QA (E1.4) e antes do commit final do E1.5.
- Base real da branch: d7c74b46203994362147a3fd3d78ec2db9fc0576 (origin/develop). O commit da entrega é b03159ce0f7795da5686c29ce6f72403c8fb17fd.
- O hook do Forge barra qualquer comando de Bash com o nome do lançador da trava, e também `$`, crase, chaves e `?`: escreva comandos literais, um por linha. Se `pnpm` ou `node` faltarem no PATH, use `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin/`.
- R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-045 status --porcelain` · espera: linhas=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-045 diff --name-only b03159ce0f7795da5686c29ce6f72403c8fb17fd HEAD` · espera: linhas=2
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-045 ls-remote origin refs/heads/feature/045-suite-unica` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-045 rev-parse HEAD`
- PQ-4 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-045 rev-parse HEAD` · espera: o sha40 do commit dos pareceres

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
