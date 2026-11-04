# Retrospectiva do pedido 066: S8 só com incidentes que têm resposta (2026-11-04)

Fontes: `docs/pedidos/066-s8-so-com-resposta.md` (Histórico inteiro), `docs/kanban/conferencias.md` (12 linhas do 066, de 1692 a 1715), `docs/kanban/historico.md` (K-217, 2 movimentos, linhas 744 e 746). Horas do Histórico do pedido são as da escrita do Jarvis, não as do evento. `forge-check esperas`, `forge-check escape resumo`, `forge-check corrigidos`, `forge-check afrouxamentos` e `forge-check transcricao custo` não foram rodados nesta etapa: custo, escapes por controle e afrouxamentos ficam **não medidos**. Métricas do processo, nunca de pessoa ou de agente. Amostra de 1 cartão (K-217): valores brutos, sem percentil.

## 1. Dados do fluxo
| Marco (2026-11-04, -03:00) | Hora | Intervalo |
|---|---|---|
| Pedido aberto pela decisão "B"; recibo; K-217 criado | 14:11 | |
| Recibo confirmado pelo dono ("é isso"); decisão de discovery só com o arquiteto | 14:12 | 1 min |
| E1.1 desenho (`docs/analises/066-desenho.md`) | 14:17 | 5 min |
| E1.2 back (baf0b8e) | 14:37 | 20 min |
| E1.3 front (69168ac) | 14:45 | 8 min |
| E1.7 revisão de interface, aprovada com ressalvas (2 médios, 2 baixos) | 14:48 | 3 min |
| E1.4 review aprovado (80f7e8d, commit 7073c1c) | 15:04 | 16 min |
| E1.5 QA aprovado (2b394b5) | 15:29 | 25 min |
| E1.6 parou: `forge-check pr` recusou o review por autoria | 15:34 | 5 min |
| Mesma parada registrada de novo no Histórico (texto idêntico) | 15:45 | 11 min |
| Review regravado com Write; PR 216 aberto; squash falhou por conflito em `docs/api/metricas.md` | 16:17 | 32 min |
| E1.8 merge da develop (a54ac8d); `forge-check pr` pede parecer novo | 16:23 | 6 min |
| E1.9 review (0f8bee3) e E1.10 QA (6cef210), regravados na ponta | 16:41 | 18 min |
| E1.11 PR 216 mesclado por squash (K-217 Em QA -> Pronto, 17:03:35) | 17:03 | 22 min |

- Lead time do pedido (decisão do dono ao merge): 2h52 (14:11 a 17:03). Cycle time de K-217: cerca de 2h51 pelo Histórico do pedido; o `historico.md` não tem a linha de entrada em "Em andamento" nem a de Code review, só `Em andamento -> Em QA` (15:05) e `Em QA -> Pronto` (17:03:35), então o cycle time do quadro é **não medido** e o número acima vem do pedido. Vazão: 1 cartão, 1 PR. Percentil: não publicado (1 item).
- Fatia de espera por ambiente e ferramenta: 43 min entre a recusa de autoria (15:34) e o PR aberto (16:17), e 46 min entre o conflito (16:17) e o merge (17:03), dos quais 18 min de regravação de pareceres. Soma 89 min de 172 (52%) sem mudança de código nenhuma. O tempo com código novo foi de 14:12 a 15:04 (52 min).
- Retrabalho: 0 cartões devolvidos (nenhum `Code review -> Em andamento`); as 2 paradas depois do QA vieram de ferramenta (autoria) e de integração (conflito), não de defeito. Estabilidade (DORA): 1 PR (squash) na develop, sem falha em produção; falha e recuperação: nenhuma. Escape: nenhum achado depois dos pareceres aprovados; ressalvas A1 a A3 do review e do QA seguiram como ressalva no PR (não são bug). Lead time de mudança (primeiro commit da branch ao merge): primeiro commit sem hora registrada, **não medido**.
- Clareza (tags do pedido): a seção "Registro de clareza" não existe, então `PERGUNTA:`, `NAO-ENTENDI:`, `ESCOPO+:` e `DEVOLVIDA:` ficam **não medidas**. Itens por marca: 2 `confirmado`, 0 `delegado`, 0 suposição, 0 técnico, 0 no-protótipo. Perguntas na fila: 0 (campo "Clareza" do pedido). Etapas E1.8 a E1.12 nasceram depois do início (a partir de 16:17): mudança de processo e de integração, não de escopo.

### Briefs e conferências
12 conferências de brief no 066; 2 reprovadas (17%), as duas do mesmo brief (tech-lead-3), e nenhuma entrega "não cumpriu".

| Classe | Qtd | Linhas (conferencias.md) | Causa resumida |
|---|---|---|---|
| decisao | 2 | 1708 (15:43 r1), 1710 (15:45 r2) | conferente leu o 064 sem a nota da linha 25; faltaram as linhas de Histórico do 064 e o alcance da recusa de autoria |

