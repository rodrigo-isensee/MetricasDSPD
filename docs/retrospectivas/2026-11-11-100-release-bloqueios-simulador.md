# Retrospectiva do pedido 100: release da develop para a main (bloqueios 9a e 9b, simulador desligado, K-272, K-270, CI)

Fontes: `docs/pedidos/100-release-bloqueios-simulador.md` (Histórico inteiro), `docs/kanban/conferencias.md` (linhas do 100), `docs/kanban/melhorias.md`. Horas no relógio local (-03:00), de 2026-11-11, como o Histórico do pedido as registra (não conferidas com o `gh` nesta delegação, que não tem rede). Processo, nunca pessoa. Retrospectiva curta.

## 1. Dados do fluxo
| Marco | Hora | Fonte |
|---|---|---|
| Pedido aberto (develop verde em 77c208a9) | 16:25 | Histórico do pedido |
| E1.1 review, E1.2 segurança, E1.3 QA aprovados | 16:31, 16:35, 17:13 | Histórico |
| PR 325 (K-271) mesclado pelo dono na develop, no meio da release | 16:37 | Histórico |
| PR 326 (CHANGELOG e pareceres) mesclado | 17:31 | Histórico |
| Promoção recusada (pareceres desatualizados e falta de devops); volta em `docs/100-release-b` | 17:31 | Histórico |
| Pedido 100-REV: três portões confirmam por delta vazio; conferência da volta passa | 17:48 | Histórico |
| PR 327 (volta) mesclado na develop (1d697d6a) | 17:57 (Histórico também diz 18:11) | Histórico |
| PR 328 (develop para homolog) mesclado, 20 checks verdes e 3 pulados | 18:40 | Histórico |
| PR 332 (homolog para main) aberto para o dono, `homolog-aprovada` verde | 18:59 | Histórico |

- **Lead time do pedido até o PR de release aberto para o dono:** 16:25 a 18:59 = 2 h 34 min, **estimado** (Histórico do pedido). Até a main: **não medido** (o merge é do dono e estava aberto). Sem ele, a meta do dono ("amanhã cedo com nada pendente e os PRs pra main abertos") foi cumprida.
- **Cycle time, dois relógios (D-4), vazão:** **não medidos**: o pedido não tem cartão próprio no `historico.md` (o K-204 é do 075) e `forge-check voltas` não foi rodado. Vazão da release: 10 PRs levados à main (316 a 324 e 325) mais 4 de processo (326, 327, 328 e 332).
- **Voltas da release:** 1 volta de documentação (PR 327) mais o pedido 100-REV, causadas pelo PR 325 mesclado depois dos pareceres. A volta custou 17:31 a 17:57, cerca de 26 min até o PR 327 mesclado, com 4 portões revalidados (review, segurança, QA, devops) e 6 briefs a mais (tech-lead 9, 11 e 13; segurança 3; QA 3; devops 1), mais os 3 do 100-REV.
- **Retrabalho pelas conferências:** só 4 linhas do 100 em `conferencias.md` (devops-9, tech-lead-14, tech-lead-15, agile-coach-0), todas `brief`, rodada 1, aprovadas: 4 de 4 = 100% de aprovação na 1ª conferência. **Lacuna:** o Histórico cita pelo menos 15 briefs selados (tech-lead 1, 3, 5, 9, 11, 13, 14, 15; segurança 1 e 3; QA 1 e 3; devops 1 e 9; agile-coach 0) e duas "entrega conferida" (17:15 e 17:48); as linhas de 11 deles e as de `entrega` não aparecem. Por isso, retrabalho de conferência por pedido: **não medido** (amostra parcial); dado ausente não vira zero.
- **QA e segurança:** 0 bugs na QA da release (17ffe670) e na revalidação (b2c8e252); segurança aprovada duas vezes (aeba81a0, 0c43e495); devops aprovado (2b85b70e). Recomendados abertos: A1 a A3 de review, A1 a A3 de segurança, A1 de QA (8 timeouts por carga, verdes sozinhos), A1 e A2 de devops.
- **Estabilidade (DORA):** taxa de falha e tempo de recuperação **não medidos** (a release ainda não chegou à main). A homolog passou com portão verde no 50387f96 (run 43105079447), sem bypass, o que lê melhor que o 093 (main com bypass).
- **Clareza:** sem a seção "Registro de clareza", `PERGUNTA:`, `NAO-ENTENDI:` e `DEVOLVIDA:` são **não medidas**. Lido à mão: marcas do cabeçalho 1 confirmado, 1 técnico, 0 suposição, 0 delegado (0%); 1 pergunta em curso (Q-100-1, encerrada 18:43); 0 `ERRO-JARVIS` no pedido; 4 `DECISÃO TÉCNICA` do Jarvis (16:37, 17:31, 17:41, 17:45); 1 `DECISÃO DO DONO` literal no pedido (17:51, "ate o merge da main") e 1 relatada (18:43, "Deixar como estão"); nenhuma aprova proposta de processo, `versão:` não aplicável.
- Esperas, escapes, corrigidos, afrouxamentos (linha de base M14b): não rodados nesta delegação; **não medidos**.

