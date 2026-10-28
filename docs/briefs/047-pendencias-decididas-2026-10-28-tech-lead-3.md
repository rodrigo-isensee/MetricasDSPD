Agente destino: forge:tech-lead
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: review
Branch: docs/047-portao-e2e   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Etapa E2.3 do pedido 047 (cartões K-144 e K-172): code review (R-REVIEW) do parecer de devops do E2.1 e da divisão da E2E do portão da homolog em 2 partes do E2.2, antes do QA. Worktree `/home/rodrigoisensee/MetricasDSPD-047b`, head 359cec16e357eab59e6e2c28a52a5e454c3e5d20, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-047b diff 4137981e5333bee5b69f3c515b26c64d3a0b71c0 359cec16e357eab59e6e2c28a52a5e454c3e5d20` (dois arquivos: `.github/workflows/homolog.yml` e `docs/devops/047-portao-e2e.md`).
- `.github/workflows/ci.yml`, só as linhas 189 a 253 (a divisão do #154, referência).

## Entregar
- (E2.3, E2, E5) Review do `homolog.yml` (matriz de 2 partes, agregador de id `e2e` que o `portao` consome, falha quando uma parte não é `success`, sem timeout maior e sem retry) e do parecer de devops. O devops relatou que o topo do parecer ainda diz "sem mudança de workflow" depois do E2.2: avalie como achado. Grave o parecer em `docs/reviews/047-portao-e2e.md` pela ferramenta Write, com `commit: 359cec16e357eab59e6e2c28a52a5e454c3e5d20`, veredito e seção `## Achados` (uma linha por achado: bloqueante ou recomendado, `arquivo:linha` e destino).
- (E2.3) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-172` e `git add` explícito por caminho; push sem `--force`, sem PR. O security-engineer grava o parecer dele na mesma branch ao mesmo tempo: se o push for recusado porque a branch andou, `git pull --rebase` e push de novo, sem `--force`.
- (E1, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue (b42b2610abf65e6ded9ce8db989ac06f4726aaa2)
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; já entregue (9a973696a83247cb8278a7eb4ddf8a7a58b84ded, aprovado)
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; já entregue (c9ad9777bbb47ad08d52671a5eba6e1134ba77f3, aprovado)
- "E1.5 (forge:qa-engineer): corrigir o campo `pedido:` do parecer `docs/qa/047-select-timeout.md` (está `047-select-timeout`; o certo é `047-pendencias-decididas-2026-10-28`), que o `forge-check pr` não acha." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:tech-lead): tirar do bloco `## Achados` do parecer `docs/reviews/047-select-timeout.md` a linha solta "Sem achado bloqueante...", fora do formato do `forge-check pr`, junto com o E1.4." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; já entregue (455d3604356085eb0caf3ce11dbd7659b6b8b515)
- "E2.2 (forge:devops-engineer): divisão da E2E do portão da homolog em 2 partes (E5), na mesma branch `docs/047-portao-e2e`, com o parecer atualizado." · etapa de outra delegação; já entregue (359cec16e357eab59e6e2c28a52a5e454c3e5d20)
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; continua no pedido
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; continua no pedido
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Alterar o workflow ou o parecer de devops (achado volta ao devops); disparar workflow; a suíte local; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- NÃO tocar: o `homolog.yml`, o `ci.yml` e o parecer de devops; `EXIGIR_NOTURNA`, variáveis, segredos e proteção de branch; as outras worktrees; o `.env`.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 359cec16e357eab59e6e2c28a52a5e454c3e5d20' /home/rodrigoisensee/MetricasDSPD-047b/docs/reviews/047-portao-e2e.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047b log --format=%H -1 -- docs/reviews/047-portao-e2e.md` · espera: linhas=1
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-047b ls-remote origin refs/heads/docs/047-portao-e2e` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-047b rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito e achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
