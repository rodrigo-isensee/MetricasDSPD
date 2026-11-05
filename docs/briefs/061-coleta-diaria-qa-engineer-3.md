Agente destino: forge:qa-engineer
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: feature/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: qa   Cobre: E2.5

## Objetivo
Volta curta do parecer de QA da coleta: registrar a autoria e encurtar o achado A1 (pedido 061, E2.5, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/061-coleta-diaria`.

## Ler
- `docs/qa/061-coleta-diaria.md` na branch (o seu parecer).

## Entregar
- "E2.5 (qa-engineer): QA." (E2.5)
- (E2.5) `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/061-coleta-diaria`; regravar `docs/qa/061-coleta-diaria.md` pela ferramenta Write com o mesmo veredito e o achado A1 reescrito em até 300 caracteres, sem rodar testes de novo.
- (E2.5) Commit só do parecer com `Cartão: K-196`, `git add docs/qa/061-coleta-diaria.md`, se houver diff; push com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/061-coleta-diaria`; depois, `forge-check pr 061-coleta-diaria --raiz /home/rodrigoisensee/MetricasDSPD-052g --ref HEAD --base origin/develop` sem a linha do papel `qa`; sem PR.

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
- 2026-11-02 22:33: recursos da máquina definidos pelo dono em 2026-11-02 20:40 (pelo assistente do app, registrados no topo do KANBAN.md): no máximo 1 tarefa pesada por vez (suíte completa, e2e, build), até 2 worktrees testando ao mesmo tempo, antes de tarefa pesada MemAvailable acima de 3000 MB e load abaixo de 7, vitest e playwright com no máximo 4 workers, nunca pkill amplo.
- 2026-11-02 22:53: conferência de entrega do QA da coleta: não cumpriu só pelo anexo com remoção do parecer de review (commit ce363ba, revalidação do tech-lead, sem mérito). O forge-check pr da branch acusa: parecer de QA sem registro de autoria e achado A1 com mais de 300 caracteres; parecer de segurança desatualizado (o README mudou depois); parecer de devops (docs/devops/061-coleta-diaria.md) desatualizado e sem autoria. DECISÃO TÉCNICA (Jarvis): voltas curtas antes do PR da coleta, em paralelo: QA regrava o próprio parecer pela ferramenta Write com o A1 abaixo de 300 caracteres; segurança renova por delta sobre a ponta atual; devops renova o próprio parecer como revisão de devops da branch.
- O agente nunca abre nem lê arquivos `.env*`; não roda coleta nem sobe container contra base real.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- Outros pareceres podem ser gravados em paralelo na mesma branch: antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/061-coleta-diaria`; push recusado por estar atrás: repita o pull e o push.
- O parecer é gravado pela ferramenta Write; frase de regra só pelo ID; cada achado até 300 caracteres; o campo `pedido:` do parecer é `061-coleta-diaria`.
- NÃO tocar: código, configuração, runbook, pareceres de outro papel, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher a opção; a implementação vira pedido próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): revisão das ADRs 0022 (coleta no servidor interno, chave do dono) e 0023 (conta compartilhada sem SSL), com os riscos aceitos pelo dono." · etapa de outra delegação; continua no pedido
- "E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E2.4 (security-engineer): parecer de segurança." · etapa de outra delegação; continua no pedido
- "E2.6 (tech-lead): PR e merge na develop." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052g log --format=%H -1 origin/feature/061-coleta-diaria -- docs/qa/061-coleta-diaria.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).