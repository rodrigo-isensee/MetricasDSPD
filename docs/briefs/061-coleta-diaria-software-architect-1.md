Agente destino: forge:software-architect
Pedido: 061-coleta-diaria
Tipo: codigo
Branch: docs/061-coleta-diaria   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E2.1

## Objetivo
Revisar as ADRs 0022 e 0023 para a coleta rodar no servidor interno, com os riscos aceitos pelo dono (pedido 061, E2.1, K-196). A etapa `codigo` é a do vocabulário do forge-check para entrega sem PR; aqui a entrega é só o texto das ADRs. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/devops/061-coleta-diaria.md` (parecer do devops, seções 2 a 5); `/home/rodrigoisensee/MetricasDSPD-052g/docs/architecture/adr/0022-coleta-incremental-e-webhook-businessmap.md` e `0023-acelerato-pela-tabela-mysql.md`.

## Entregar
- "E2.1 (software-architect): revisão das ADRs 0022 (coleta no servidor interno, chave do dono) e 0023 (conta compartilhada sem SSL), com os riscos aceitos pelo dono." (E2.1)
- (E2) Revisão datada na ADR 0022: a coleta real passa a rodar no servidor interno pelo container de coleta (B1), mantendo a apikey do dono, com o risco aceito (a chave permite escrita no quadro; o código só faz GET) e a mitigação (chave só no serviço de coleta).
- (E2) Revisão datada na ADR 0023: a coleta agendada usa a conta compartilhada do MySQL, sem host amarrado nem SSL, com o risco aceito (senha válida de qualquer endereço, tráfego sem criptografia com dado de pessoa) e o caminho para endurecer depois.
- (E2) Escrever nos dois arquivos da worktree; sem commit (papel sem Bash).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "Isso" (recibo do 061): o devops-engineer explica como as coletas rodam hoje e propõe opções para agendá-las uma vez por dia no ambiente publicado, só lendo; nada é agendado, publicado nem mexido em servidor nesta etapa; a implementação vira pedido próprio.
- DECISÃO DO DONO (2026-11-02): "B1" (como agendar): container de coleta chamado pelo agendador do host (timer por fonte), BusinessMap às 06:00 com --projetar e Acelerato às 06:30, pela recomendação do parecer docs/devops/061-coleta-diaria.md.
- DECISÃO DO DONO (2026-11-02): "A" (onde publicar): num servidor interno da empresa, VM Linux na rede do Acelerato, com Docker, ligado 24 horas.
- DECISÃO DO DONO (2026-11-02): "A, porém pode manter minha chave o sistema não tem funcionalidades de alteração" (coleta fora da máquina do dono): a ADR 0022 é revista para a coleta rodar no servidor interno, mantendo a apikey atual do dono no BusinessMap, sem criar usuário de serviço só leitor.
- DECISÃO DO DONO (2026-11-02): "B" (acesso ao MySQL do Acelerato a partir do servidor): usar a conta compartilhada atual, sem pedir ao DBA usuário próprio, host amarrado nem SSL; exige revisar a ADR 0023, que pedia isso antes da coleta agendada.
- DECISÃO DO DONO (2026-11-02): "A" (aviso de falha e horário): aviso por e-mail ao dono quando a coleta falhar; BusinessMap às 06:00 e Acelerato às 06:30, horário de Brasília.
- DECISÃO DO DONO (2026-11-02): "A" (pesquisa de percepção): continua manual, com carga do arquivo a cada trimestre.
- DECISÃO DO DONO (2026-11-02): "A" (tocar tudo durante a noite): implementar P2 a P5 do plano 060-sem-mock, a coleta diária do 061 com as revisões das ADRs 0022 e 0023, e a Visão Geral validada depois de P2 e P3; cada parte com review, segurança e QA até a develop; nada na main sem o dono.
- ADR 0022 (citada no pedido): é revisada nesta entrega (coleta no servidor interno com a chave do dono)
- ADR 0023 (citada no pedido): é revisada nesta entrega (conta compartilhada do MySQL sem SSL)
- 2026-11-02 20:10: DECISÃO DO DONO na decisão 3 de 6: "A, porém pode manter minha chave o sistema não tem funcionalidades de alteração". Risco a registrar na revisão da ADR 0022: a chave do dono tem permissão de escrita no quadro; o código só faz GET, mas a chave guardada no servidor, se vazar, permite alterar o quadro. Faltam 3.
- 2026-11-02 20:10: DECISÃO DO DONO "B" na decisão 4 de 6 (conta compartilhada do MySQL do Acelerato). Risco aceito pelo dono, a registrar na revisão da ADR 0023: senha válida de qualquer endereço e tráfego sem criptografia, com dado de pessoa do apontamento. Faltam 2 (aviso de falha e horário; pesquisa manual). Ação do dono à parte: providenciar os segredos no servidor.
- O agente nunca abre nem lê o `.env`; não roda seed, coleta nem limpeza na base do dono.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook ou do sandbox: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- O `.git/config.lock` do repositório principal está parado: branch nova com `--no-track`, push sem `-u` (`git push origin HEAD:refs/heads/<branch>`).
- Regras invioláveis do CLAUDE.md: BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens não publicar; sem métrica individual (salvo a exceção Apontamento); nenhuma métrica com cálculo próprio fora da biblioteca.
- NÃO tocar: o `.env`, o `CLAUDE.md` (salvo onde o Entregar manda), as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher a opção; a implementação vira pedido próprio." · etapa de outra delegação; continua no pedido
- "E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E2.4 (security-engineer): parecer de segurança." · etapa de outra delegação; continua no pedido
- "E2.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E2.6 (tech-lead): PR e merge na develop." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c '2026-11-02' /home/rodrigoisensee/MetricasDSPD-052g/docs/architecture/adr/0022-coleta-incremental-e-webhook-businessmap.md /home/rodrigoisensee/MetricasDSPD-052g/docs/architecture/adr/0023-acelerato-pela-tabela-mysql.md` · espera: contém ':'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).