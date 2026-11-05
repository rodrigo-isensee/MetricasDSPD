Agente destino: forge:tech-lead
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-aviso-incompleto   Base: develop   Base-sha: 4e755edd1a00aa2d934899b4deb7c944435f54f8
Etapa: merge-integracao   Cobre: E2.8

## Objetivo
PR do lote do 063 para a develop, merge por squash e promoção da develop para a homolog, que leva o 060 junto (pedido 063, E2.8, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/063-aviso-incompleto`.

## Ler
- Os pareceres na branch: `docs/reviews/063-aviso-incompleto.md`, `docs/security/063-aviso-incompleto.md`, `docs/qa/063-aviso-incompleto.md`, `docs/ux/063-revisao-aviso-incompleto.md`; `{W}/docs/engineering/fluxo-homologacao.md` (promoção); seção de commits e de PR de `{W}/docs/engineering/praticas.md`.

## Entregar
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." (E2.8)
- (E2.8) `git -C /home/rodrigoisensee/MetricasDSPD-052h pull --ff-only origin feature/063-aviso-incompleto`; `forge-check pr 063-worklog-cards-acima-do-teto --ref origin/feature/063-aviso-incompleto --base origin/develop` limpo antes de abrir; PR para a develop com título citando o pedido 063 (coleta lendo todas as páginas e aviso de registro incompleto), corpo com o resumo, os 4 pareceres, as ressalvas registradas (segurança A1 sem teto próprio de páginas; QA A1 selo com 24 px, A2 CA-4 na branch de docs, A3 contraste só no tema claro), a nota de deploy (o aviso dos 5 cards já conhecidos aparece na primeira coleta depois da publicação) e a linha `teto: excedido, <n> linhas, <motivo>`; merge por squash quando os checks ficarem verdes, sem `--admin`; se a develop andou, `gh pr update-branch` e esperar os checks de novo. Depois, promoção pelo fluxo de homologação: PR da develop para a homolog, merge commit quando o portão ficar verde, sem `--admin`; sem PR de release para a main (é do dono).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): proposta revista: coleta lendo todas as páginas
- ADR 0015 (citada no pedido): lista fechada: ganha só page em CONSULTA_WORKLOG
- ADR 0020 (citada no pedido): não muda nesta etapa
- ADR 0014 (citada no pedido): migrações sem INSERT; a semeadura ficou no coletor
- 2026-11-03 13:48: recursos da máquina, mensagem do dono pelo assistente do app (PC pesado, "REDUZA JA"); substitui a de 08:05 até o dono avisar: núcleos 0-5, nice 15, até ~6 GB; no máximo 1 tarefa pesada por vez, 1 worktree testando, vitest e playwright com no máximo 2 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 4; nada em andamento é encerrado.
- 2026-11-03 20:34: DECISÃO DO DONO "B" (publicação só com o 063): segurar a publicação na VM até o 063 entrar; o 060 segue até a develop e espera. DECISÃO TÉCNICA (Jarvis): E2.1 e E2.2 numa branch do back, feature/063-worklog-paginas, na worktree /home/rodrigoisensee/MetricasDSPD-052g, a partir da develop b44602100416c953dc3ef6e6b496e0c381db2582; o front (E2.3) começa quando o contrato da E2.2 estiver no relatório do back; portões em seguida, uma tarefa pesada por vez.
- 2026-11-03 21:44: dono (pelo assistente do app) rodou na 052g em 3c3740d: test:pg rc=0 (232 testes, catálogo ok) e pronto rc=0 (server 1612 com cobertura 100%, web 1401, demais verdes). DECISÃO TÉCNICA (Jarvis): lote por arquivo do 063 numa branch só (feature/063-aviso-incompleto com o back trazido por merge, E2.9), para os portões E2.4 a E2.7 rodarem uma vez sobre back e front, e um PR só na E2.8 com a linha teto.
- 2026-11-04 01:21: E2.4 volta 1 cumprida pelo tech-lead: review do delta aprovado em 675ed965bfddb152f22b6a797c1deb4ff756c922 (commit: 46933d4); A1 resolvido; A2 em menor ou igual: o tech-lead concorda com a DECISÃO TÉCNICA (retomada da carga em outro dia recalcula o início a partir de hoje); A3 e A4 resolvidos. Conferente: entrega do react-frontend (react-frontend-5) não cumpriu só por escopo do intervalo (o server de 48de420 sem conferida própria). DECISÃO TÉCNICA (Jarvis): reconferir a entrega do node-backend (node-backend-7) com a DECISÃO TÉCNICA do A2 e o review aprovado; com a conferida dela, reconferir a do react-frontend e a do review, nessa ordem.
- 2026-11-04 01:29: E2.5 cumprida pelo security-engineer: aprovado sem bloqueante em 9a4effc9f7a8b1e896cab5c4d4beac1b938c0c8b (commit: 675ed96); page na lista fechada aceito (1 a 9999); GRANT e contrato sem pessoa nem horas; A1 recomendado baixo (sem teto próprio de páginas por consulta; o limite por hora do cliente segura; documentar em comentário ou teste); gitleaks, semgrep e osv-scanner fora do PATH (lacuna registrada). DECISÃO TÉCNICA (Jarvis): o A1 de segurança fica como pendência registrada, sem volta agora (baixo e já contido pelo limite do cliente); entra no PR como ressalva.
- 2026-11-04 01:46: E2.6 cumprida pelo qa-engineer: aprovado, 0 bugs, em a4c9bba52cdc7382b72412c352c992c3948b0043 (commit: 675ed96); server 1614 e web 1409 verdes; E2E novo e2e/tests/apontamento-incompleto-063.spec.ts 7/7 em Chromium (375 px sem rolagem, CA-4 por Enter e Espaço, Esc fecha, axe 1280 e 375); 12 CA com teste; médio 2 do UX resolvido; recomendados: A1 selo com 24 px de altura, A2 CA-4 só na branch de docs, A3 contraste só no tema claro. DECISÃO TÉCNICA (Jarvis): os 3 recomendados do QA ficam como pendência registrada no PR, sem volta (o A2 se resolve com o PR da branch de docs); próximo é o PR do lote para a develop (E2.8), com merge só com a CI verde.
- 2026-11-04 02:11: E2.12 a E2.14 cumpridas na ponta 27bae58: segurança regravada aprovada em e023b095bf0c488873a87b971bb5c7383c743884; review regravado aprovado em b41c099d9e90ab9ca169e549595d10b153fa77b7; QA regravado aprovado em 3b42ac9e1b055b3db12b3fa34fcf4b475ff8f203, E2E 56 de 56 (aviso e aba do apontamento, axe 1280 e 375 px, tema escuro); forge-check pr limpo em 3b42ac9. Conferente: entrega do merge (tech-lead-12) não verificável só por faltar o hash do brief do QA no anexo; PQ e escopo por leitura do diff ok. DECISÃO TÉCNICA (Jarvis): conferência única do intervalo 9a4effc..3b42ac9 pela união dos 5 briefs, com os hashes, em paralelo ao PR (E2.8), que só mescla com a CI verde.
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada na `main`: merge só na `develop` e na `homolog` (CLAUDE.md, A main é do usuário).
- Recusa do `forge-check pr`, de hook, do sandbox ou do classificador: pare e relate a mensagem literal, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

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
- "E1.13 (qa-engineer): QA documental da branch docs/063-worklog-teto antes do PR." · etapa de outra delegação; continua no pedido
- "E1.14 (ux-designer): corrigir o A1 do review da branch de docs (Q-1 da especificação sem a coleta por período), sem commit; o tech-lead commita." · etapa de outra delegação; continua no pedido
- "E1.15 (software-architect): corrigir o A2 do review da branch de docs (plano registrando a semeadura no coletor), sem commit; o tech-lead commita." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas lendo todas as páginas de cada consulta (D-5; período só como contingência) e o sinal de registro incompleto por card na API do apontamento (C2 e C3-R do plano), com o contrato documentado para o front; review, segurança e QA nas etapas E2.4 a E2.6." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): aviso de registro incompleto na aba do apontamento nos três lugares da especificação 063-aviso-registro-incompleto, a partir do contrato da E2.1." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): review do lote do 063 (coleta, sinal na API e aviso na aba)." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): trazer a branch do back (feature/063-worklog-paginas, 3c3740d) para a branch do aviso (feature/063-aviso-incompleto) por merge commit, sem mudar código além da resolução de conflito, e enviar; a branch do aviso vira o lote do 063." · etapa de outra delegação; continua no pedido
- "E2.10 (ux-designer): na especificação da branch de docs do 063, o CA-4 passa a dizer que a dica abre ao ativar o selo (achado A3 do review e médio 1 da revisão de interface)." · etapa de outra delegação; continua no pedido
- "E2.11 (tech-lead): trazer a develop atual (com o 060 do web, PR 208, e o PR 203) para a branch do lote por merge commit, resolvendo conflito sem mudar comportamento, e enviar." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review regravado na ponta depois da E2.11 (delta com o E2E do QA e o merge da develop)." · etapa de outra delegação; continua no pedido
- "E2.13 (security-engineer): parecer de segurança regravado na ponta depois da E2.11." · etapa de outra delegação; continua no pedido
- "E2.14 (qa-engineer): parecer de QA regravado na ponta depois da E2.11, com o E2E rodado de novo." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr view --repo rodrigo-isensee/MetricasDSPD feature/063-aviso-incompleto --json state,baseRefName` · espera: contém 'MERGED'
- PQ-2 (cmd): `gh pr view --repo rodrigo-isensee/MetricasDSPD feature/063-aviso-incompleto --json body --jq .body | grep -c '^teto: excedido'` · espera: igual '1'
- PQ-3 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --base homolog --head develop --state merged --limit 1 --json number,mergedAt` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).