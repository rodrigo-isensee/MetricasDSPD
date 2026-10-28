Agente destino: forge:node-backend
Pedido: 045-suite-unica-com-trava
Tipo: codigo
Branch: feature/045-suite-unica   Base: develop   Base-sha: d55db80a87e82ca58aa25e309395d2a2e4590c95
Etapa: codigo

## Objetivo
Etapa E1.1 do pedido 045 (cartão K-163): fazer a própria suíte garantir a regra do dono "uma suíte de teste por vez", com uma trava `flock` comum a todas as worktrees, em vez de cada agente checar com `pgrep` (houve corrida em 2026-10-27 19:14, que custou uma rodada do `pronto`). Crie a worktree `/home/rodrigoisensee/MetricasDSPD-045` com a branch nova `feature/045-suite-unica` a partir de `origin/develop` (d55db80a87e82ca58aa25e309395d2a2e4590c95), com `git worktree add -b`, e trabalhe só nela.

## Ler
- `docs/pedidos/045-suite-unica-com-trava.md`, seções Escopo, Fora do escopo e Suposições.
- `package.json` da raiz, bloco `scripts`; `scripts/test-pg.sh`.
- `docs/engineering/praticas.md`, só a seção que descreve como rodar os testes e a de commits.

## Entregar
- (E1.1, E1) Um script de trava (por exemplo `scripts/suite-unica.sh`) que roda o comando recebido sob `flock` em `/tmp/metricas-dspd-suite.lock`. Com a trava ocupada, ele avisa no terminal que espera outra suíte e espera, sem falhar. Ele não aninha: se o processo já segura a trava (variável de ambiente marcada pelo próprio script), roda o comando direto. Os scripts `pronto`, `test`, `test:e2e` e `test:pg` da raiz passam por ele; `e2e` já chama `test:e2e`.
- (E1.1, E1) Teste do script: duas chamadas simultâneas rodam em série, e uma chamada aninhada não trava. Use um teste em shell ou no vitest do pacote que couber; ele não pode depender do banco nem do navegador.
- (E1.1, E2) A seção de como rodar os testes em `docs/engineering/praticas.md` diz que a trava existe, onde fica e como ver quem a segura (`fuser` ou `lsof` no arquivo).
- (E1.1, E1, E2) Commits no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-163`, e `git add` explícito por caminho. Push da branch, sem `--force`. O push antes do QA está liberado pela decisão do dono de 2026-10-27 (pedido 026).
- (E3) Nada a entregar aqui: não nesta delegação (parecer de segurança no E1.3).

## Fora do escopo
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:security-engineer): parecer de segurança dos scripts (E3), junto com o code review." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:qa-engineer): parecer de QA: duas suítes disparadas juntas em worktrees diferentes rodam uma depois da outra, e o `pronto` sozinho continua verde." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): PR para a develop e merge (só o merge; a limpeza da branch fica numa delegação própria, MELHORIA da retro do 041)." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-045-suite-unica.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- O PR; a CI e os workflows (`.github/`); o timeout do `plataforma2.test.ts` (K-150); aumentar timeout de teste ou pôr retry; os scripts dos pacotes `server/`, `web/` e `e2e/`; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- Antes de rodar o `pronto`, confira com `pgrep -af 'vitest|playwright'` que nenhuma outra suíte roda; se roda, espere. A trava ainda não está na develop.
- ADR 0003: orçamento de performance; nada a decidir aqui.
- Sem dependência nova de pacote. O `flock` vem do util-linux; confirme com `command -v flock`.
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` em comando de Bash: escreva comandos literais, um por linha, e scripts com Write.

## Pronto quando
- PQ-1 (cmd): `grep -c 'suite-unica.sh' /home/rodrigoisensee/MetricasDSPD-045/package.json` · espera: igual '4'
- PQ-2 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-045 run pronto` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-045 diff --name-only d55db80a87e82ca58aa25e309395d2a2e4590c95 HEAD` · espera: contém 'package.json'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-045 ls-remote origin refs/heads/feature/045-suite-unica` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-045 rev-parse HEAD`
- PQ-5 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-045 rev-parse HEAD` · espera: o sha40 do último commit da entrega

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o comando do teste do script e a saída dele. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
