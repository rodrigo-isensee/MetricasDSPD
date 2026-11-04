# Retrospectiva do pedido 065: bloqueados fora do mapa real (2026-11-04)

Fontes: `docs/pedidos/065-bloqueados-sem-dado-real.md` (Histórico inteiro), `docs/kanban/conferencias.md` (35 linhas do 065, de 1658 a 1706), `docs/kanban/historico.md` (K-205, 1 movimento, linha 743). Horas do Histórico do pedido são as da escrita do Jarvis, não as do evento. `forge-check esperas`, `forge-check escape resumo` e `forge-check transcricao custo` não foram rodados nesta etapa: custo, carga da máquina e escapes por controle ficam **não medidos**. Métricas do processo, nunca de pessoa ou de agente. Amostra de 1 cartão (K-205): valores brutos, sem percentil.

## 1. Dados do fluxo
| Marco (2026-11-04, -03:00) | Hora | Intervalo |
|---|---|---|
| Pedido aberto pela decisão "C"; recibo; K-205 criado | 08:04 | |
| Recibo confirmado pelo dono ("isso") | 08:06 | 2 min |
| E1.1 desenho (arquiteto) | 08:14 | 8 min |
| E1.2 back (3 commits locais, pre-push barrou no typecheck do web) | 08:36 | 22 min |
| E1.3 front, branch inteira enviada (205052155) | 08:56 | 20 min |
| E1.7 revisão de interface, aprovada com ressalvas (A1 alto: percentual do O5) | 09:04 | 8 min |
| Volta 1 pela decisão B do dono (O5 inteiro sem dado) | 10:04 | 1h00 (inclui a espera da Q-065-1) |
| Volta 1 do back (26692ba) e do front (ae729b2) | 10:14 e 10:26 | 22 min |
| E1.4 review aprovado (b02fd50) | 10:44 | 18 min |
| E1.5 QA aprovado (e8eedda; 917ee0b) | 11:13 | 29 min |
| Volta 2: format:check do fluxo.tsx, hook recusou o commit | 11:22 | 9 min |
| E1.4 review regravado (545924e); E1.5 QA regravado (1f343f3), forma do parecer corrigida (8dba5ed) | 11:48, 11:59, 12:04 | 42 min |
| E1.6 PR 214 aberto, check `testes` falhou na cobertura do web (branches 99,97%) | 12:16 | 12 min |
| Volta 3: W2b em a629434, cobertura 100% | 12:31 | 15 min |
| Pareceres regravados (a4ff25d, e6ae9cc) | 12:43 | 12 min |
| PR 214 parou: `docs-contratos` falhou (O1, O3, O5 incompatíveis; O2 campo novo) | 13:19 | 36 min |
| Volta 4 do back parou sem mudar nada (política §2 x saída 2) | 13:25 | 6 min |
| E1.8 decisão de contrato (aceite na v1) e E1.9 aprovação | 13:30 e 13:33 | 8 min |
| Volta 4 entregue (c1e0c06) | 13:42 | 9 min |
| Pareceres regravados (ae606dd, e60a0a3) | 13:56 | 14 min |
| Merge negado pela permissão do ambiente; head 5df5a60 com merge da develop | 14:18 | 22 min |
| Merge do PR 214 por squash (informado pelo dono); K-205 Em andamento -> Pronto | 14:48 (14:48:44) | 30 min |

- Lead time e cycle time de K-205: 6h44 (08:04 a 14:48). O `historico.md` só tem a linha de saída (Em andamento -> Pronto); as de entrada e das voltas não estão lá, então o cycle time vem do Histórico do pedido. Vazão: 1 cartão, 1 PR. Percentil: não publicado (1 item).
- Fatia de espera: cerca de 1h na Q-065-1 (09:04 a 10:04) e 30 min no merge (14:18 a 14:48); resto é trabalho e rodadas de conferência.
- Retrabalho: 1 cartão devolvido, 4 voltas (decisão B 10:04; formatação 11:22; cobertura 12:16; contrato 13:19). A volta 1 veio de decisão do dono, não de falha. As voltas 2, 3 e 4 vieram de coisas que só a CI ou o hook pegaram.
- Estabilidade (DORA): 1 PR de 591 linhas na develop; nenhuma falha em produção. Escape: 1 achado depois dos pareceres aprovados e antes do merge: contrato incompatível (13:19, `docs-contratos`) e cobertura do web (12:16). Escape por gravidade e controle: `forge-check escape resumo` não rodado, **não medido**. Lead time de mudança (primeiro commit da branch ao merge): primeiro commit sem hora no Histórico, **não medido**.
- Clareza (tags do pedido): perguntas 1 (Q-065-1 no Histórico; a seção "Registro de clareza" não existe, então as tags `PERGUNTA:`, `NAO-ENTENDI:`, `ESCOPO+:` e `DEVOLVIDA:` ficam **não medidas**). Itens por marca: 2 `confirmado`, 0 `delegado`, 0 suposição, 0 técnico, 0 no-protótipo. 3 decisões do dono, todas `confirmado`. Etapas E1.7 a E1.10 nasceram depois do início (E1.7 em 09:04): mudança de processo, não de escopo.

