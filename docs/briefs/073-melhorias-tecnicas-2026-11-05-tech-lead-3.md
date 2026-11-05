Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: review   Cobre: E5.1

## Objetivo
Levantar, sem mudar nada, por que o `format:check` da raiz não cobre o server/ e qual o custo de passar a cobrir, antes de qualquer código (pedido 073, E5.1, item E5, K-226). O review do L9-c viu o prettier acusar estilo nos arquivos do server.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/develop:package.json` (scripts format e format:check), `.prettierrc*` e `.prettierignore` da develop, `server/package.json` (se tem script de formatação próprio), `docs/engineering/praticas.md` (seção de formatação, se houver) e o histórico dessas linhas (`git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline -5 origin/develop -- package.json .prettierignore`).

## Entregar
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." (E5.1)
- (E5) (E5.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-format-server.md` pela ferramenta Write: se a exclusão do server/ foi de propósito (com a evidência: commit, ADR ou prática), quantos arquivos do server o `pnpm exec prettier --check server` acusa hoje numa cópia limpa da develop (rodar em `/home/rodrigoisensee/MetricasDSPD-056d` só depois de `git -C /home/rodrigoisensee/MetricasDSPD-056d switch --detach origin/develop`, sem escrever nada; a worktree está limpa na feature/069-l9a-sem-zero, já mesclada), e a recomendação entre (a) formatar o server inteiro num commit só de formatação e incluir server/ no format:check, (b) manter fora com o motivo registrado, ou (c) outra; sem commit, sem PR.
- (E1, E2, E3, E4, E6, E7, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; valem as DECISÕES TÉCNICAS abaixo)
### ADRs citadas no pedido
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023 (E2); nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
- 2026-11-05 18:31: DECISÃO TÉCNICA (Jarvis): o E5 começa pela análise E5.1 do tech-lead, só leitura, sem commit; o prettier --check roda numa cópia destacada da develop na worktree /home/rodrigoisensee/MetricasDSPD-056d (limpa, na feature/069-l9a-sem-zero já mesclada), com `git switch --detach origin/develop` e nada escrito.
### Restrições
- Só leitura: o prettier roda só com `--check`, nunca `--write`; nenhum commit nem PR; os arquivos `.env*` não são abertos.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (package.json, configuração do prettier, código, o quadro e os pedidos inclusive), as worktrees além da 056d (que só recebe o switch --detach, sem escrita) e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E3.2 (tech-lead): review e PR por item." · etapa de outra delegação; continua no pedido
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- A mudança do format:check em si: depois da análise, em entrega própria.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-format-server.md` existe e contém 'format:check'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
