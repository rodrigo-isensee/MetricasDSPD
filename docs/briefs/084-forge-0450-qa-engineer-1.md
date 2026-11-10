Agente destino: forge:qa-engineer
Pedido: 084-forge-0450
Tipo: qa
Branch: forge/upgrade-0.45.2   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: qa   Cobre: E1.3
Revisar-sha: 378c05685d2bd8fa52b0d03297b24e692f4622a1

## Objetivo
QA da branch `forge/upgrade-0.45.2` (pedido 084, K-255): o projeto passa a registrar o Forge 0.45.2 (uma linha no arquivo de versão do Forge, commit 378c05685d2bd8fa52b0d03297b24e692f4622a1), com review aprovado em 41bb2efb. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `forge/upgrade-0.45.2`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/develop:docs/qa/chore-forge-0442.md` (o QA da atualização anterior, o molde do parecer).

## Entregar
- "E1.3 (qa-engineer): QA (`pnpm run pronto`)." (E1.3)
- (E1) (E1.3) Na worktree (branch `forge/upgrade-0.45.2`), rodar `pnpm run pronto` da raiz (tarefa pesada: só uma por vez; instale as dependências antes, se faltarem, com `CI=true pnpm install --frozen-lockfile --store-dir` num diretório do scratchpad, `registry.npmjs.org` em allowed_domains). Falha que já existia na develop, sem relação com a versão (como os três pré-existentes do PR 275), fica como achado com a evidência, não como bug do upgrade; falha nova vira bug. Grave `docs/qa/chore-forge-0452.md` (novo) pela ferramenta Write, uma vez só, no molde do anterior, com `pedido: 084-forge-0450`, `branch: forge/upgrade-0.45.2`, `commit: 378c05685d2bd8fa52b0d03297b24e692f4622a1`, veredito, contagem de bugs e `## Achados` (até 300 caracteres por achado); commit só do parecer com `Cartão: K-255` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/forge/upgrade-0.45.2` (`github.com` em allowed_domains); sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 084-forge-0450 até 2e7ed5743b1fd195bfa120934ce069011c07f8632ea94ac0512e7ae775417d1a (3 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/084-forge-0450.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.3 (copiadas literalmente):
- - 2026-11-10: DECISÃO DO DONO (literal): "sim" ao recibo "Mudo o pedido 084 para mirar a 0.45.2?". Alvo passa a 0.45.2; E1 e E1.1 reescritas (a E1.1 é do dono: atualizar o plugin, reiniciar, rodar o forge-upgrade, enviar a branch). A branch forge/upgrade-0.45.0 fica parada e será descartada quando a 0.45.2 entrar.
- - 2026-11-10 11:06: DECISÃO DO DONO (2026-11-10 11:00): recibo confirmado: "rode e atualize e depois retome" (vou fazer: forge-upgrade para a 0.45.2 numa worktree limpa, envio da branch, review, QA e PR para a develop; não vou: mesclar). Branch forge/upgrade-0.45.2 enviada pelo Jarvis (378c05685d2bd8fa52b0d03297b24e692f4622a1), como parte da ordem do dono de rodar e atualizar; o review (E1.2) segue com o tech-lead.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): atualizar o plugin Forge para 0.45.2, reiniciar a sessão, rodar o `forge-upgrade` e enviar a branch dele." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada de retrospectivas." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/forge/upgrade-0.45.2:docs/qa/chore-forge-0452.md` · espera: contém 'commit: 378c05685d2bd8fa52b0d03297b24e692f4622a1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