Rodadas até aprovar: o tech-lead-3 levou 2 reprovações em 2 min (15:43 e 15:45) e foi aprovado às 16:17; os outros 10 briefs passaram na rodada 1. Tempo da reprovação à aprovação do mesmo brief: 34 min (15:43 a 16:17), em boa parte a execução da delegação anterior (tech-lead-2) e a regravação do review.

Pareceres: review com 3 versões (80f7e8d, regravado com Write sem sha anotado, 0f8bee3) e QA com 2 (2b394b5, 6cef210): 5 gravações em 1 PR, para 0 mudanças de código depois do primeiro review. Nenhuma das 3 regravações do review mudou conteúdo técnico: uma foi por autoria da ferramenta, duas por merge da develop.

## 2. O que funcionou
- O desenho curto do arquiteto (14:17, 5 min) achou que a biblioteca (`s8.ts`) já dividia só pelos que responderam e que o 0% vinha do adaptador `extrasAC`: a correção ficou no adaptador, com a versão de critério `066:S8-com-resposta` em `CRITERIOS_ACELERATO` e a D-10 mantida como histórico. A mudança de critério ficou com data e sem alterar a forma do contrato, e nenhum agente reescreveu cálculo fora da biblioteca compartilhada.
- A decisão técnica de pular o discovery completo (14:12) sem gatilho de segurança tirou o upstream de um pedido pequeno; todo o código ficou pronto em 36 min (14:12 a 14:48).
- A revisão de interface (14:48) correu antes do review e produziu 2 médios e 2 baixos que o review reavaliou como recomendados A1 a A3, sem devolução.
- O brief do QA (15:16) já mandou rodar `docs:check` e a cobertura do web, e o QA fechou com server 1616, web com cobertura 100%, docs-contratos 102 e E2E COMP-12 2/2: nenhuma falha de CI apareceu depois de parecer aprovado, o contrário do PR 214.
- As duas paradas (15:34 e 16:23) foram sem contornar: a ferramenta recusou e o agente parou; nenhum `--no-verify`.

## 3. O que atrapalhou (fatos)
- **Recusa de autoria do review em `forge-check pr`** (15:34). O parecer de review aprovado às 15:04 foi gravado sem o registro de que o papel tech-lead o escreveu com Write; o PR só abriu às 16:17, 43 min depois, com o mesmo conteúdo regravado. Custo: 43 min e 1 gravação sem mudança de conteúdo. Registro duplicado no Histórico do pedido (15:34 e 15:45 com o mesmo texto).
- **Conflito em `docs/api/metricas.md` com a develop** (16:17). O squash do PR 216 falhou porque a develop recebeu o 065 e o 067 e o 066 editou a mesma seção; a resolução foi uma linha, mantendo as duas seções, sem código.
- **Pareceres regravados depois do merge da develop** (16:23 a 16:41). O delta era só `docs/api/metricas.md`, mas `forge-check pr` pediu review e QA novos na ponta (0f8bee3 e 6cef210): 18 min e 2 gravações. O review inteiro, aprovado em 15:04, foi regravado 3 vezes até o merge.
- **Brief reprovado por decisão da dependência** (15:43 e 15:45). A decisão e a nota do 064 (linha 25) não vieram copiadas no brief do tech-lead-3; é a causa `decisao` que a retrospectiva do 065 já apontava (4 de 9 reprovações), e voltou.
- **Quadro incompleto.** K-217 tem 2 linhas em `historico.md`: sem a entrada em "Em andamento" e sem "Code review"; o cartão foi de "Em andamento" para "Em QA" e de "Em QA" direto para "Pronto" (a coluna "Aguardando sua validação" fica de fora, como no 065, porque o merge em develop é do tech-lead e o PR 216 é de integração). A idade do cartão e o tempo em Code review não saem do histórico; a coluna foi pulada na prática, que a política do quadro proíbe.
- **Etapa pendente do dono depois do deploy**: preencher `criterios-ac` com a data do deploy, para o gráfico marcar a mudança de critério (T2.6). Sem essa data, o critério novo não aparece marcado no gráfico: risco aberto, **não medido** (o deploy não aconteceu).
- Carga da máquina e laço de despachante: o Histórico e as conferências não registram nenhum caso no 066; ficam **não medidos**. Recusas do hook `conformidade`: nenhuma registrada no 066.

## 4. Ações (até 3) e melhorias
1. Jarvis (Forge): o brief de qualquer agente que lê uma dependência copia literalmente as linhas `DECISÃO DO DONO`, as notas da linha e as linhas de Histórico da dependência que mudam o que o agente pode fazer (o 064, linha 25); a conferência reprova se faltar. Medida: reprovações de brief por `decisao` menores ou iguais a 1 por pedido nos próximos 3 pedidos (hoje 2 no 066 e 5 no 065), conferidas em `conferencias.md`.
2. Tech-lead com o Jarvis (projeto): num PR que toca `docs/api/` ou `docs/contratos/`, trazer a develop para a branch **antes** do review (E1.4), não depois do PR aberto; e gravar o parecer de review com a ferramenta Write desde a primeira versão, citando o papel. Medida: gravações de parecer por pedido com 1 PR, alvo menor ou igual a 4 (hoje 5 no 066 e 9 no 065); conflitos de `docs/api/metricas.md` na hora do squash = 0 em 3 pedidos.
3. Jarvis (projeto): lançar todo movimento do cartão com `forge-check movimento`, inclusive a entrada em "Em andamento" e "Code review", e não registrar a mesma parada duas vezes no Histórico do pedido. Medida: cartões em Pronto com linhas de entrada e de Code review no `historico.md` = 100% nos próximos 3 pedidos (hoje 0 de 1 no 066 e 0 de 1 no 065); duplicatas no Histórico = 0.

