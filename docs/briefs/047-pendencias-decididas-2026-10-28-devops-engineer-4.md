Agente destino: forge:devops-engineer
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: codigo
Branch: docs/047-portao-e2e   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E2.8 do pedido 047 (cartões K-144 e K-172): o `forge-check pr` da branch acusa no seu parecer `docs/devops/047-portao-e2e.md` "autoria: sem registro de que o papel `devops` gravou esta versão", e o review e o QA recomendaram alinhar o texto ao workflow novo. Sem isso o PR (E2.5) não abre. Worktree `/home/rodrigoisensee/MetricasDSPD-047b`, head fa50571737c1ad04549f72483afa55b368522745, já no origin.

## Ler
- O seu parecer `docs/devops/047-portao-e2e.md`, inteiro.
- `docs/reviews/047-portao-e2e.md`, só os achados A1 e A2; `docs/qa/047-portao-e2e.md`, só o achado A2.
- `.github/workflows/homolog.yml`, só os jobs `e2e-parte`, `e2e` e `portao` (para as referências de linha).

## Entregar
- (E2.8, E2, E5) Regrave o parecer `docs/devops/047-portao-e2e.md` pela ferramenta Write (nunca `sed` ou outro comando de shell, que não registra a autoria): o resumo do topo e as Evidências descrevem o portão com a E2E em 2 partes e citam as linhas atuais do `homolog.yml`; o `commit:` do frontmatter aponta 359cec16e357eab59e6e2c28a52a5e454c3e5d20 (o commit do workflow que o parecer avalia); o veredito continua aprovado. O `## Achados` só com linhas de achado no formato do `forge-check pr`, sem frase solta, cada uma com até 300 caracteres.
- (E2.8) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-172` e `git add` explícito por caminho; push sem `--force`, sem PR. Depois do push, rode `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 047-pendencias-decididas-2026-10-28 --ref docs/047-portao-e2e --base origin/develop` na worktree e copie a saída no relatório (a linha do A1 do review é do E2.7 e deve continuar).
- (E1, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue (b42b2610abf65e6ded9ce8db989ac06f4726aaa2)
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; já entregue (9a973696a83247cb8278a7eb4ddf8a7a58b84ded, aprovado)
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; já entregue (c9ad9777bbb47ad08d52671a5eba6e1134ba77f3, aprovado)
- "E1.5 (forge:qa-engineer): corrigir o campo `pedido:` do parecer `docs/qa/047-select-timeout.md` (está `047-select-timeout`; o certo é `047-pendencias-decididas-2026-10-28`), que o `forge-check pr` não acha." · etapa de outra delegação; já entregue (b1e3c31aff93bdf3f134588f937f8824434add0c)
- "E1.7 (forge:qa-engineer): tirar do bloco `## Achados` do parecer `docs/qa/047-select-timeout.md` a linha solta "Sem achado bloqueante.", fora do formato do `forge-check pr`." · etapa de outra delegação; já entregue (9fe4d6c057f547e06d2b8fad8be63fd11fb32d53)
- "E1.6 (forge:tech-lead): tirar do bloco `## Achados` do parecer `docs/reviews/047-select-timeout.md` a linha solta "Sem achado bloqueante...", fora do formato do `forge-check pr`, junto com o E1.4." · etapa de outra delegação; já entregue (af14eab525265ba8c3c006fa3da2f05953a51e10)
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; já entregue (455d3604356085eb0caf3ce11dbd7659b6b8b515)
- "E2.2 (forge:devops-engineer): divisão da E2E do portão da homolog em 2 partes (E5), na mesma branch `docs/047-portao-e2e`, com o parecer atualizado." · etapa de outra delegação; já entregue (359cec16e357eab59e6e2c28a52a5e454c3e5d20)
- "E2.3 (forge:tech-lead): code review do E2.1 e do E2.2." · etapa de outra delegação; já entregue (4820575d0a0375687ba0e344aa21407ffcd9f64e)
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; já entregue (2315e26b64d3dba83f34f040ff55d81ef4d8a78e)
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; já entregue (fa50571737c1ad04549f72483afa55b368522745)
- "E2.7 (forge:tech-lead): encurtar para até 300 caracteres o achado A1 do review `docs/reviews/047-portao-e2e.md` (aviso do conferente no brief qa-4, R-REVIEW), antes do E2.5." · etapa de outra delegação; continua no pedido
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Alterar o `homolog.yml`, o `ci.yml` e os pareceres de review, QA e segurança; disparar workflow; a E2E local, a suíte ou o `pronto`; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- NÃO tocar: o workflow, os outros pareceres, `EXIGIR_NOTURNA`, variáveis, segredos e proteção de branch; as outras worktrees; o `.env`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 359cec16e357eab59e6e2c28a52a5e454c3e5d20' /home/rodrigoisensee/MetricasDSPD-047b/docs/devops/047-portao-e2e.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047b diff --name-only fa50571737c1ad04549f72483afa55b368522745 HEAD` · espera: igual 'docs/devops/047-portao-e2e.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-047b ls-remote origin refs/heads/docs/047-portao-e2e` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-047b rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real, com a saída do `forge-check pr` depois do push; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
