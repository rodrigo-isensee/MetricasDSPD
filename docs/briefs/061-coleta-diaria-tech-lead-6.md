Agente destino: forge:tech-lead
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: feature/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: merge-integracao   Cobre: E2.7

## Objetivo
Mesclar o PR 204 da coleta diária na develop (pedido 061, E2.7, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/061-coleta-diaria`.

## Ler
- `gh pr view feature/061-coleta-diaria` e `gh pr checks feature/061-coleta-diaria`.

## Entregar
- "E2.7 (tech-lead): merge (squash) do PR na develop." (E2.7)
- (E2.7) `gh pr ready feature/061-coleta-diaria`; esperar os checks pelo laço da skill esperar-estado (sem `--watch`); com tudo verde e `forge-check pr 061-coleta-diaria --raiz /home/rodrigoisensee/MetricasDSPD-052g --ref origin/feature/061-coleta-diaria --base origin/develop` limpo, `gh pr merge feature/061-coleta-diaria --squash --match-head-commit <sha40 da ponta>`, sem `--admin`; check vermelho, branch atrás ou recusa: pare e relate; relatar o sha do squash.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "Isso" (recibo do 061): o devops-engineer explica como as coletas rodam hoje e propõe opções para agendá-las uma vez por dia no ambiente publicado, só lendo; nada é agendado, publicado nem mexido em servidor nesta etapa; a implementação vira pedido próprio.
- DECISÃO DO DONO (2026-11-02): "B1" (como agendar): container de coleta chamado pelo agendador do host (timer por fonte), BusinessMap às 06:00 com --projetar e Acelerato às 06:30, pela recomendação do parecer docs/devops/061-coleta-diaria.md.
- DECISÃO DO DONO (2026-11-02): "A" (onde publicar): num servidor interno da empresa, VM Linux na rede do Acelerato, com Docker, ligado 24 horas.
- DECISÃO DO DONO (2026-11-02): "A, porém pode manter minha chave o sistema não tem funcionalidades de alteração" (coleta fora da máquina do dono): a ADR 0022 é revista para a coleta rodar no servidor interno, mantendo a apikey atual do dono no BusinessMap, sem criar usuário de serviço só leitor.
- DECISÃO DO DONO (2026-11-02): "B" (acesso ao MySQL do Acelerato a partir do servidor): usar a conta compartilhada atual, sem pedir ao DBA usuário próprio, host amarrado nem SSL; exige revisar a ADR 0023, que pedia isso antes da coleta agendada.
- DECISÃO DO DONO (2026-11-02): "A" (aviso de falha e horário): aviso por e-mail ao dono quando a coleta falhar; BusinessMap às 06:00 e Acelerato às 06:30, horário de Brasília.
- DECISÃO DO DONO (2026-11-02): "A" (pesquisa de percepção): continua manual, com carga do arquivo a cada trimestre.
- DECISÃO DO DONO (2026-11-02): "A" (tocar tudo durante a noite): implementar P2 a P5 do plano 060-sem-mock, a coleta diária do 061 com as revisões das ADRs 0022 e 0023, e a Visão Geral validada depois de P2 e P3; cada parte com review, segurança e QA até a develop; nada na main sem o dono.
- ADR 0022 (citada no pedido): revista no item 6
- ADR 0023 (citada no pedido): revista no §8
- 2026-11-02 23:20: E2.6 cumprida pelo tech-lead: PR 204 da coleta diária aberto como rascunho para a develop (https://github.com/rodrigo-isensee/MetricasDSPD/pull/204), ponta fca1c9af4ed3e5430dad36ad5d1c983449897847, forge-check pr limpo; o pronto fica para a CI do PR. Próximo: E2.7 (merge).
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- A main é do dono; o merge é só na develop. O hook aceita `gh pr merge` pelo nome da branch, não pelo número.
- NÃO tocar: código, configuração, pareceres, o `CLAUDE.md`, as outras worktrees e a `main`; sem `--force`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher a opção; a implementação vira pedido próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): revisão das ADRs 0022 (coleta no servidor interno, chave do dono) e 0023 (conta compartilhada sem SSL), com os riscos aceitos pelo dono." · etapa de outra delegação; continua no pedido
- "E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E2.4 (security-engineer): parecer de segurança." · etapa de outra delegação; continua no pedido
- "E2.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E2.6 (tech-lead): PR na develop, sem merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr view feature/061-coleta-diaria --json state --jq .state` · espera: igual 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).