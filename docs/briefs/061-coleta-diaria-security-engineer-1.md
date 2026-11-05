Agente destino: forge:security-engineer
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: feature/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: seguranca   Cobre: E2.4

## Objetivo
Parecer de segurança da coleta diária (pedido 061, E2.4, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/061-coleta-diaria`, ponta `e992a5fdbf0acf82ebd707bb0191d298f0f1b065`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9...e992a5fdbf0acf82ebd707bb0191d298f0f1b065`; `docs/devops/061-coleta-diaria.md` e `docs/devops/runbook-coleta-diaria.md` na branch.

## Entregar
- "E2.4 (security-engineer): parecer de segurança." (E2.4)
- (E2.4) Revisão estática: nenhum segredo na imagem, no Compose, nas unidades nem no runbook; a chave do BusinessMap e a senha do MySQL só no serviço `coleta`; o PEM montado só leitura; nenhuma porta publicada; o aviso de falha sem dado de pessoa; os riscos aceitos pelo dono nas ADRs 0022 e 0023 descritos com fidelidade e o TLS do coletor mantido. Parecer `docs/security/061-coleta-diaria.md` com veredito, `commit:` no sha40 da ponta revisada e bloco `## Achados`; commit só do parecer com `Cartão: K-196`, `git add docs/security/061-coleta-diaria.md`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/061-coleta-diaria`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "Isso" (recibo do 061): o devops-engineer explica como as coletas rodam hoje e propõe opções para agendá-las uma vez por dia no ambiente publicado, só lendo; nada é agendado, publicado nem mexido em servidor nesta etapa; a implementação vira pedido próprio.
- DECISÃO DO DONO (2026-11-02): "B1" (como agendar): container de coleta chamado pelo agendador do host (timer por fonte), BusinessMap às 06:00 com --projetar e Acelerato às 06:30, pela recomendação do parecer docs/devops/061-coleta-diaria.md.
- DECISÃO DO DONO (2026-11-02): "A" (onde publicar): num servidor interno da empresa, VM Linux na rede do Acelerato, com Docker, ligado 24 horas.
- DECISÃO DO DONO (2026-11-02): "A, porém pode manter minha chave o sistema não tem funcionalidades de alteração" (coleta fora da máquina do dono): a ADR 0022 é revista para a coleta rodar no servidor interno, mantendo a apikey atual do dono no BusinessMap, sem criar usuário de serviço só leitor.
- DECISÃO DO DONO (2026-11-02): "B" (acesso ao MySQL do Acelerato a partir do servidor): usar a conta compartilhada atual, sem pedir ao DBA usuário próprio, host amarrado nem SSL; exige revisar a ADR 0023, que pedia isso antes da coleta agendada.
- DECISÃO DO DONO (2026-11-02): "A" (aviso de falha e horário): aviso por e-mail ao dono quando a coleta falhar; BusinessMap às 06:00 e Acelerato às 06:30, horário de Brasília.
- DECISÃO DO DONO (2026-11-02): "A" (pesquisa de percepção): continua manual, com carga do arquivo a cada trimestre.
- DECISÃO DO DONO (2026-11-02): "A" (tocar tudo durante a noite): implementar P2 a P5 do plano 060-sem-mock, a coleta diária do 061 com as revisões das ADRs 0022 e 0023, e a Visão Geral validada depois de P2 e P3; cada parte com review, segurança e QA até a develop; nada na main sem o dono.
- ADR 0022 (citada no pedido): revista no item 6 (coleta no servidor interno, chave do dono só no serviço de coleta)
- ADR 0023 (citada no pedido): revista no §8 (conta compartilhada; coletor mantém TLS fixado)
- 2026-11-02 21:26: E2.2 cumprida pelo devops-engineer: feature/061-coleta-diaria em e992a5fdbf0acf82ebd707bb0191d298f0f1b065 (3034e96 só as ADRs do arquiteto; e992a5f implementação), sem PR. Dockerfile e .dockerignore levam docs/architecture/fontes; serviço coleta no Compose (perfil coleta, sem porta, env_file do host, PEM só leitura); deploy/systemd com timers 06:00, 06:30 e domingo 07:30 BRT e OnFailure por e-mail (AVISO_EMAIL do host); runbook docs/devops/runbook-coleta-diaria.md. docker build e compose config ok; pronto rc=0 fora do sandbox; nenhuma coleta executada. Decisões do autor para o review: releitura domingo 07:30; senhas DSPD_PWD_* do servidor no .env do Compose.
- 2026-11-02 21:30: entrega conferida e992a5fdbf0acf82ebd707bb0191d298f0f1b065
- 2026-11-02 21:30: DECISÃO TÉCNICA (Jarvis): review (E2.3) e segurança (E2.4) em paralelo; QA (E2.5) depois do review. O parecer de devops é dispensado aqui porque o autor é o próprio devops-engineer.
- O agente nunca abre nem lê arquivos `.env*`; não roda coleta nem sobe container contra base real.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook ou do sandbox: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- Outro parecer pode ser gravado em paralelo na mesma branch: antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/061-coleta-diaria`; push recusado por estar atrás: repita o pull e o push.
- O parecer é gravado pela ferramenta Write; frase de regra só pelo ID; achado até 300 caracteres.
- NÃO tocar: código, configuração, outros pareceres, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher a opção; a implementação vira pedido próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): revisão das ADRs 0022 (coleta no servidor interno, chave do dono) e 0023 (conta compartilhada sem SSL), com os riscos aceitos pelo dono." · etapa de outra delegação; continua no pedido
- "E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E2.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E2.6 (tech-lead): PR e merge na develop." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052g log --format=%H -1 origin/feature/061-coleta-diaria -- docs/security/061-coleta-diaria.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).