## 2. O que funcionou
- **A lição do 093 foi aplicada na abertura:** o pedido pediu ao dono para segurar merges na develop (16:25). A volta foi 1 só, contra 2 do 093, e foi de ~26 min contra ~1 h 10 min.
- **O forge-check recusou a promoção com pareceres desatualizados** (17:31) em vez de a release seguir com review e QA de um sha que já não era a ponta; o caminho `-REV` o deixou aberto sem contorno (17:45): a recusa foi tratada como decisão, não driblada.
- **0 bugs na QA e segurança aprovada duas vezes:** o conteúdo da release não foi problema; a promoção chegou à homolog com 20 checks verdes.
- **Autorização do dono clara e usada dentro do limite** (17:51): o tech-lead mesclou em develop e homolog com portão e checks verdes; o merge da main ficou com o dono.
- **A fila do Actions foi tratada como pergunta ao dono**, não contornada, quando o classificador recusou o cancelamento (18:21); a resposta e a prova (HTTP 409) ficaram no pedido.

## 3. O que atrapalhou (fatos)
- **O PR 325 foi mesclado na develop com os pareceres prontos** (16:37, depois de E1.1 a E1.3 e antes do CHANGELOG): invalidou review, segurança e QA pelo sha e exigiu a volta e o pedido 100-REV (3 portões despachados só para confirmar delta vazio). Segunda release seguida em que o pedido de segurar a develop não impediu o merge.
- **O PR 326 foi mesclado com os checks ainda na fila** (17:31) e o PR 327 só mesclou às 17:57 (Histórico também diz 18:11, divergência de 14 min).
- **Fila do GitHub Actions entupida:** cerca de 15 execuções em fila, quase todas de push já substituído, andando uma por vez; as execuções antigas estão presas em `queued` sem job, o GitHub recusa cancel e force-cancel (HTTP 409, "has not been queued yet"). O dono decidiu "Deixar como estão"; a E1.9 não foi executada. A fila custou espera nos PRs 326 e 327.
- **Laço de espera da skill e `gh pr merge` por número recusados pelos hooks** (18:57, registrado no pedido como Melhoria vista): o laço da `esperar-estado` que cita `gh run` ou homolog é recusado por R-CONFORMIDADE, e R-CONTRIB recusa `gh pr merge` por número.
- **PR atrás da develop na hora do merge** (relato do brief desta delegação; o pedido não tem linha dele): o merge fica sem motivo claro (ver melhoria registrada em 2026-11-11).
- **A conferência recusou os três pareceres reescritos como "fora do declarado"** (17:41): o brief da volta mandava reescrevê-los, e o Forge só aceita o pedido `-REV`; um brief a mais (tech-lead-11) e ~7 min (17:41 a 17:48) para chegar ao caminho certo.
- **Registro das conferências incompleto** (ver seção 1): recorrência do 090 a 094 e do 093.

## 4. Ação (uma causa nova) e linhas `MELHORIA:`
Causa nova escolhida, uma só: **o merge de um PR de outro pedido na develop, depois dos pareceres da release, é o que gera a volta**, e o pedido ao dono não o impede (093, duas vezes; 100, uma). A proposta formal só entra em `docs/kanban/melhorias.md` pelo `forge-placar propostas` (uma proposta aberta por vez), com o `tech-lead`; não aberta aqui.

MELHORIA: a release 100 teve 1 volta mais o pedido 100-REV porque o PR 325 foi mesclado às 16:37, depois do review, da segurança e da QA (docs/pedidos/100-release-bloqueios-simulador.md, entradas 16:37, 17:31 e 17:48; ~26 min de volta e 6 briefs a mais, fora os do 100-REV); medida: voltas da release por pedido = 0 nas próximas 3 releases, com os pareceres começando só depois de a develop ficar sem PR aberto de outro pedido pronto para mesclar (checagem do `gh pr list --base develop` na abertura); projeto, e vai ao Forge a opção de o gerador do brief da release listar PRs abertos contra a develop antes do E1.1.
MELHORIA: `forge-check` aceitaria o delta só de documentação sem pedido `-REV` quando todos os portões o confirmam como vazio (3 portões despachados para confirmar delta vazio, 17:45 a 17:48, 0 commits); medida: briefs de revalidação sem commit por release = 0; vai ao Forge, ainda não decidido: ligado à linha de 2026-10-17 em `docs/kanban/melhorias.md`, e a primeira vez em que o `-REV` rodou até o fim.
MELHORIA: fila do GitHub Actions com 15 execuções presas em `queued`, sem job e não canceláveis (HTTP 409; docs/pedidos/100-release-bloqueios-simulador.md, entradas 18:21 e 18:43); o dono decidiu deixar como estão; medida: execuções antigas em `queued` por release = 0 depois que o GitHub as expirar, e PRs só de `.md` sem a suíte inteira (já em `docs/kanban/melhorias.md`, 2026-11-11, projeto de CI); fica só como dado.
MELHORIA: laço de espera da `esperar-estado` recusado por R-CONFORMIDADE quando cita `gh run` ou homolog e `gh pr merge` por número recusado por R-CONTRIB (docs/pedidos/100-release-bloqueios-simulador.md, entrada 18:57); já em `docs/kanban/melhorias.md` (2026-11-10, 2026-11-11 15:36 e a do hook R-CONFORMIDADE); vai ao Forge, fica só como dado.
MELHORIA: PR atrás da develop na hora do merge sem motivo claro na recusa (relato do brief; sem linha no pedido); já em `docs/kanban/melhorias.md` (2026-11-11, "hook de merge e brief de merge"); fica só como dado.
MELHORIA: horas do Histórico do pedido que divergem do `gh` (PR 327: 17:57 contra 18:11) e `conferencias.md` sem 11 dos 15 briefs e sem as duas linhas `entrega` do 100; recorrência do 093 (mesmo padrão), já em ação aberta lá; medida: linhas de `conferencias.md` por pedido iguais aos briefs selados no Histórico = 100% nos próximos 3 pedidos; projeto (o Jarvis registra a conferência no ato), fica só como dado.
