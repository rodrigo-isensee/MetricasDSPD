Agente destino: forge:node-backend
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-worklog-paginas   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: codigo   Cobre: E2.1

## Objetivo
Coleta do registro de horas lendo todas as páginas do /loggedTime e sinal de card incompleto na API do apontamento (pedido 063, E2.1, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/063-worklog-paginas` a criar a partir da develop b44602100416c953dc3ef6e6b496e0c381db2582.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/063-worklog-acima-do-teto.md` (seções b.2, C1-R, C2, C3-R, riscos e cenários de QA); `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/063-aviso-registro-incompleto.md` (o que o aviso precisa receber da API); `/home/rodrigoisensee/MetricasDSPD-052g/server/src/modulos/businessmap/apontamento/lotes.ts`, `coleta.ts` e `registro.ts`; `/home/rodrigoisensee/MetricasDSPD-052g/server/src/modulos/businessmap/http.ts` (CONSULTA_WORKLOG); a rota `GET /api/apontamento` e o contrato dela em `/home/rodrigoisensee/MetricasDSPD-052g/docs/api/`.

## Entregar
- "E2.1 (node-backend): coleta do registro de horas lendo todas as páginas de cada consulta (D-5; período só como contingência) e o sinal de registro incompleto por card na API do apontamento (C2 e C3-R do plano), com o contrato documentado para o front; review, segurança e QA nas etapas E2.4 a E2.6." (E2.1)
- (E2.1) `git -C /home/rodrigoisensee/MetricasDSPD-052g switch -c feature/063-worklog-paginas b44602100416c953dc3ef6e6b496e0c381db2582`; a coleta pede page=1, lê pagination.all_pages e pede page=2 até all_pages para cada consulta; o card só conta como completo com todas as páginas certas; se all_pages mudar no meio, a consulta fica incompleta e não gera exclusão; falha transitória de página não marca o card como incompleto definitivo; a divisão por período fica só como contingência (C1-R.6); `page` entra na lista fechada CONSULTA_WORKLOG; carga incremental nunca sobrescreve histórico; testes com fetch falso e test:pg.
- (E2.1) a API do apontamento expõe, por card do recorte, o sinal de registro de horas incompleto (sem horas estimadas, sem pessoa), como o plano C2 e C3-R pedem; contrato documentado em `docs/api/` e no relatório (formato do campo e exemplo), para o front; testes da rota.
- Commits com `Cartão: K-200`; vitest com no máximo 2 workers; push com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/063-worklog-paginas`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): proposta revista: coleta só por /loggedTime lendo todas as páginas; período só como contingência
- ADR 0015 (citada no pedido): lista fechada de consultas ao BusinessMap; ganha só o parâmetro page em CONSULTA_WORKLOG, que a segurança confere na E2.5
- ADR 0020 (citada no pedido): o plano propõe rever o R4-5; não muda nesta etapa
- 2026-11-03 13:48: recursos da máquina, mensagem do dono pelo assistente do app (PC pesado, "REDUZA JA"); substitui a de 08:05 até o dono avisar: núcleos 0-5, nice 15, até ~6 GB; no máximo 1 tarefa pesada por vez, 1 worktree testando, vitest e playwright com no máximo 2 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 4; nada em andamento é encerrado.
- 2026-11-03 16:11: E1.12 cumprida pelo software-architect (plano e ADR 0025 em 052d, sem commit): causa da carga 8 lida no código: lerLote faz 1 GET por lote com per_page=1000 e sem page e descarta pagination (lotes.ts:28-48; CONSULTA_WORKLOG não aceita page, http.ts:71-84), então os 1000 gravados são só a página 1. Plano C1-R: seguir page=1..all_pages antes de dividir por período; card completo só com todas as páginas; período vira contingência. ADR 0025 segue proposta (depende da D-5 e da leitura do security-engineer sobre page na lista fechada, ADR 0015). PERGUNTA: D-5, trocar a divisão por período da decisão "B" pela leitura de todas as páginas (recomendação do arquiteto: trocar). D-4 (a coleta diária rodou depois da coleta 8?) segue aberta, depende da consulta do dono em ctl_coleta. Aguardando o dono.
- 2026-11-03 20:34: DECISÃO DO DONO "B" (publicação só com o 063): segurar a publicação na VM até o 063 entrar; o 060 segue até a develop e espera. DECISÃO TÉCNICA (Jarvis): E2.1 e E2.2 numa branch do back, feature/063-worklog-paginas, na worktree /home/rodrigoisensee/MetricasDSPD-052g, a partir da develop b44602100416c953dc3ef6e6b496e0c381db2582; o front (E2.3) começa quando o contrato da E2.2 estiver no relatório do back; portões em seguida, uma tarefa pesada por vez.
- O agente não abre, lê nem edita arquivos `.env*` e não chama a API do BusinessMap; nada é escrito no BusinessMap.
- Regras invioláveis do CLAUDE.md: nenhuma métrica para avaliação individual; carga incremental nunca sobrescreve histórico; dúvida de regra de negócio vira pergunta, não decisão no código.
- Recursos: no máximo 1 tarefa pesada por vez (o test:pg é pesado), vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes (`cat /proc/loadavg`). `pnpm run pronto` não roda no sandbox (K-201); rode as partes que rodam e relate.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: `web/`, a especificação do UX, o plano e as ADRs (só leitura), o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

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
- "E2.3 (react-frontend): aviso de registro incompleto na aba do apontamento nos três lugares da especificação 063-aviso-registro-incompleto, a partir do contrato da E2.1." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): review da branch do back (E2.1)." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052g ls-remote origin feature/063-worklog-paginas` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g grep -q 'all_pages' origin/feature/063-worklog-paginas -- server/src/modulos/businessmap/apontamento` · espera: rc=0
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052g/server && pnpm exec vitest run --maxWorkers=2 tests` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).