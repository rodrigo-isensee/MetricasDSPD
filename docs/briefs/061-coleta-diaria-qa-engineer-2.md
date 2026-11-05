Agente destino: forge:qa-engineer
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: feature/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: qa   Cobre: E2.5

## Objetivo
QA da coleta diária (pedido 061, E2.5, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/061-coleta-diaria`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9...origin/feature/061-coleta-diaria`; `docs/devops/runbook-coleta-diaria.md`; os pareceres de review e segurança da branch.

## Entregar
- "E2.5 (qa-engineer): QA." (E2.5)
- (E2.5) `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/061-coleta-diaria`. Conferir: a imagem leva `docs/architecture/fontes/` (docker build, se o sandbox permitir); `docker compose config` sem resolver o `env_file`; as unidades systemd com os horários 06:00 e 06:30 BRT e a releitura de domingo depois do Acelerato (`systemd-analyze calendar`); o aviso de falha sem dado de pessoa; o runbook executável na ordem, com segredos pelo nome e permissões 755 e 644; `pnpm run pronto`, se o sandbox permitir.
- (E2.5) Parecer `docs/qa/061-coleta-diaria.md` com veredito, `commit:` no sha40 da ponta testada, o que foi e o que não foi possível testar e bloco `## Achados`; commit só do parecer com `Cartão: K-196`, `git add docs/qa/061-coleta-diaria.md`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/061-coleta-diaria`; sem PR.

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
- 2026-11-02 21:40: E2.4 cumprida pelo security-engineer: parecer docs/security/061-coleta-diaria.md aprovado em e992a5f (6cb6bc33bf862bb40968c8c4164e6aad4c359223). Recomendados para o devops: A1 segredos com 700 de root impedem o container (uid 1000) de ler o PEM e a coleta do Acelerato falharia (defeito de funcionamento); A2 clone em /opt pertencente a root; A3 chmod 600 no .env do Compose e sem senhas _dev. DECISÃO TÉCNICA (Jarvis): o A1 volta ao devops antes do QA, num brief único com os achados do review quando ele sair.
- 2026-11-02 22:25: entrega conferida 6dece9a61c6c152f2e61422dcd881286e3beafd8
- 2026-11-02 22:30: E2.3 cumprida pelo tech-lead: review revalidado por delta e aprovado em 6dece9a (ce363ba1c32639c2c78668d83e4d450ff0186d36), sem achados. Próximo: QA (E2.5).
- 2026-11-02 22:33: recursos da máquina definidos pelo dono em 2026-11-02 20:40 (pelo assistente do app, registrados no topo do KANBAN.md): no máximo 1 tarefa pesada por vez (suíte completa, e2e, build), até 2 worktrees testando ao mesmo tempo, antes de tarefa pesada MemAvailable acima de 3000 MB e load abaixo de 7, vitest e playwright com no máximo 4 workers, nunca pkill amplo.
- O agente nunca abre nem lê arquivos `.env*`; não roda coleta nem sobe container contra base real; não instala nada no host.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`; não rodar comandos fora do sandbox; o que o sandbox impedir fica para a CI do PR, relatado.
- Recursos da máquina (dono, Histórico do pedido): no máximo 1 tarefa pesada por vez (build, suíte); antes, MemAvailable acima de 3000 MB e load abaixo de 7.
- O parecer é gravado pela ferramenta Write ou Edit; frase de regra só pelo ID; achado até 300 caracteres; o campo `pedido:` do parecer é `061-coleta-diaria`.
- NÃO tocar: código, configuração, runbook, outros pareceres, o `CLAUDE.md`, as outras worktrees e a `main`.

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