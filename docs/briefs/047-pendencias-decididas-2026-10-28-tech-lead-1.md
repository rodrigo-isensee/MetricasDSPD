Agente destino: forge:tech-lead
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: review
Branch: feature/047-select-timeout   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Etapa E1.2 do pedido 047 (cartão K-150): code review do commit b42b2610abf65e6ded9ce8db989ac06f4726aaa2 (o `ESLint` do `server/tests/plataforma2.test.ts` sai do primeiro `it` e é aquecido na coleta do arquivo; teste "reprova: SELECT *" de 447 ms para 7 ms; `pronto` rc=0). Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-047a`, head b42b2610abf65e6ded9ce8db989ac06f4726aaa2, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-047a diff 4137981e5333bee5b69f3c515b26c64d3a0b71c0 b42b2610abf65e6ded9ce8db989ac06f4726aaa2` (6 linhas em um arquivo).
- `docs/engineering/praticas.md`, só a seção de testes e a de commits.

## Entregar
- (E1.2, E1) Code review (R-REVIEW): a correção mantém a asserção "reprova: SELECT *" com o mesmo efeito, não aumenta timeout, não usa retry e o aquecimento na coleta não esconde falha (lint de aquecimento que lança derruba o arquivo, não passa calado). Rode só os testes do arquivo alterado, uma vez. Grave o parecer em `docs/reviews/047-select-timeout.md` pela ferramenta Write, com `commit: b42b2610abf65e6ded9ce8db989ac06f4726aaa2`, veredito e seção `## Achados` (bloqueante ou recomendado, `arquivo:linha` e destino).
- (E1.2) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-150` e `git add` explícito por caminho; push sem `--force`, sem PR.
- (E2, E3, E4) Nada a entregar aqui: não nesta delegação (E2.1, E3.1 e E4.1, em outras delegações).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue (b42b2610abf65e6ded9ce8db989ac06f4726aaa2)
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Corrigir o código (achado volta ao node-backend); o `pronto` ou a suíte inteira; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- NÃO tocar: o código e os testes; as outras worktrees; o `.env`.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- A trava de suíte única (PR #156) serializa as suítes entre worktrees: se a sua execução esperar a trava, espere, sem matar processo. Se `pnpm` faltar no PATH, use `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin/`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: b42b2610abf65e6ded9ce8db989ac06f4726aaa2' /home/rodrigoisensee/MetricasDSPD-047a/docs/reviews/047-select-timeout.md` · espera: igual '2'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047a diff --name-only b42b2610abf65e6ded9ce8db989ac06f4726aaa2 HEAD` · espera: igual 'docs/reviews/047-select-timeout.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-047a ls-remote origin refs/heads/feature/047-select-timeout` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-047a rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito e achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
