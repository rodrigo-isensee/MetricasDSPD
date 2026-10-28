Agente destino: forge:devops-engineer
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: codigo
Branch: docs/047-portao-e2e   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E2.2 do pedido 047 (cartão K-172): o seu achado 1 do parecer `docs/devops/047-portao-e2e.md` mostra que o job `e2e-homolog` roda a E2E numa parte só (28m29s com 690 testes na run 39984250260, teto de 30 min; hoje são 716). Divida a E2E do portão da homolog em 2 partes, como o #154 fez na CI do PR, antes da próxima promoção para a homolog. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-047b`, head 455d3604356085eb0caf3ce11dbd7659b6b8b515, já no origin.

## Ler
- `.github/workflows/homolog.yml` da worktree: o job `e2e-homolog` e o `portao` que consome o resultado.
- `.github/workflows/ci.yml`, só as linhas 189 a 253 (a divisão do #154).
- O seu parecer `docs/devops/047-portao-e2e.md`.

## Entregar
- (E2.2, E5) No `homolog.yml`, a E2E do portão em 2 partes (matriz com o mesmo mecanismo do `ci.yml`) e um agregador que mantém o id e o resultado que o `portao` consome, de modo que o `portao` só passa com as 2 partes verdes. Valide a sintaxe dos workflows com `actionlint` se existir; se não existir, diga no parecer.
- (E2.2, E2) Atualize o parecer `docs/devops/047-portao-e2e.md`: o achado 1 vira resolvido com a mudança descrita, e o campo `commit` passa a apontar para o commit desta entrega que contém o workflow (dois commits: primeiro o workflow, depois o parecer com o sha dele).
- (E2.2) Commits no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-172` e `git add` explícito por caminho; push sem `--force`, sem PR.
- (E1, E3, E4) Nada a entregar aqui: não nesta delegação (E1.1, E3.1 e E4.1, em outras delegações).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue (b42b2610abf65e6ded9ce8db989ac06f4726aaa2)
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; já entregue (9a973696a83247cb8278a7eb4ddf8a7a58b84ded, aprovado)
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; já entregue (455d3604356085eb0caf3ce11dbd7659b6b8b515)
- "E2.3 (forge:tech-lead): code review do E2.1 e do E2.2." · etapa de outra delegação; continua no pedido
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; continua no pedido
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; continua no pedido
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Disparar ou re-executar workflow; a promoção para a homolog; mudar `EXIGIR_NOTURNA`, variável, segredo, ruleset ou proteção de branch; o `ci.yml` e os outros workflows; rodar suíte local; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- NÃO tocar: `EXIGIR_NOTURNA`, variáveis, segredos, ruleset e proteção de branch; o `ci.yml` e os workflows fora do portão da homolog; o código de `server/`, `web/` e `e2e/`; o `.env`; as outras worktrees.
- Sem aumentar o timeout do job e sem retry: a solução é a divisão (pedido 041, E2). Nada que custe dinheiro (R-CUSTO): runners padrão do GitHub, como no `ci.yml`.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047b diff --name-only 455d3604356085eb0caf3ce11dbd7659b6b8b515 HEAD` · espera: linhas=2
- PQ-2 (cmd): `grep -c 'matrix' /home/rodrigoisensee/MetricasDSPD-047b/.github/workflows/homolog.yml` · espera: linhas>=1
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-047b ls-remote origin refs/heads/docs/047-portao-e2e` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-047b rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047b status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o que mudou no `homolog.yml`, como o `portao` passa a depender das 2 partes e se o `actionlint` rodou; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
