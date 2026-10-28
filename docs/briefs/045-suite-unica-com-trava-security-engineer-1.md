Agente destino: forge:security-engineer
Pedido: 045-suite-unica-com-trava
Tipo: codigo
Branch: feature/045-suite-unica   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: seguranca

## Objetivo
Etapa E1.3 do pedido 045 (cartão K-163): parecer de segurança dos scripts da trava de suíte única (commit b03159ce0f7795da5686c29ce6f72403c8fb17fd), em paralelo ao code review. O gatilho é um script de shell que cria arquivo em `/tmp`, compartilhado entre worktrees. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-045`.

## Ler
- O diff citado em Decisões e restrições (4 arquivos).
- `docs/pedidos/045-suite-unica-com-trava.md`, seção Escopo (E3).

## Entregar
- (E1.3, E3) Parecer de segurança, estático: arquivo de trava em `/tmp` (link simbólico, dono e permissão, condição de corrida na criação), citação de variáveis e argumentos no shell, repasse do comando recebido e a variável de não aninhar. Grave em `docs/security/045-suite-unica.md`, com veredito e seção `## Achados` (bloqueante ou recomendado, `arquivo:linha` e destino). Sem commit: o arquivo fica na worktree, e o tech-lead faz o commit no E1.5.
- (E1, E2) Nada a entregar aqui: não nesta delegação (já entregues no E1.1).

## Fora do escopo
- "E1.1 (forge:node-backend): a trava nos scripts (E1) e a documentação (E2), na branch `feature/045-suite-unica`, com os testes do script." · etapa de outra delegação; já entregue (b03159ce0f7795da5686c29ce6f72403c8fb17fd)
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:qa-engineer): parecer de QA: duas suítes disparadas juntas em worktrees diferentes rodam uma depois da outra, e o `pronto` sozinho continua verde." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): PR para a develop e merge (só o merge; a limpeza da branch fica numa delegação própria, MELHORIA da retro do 041)." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Editar os scripts, o `package.json` ou a documentação (ajuste volta ao autor); o arquivo `docs/reviews/045-suite-unica.md` (é do E1.2, em paralelo); commit e push; rodar o `pronto` ou outra suíte; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0003: orçamento de performance; nada a decidir aqui.
- Base real da branch: d7c74b46203994362147a3fd3d78ec2db9fc0576 (origin/develop). O commit da entrega é b03159ce0f7795da5686c29ce6f72403c8fb17fd; revise só `git -C /home/rodrigoisensee/MetricasDSPD-045 diff d7c74b46203994362147a3fd3d78ec2db9fc0576 b03159ce0f7795da5686c29ce6f72403c8fb17fd`.
- O hook do Forge barra qualquer comando de Bash com o nome do lançador da trava, e também `$`, crase, chaves e `?`: leia os scripts com Read e rode o teste só por `bash scripts/suite-unica.test.sh`. Se `pnpm` ou `node` faltarem no PATH, use `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin/`.
- R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-045/docs/security/045-suite-unica.md`
- PQ-2 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD-045/docs/security/045-suite-unica.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real: veredito e achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