### Briefs e conferências
33 conferências de brief e 2 de entrega no 065; 9 briefs reprovados (27% das conferências de brief) e 2 entregas "não cumpriu".

| Classe | Qtd | Linhas (conferencias.md) | Causa resumida |
|---|---|---|---|
| decisao | 5 | 1659 (08:15 back r1), 1673 (11:17 front r2), 1684 e 1685 (13:21 e 13:22 back r1 e r2), 1706 (15:34 coach r2) | cobertura além do pedido pela decisão A do 064; decisão A do 064 lida como restrição ao código e nota só no brief, não no registro; faltou decisão A no brief do coach |
| forma | 2 | 1670 (10:47 QA r1), 1678 (12:06 tech-lead r1) | placeholder `W` no Ler |
| prova | 1 | 1672 (11:15 front r1) | `format:check` sem PQ |
| citacao | 1 | 1701 (14:51 coach r1) | objetivo citava o 064 |
| entrega: forma | 1 | 1664 (09:04) | E1.7 criada depois da aprovação do brief |
| entrega: escopo | 1 | 1668 (10:44) | `docs/api` fora do Entregar do brief do back |

Rodadas até aprovar: back-1 2, front-3 3, back-3 3, QA-1 2, tech-lead-3 2, coach-1 3 (esta delegação). A decisão A do 064 ("sem mudar código" do levantamento) atrapalhou 4 dos 9 briefs reprovados e foi lida como restrição desta etapa (1684 e 1685).

Pareceres: review com 4 versões (21fffba, 545924e, a4ff25d, ae606dd), QA com 5 (917ee0b, 1f343f3, 8dba5ed, e6ae9cc, e60a0a3): 9 gravações para 3 mudanças de código depois do primeiro review (formatação 742e4f3, teste a629434, contrato c1e0c06) mais 1 de forma do parecer.

## 2. O que funcionou
- O desenho curto do arquiteto (08:14) e a decisão por política de contrato (E1.8 em 13:30 e aprovação em 13:33, 3 min) deram o caminho sem `/api/v2` e sem inventar mudança de produto.
- A revisão de interface (09:04) achou o A1 (percentual do O5 inflado) antes do review, o que fez a Q-065-1 subir ao dono e a decisão B (10:04) resolver A1 e M1 com o O5 inteiro sem dado.
- Back e front pararam sem contornar: pre-push barrou o typecheck do web (08:36), hook recusou commit (11:22), a volta 4 parou sem mudar nada diante da contradição da política (13:25). Nenhum `--no-verify`.
- O E2E novo (7/7) e a mutação em `parte-sem-dado.ts` (2 mutantes mortos) cobriram o estado sem dado no QA (11:13).
- A CI achou os dois problemas que o local não achou, antes do merge: custo de 2 voltas, nenhum escape para a develop.

