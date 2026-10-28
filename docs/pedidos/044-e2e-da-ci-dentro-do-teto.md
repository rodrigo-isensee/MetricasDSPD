# Pedido 044: E2E da CI dentro do teto de tempo

- **Data:** 2026-10-28
- **Origem:** Jarvis (tarefa técnica, sem mudança de interface), a partir do relatório do tech-lead-10 do 026: o check obrigatório `e2e` do PR #152 foi cancelado pelo teto de 30 minutos (run 40669258684, 588 de 726 testes em 28 min) e o do PR #151 do 042 também (run 40664083008, 30 min); o do PR #153 do 041 passou em 26,5 min (run 40665842577). Ordem do dono de 2026-10-28: "Eu estou indo dormir faça tudo Que não depende de mim".
- **Modo:** implementar
- **Objetivo:** o job `e2e` do `ci.yml` terminar bem abaixo do teto, com a suíte inteira, sem aumentar o teto do job nem os timeouts dos testes e sem retry novo.
- **Clareza:** 0 confirmados, 4 técnicos, 2 suposições; 0 perguntas.

## Escopo
- E1. Dividir a E2E do job `e2e` do `.github/workflows/ci.yml` em 2 partes paralelas (shard do Playwright) e manter um job de nome `e2e` que só passa se as duas partes passarem, para o check obrigatório do ruleset continuar com o mesmo nome; o passo dos diagramas Mermaid (verificação única, não depende da E2E) roda numa parte só. · `técnico`
- E2. Relatório de falha (artefato) por parte, com nome distinto. · `técnico`
- E3. Parecer de devops em `docs/devops/` e parecer de segurança (workflow, gatilho de R-SEGURANCA). · `técnico`

