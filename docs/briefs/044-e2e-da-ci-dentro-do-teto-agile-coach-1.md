Agente destino: forge:agile-coach
Pedido: 044-e2e-da-ci-dentro-do-teto
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo

## Objetivo
Retrospectiva do pedido 044 (E2E da CI em 2 partes dentro do teto de 30 min), cartão K-155. O pedido saiu na develop pelo PR #154 (53675ec) em cerca de 1 h 25 min, mas teve uma rodada extra para regravar o parecer de devops, a exclusão da branch remota negada e, logo depois, derrubou o merge de 2 PRs por "branch desatualizada". O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (do Jarvis); não troque de branch. Outros agentes podem commitar nesta branch ao mesmo tempo: se o `git commit` acusar `index.lock`, espere alguns segundos e tente de novo.

## Ler
- `docs/pedidos/044-e2e-da-ci-dentro-do-teto.md` inteiro.
- `docs/kanban/historico.md`, linhas do K-155.
- `docs/kanban/conferencias.md`, linhas do 044.
- `docs/retrospectivas/2026-10-23-025-taticas-lote2.md`, só como modelo de forma.

## Entregar
- (E1, E2, E3) Retrospectiva em `docs/retrospectivas/2026-10-28-044-e2e-em-partes.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (com a hora de cada evento tirada do Histórico do pedido e do historico.md), rodadas e reprovações agregadas por classe de causa, e linhas `MELHORIA:` (uma por linha, com problema, evidência por data e arquivo, medida do efeito e se vale para o Forge ou só para o projeto). Avalie pelo menos: a cobrança de autoria do parecer de devops pelo `forge-check pr` depois do QA; a contagem de testes do pedido (726) diferente da medida (716); a conferência sem `Desde` que mede commits de outros papéis (K-147); a exclusão da branch remota negada pelo classificador; o ruleset com checks estritos derrubando o merge de PRs abertos em paralelo (PRs #151 e #153).
- (E1) Um commit só da retrospectiva, `git add` explícito por caminho, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-155`; sem push.

## Fora do escopo
- "E1.1 (forge:devops-engineer): a divisão em 2 partes e o job agregador `e2e` (E1, E2), na branch `feature/044-e2e-em-partes`, com o parecer de devops (E3)." · etapa de outra delegação; já entregue
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue
- "E1.3 (forge:security-engineer): parecer de segurança do workflow, junto com o code review." · etapa de outra delegação; já entregue
- "E1.4 (forge:qa-engineer): parecer de QA: o run de workflow_dispatch na branch mostra as 2 partes somando os 726 testes e o `e2e` verde." · etapa de outra delegação; já entregue
- "E1.5 (forge:tech-lead): PR para a develop e merge; depois, os PRs #151 e #152 recebem a develop." · etapa de outra delegação; PR #154 mesclado, a segunda parte segue com o tech-lead
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os outros pedidos; push; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Eu estou indo dormir faça tudo Que não depende de mim".
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- DECISÃO DO DONO (2026-10-28): "Faça suas recomendações para as decisões até eu voltar para nada ficar parado só registre as decisões tomadas".
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md): nenhuma instância de agente (papel seguido de número, como tech-lead-2) no texto.
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-044-e2e-em-partes.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-044-e2e-em-partes.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-28-044-e2e-em-partes.md` · espera: o sha40 do commit da retrospectiva
- PQ-4 (cmd): `grep -cE '(tech-lead|qa-engineer|react-frontend|node-backend|ux-designer|security-engineer|devops-engineer|agile-coach|software-architect)-[0-9]' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-044-e2e-em-partes.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui as linhas `MELHORIA:` copiadas. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
