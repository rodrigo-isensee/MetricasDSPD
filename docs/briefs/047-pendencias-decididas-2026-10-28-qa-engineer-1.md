Agente destino: forge:qa-engineer
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: qa
Branch: feature/047-select-timeout   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: qa

## Objetivo
Etapa E1.3 do pedido 047 (cartão K-150): parecer de QA (R-QA) da correção do teste "reprova: SELECT *" (commit b42b2610abf65e6ded9ce8db989ac06f4726aaa2, review aprovado em 9a973696a83247cb8278a7eb4ddf8a7a58b84ded), antes do PR. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-047a`, head 9a973696a83247cb8278a7eb4ddf8a7a58b84ded, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-047a diff 4137981e5333bee5b69f3c515b26c64d3a0b71c0 b42b2610abf65e6ded9ce8db989ac06f4726aaa2` (um arquivo).
- O parecer de review `docs/reviews/047-select-timeout.md`, só o `## Achados`.

## Entregar
- (E1.3, E1) QA da correção: rode `server/tests/plataforma2.test.ts` uma vez sozinho e confira que o teste "reprova: SELECT *" passa com o tempo do próprio teste abaixo de 1 s; confira que um lint de aquecimento que falha derruba o arquivo (falha visível), por leitura do código, sem alterar o teste. Grave o parecer em `docs/qa/047-select-timeout.md` pela ferramenta Write, com `commit: 9a973696a83247cb8278a7eb4ddf8a7a58b84ded`, veredito, os tempos medidos e seção `## Achados` (bloqueante ou recomendado, `arquivo:linha` e destino).
- (E1.3) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-150` e `git add` explícito por caminho; push sem `--force`, sem PR.
- (E2, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue (b42b2610abf65e6ded9ce8db989ac06f4726aaa2)
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; já entregue (9a973696a83247cb8278a7eb4ddf8a7a58b84ded, aprovado)
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; já entregue (455d3604356085eb0caf3ce11dbd7659b6b8b515)
- "E2.2 (forge:devops-engineer): divisão da E2E do portão da homolog em 2 partes (E5), na mesma branch `docs/047-portao-e2e`, com o parecer atualizado." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:tech-lead): code review do E2.1 e do E2.2." · etapa de outra delegação; continua no pedido
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; continua no pedido
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; continua no pedido
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Alterar código ou teste (achado volta ao node-backend); o `pronto` ou a suíte inteira; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- NÃO tocar: o código e os testes; o parecer de review; as outras worktrees; o `.env`.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- A trava de suíte única (PR #156) serializa as suítes entre worktrees: se a execução esperar a trava, espere, sem matar processo. `pnpm` sem `node` no PATH: `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/bin:/bin pnpm ...`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: 9a973696a83247cb8278a7eb4ddf8a7a58b84ded' /home/rodrigoisensee/MetricasDSPD-047a/docs/qa/047-select-timeout.md` · espera: igual '2'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047a diff --name-only 9a973696a83247cb8278a7eb4ddf8a7a58b84ded HEAD` · espera: igual 'docs/qa/047-select-timeout.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-047a ls-remote origin refs/heads/feature/047-select-timeout` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-047a rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito, tempos medidos e achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
