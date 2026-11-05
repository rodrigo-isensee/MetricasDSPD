Agente destino: forge:node-backend
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: feature/073-fronteira-eslint   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: codigo   Cobre: E3.1

## Objetivo
A regra de fronteira de importação do eslint do server (no-restricted-imports) passa a valer para toda pasta de server/src fora de modulos/, e não só para as listadas, para que uma pasta nova não escape sem aviso como aconteceu com src/apoio no L9-c (pedido 073, E3.1, item E4, K-225). Branch nova feature/073-fronteira-eslint a partir da develop 8a789d43, na worktree `/home/rodrigoisensee/MetricasDSPD-052c`.

## Ler
- `server/eslint.config.js` (a regra de fronteira, por volta da linha 48) e a ADR 0013 §9 em `docs/architecture/adr/` (módulos só pelo index.ts).
- O achado que originou o item: `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/develop:docs/reviews/069-zz5-l9c.md` (A1 e a melhoria vista).

## Entregar
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." (E3.1)
- (E4) (E3.1) `git -C /home/rodrigoisensee/MetricasDSPD-052c fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052c switch -c feature/073-fronteira-eslint 8a789d43dd6227255e7f686728bcaaaaa1ed1797` (a worktree está na feature/069-l9c-projecao, já mesclada no PR 238; se tiver mudança local, pare e relate); em `server/eslint.config.js`, trocar a lista de pastas da regra de fronteira por um padrão que cubra todo `src/**` fora de `src/modulos/**` (os módulos seguem com a regra deles); um teste que prove a cobertura: para cada pasta de primeiro nível de `server/src` fora de `modulos`, o `ESLint.calculateConfigForFile` de um arquivo dela traz `no-restricted-imports` ativo (o teste quebra se uma pasta nova escapar); `npx eslint .` com cwd em `server/` (rc=0, sem import interno novo acusado; se acusar, relate o arquivo, não corrija código de produção além do import), o vitest do server só do teste novo e dos testes de lint existentes, `pnpm run docs:check`; documentação técnica afetada atualizada (onde a regra estiver descrita); commits com `git -C /home/rodrigoisensee/MetricasDSPD-052c add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-225' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/073-fronteira-eslint`; sem PR.
- (E1, E2, E3, E5, E6, E7) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; vale a DECISÃO TÉCNICA abaixo)
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, `packages/`, código de produção do server (só a configuração do eslint e o teste novo), os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review e PR por item." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052c ls-remote origin feature/073-fronteira-eslint` · espera: contém 'refs/heads/feature/073-fronteira-eslint'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --name-only 8a789d43dd6227255e7f686728bcaaaaa1ed1797 origin/feature/073-fronteira-eslint -- server/eslint.config.js` · espera: igual 'server/eslint.config.js'
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052c/server && npx eslint .` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
