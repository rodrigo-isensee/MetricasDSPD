Agente destino: forge:security-engineer
Pedido: 045-suite-unica-com-trava
Tipo: codigo
Branch: feature/045-suite-unica   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: seguranca

## Objetivo
Etapa E1.3 do pedido 045 (cartão K-163), registro de autoria. O seu parecer `docs/security/045-suite-unica.md` foi commitado em 8cdb5abf85737f04047350e964e389b64b3fdeab, mas o texto commitado não tem registro de autoria do papel `seguranca` (o `forge-check pr` reprova: "autoria: sem registro de que o papel `seguranca` gravou esta versão", R-SEGURANCA), e sem isso o PR do E1.5 não sai. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-045`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-045/docs/security/045-suite-unica.md`, inteiro (é o seu parecer).

## Entregar
- (E1.3, E3) Regrave o parecer `/home/rodrigoisensee/MetricasDSPD-045/docs/security/045-suite-unica.md` com a ferramenta Write, com o conteúdo idêntico ao atual, byte a byte; a gravação cria o registro de autoria. Se, ao reler, você discordar de algo no texto, não mude: escreva no relatório.
- (E1, E2) Nada a entregar aqui: não nesta delegação (já entregues no E1.1).

## Fora do escopo
- "E1.1 (forge:node-backend): a trava nos scripts (E1) e a documentação (E2), na branch `feature/045-suite-unica`, com os testes do script." · etapa de outra delegação; já entregue (b03159ce0f7795da5686c29ce6f72403c8fb17fd)
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue (8cdb5abf85737f04047350e964e389b64b3fdeab)
- "E1.4 (forge:qa-engineer): parecer de QA: duas suítes disparadas juntas em worktrees diferentes rodam uma depois da outra, e o `pronto` sozinho continua verde." · etapa de outra delegação; já entregue (aprovado; parecer sem commit)
- "E1.5 (forge:tech-lead): PR para a develop e merge (só o merge; a limpeza da branch fica numa delegação própria, MELHORIA da retro do 041)." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Mudar o conteúdo ou o veredito do parecer; editar qualquer outro arquivo (scripts, `package.json`, documentação, os pareceres de review e de QA); commit; push; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0003: orçamento de performance; nada a decidir aqui.
- O sha256 do texto atual (sem espaços nas pontas) é 01074242921770504ce7feaf22f6771bf4f3eb3d22d39aaf1a1ad4e00da64d0c; o registro existente (2c39a98859da5e8de1b25d934887bab25cc7e77df5cfbf7584979d0d57d7572f, 11:35) é de outra versão do texto.

## Pronto quando
- PQ-1 (cmd): `grep -c 01074242921770504ce7feaf22f6771bf4f3eb3d22d39aaf1a1ad4e00da64d0c /home/rodrigoisensee/MetricasDSPD/.forge/run/autoria.jsonl` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-045 diff --name-only` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta (o conferente roda os comandos, você não tem Bash), ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
