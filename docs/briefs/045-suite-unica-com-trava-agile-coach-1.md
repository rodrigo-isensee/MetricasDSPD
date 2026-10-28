Agente destino: forge:agile-coach
Pedido: 045-suite-unica-com-trava
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo

## Objetivo
Retrospectiva do pedido 045 (uma suíte de teste por vez, com trava `flock`; cartão K-163), etapa E1.6. O pedido foi aberto em 2026-10-28 às 11:15 a partir de uma MELHORIA da retro do 041 e fechou com o PR #156 mesclado na develop às 13:36; no caminho houve parecer de segurança sem registro de autoria (regravado), parecer de QA sem commit e brief do PR reprovado na rodada 1. O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (do Jarvis); não troque de branch. Outros agentes podem commitar nesta branch ao mesmo tempo: se o `git commit` acusar `index.lock`, espere alguns segundos e tente de novo.

## Ler
- `docs/pedidos/045-suite-unica-com-trava.md` inteiro.
- `docs/kanban/historico.md`, linhas do cartão K-163.
- `docs/kanban/conferencias.md`, linhas do 045.
- `docs/retrospectivas/2026-10-28-026-lote3.md`, só como modelo de forma e para não repetir as MELHORIAs que já viraram cartão.

## Entregar
- (E1.6) Retrospectiva em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, gravada só com Write ou Edit (nenhum `sed` nem `echo` no arquivo): o que foi bem, o que custou tempo (com a hora de cada evento tirada do Histórico do pedido e do historico.md), rodadas e reprovações de brief e de entrega agregadas por classe de causa (de `conferencias.md`), e linhas `MELHORIA:` (uma por linha, com problema, evidência por data e arquivo, medida do efeito e se vale para o Forge ou só para o projeto). Avalie pelo menos: a autoria do parecer de segurança (regravação às 12:39); o parecer de QA sem commit até o E1.5; o segundo commit do PR só de autoria do review; se a trava já evitou suíte em paralelo depois do merge. Melhoria que já tem cartão aberto (K-164, K-172 a K-174) entra citando o cartão, sem linha `MELHORIA:` nova.
- (E1.6) Um commit só da retrospectiva, `git add` explícito por caminho, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-163`; sem push.
- (E1, E2, E3) Nada a entregar aqui: as etapas E1.1 a E1.5 já foram entregues e mescladas (PR #156).

## Fora do escopo
- "E1.1 (forge:node-backend): a trava nos scripts (E1) e a documentação (E2), na branch `feature/045-suite-unica`, com os testes do script." · etapa de outra delegação; já entregue (Histórico do pedido; PR #156 mesclado)
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue (Histórico do pedido; PR #156 mesclado)
- "E1.3 (forge:security-engineer): parecer de segurança dos scripts (E3), junto com o code review." · etapa de outra delegação; já entregue (Histórico do pedido; PR #156 mesclado)
- "E1.4 (forge:qa-engineer): parecer de QA: duas suítes disparadas juntas em worktrees diferentes rodam uma depois da outra, e o `pronto` sozinho continua verde." · etapa de outra delegação; já entregue (Histórico do pedido; PR #156 mesclado)
- "E1.5 (forge:tech-lead): PR para a develop e merge (só o merge; a limpeza da branch fica numa delegação própria, MELHORIA da retro do 041)." · etapa de outra delegação; já entregue (Histórico do pedido; PR #156 mesclado)
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os outros pedidos; push; ler ou editar o `.env`.

## Decisões e restrições
- - DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- - DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- - DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- - DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 3 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- Erro recorrente deste destino (forge-check, 30 dias): implementacao em 2 entregas · evita: rode a suíte inteira e cada prova antes do relatório (R-PROVA)
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md): nenhuma instância de agente (papel seguido de número, como tech-lead-2) no texto.
- Não rode a suíte, o `pronto` nem testes (trava de suíte única; o QA usa a máquina).
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-045-suite-unica.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-045-suite-unica.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-28-045-suite-unica.md` · espera: o sha40 do commit da retrospectiva
- PQ-4 (cmd): `grep -cE '(tech-lead|qa-engineer|react-frontend|node-backend|ux-designer|security-engineer|devops-engineer|agile-coach|software-architect)-[0-9]' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-045-suite-unica.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui as linhas `MELHORIA:` copiadas. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