## Etapas
- E1.1 (forge:devops-engineer): a divisão em 2 partes e o job agregador `e2e` (E1, E2), na branch `feature/044-e2e-em-partes`, com o parecer de devops (E3).
- E1.2 (forge:tech-lead): code review.
- E1.3 (forge:security-engineer): parecer de segurança do workflow, junto com o code review.
- E1.4 (forge:qa-engineer): parecer de QA: o run de workflow_dispatch na branch mostra as 2 partes somando os 726 testes e o `e2e` verde.
- E1.5 (forge:tech-lead): PR para a develop e merge; depois, os PRs #151 e #152 recebem a develop.
- E1.6 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-044-e2e-em-partes.md`, com as linhas `MELHORIA:` (passo 9 do fluxo do Jarvis; todo pedido fecha com ela).

## Fora do escopo
- Aumentar o `timeout-minutes` do job ou os timeouts dos testes; retry novo. · `técnico` · base: pedido 041, E2 ("sem aumentar timeout e sem retry como solução")
- Mudar o ruleset ou a proteção de branch (do dono). · `confirmado` · base: regras do projeto
- E2E completo no portão da homolog e rodada noturna (K-144). · `técnico`
- Mudar testes ou código de produção. · `técnico`

## Suposições
- O ruleset exige o check pelo nome `e2e`, e um job agregador com esse nome o satisfaz. · `suposição` · base: `gh pr checks --required` do PR #152 lista `e2e`
- Repositório público: os minutos do GitHub Actions nos runners padrão não custam dinheiro (R-CUSTO). · `suposição` · base: `gh repo view` → visibility PUBLIC

## Critério de pronto
- PQ-1 o run de workflow_dispatch na branch (o PR só abre depois do QA) mostra as 2 partes e o `e2e` verde · prova: run · `técnico`
- PQ-2 nenhum `timeout-minutes` aumentado e nenhum retry novo no diff · prova: cmd · `técnico`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-28): "Eu estou indo dormir faça tudo Que não depende de mim".

## Histórico
- 2026-10-28 07:39: pedido aberto pelo Jarvis (decisão técnica do time: dividir em partes, não subir o teto). Cartão K-155.
- 2026-10-28 07:40: brief devops-engineer-1 enviado ao conferente.
- 2026-10-28 07:41: conferente reprovou o brief devops-engineer-1 (Mermaid numa parte só fora do Escopo); E1 completado no pedido (técnico); brief sem mudança, segue para a rodada 2.
- 2026-10-28 07:42: brief devops-engineer-1 aprovado pelo conferente na rodada 2 (sha256 c92e164eadf9a996232ae4186963b7757daa2e95ad8d3782e81c2b3a25ae881b) e delegado ao forge:devops-engineer.
- 2026-10-28 08:05: devops-engineer-1 entregue: E2E em 2 partes (b0c0f69) e parecer de devops aprovado (19549b9c6dc80704a40dadf22fc81860cb16308c); run 40674397824 de workflow_dispatch verde: parte 1 em 13 min 10 s, parte 2 em 19 min 13 s, `e2e` agregador em success. Conferência da entrega, code review e segurança em paralelo.
- 2026-10-28 08:06: conferência da entrega do devops-engineer-1: não cumpriu só no PQ-1 (o run 40674397824 é de b0c0f69, o workflow; o head 19549b9 só acrescenta o parecer). Decisão técnica: sem retrabalho e sem linha conferida; o QA (E1.4) prova com um run de workflow_dispatch no head final. Briefs do code review (E1.2) e da segurança (E1.3) ao conferente, em paralelo.
- 2026-10-28 08:07: brief security-engineer-1 aprovado pelo conferente na rodada 1 (sha256 7f76941bc25c7207c9774e2cb77b32334147ab05480c9fc245abe07606fa3964) e delegado ao forge:security-engineer.
- 2026-10-28 08:07: brief tech-lead-1 (code review) aprovado pelo conferente na rodada 1 (sha256 d197f80544253082553915a1219041d549614598d97be77052f14e32dadb2d86) e delegado ao forge:tech-lead, em paralelo à segurança.
- 2026-10-28 08:08: security-engineer-1 entregue: parecer de segurança aprovado, sem bloqueante (3eae989baac633d39f7f61766a67b2e9fe0a17c9, commit: 19549b9); A1 recomendado (o agregador não confere a quantidade de partes; cobertura dos 726 com o QA). Conferência da entrega em seguida.
- 2026-10-28 08:08: tech-lead-1 entregue: code review aprovado, sem bloqueante (ef310bf62716e95f161a076c03758c175468496f, commit: 19549b9); A1 (3 partes se a suíte crescer) e A2 (os checks `e2e-parte` não entram no ruleset, do dono) recomendados. Conferência da entrega e brief do QA (E1.4) em paralelo.
- 2026-10-28 08:10: conferência da entrega do tech-lead-1 cumpriu; entrega conferida ef310bf62716e95f161a076c03758c175468496f
- 2026-10-28 08:10: conferência da entrega do security-engineer-1: não cumpriu só no escopo (o ci.yml do devops entra no intervalo porque não havia Desde; família do K-147); os 3 PQs e o parecer (3eae989) conferem. Decisão técnica: sem retrabalho.
- 2026-10-28 08:10: brief qa-engineer-1 aprovado pelo conferente na rodada 1 (sha256 9aa586a0c4896b88457f950cec38c753553391844b27f56b50a923568d0eb3f9) e delegado ao forge:qa-engineer. O forge-check pr também cobra a autoria do parecer de devops (sem registro de que o papel devops gravou esta versão): decisão técnica, o devops-engineer regrava o parecer pela ferramenta de escrita depois do QA (mesma branch; em série para não sujar o intervalo do QA).
- 2026-10-28 08:29: qa-engineer-1 entregue: parecer de QA aprovado (62a505bef43a6120e4befdfac4714bbdbda78f40, commit: ef310bf); run 40677944455 de workflow_dispatch em ef310bf verde; 358 + 358 = 716 testes, igual ao `--list` (o 726 do pedido era a contagem do run antigo); partes em 12 min 31 s e 16 min 25 s. Conferência da entrega e brief devops-engineer-2 (regravar o parecer) em paralelo.
- 2026-10-28 08:31: brief devops-engineer-2 (regravar o parecer de devops no head final) aprovado pelo conferente na rodada 1 (sha256 f480b000b92def583645d53e4025745c3fc9084771dd4d514b0e0eaa539dcd7d); delegação depois da conferência da entrega do QA, para não mover a branch durante ela.
- 2026-10-28 08:32: conferência da entrega do qa-engineer-1 cumpriu; entrega conferida 62a505bef43a6120e4befdfac4714bbdbda78f40
- 2026-10-28 08:32: avisos do conferente sem efeito no veredito: linhas do ci.yml citadas nos achados A1 e A2 do parecer de QA erradas (198 e 252); contagem 358 + 358 = 716 é do autor (log fora do --json). Brief devops-engineer-2 delegado ao forge:devops-engineer.
- 2026-10-28 08:33: devops-engineer-2 entregue: parecer de devops regravado pela ferramenta de escrita, veredito aprovado, `commit: 62a505b` (d26b903eed6c64ab2582bda6c26caa12aca8cd1d); `forge-check pr --base origin/develop` rc=0. Conferência da entrega e brief tech-lead-2 (E1.5, PR e merge) em paralelo.
- 2026-10-28 08:34: brief tech-lead-2 (E1.5, PR e merge) aprovado pelo conferente na rodada 1 (sha256 be3a78fd3e3eb678803409c70879394e477c81fa14f05180cf065be4ef212229); delegação depois da conferência da entrega do devops-engineer-2 (o merge apaga a branch).
- 2026-10-28 08:35: conferência da entrega do devops-engineer-2 cumpriu; entrega conferida d26b903eed6c64ab2582bda6c26caa12aca8cd1d
- 2026-10-28 08:35: aviso do conferente sem efeito no veredito: o devops também corrigiu duas frases do parecer (726 → testes somados; segurança pendente → entregue), dentro do arquivo do Entregar. Brief tech-lead-2 delegado ao forge:tech-lead.
- 2026-10-28 09:01: DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar" (ordem ampla: só o que já está confirmado ou delegado; item novo ou irreversível fica para o dono).
- 2026-10-28 09:02: DECISÃO DO DONO (2026-10-28): "Faça suas recomendações para as decisões até eu voltar para nada ficar parado só registre as decisões tomadas" (R-DECISAO: decisões pendentes viram `delegado`, com a recomendação do time e a base gravadas aqui; custo, acesso, exceção a regra e ato irreversível continuam com o dono).
- 2026-10-28 09:02: tech-lead-2 entregue: PR #154 mesclado por squash na develop (53675ece68f973986b30d7ea251ae5b79443e609); no run de pull_request 40681189300, parte 1 em ~10 min 30 s e parte 2 em ~18 min 50 s, `e2e` pass. Worktree e branch local removidas; a exclusão da branch remota feature/044-e2e-em-partes foi negada pelo classificador de permissões (ação do dono: `git push origin --delete feature/044-e2e-em-partes`). Conferência da entrega em seguida. E1.5, segunda parte: os PRs #151 e #152 (e o #153 do 041) recebem a develop, em série.
- 2026-10-28 09:06: conferência da entrega do tech-lead-2: não cumpriu só no PQ-6 (branch remota feature/044-e2e-em-partes segue no origin em d26b903, exclusão negada pelo classificador de permissões); PQ-1, PQ-3, PQ-4, PQ-5 cumpridos, merge 53675ec, escopo ok. Decisão técnica do Jarvis: sem retrabalho (permissão não se contorna); a exclusão da branch remota fica como ação do dono. E1 a E3 entregues na develop; falta a retro.
- 2026-10-28 09:11: recomendações do time para as pendências do 044, pela decisão do dono das 09:02 (R-DECISAO).
  - (a) A2 do review: não pôr os checks `e2e-parte` no ruleset. `delegado`: decidido pela recomendação do time. Base: o agregador `e2e` já cobre as duas partes, e o ruleset é do dono. Não há nada a executar.
  - (b) Branch remota feature/044-e2e-em-partes: o classificador negou a exclusão. Fica com o dono por acesso. Ação do dono: `git push origin --delete feature/044-e2e-em-partes`. Vale o mesmo para feature/041-estabilidade. Não bloqueia nenhuma entrega.
- 2026-10-28 09:12: o brief agile-coach-1 (retrospectiva) foi reprovado na rodada 1, classe etapa: a retro não estava em `## Etapas`. Decisão técnica do Jarvis (técnico, base: passo 9 do fluxo, em que todo pedido fecha com a retrospectiva): entra a etapa E1.6 (forge:agile-coach), sem mudar o escopo. O brief vai como agile-coach-2, com o Entregar citando E1.6.
- 2026-10-28 09:14: o brief agile-coach-2 (E1.6, retrospectiva) foi aprovado na rodada 2 (sha256 492a60991c5acc2ebeff3f668b49cf7dea5d0f03f6de605666f66803d2ce8b10). Protegido 0444 e delegado ao forge:agile-coach.
- 2026-10-28 09:18: E1.6 entregue pelo agile-coach: retrospectiva em docs/retrospectivas/2026-10-28-044-e2e-em-partes.md (cac20b1f330565708678109818b937bbcfcf6062, só esse arquivo), com 6 linhas MELHORIA. A conferência da entrega foi enviada sem `Desde:`: a única conferida do pedido é de outra branch. As MELHORIAs viraram cartões, por decisão técnica do Jarvis (base: R-DECISAO, "Melhoria vista").
  - K-156 a K-159: Forge. São autoria do parecer cobrada antes do QA, contagem de testes por comando, `Desde:` obrigatório e etapa da retro no modelo do pedido. Numa sessão de projeto, a autonomia sobre o Forge é só propor (R-CONTRIB). Entram no próximo lote ao Forge, depois do F21 e do F22.
  - K-160: projeto, ação do dono (acesso): apagar as branches mescladas ou ativar a exclusão automática depois do merge.
  - K-161: projeto. A série de merges já está adotada. Avaliar a fila de merge (merge queue) é decisão do dono, porque mexe no ruleset e pode custar.
- 2026-10-28 09:19: a conferência da entrega do E1.6 (retrospectiva) deu "não cumpriu" só por escopo.
  - Os PQ-1 a PQ-4 foram cumpridos, e o `git show --stat cac20b1` mostra só o arquivo da retro.
  - O que reprovou: a faixa ae009a7...cac20b1 traz os commits do Jarvis na mesma branch, e o `Desde:` não foi enviado porque as linhas `conferida` do pedido (ef310bf, 62a505b, d26b903) são da feature/044-e2e-em-partes e não estão nesta branch. A nota do Jarvis dizia que a única conferida era a d26b903, mas são três; o erro de redação não mudou o veredito.
  - Decisão técnica do Jarvis (técnico, base: o defeito é da faixa, não da entrega; K-158): a entrega fica aceita, sem retrabalho e sem linha conferida.
  - O 044 está entregue. Falta a segunda parte da E1.5: os PRs #151 e #152 recebem a develop, em série, depois do #153 do 041, que está parado por ação do dono. Custos de transcrição no fechamento do dia.