## 3. O que atrapalhou (fatos)
- **Contrato incompatível que review e QA não pegaram.** Em 13:19 o `docs-contratos` (src/insumos.test.ts:130 e 134) acusou fotografias incompatíveis em O1, O3 e O5 e páginas geradas desatualizadas; review (10:44, 11:48, 12:43) e QA (11:13, 11:59, 12:43) aprovaram sem esse check. Custo: 36 min até a parada, 22 min de volta 4 e mais 2 regravações de parecer (13:56).
- **Cobertura do web que o pronto local não pegou.** A entrega da E1.3 (08:56) tinha "web 1425 testes", sem cobertura; a CI falhou em 12:16 (branches 99,97% contra 100%, run 41853752754; era a descrição do O1 por coluna sem bloqueio). Custo: volta 3 (15 min) e mais uma regravação dos dois pareceres (12:43).
- **Pareceres regravados por commits depois do review.** Formatação (742e4f3), teste (a629434) e contrato (c1e0c06) mudaram a ponta depois do review aprovado; cada vez, review e QA regravam: 9 gravações em 1 pedido (ver seção 1). A parte da forma do parecer (A2 do QA em `forge-check pr`, 11:59 e 12:04) custou 2 gravações sem mudança de código.
- **Rodadas de brief por placeholder e decisão da dependência.** 2 reprovações por `W` no Ler (10:47, 12:06), 1 por `format:check` sem PQ (11:15) e 5 por decisão do 064 (ver tabela). Soma de 9 reprovações; tempo entre reprovação e aprovação do mesmo brief de 1 a 5 min nas rodadas rápidas e 26 min no QA-1 (10:47 a 11:13).
- **Etapa nova invalida brief já aprovado.** E1.7 criada às 09:04 reprovou por forma as entregas de back e front (1664) que tinham brief aprovado às 08:15 e 08:56; `docs/api` fora do Entregar (1668, 10:44) é omissão do brief.
- **Hook recusando heredoc com pipe ou redirecionamento.** 11:13 (QA gravou script com Write e rodou com bash, registrado como possível contorno), 11:22 (commit com heredoc e pipe recusado, o agente parou) e 12:43 (QA trocou heredoc com redirecionamento por Write e commit separado). Cada vez o Jarvis precisou classificar a ação e o agente refazer.
- **Merge negado pela permissão do ambiente** (14:18): 30 min até o dono informar o merge (14:48).
- **Carga da máquina e laço sem pausa de um despachante**: o Histórico, as conferências e o `historico.md` não registram barramento por carga de máquina nem o laço do despachante neste pedido; ficam **não medidos** aqui. `uptime` às 15:40: load average 1,19, 1,73 e 2,25, sem carga alta agora. O registro dessas ocorrências depende do Jarvis anotá-las no Histórico do pedido na hora.
- **Política de contrato contradiz a si mesma** (13:25): §2 pede `/api/v2` para trocar tipo, a saída 2 do gate aceita em `aceitas.json`; a decisão do arquiteto (13:30) já registrou como cartão.

## 4. Ações (até 3) e melhorias
1. Jarvis com o tech-lead (projeto): antes de pedir o review, rodar o equivalente local da CI (`docs:check`, `docs-contratos` e cobertura do web) e anotar a saída no brief do review e do QA; só regravar review e QA uma vez, depois de a ponta estar estável. Medida: pareceres regravados por mudança de ponta depois do review aprovado, alvo menor ou igual a 2 por pedido (hoje 9 gravações em 1 pedido); falhas da CI por contrato ou cobertura depois de review e QA aprovados = 0 nos próximos 3 pedidos.
2. Jarvis (Forge): o gerador de brief copia sempre as linhas `DECISÃO DO DONO` das dependências do pedido (como o 064 e a decisão A) e recusa `W` ou placeholder no Ler; etapa nova no pedido não reprova brief aprovado antes dela. Medida: reprovações de brief por `decisao` e `forma` menores ou iguais a 1 por pedido (hoje 7 de 9), conferidas em `conferencias.md`.
3. Jarvis (Forge): o prompt-padrão manda gravar arquivo com Write e commitar com `git commit -m` curto, sem heredoc, pipe nem redirecionamento na mesma chamada. Medida: recusas do hook conformidade por pedido, alvo 0 (hoje 3).

| Classe de R-DECISAO | Linha |
|---|---|
| Melhoria vista (entrada direta) | MELHORIA 1, 2, 3 e 5 |
| Melhoria vista (arquiteto e tech-lead decidem, política de contrato) | MELHORIA 4 |

MELHORIA: o contrato incompatível (O1, O3, O5) passou por review e QA e só a CI o pegou, depois de 36 min de espera e de 2 regravações de parecer. Evidência: pedido 065, Histórico de 2026-11-04 13:19 ("Review e QA não pegaram"); `docs/kanban/conferencias.md` linhas 1669 a 1683 (briefs de review e QA sem `docs:check`); `docs/analises/065-decisao-contrato.md`. Medida do efeito: falhas de `docs-contratos` ou `docs:check` na CI depois de parecer aprovado em PR que toca contratos = 0 em 3 pedidos. Projeto (`pnpm run pronto`, ou o brief do review e do QA, inclui `docs:check` e `docs-contratos` quando o diff toca `packages/contratos`; checklist do tech-lead em `docs/engineering/`).

