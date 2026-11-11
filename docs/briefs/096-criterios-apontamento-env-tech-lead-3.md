Agente destino: forge:tech-lead
Pedido: 096-criterios-apontamento-env
Tipo: codigo
Branch: fix/k270-criterios-env   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.4

## Objetivo
PR do K-270 para a develop: branch `fix/k270-criterios-env`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, head 554f3b15 (código 3316cce9; QA em 508823c3, segurança em 1545a83e e review em 554f3b15, todos aprovados; `forge-check pr` com veredito aprovado), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/reviews/096-criterios-apontamento-env.md`, `/home/rodrigoisensee/MetricasDSPD-052g/docs/qa/096-criterios-apontamento-env.md` e `/home/rodrigoisensee/MetricasDSPD-052g/docs/security/096-criterios-apontamento-env.md`.

## Entregar
- "E1.4 (tech-lead): PR para a develop; o merge é do dono." (E1.4)
- (E1) (E1.4) Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos (o que mudou: o passo de critérios do apontamento lê o `.env` sozinho e ganha o script `bm:criterios-apontamento`; os três pareceres; `Cartão: K-270`). Se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um (falha: nome do check e linha do erro; a falha de DNS do runner Ubuntu 26.04 nos jobs com navegador é conhecida e vai pelo pedido 095). Não mesclar: o merge é do dono.
- (E2) (E1.4) O roteiro do `CHANGELOG.md` entra no mesmo PR.
- arquivos: server/src/entradas/criterios-apontamento.ts, server/package.json, server/tests/criterios-apontamento-entrada.test.ts, CHANGELOG.md, docs/reviews/096-criterios-apontamento-env.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 096-criterios-apontamento-env até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/096-criterios-apontamento-env.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 095; o PR continua do tech-lead (E1.4)." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (gatilho: server/package.json e leitura do .env)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k270-criterios-env --state open --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
