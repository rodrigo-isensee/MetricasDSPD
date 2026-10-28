Agente destino: forge:devops-engineer
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: codigo
Branch: docs/047-portao-e2e   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E2.1 do pedido 047 (cartão K-144): o dono decidiu seguir o padrão da Forge, isto é, a bateria completa no PR e no push da homolog, sem a rodada noturna como portão. Confira que o portão da homolog roda de fato a E2E completa (as 2 partes do #154) e registre o parecer. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-047b` com a branch `docs/047-portao-e2e` a partir de `origin/develop` (4137981e5333bee5b69f3c515b26c64d3a0b71c0) e trabalhe só nela.

## Ler
- `.github/workflows/` da worktree: só os workflows disparados por `pull_request` para a develop e por `push` na `homolog`, e o do check `homolog-aprovada`.
- `docs/engineering/fluxo-homologacao.md`, só a seção do portão da homolog.
- Para conferir a execução real: `gh run list --branch homolog --limit 5` e o `gh run view` da última rodada do portão (jobs e duração).

## Entregar
- (E2.1, E2) Parecer de devops em `docs/devops/047-portao-e2e.md`: o portão do push na `homolog` roda a E2E completa (as 2 partes), a migração a partir da main e o smoke; o PR para a develop roda a bateria definida no workflow; `EXIGIR_NOTURNA` continua `false`. Cada afirmação com a evidência (`arquivo:linha` do workflow e id da rodada). Seção `## Achados` (bloqueante ou recomendado, `arquivo:linha` e destino).
- (E2.1) Mudança no workflow só se faltar parte da E2E completa no portão da homolog; nesse caso, a mudança mínima, no mesmo commit do parecer, e o parecer diz o que mudou.
- (E2.1) Commit no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-144` e `git add` explícito por caminho; push sem `--force`, sem PR.
- (E1, E3, E4) Nada a entregar aqui: não nesta delegação (E1.1, E3.1 e E4.1, em outras delegações).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Disparar ou re-executar workflow; mudar `EXIGIR_NOTURNA`, variável, segredo, ruleset ou proteção de branch; rodar suíte local; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- NÃO tocar: `EXIGIR_NOTURNA`, variáveis, segredos, ruleset e proteção de branch; os workflows fora do portão da homolog; o código de `server/`, `web/` e `e2e/`; o `.env`; as outras worktrees.
- R-CUSTO: nada que custe dinheiro. R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-047b/docs/devops/047-portao-e2e.md`
- PQ-2 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD-047b/docs/devops/047-portao-e2e.md` · espera: igual '1'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-047b ls-remote origin refs/heads/docs/047-portao-e2e` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-047b rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o portão roda ou não a E2E completa, com a evidência, e se mudou o workflow; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
