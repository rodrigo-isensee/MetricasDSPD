Agente destino: forge:devops-engineer
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: feature/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E2.2

## Objetivo
Implementar a coleta diária pela opção B1 (pedido 061, E2.2, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch nova `feature/061-coleta-diaria` a partir da `docs/061-coleta-diaria`; a worktree tem o texto revisto das ADRs 0022 e 0023, ainda sem commit.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/devops/061-coleta-diaria.md` (seu parecer, seções 1 a 5); as ADRs 0022 (item 6) e 0023 (§8) da worktree; `server/Dockerfile`, `docker-compose.yml`, `scripts/`.

## Entregar
- "E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook." (E2.2)
- (E2) `git -C /home/rodrigoisensee/MetricasDSPD-052g switch --no-track -c feature/061-coleta-diaria` (a partir da branch atual, levando as ADRs); commit só das duas ADRs, com mensagem dizendo que o texto é do software-architect e `Cartão: K-196`.
- (E2) `server/Dockerfile` passa a levar `docs/architecture/fontes/`; serviço `coleta` no Compose, com a imagem do servidor, as variáveis por `env_file` do host, sem porta publicada, rede interna até o Postgres, a chave do BusinessMap só nele.
- (E2) Unidades systemd versionadas no repositório (por exemplo em `deploy/systemd/`): timer do BusinessMap às 06:00 e do Acelerato às 06:30 America/Sao_Paulo, releitura do Acelerato aos domingos, `OnFailure=` que manda e-mail ao dono (endereço por variável do host, nunca no repositório), cada uma chamando `docker compose run --rm coleta <comando>`.
- (E2) Runbook em `docs/devops/` com instalação na VM, segredos que o dono providencia (pelo nome), como reexecutar, como desligar (rollback) e como conferir o frescor depois de cada execução.
- (E2) `docker build` da imagem, `docker compose config` e `shellcheck`/`systemd-analyze verify` quando disponíveis; `pnpm run pronto` verde; commits com `Cartão: K-196`, `git add` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/061-coleta-diaria`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "Isso" (recibo do 061): o devops-engineer explica como as coletas rodam hoje e propõe opções para agendá-las uma vez por dia no ambiente publicado, só lendo; nada é agendado, publicado nem mexido em servidor nesta etapa; a implementação vira pedido próprio.
- DECISÃO DO DONO (2026-11-02): "B1" (como agendar): container de coleta chamado pelo agendador do host (timer por fonte), BusinessMap às 06:00 com --projetar e Acelerato às 06:30, pela recomendação do parecer docs/devops/061-coleta-diaria.md.
- DECISÃO DO DONO (2026-11-02): "A" (onde publicar): num servidor interno da empresa, VM Linux na rede do Acelerato, com Docker, ligado 24 horas.
- DECISÃO DO DONO (2026-11-02): "A, porém pode manter minha chave o sistema não tem funcionalidades de alteração" (coleta fora da máquina do dono): a ADR 0022 é revista para a coleta rodar no servidor interno, mantendo a apikey atual do dono no BusinessMap, sem criar usuário de serviço só leitor.
- DECISÃO DO DONO (2026-11-02): "B" (acesso ao MySQL do Acelerato a partir do servidor): usar a conta compartilhada atual, sem pedir ao DBA usuário próprio, host amarrado nem SSL; exige revisar a ADR 0023, que pedia isso antes da coleta agendada.
- DECISÃO DO DONO (2026-11-02): "A" (aviso de falha e horário): aviso por e-mail ao dono quando a coleta falhar; BusinessMap às 06:00 e Acelerato às 06:30, horário de Brasília.
- DECISÃO DO DONO (2026-11-02): "A" (pesquisa de percepção): continua manual, com carga do arquivo a cada trimestre.
- DECISÃO DO DONO (2026-11-02): "A" (tocar tudo durante a noite): implementar P2 a P5 do plano 060-sem-mock, a coleta diária do 061 com as revisões das ADRs 0022 e 0023, e a Visão Geral validada depois de P2 e P3; cada parte com review, segurança e QA até a develop; nada na main sem o dono.
- ADR 0022 (citada no pedido): revista no item 6 (coleta no servidor interno pelo serviço de coleta, chave do dono só nesse serviço)
- ADR 0023 (citada no pedido): revista no §8 (conta compartilhada; o coletor mantém TLS com certificado fixado)
- 2026-11-02 19:56: E1.1 cumprida pelo devops-engineer: parecer docs/devops/061-coleta-diaria.md (c5bb99908a0e05dc5e14817beca0343e09f7ba8f, branch docs/061-coleta-diaria, sem PR). Recomendação: container de coleta chamado por timer do host (BusinessMap às 06:00 com --projetar, Acelerato às 06:30, releitura semanal do Acelerato, pesquisa fora da agenda por ser trimestral e por arquivo); cron direto equivalente em servidor simples. Achados: server/Dockerfile não leva docs/architecture/fontes/*.json (a coleta falha na imagem); worker do Compose vazio e sem variáveis; ADR 0022 item 5 e ADR 0023 mantêm a coleta real só na máquina do dono, e publicar exige revisar a ADR 0022, usuário só leitor no BusinessMap e usuário próprio com SSL no Acelerato. Duração das coletas não medida. PERGUNTA ao dono (E1.2): 6 decisões do parecer.
- 2026-11-02 20:32: E2.1 cumprida pelo software-architect: ADR 0022 item 6 e ADR 0023 §8 revistos em 2026-11-02 na worktree 052g, sem commit, com os riscos aceitos e o critério de reversão. Ponto registrado: a decisão 4 vale para o servidor MySQL, que não exige TLS; o coletor continua exigindo TLS com certificado fixado (tls.ts), então a conexão segue cifrada; desligar isso seria decisão nova do dono. DECISÃO TÉCNICA (Jarvis): a E2.2 (devops) cria a branch feature/061-coleta-diaria a partir da docs/061-coleta-diaria na worktree 052g, commita o texto das ADRs em commit próprio e depois a implementação.
- O agente nunca abre nem lê o `.env`; não roda coleta na base do dono; não sobe container contra a base real.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook ou do sandbox: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`. R-CUSTO: nada que custe dinheiro.
- Regras do CLAUDE.md: credenciais só no `.env`, nunca na imagem nem no código; carga incremental, nunca sobrescrever histórico; BusinessMap e Acelerato nunca se misturam.
- NÃO tocar: código de coleta do server (salvo o necessário para ler `fontes/` na imagem, relatado), o `.env`, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher a opção; a implementação vira pedido próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): revisão das ADRs 0022 (coleta no servidor interno, chave do dono) e 0023 (conta compartilhada sem SSL), com os riscos aceitos pelo dono." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E2.4 (security-engineer): parecer de segurança." · etapa de outra delegação; continua no pedido
- "E2.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E2.6 (tech-lead): PR e merge na develop." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052g ls-remote origin refs/heads/feature/061-coleta-diaria` · espera: linhas=1
- PQ-2 (cmd): `pnpm -C /home/rodrigoisensee/MetricasDSPD-052g run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).