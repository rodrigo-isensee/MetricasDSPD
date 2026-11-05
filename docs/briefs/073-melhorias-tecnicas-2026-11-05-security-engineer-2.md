Agente destino: forge:security-engineer
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: seguranca   Cobre: E1.1

## Objetivo
Refazer a triagem dos alertas abertos do Dependabot do MetricasDSPD, porque a triagem antiga (branch docs/060-triagem-dependabot) envelheceu (pedido 072, E1.4) (pedido 073, E1.1, K-228). Só leitura, sem mudar dependência.

## Ler
- `gh api repos/rodrigo-isensee/MetricasDSPD/dependabot/alerts --paginate --jq '.[] | select(.state=="open") | {number, package: .dependency.package.name, manifest: .dependency.manifest_path, severity: .security_advisory.severity, ghsa: .security_advisory.ghsa_id, patched: .security_vulnerability.first_patched_version.identifier, scope: .dependency.scope}'` (só esses campos; sem copiar descrição longa).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/develop:pnpm-lock.yaml` só para achar quem puxa cada pacote.

## Entregar
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." (E1.1)
- (E1) (E1.1) Parecer em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/073-dependabot-triagem.md`, gravado inteiro pela ferramenta Write: uma linha por alerta aberto (número, pacote, severidade, manifesto, dependência direta ou transitiva e de quem, uso só em desenvolvimento ou também em produção, versão corrigida, se a correção quebra algo conhecido) e a recomendação por alerta (atualizar já, atualizar com a próxima release, aceitar o risco com motivo, ou esperar correção do pacote pai); frontmatter com `pedido: 073-melhorias-tecnicas-2026-11-05`, `branch: develop`, `commit:` igual a `git -C /home/rodrigoisensee/Metricas/MetricasDSPD rev-parse origin/develop`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); commit só do parecer com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD add docs/security/073-dependabot-triagem.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD commit -m <mensagem> -m 'Cartão: K-228' -- docs/security/073-dependabot-triagem.md` (sem heredoc e sem pipe), na branch docs/jarvis-2026-10-23, sem push.
- (E2, E3, E4, E5, E6, E7) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; vale a DECISÃO TÉCNICA abaixo)
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
### Restrições
- Só leitura: nenhuma mudança em package.json, pnpm-lock.yaml nem em código; nenhum PR; os arquivos `.env*` não são abertos.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o quadro, os pedidos e os briefs inclusive), as worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review e PR por item." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- Atualizar qualquer dependência: depois da triagem, em item próprio.

## Pronto quando
- PQ-1 (cmd): `grep -c '^pedido: 073-melhorias-tecnicas-2026-11-05' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/073-dependabot-triagem.md` · espera: igual '1'
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/security/073-dependabot-triagem.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
