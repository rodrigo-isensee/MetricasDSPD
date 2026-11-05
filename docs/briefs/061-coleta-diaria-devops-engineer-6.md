Agente destino: forge:devops-engineer
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: feature/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E2.2

## Objetivo
Referência para conferir a volta 1 da E2.2, já entregue em 6dece9a61c6c152f2e61422dcd881286e3beafd8; não refazer nada (pedido 061, E2.2, K-196). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/061-coleta-diaria`.

## Ler
- `docs/reviews/061-coleta-diaria.md` (17481f8) e `docs/security/061-coleta-diaria.md` (6cb6bc3) na branch.

## Entregar
- "E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook." (E2.2)
- (E2.2) (review 17481f8 A1) (revisao-seguranca 6cb6bc3 A1) No runbook, `segredos` com 755 e o PEM do Acelerato com 644 (o PEM é público), para o container `node` (uid 1000) ler o arquivo montado só leitura.
- (E2.2) (revisao-seguranca 6cb6bc3 A2) O runbook fixa que o clone em `/opt/metricas-dspd` pertence a root e só root escreve nele.
- (E2.2) (revisao-seguranca 6cb6bc3 A3) O runbook manda dar `chmod 600` no `.env` do Compose do servidor e conferir, na instalação, que nenhuma senha padrão `_dev` restou (texto do runbook).
- (E2.2) (review 17481f8 A2) `After=` do serviço do Acelerato na unidade da releitura de domingo.
- (E2.2) (review 17481f8 A3) (review 17481f8 A5) O runbook registra que o `env_file` com `required` exige Compose 2.24 ou mais novo; o runbook é citado no README ou no `docs/engineering/fluxo-homologacao.md`.
- (E2.2) (review 17481f8 A4) O runbook manda conferir, na instalação, se o container fica vivo segurando a trava quando o `TimeoutStartSec` estoura.
- (E2.2) Commit com `Cartão: K-196`, `git add` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/061-coleta-diaria`; sem PR.

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
- 2026-11-02 21:46: E2.3 cumprida pelo tech-lead: review docs/reviews/061-coleta-diaria.md REPROVADO em e992a5f (17481f899961a6866bf9a4ae584bf82e447f7d00). A1 bloqueante: runbook dá 700 de root em segredos e 600 no PEM, o container (uid 1000) não lê e o Acelerato falha em tls; correção no runbook (755 e 644, PEM é público). Recomendados: A2 After= na releitura; A3 env_file required exige Compose 2.24; A4 conferir trava com TimeoutStartSec; A5 apontar o runbook em docs. DECISÃO TÉCNICA (Jarvis): volta 1 da E2.2 ao devops num brief único com o A1 do review e os recomendados A1 a A3 da segurança e A2, A3 e A5 do review; o QA espera.
- 2026-11-02 22:15: volta 1 da E2.2 cumprida pelo devops-engineer: 6dece9a61c6c152f2e61422dcd881286e3beafd8 (runbook com 755 e 644 em segredos e PEM, clone de root, chmod 600 e conferência das senhas _dev, Compose 2.24, conferência da trava no TimeoutStartSec; After= na releitura; README cita o runbook); pronto rc=0. Próximo: conferente, revalidação do review por delta (E2.3) e QA (E2.5).
- 2026-11-02 22:16: o forge-check brief mensagem --entrega recusa o brief de volta gerado por gerar --volta (cabeçalho sem Etapa:). DECISÃO TÉCNICA (Jarvis): brief de referência da volta 1 da E2.2, com cabeçalho completo e o mesmo Entregar, só para conferir a entrega 6dece9a; sem nova execução. MELHORIA (Forge): gerar --volta e mensagem --entrega discordam sobre o cabeçalho.
- O agente nunca abre nem lê arquivos `.env*`; não roda coleta nem sobe container contra base real.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook ou do sandbox: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código do server, o `.env`, o `CLAUDE.md`, as outras worktrees e a `main`.

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

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).