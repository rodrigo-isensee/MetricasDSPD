Agente destino: forge:tech-lead
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-aviso-incompleto   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: codigo   Cobre: E2.9

## Objetivo
Trazer a branch do back do 063 para a branch do aviso, que vira o lote do pedido (pedido 063, E2.9, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/063-aviso-incompleto` (ponta a567b117187dd4fdaa52d315e964bb0fbc553aa6).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline 778ff0a65ae3d7b3444dd83c8b65e7df5b6adbe7..3c3740d801560129a899e8540128f513143b083c` (o que o back ganhou depois do ponto de onde o aviso nasceu).

## Entregar
- "E2.9 (tech-lead): trazer a branch do back (feature/063-worklog-paginas, 3c3740d) para a branch do aviso (feature/063-aviso-incompleto) por merge commit, sem mudar código além da resolução de conflito, e enviar; a branch do aviso vira o lote do 063." (E2.9)
- (E2.9) `git -C /home/rodrigoisensee/MetricasDSPD-052h switch feature/063-aviso-incompleto` e `git -C /home/rodrigoisensee/MetricasDSPD-052h pull --ff-only origin feature/063-aviso-incompleto`; `git -C /home/rodrigoisensee/MetricasDSPD-052h merge --no-ff 3c3740d801560129a899e8540128f513143b083c` com mensagem citando o pedido 063 e `Cartão: K-200`; resolver conflito, se houver, sem mudar código além do necessário; vitest do web e do server com no máximo 2 workers; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/063-aviso-incompleto`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): proposta revista: coleta lendo todas as páginas
- ADR 0015 (citada no pedido): lista fechada; não muda nesta etapa
- ADR 0020 (citada no pedido): não muda nesta etapa
- ADR 0014 (citada no pedido): migrações sem INSERT; não muda nesta etapa
- 2026-11-03 13:48: recursos da máquina, mensagem do dono pelo assistente do app (PC pesado, "REDUZA JA"); substitui a de 08:05 até o dono avisar: núcleos 0-5, nice 15, até ~6 GB; no máximo 1 tarefa pesada por vez, 1 worktree testando, vitest e playwright com no máximo 2 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 4; nada em andamento é encerrado.
- 2026-11-03 21:44: dono (pelo assistente do app) rodou na 052g em 3c3740d: test:pg rc=0 (232 testes, catálogo ok) e pronto rc=0 (server 1612 com cobertura 100%, web 1401, demais verdes). DECISÃO TÉCNICA (Jarvis): lote por arquivo do 063 numa branch só (feature/063-aviso-incompleto com o back trazido por merge, E2.9), para os portões E2.4 a E2.7 rodarem uma vez sobre back e front, e um PR só na E2.8 com a linha teto.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes (`cat /proc/loadavg`); `pnpm run pronto` não roda no sandbox (K-201).
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código além da resolução de conflito, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): discovery: como a coleta marca o card que parou no teto e como a API mostra isso; se a API do BusinessMap aceita consultar um card por faixa de datas (só leitura, só GET); plano do aviso e da coleta por período, com revisão da ADR 0025 se precisar." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): texto e lugar do aviso de incompleto na aba do apontamento, que some quando a coleta por período completar o card, em paralelo à E1.1." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o plano e o aviso." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): branch docs/063-worklog-teto a partir da develop, commit e push só da documentação do discovery (plano do arquiteto e especificação do aviso)." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): rodar o script de spike de 1 GET /loggedTime (D-2), só forma e contagens; o node-backend escreve o script sem tocar no .env (E1.6) e o dono o roda." · etapa de outra delegação; continua no pedido
- "E1.6 (node-backend): script de spike que lê a chave do ambiente sem exibi-la e grava só a forma da resposta e as contagens." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da branch docs/063-worklog-teto, por outra instância." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR da branch docs/063-worklog-teto para a develop, depois do review." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): review da branch feature/063-spike-paginacao." · etapa de outra delegação; continua no pedido
- "E1.10 (security-engineer): parecer de segurança do script (chave no cabeçalho, allow-list da saída)." · etapa de outra delegação; continua no pedido
- "E1.11 (qa-engineer): QA do script, sem chamar a API." · etapa de outra delegação; continua no pedido
- "E1.12 (software-architect): revisar o plano da coleta e a ADR 0025 com o resultado do spike (a API pagina: 200 por página), na branch docs/063-worklog-teto, antes da E2.1." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas lendo todas as páginas de cada consulta (D-5; período só como contingência) e o sinal de registro incompleto por card na API do apontamento (C2 e C3-R do plano), com o contrato documentado para o front; review, segurança e QA nas etapas E2.4 a E2.6." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): aviso de registro incompleto na aba do apontamento nos três lugares da especificação 063-aviso-registro-incompleto, a partir do contrato da E2.1." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): review da branch do back (E2.1)." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052h ls-remote origin feature/063-aviso-incompleto` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h merge-base --is-ancestor 3c3740d801560129a899e8540128f513143b083c origin/feature/063-aviso-incompleto` · espera: rc=0
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052h/web && pnpm exec vitest run --maxWorkers=2` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).