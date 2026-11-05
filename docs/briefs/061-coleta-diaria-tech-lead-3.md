Agente destino: forge:tech-lead
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: feature/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: pr   Cobre: E2.6

## Objetivo
Abrir o PR da coleta diária para a develop (pedido 061, E2.6, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/061-coleta-diaria`.

## Ler
- Os pareceres da branch: `docs/reviews/061-coleta-diaria.md`, `docs/security/061-coleta-diaria.md` e `docs/qa/061-coleta-diaria.md`.

## Entregar
- "E2.6 (tech-lead): PR e merge na develop." (E2.6)
- (E2.6) `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/061-coleta-diaria`; `forge-check pr 061-coleta-diaria --raiz /home/rodrigoisensee/MetricasDSPD-052g --ref HEAD --base origin/develop` limpo (achado: pare e relate).
- (E2.6) `gh pr create --base develop --head feature/061-coleta-diaria --body-file <arquivo>` com título citando a coleta diária (pedido 061), corpo com o que muda (Dockerfile, serviço coleta, timers, runbook, revisões das ADRs 0022 e 0023 com os riscos aceitos pelo dono), os três pareceres aprovados e os recomendados do QA; sem merge, sem `--admin`; relatar número e URL.

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
- 2026-11-02 22:30: E2.3 cumprida pelo tech-lead: review revalidado por delta e aprovado em 6dece9a (ce363ba1c32639c2c78668d83e4d450ff0186d36), sem achados. Próximo: QA (E2.5).
- 2026-11-02 22:45: E2.5 cumprida pelo qa-engineer: QA da coleta aprovado em ce363ba (808034100af8feec83e9490dc4fbdec4b95afecf), sem bugs; docker build, compose config, horários e aviso de falha conferidos; pronto não rodou no sandbox (fica para a CI do PR). Recomendados: A1 runbook conferir o PEM antes de ligar os timers; A2 caminho fixo do sendmail. Próximo: PR (E2.6).
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- A main é do dono; este PR vai só para a develop. O corpo do PR é gravado pela ferramenta Write num arquivo com caminho literal em `/tmp/claude-1000/` e o slug da branch no nome, e passado com `--body-file`.
- NÃO tocar: código, configuração, pareceres, o `CLAUDE.md`, as outras worktrees e a `main`; sem merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher a opção; a implementação vira pedido próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): revisão das ADRs 0022 (coleta no servidor interno, chave do dono) e 0023 (conta compartilhada sem SSL), com os riscos aceitos pelo dono." · etapa de outra delegação; continua no pedido
- "E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E2.4 (security-engineer): parecer de segurança." · etapa de outra delegação; continua no pedido
- "E2.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (pr): `gh pr list --head feature/061-coleta-diaria --base develop --state open --json number --jq length` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).