| Classe de R-DECISAO | Linha |
|---|---|
| Melhoria vista (entrada direta) | MELHORIA 1, 2, 3 e 4 |

MELHORIA: o brief do tech-lead-3 foi reprovado 2 vezes por faltar a decisão e a nota do 064 (linha 25) e as linhas de Histórico do 064 que fixam o alcance da recusa de autoria; é a mesma causa `decisao` da retrospectiva do 065. Evidência: 2026-11-04 15:43 e 15:45, `docs/kanban/conferencias.md` linhas 1708 e 1710; pedido 066, Histórico de 2026-11-04 15:34 e 15:45; `docs/retrospectivas/2026-11-04-065-bloqueados-sem-dado-real.md` seção 4 (ação 2). Medida do efeito: reprovações de brief por `decisao` menores ou iguais a 1 por pedido em 3 pedidos. Forge (o gerador de brief copia as decisões e notas das dependências, com a nota "vale só para o levantamento" quando for o caso; reincidência da ação 2 do 065).

MELHORIA: `forge-check pr` recusou o review aprovado por autoria (sem registro de que o tech-lead o gravou) e o PR 216 só abriu 43 min depois, com o mesmo conteúdo. Evidência: 2026-11-04 15:34 e 16:17, pedido 066 (Histórico); `docs/kanban/conferencias.md` linhas 1705, 1708, 1710 e 1713; `docs/reviews/066-s8.md` (versões 80f7e8d e 0f8bee3). Medida do efeito: recusas de autoria de parecer por `forge-check pr` = 0 em 3 pedidos; minutos entre o parecer aprovado e o PR aberto, alvo menor ou igual a 15. Forge (o brief do review diz "gravar o parecer só com Write, no papel tech-lead" e `forge-check pr` mostra no motivo qual registro faltou).

MELHORIA: o PR 216 conflitou com a develop em `docs/api/metricas.md` (o 065 e o 067 já estavam lá) e review e QA foram regravados na ponta por um delta só de documentação, 5 gravações de parecer em 1 PR. Evidência: 2026-11-04 16:17, 16:23 e 16:41, pedido 066 (Histórico); `docs/kanban/conferencias.md` linhas 1713 a 1715; commits a54ac8d, 0f8bee3 e 6cef210. Medida do efeito: conflitos de `docs/api/metricas.md` na hora do squash = 0 e regravações de parecer por merge da develop = 0 em 3 pedidos que tocam `docs/api/`; minutos entre o PR aberto e o merge, alvo menor ou igual a 20 (hoje 46). Projeto (o tech-lead traz a develop para a branch antes do review quando o diff toca `docs/api/`, e a seção de cada métrica fica separada por título para a resolução de conflito ser trivial; checklist em `docs/engineering/`).

MELHORIA: K-217 chegou a Pronto com 2 linhas no `historico.md` (sem entrada em "Em andamento", sem "Code review"), o que impede o cycle time e a idade do cartão, e o Histórico do pedido registrou a parada de 15:34 duas vezes (15:34 e 15:45). Evidência: `docs/kanban/historico.md` linhas 744 e 746; pedido 066, Histórico de 2026-11-04 15:34 e 15:45. Medida do efeito: cartões em Pronto com todas as linhas de movimento no `historico.md` = 100% em 3 pedidos; duplicatas no Histórico do pedido = 0. Projeto (o Jarvis lança cada movimento com `forge-check movimento`; o agile-coach audita ao fechar o pedido e o fecha com a lista de lacunas).

## 5. Revisão das ações da retrospectiva anterior (065)
- Ação 1 (rodar o equivalente local da CI antes de pedir review e QA, regravar uma vez com a ponta estável): o brief do QA do 066 já pediu `docs:check` e cobertura do web e nenhuma falha de CI veio depois de parecer aprovado: **funcionou** em 1 pedido; a meta de regravações menor ou igual a 2 não bateu (5 gravações, todas por ferramenta ou merge da develop, nenhuma por código): vira a MELHORIA 3.
- Ação 2 (gerador de brief copia as decisões das dependências): **não funcionou**: as 2 reprovações por `decisao` do 066 (linhas 1708 e 1710) são o mesmo tipo; a ação continua como MELHORIA 1.
- Ação 3 (hook sem heredoc, pipe nem redirecionamento): nenhuma recusa de hook registrada no 066: **sem ocorrência**, amostra de 1 pedido.
