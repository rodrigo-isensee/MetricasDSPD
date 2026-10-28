Agente destino: forge:qa-engineer
Pedido: 045-suite-unica-com-trava
Tipo: codigo
Branch: feature/045-suite-unica   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: qa

## Objetivo
Etapa E1.4 do pedido 045 (cartão K-163): parecer de QA da trava de suíte única (commit b03159ce0f7795da5686c29ce6f72403c8fb17fd), depois do review e da segurança aprovados (R-QA). Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-045`.

## Ler
- O diff citado em Decisões e restrições (4 arquivos).
- `docs/pedidos/045-suite-unica-com-trava.md`, seções Escopo e Suposições.
- Na worktree, `docs/reviews/045-suite-unica.md` e `docs/security/045-suite-unica.md`, só a seção `## Achados` de cada um.

## Entregar
- (E1.4, E1) Teste de aceitação: dispare `pnpm run test` em duas worktrees ao mesmo tempo (a `-045` e uma cópia temporária criada por você com `git worktree add --detach` em b03159ce0f7795da5686c29ce6f72403c8fb17fd, removida no fim com `git worktree remove`) e mostre pela saída e pelos horários que a segunda esperou a primeira, com o aviso de espera. Depois rode o `pronto` sozinho na `-045` e mostre o rc. Depois do `test:e2e` (parte do `pronto`), confira que nenhum processo segura `/tmp/metricas-dspd-suite.lock` (A1 do review), com `fuser` no arquivo.
- (E1.4) Grave o parecer em `docs/qa/045-suite-unica.md`, com veredito, os comandos e as saídas, e a seção `## Achados` (bloqueante ou recomendado, `arquivo:linha` e destino). Sem commit: o commit do parecer de QA sai no E1.5.
- (E2, E3) Nada a entregar aqui: não nesta delegação (já entregues no E1.1 e no E1.3).

## Fora do escopo
- "E1.1 (forge:node-backend): a trava nos scripts (E1) e a documentação (E2), na branch `feature/045-suite-unica`, com os testes do script." · etapa de outra delegação; já entregue (b03159ce0f7795da5686c29ce6f72403c8fb17fd)
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue (aprovado, sem bloqueante; pareceres em 8cdb5abf85737f04047350e964e389b64b3fdeab)
- "E1.3 (forge:security-engineer): parecer de segurança dos scripts (E3), junto com o code review." · etapa de outra delegação; já entregue
- "E1.5 (forge:tech-lead): PR para a develop e merge (só o merge; a limpeza da branch fica numa delegação própria, MELHORIA da retro do 041)." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Editar os scripts, o `package.json` ou a documentação (defeito volta ao autor); os pareceres de review e de segurança; commit e push; o PR; o quadro e o arquivo do pedido; as outras worktrees além da cópia temporária; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0003: orçamento de performance; nada a decidir aqui.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:41, Histórico do pedido): os pareceres de review e de segurança são commitados e enviados no fechamento do E1.2, antes do QA; o `pronto` completo roda no QA (E1.4) e antes do commit final do E1.5.
- Base real da branch: d7c74b46203994362147a3fd3d78ec2db9fc0576 (origin/develop). O commit da entrega é b03159ce0f7795da5686c29ce6f72403c8fb17fd; revise só `git -C /home/rodrigoisensee/MetricasDSPD-045 diff d7c74b46203994362147a3fd3d78ec2db9fc0576 b03159ce0f7795da5686c29ce6f72403c8fb17fd`.
- O hook do Forge barra qualquer comando de Bash com o nome do lançador da trava, e também `$`, crase, chaves e `?`: leia os scripts com Read e rode os scripts só por `pnpm run` ou `bash scripts/...`. As duas suítes simultâneas desta etapa são o próprio teste da trava; fora delas, uma suíte por vez: antes de começar, confira com `pgrep -af 'vitest|playwright'` que nenhuma outra roda e, se roda, espere. Se `pnpm` ou `node` faltarem no PATH, use `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin/`.
- R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-045/docs/qa/045-suite-unica.md`
- PQ-2 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD-045/docs/qa/045-suite-unica.md` · espera: igual '1'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list` · espera: contém 'MetricasDSPD-045'

## Relatório
Até 8 linhas, resultado real: veredito e achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