MELHORIA: a cobertura do web não passou pelo pronto local e a CI falhou depois de dois pareceres aprovados. Evidência: pedido 065, Histórico de 2026-11-04 08:56 (web 1425 testes sem cobertura) e 12:16 (check `testes`, branches 99,97%, run 41853752754; ponto em a629434); `docs/kanban/conferencias.md` linha 1672 (brief da volta 3 do front). Medida do efeito: falhas de cobertura do web só vistas na CI = 0 em 3 pedidos que tocam o web. Projeto (`pnpm run pronto` roda `test:coverage` do web com o mesmo limiar da CI, ou o PQ do brief do front exige a saída da cobertura).

MELHORIA: pareceres de review e de QA regravados 9 vezes por commits de formatação, teste e contrato depois do review e por forma do parecer em `forge-check pr`. Evidência: pedido 065, Histórico de 2026-11-04 10:44, 11:13, 11:48, 11:59, 12:04, 12:43 e 13:56; `docs/kanban/conferencias.md` linhas 1669, 1671, 1675 a 1677, 1681, 1682, 1690 e 1691. Medida do efeito: gravações de parecer por pedido com 1 PR, alvo menor ou igual a 4 (review e QA 2 vezes cada); regravações só por forma = 0. Forge (a ordem do fluxo: `format:check`, cobertura e docs da API entram no pronto da entrega antes do review; `forge-check pr` valida o formato do parecer antes de o QA gravar, e uma linha só de motivo em "resolvido em" no texto, fora do bloco Achados).

MELHORIA: reprovações de brief por placeholder no Ler, por falta de PQ do `format:check` e por decisão do 064 lida como restrição ao código, 9 reprovações em 35 linhas, e etapa criada depois da aprovação do brief reprovou entrega por forma. Evidência: `docs/kanban/conferencias.md` linhas 1659, 1664, 1670, 1672, 1673, 1678, 1684, 1685, 1701 e 1706; pedido 065, Histórico de 2026-11-04 09:04 ("MELHORIA: etapa nova no pedido invalida brief já aprovado") e 13:21. Medida do efeito: reprovações de brief por `decisao` e `forma` menores ou iguais a 1 por pedido; entregas "não cumpriu" por etapa nova = 0. Forge (o gerador de brief copia literalmente as `DECISÃO DO DONO` das dependências, com a nota "vale só para o levantamento" quando for o caso, e recusa `W` no Ler; `forge-check` julga a entrega pelo pedido do momento da aprovação do brief).

MELHORIA: o hook `conformidade` recusou heredoc com pipe ou redirecionamento e o agente precisou refazer a chamada, 3 vezes no pedido. Evidência: pedido 065, Histórico de 2026-11-04 11:13 (QA, script com Write e bash), 11:22 (commit com heredoc e pipe, o agente parou) e 12:43 (QA, heredoc com redirecionamento e commit na mesma chamada). Medida do efeito: recusas do hook por pedido, alvo 0 em 3 pedidos; tempo de espera da volta por recusa (hoje 9 min na volta 2, de 11:13 a 11:22). Forge (prompt-padrão dos agentes: gravar com Write e commitar com `git commit -m` curto, uma ação por chamada).

MELHORIA: a política de mudança de contrato (`docs/contratos/politica-de-mudanca.md`) se contradiz entre o §2 (`/api/v2` para trocar tipo) e a saída 2 do gate (aceite em `aceitas.json`), o que parou a volta 4 e exigiu E1.8 e E1.9. Evidência: pedido 065, Histórico de 2026-11-04 13:25 e 13:30; `docs/analises/065-decisao-contrato.md`. Medida do efeito: volta por política ambígua de contrato = 0 nos próximos 3 pedidos que tocam contrato; E1.8 e E1.9 sem parada de volta anterior. Projeto (o arquiteto escreve no §2 o critério de quando o aceite na v1 vale; cartão já aberto pela E1.8).

## 5. Revisão das ações da retrospectiva anterior (064)
- Ação 1 (pasta de worktree existente e gravável): o 065 usou a worktree 052d sem falha de "Read-only file system" (08:06 a 12:43): **funcionou** nesta amostra de 1 pedido.
- Ação 2 (conferência da base sem ler `.env`): não reaparece no 065 (a base já veio das consultas do 064): **não medida**.
- Ação 3 (item "gravador" no mapa de métrica): o 065 é a correção de L1 e não houve mapa novo: **não medida**.
