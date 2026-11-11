# Retrospectiva curta do pedido 096: passo de critérios do apontamento lê o .env sozinho (K-270)

Fontes: `docs/pedidos/096-criterios-apontamento-env.md` (Histórico inteiro), `docs/kanban/conferencias.md` (linhas do 096), `docs/kanban/historico.md` e `docs/kanban/melhorias.md`. Horas no relógio local (-03:00), de 2026-11-11. Processo, nunca pessoa. PR 319 mesclado pelo dono na develop; `gh pr view` não rodou nesta delegação, então as horas de PR vêm do Histórico do pedido.

## 1. Dados do fluxo
| Marco | Hora | Intervalo |
|---|---|---|
| Pedido aberto (K-270, node-backend) | 12:37 | |
| Brief do node-backend selado | 12:41 | 4 min |
| E1.1 entregue (3316cce9, pronto rc=0, 3 casos de teste) e entrega conferida | 12:52 a 12:53 | 12 min |
| QA aprovado, 0 bugs (508823c3) | 12:58 | 5 min |
| Segurança aprovada (1545a83e), A1 e A2 recomendados (viram o K-271) | 12:59 | 1 min |
| Review aprovado (554f3b15), A1 a A3 recomendados (vão ao K-271) | 13:12 | 13 min |
| PR 319 aberto, todos os checks verdes, CLEAN | 14:14 | 62 min |
| Dono declara tudo mesclado (develop em f4c122f1) | 14:47 | 33 min |

- **Lead time (pedido aberto à mescla):** 2 h 10 min (12:37 às 14:47), **estimado** pelo Histórico do pedido; o `historico.md` não tem nenhum movimento do K-270 (`grep K-270 docs/kanban/historico.md` vazio), então o número não vem de movimento. Amostra de 1 cartão: sem percentis.
- **Cycle time:** igual, 2 h 10 min, **estimado** (fim pela declaração do dono).
- **Dois relógios (D-4):** "pedido aberto para develop" 2 h 10 min, **estimado**; "pronto para fazer para develop": **não medido** (sem entrada em "Pronto para fazer"). Trabalho ativo até o último parecer: 36 min (12:37 às 13:12), **estimado**; os outros 95 min foram espera do PR e da mescla do dono (13:12 às 14:47).
- **Custo:** `forge-check transcricao custo` não rodado, **não medido**.
- **Retrabalho de cartão:** 0 de 1 devolvido por review ou QA (QA 0 bugs; review e segurança só recomendados). Os recomendados (A1 e A2 da segurança, A1 a A3 do review) foram para o K-271, cartão novo, sem devolver o K-270.
- **Estabilidade (DORA):** taxa de falha 0 de 1 entrega; reversão e hotfix 0; tempo de recuperação: não se aplica (nenhuma falha). Lead time de mudança (primeiro commit 3316cce9, 12:52, à mescla 14:47): 1 h 55 min, **estimado**.
- **Escape:** 0 achado depois do parecer do QA, lido do Histórico do pedido (sem `forge-check escape resumo` rodado: **não medido** pela ferramenta).
- **Clareza:** sem a seção "Registro de clareza", `PERGUNTA:`, `NAO-ENTENDI:` e `DEVOLVIDA:` são **não medidas**. Lido à mão: 0 perguntas; cabeçalho 0 confirmado, 2 técnico, 0 suposição, 0 delegado (0%); 0 `ESCOPO+`/`ESCOPO-`; 0 `ERRO-JARVIS` no Histórico do pedido; 1 `DECISÃO TÉCNICA` (E1.6 de segurança acrescentada por gatilho, portões em sequência).
- Esperas, corrigidos, afrouxamentos (linha de base M14b): não rodados; **não medidos**.

### Briefs e conferências (linhas do 096 em `conferencias.md`)
6 linhas, todas de `brief`: 4 aprovadas na 1ª rodada (node-backend-1, security-engineer-1, tech-lead-1, tech-lead-3), 1 aprovada na 2ª (qa-engineer-2) e 1 **reprovada** (qa-engineer-1, 12:54, classe **escopo**: o brief mandava o QA enviar o parecer e o pedido não dizia quem envia; o pedido foi corrigido e a rodada 2 aprovou no mesmo minuto). Linha de `entrega` do 096: não aparece em `conferencias.md`, embora o Histórico registre "entrega conferida 3316cce9" (12:52), como no 090 a 095. Dos briefs do agile-coach, só o de agora (agile-coach-1) existe e ainda não tem linha.

## 2. O que funcionou
- **Entrega sem devolução:** a primeira entrega passou em QA (3 de 3 casos, teste hermético, 2 mutantes mortos), segurança (sondas S1 a S3 sem vazar senha) e review sem nenhum bug.
- **O gatilho de segurança foi visto cedo:** `server/package.json` e leitura do `.env` acrescentaram a E1.6 logo após a entrega (12:53), antes do PR.
- **Recomendados não prenderam a entrega:** A1 e A2 da segurança e A1 a A3 do review foram agrupados no K-271 em vez de reabrir o K-270; o PR 319 seguiu limpo.
- **Brief reprovado barrou o desvio antes de acontecer:** a conferência do brief do QA achou a lacuna de escopo (quem envia o parecer) e o pedido foi corrigido para os próximos portões, e o 097 reaproveitou a frase.
- **Todos os checks do PR 319 verdes**, inclusive `e2e-parte` 1/2 e 2/2, na primeira execução.

## 3. O que atrapalhou (fatos)
- **Brief do QA reprovado por o pedido não dizer quem envia o parecer** (12:54, escopo): o pedido original listava só "QA" sem dizer quem commita e envia o parecer na branch; o Jarvis encheu a lacuna no brief e a conferência barrou. Custo: uma rodada de brief, minutos. **Recorrência no 097** (097-resumo-filtro-time-qa-engineer-1, 14:14, mesma classe e mesma causa): o padrão repetiu-se duas vezes em 1 h 20 min.
- **Portões em sequência por uma escrita por branch** (DECISÃO TÉCNICA 12:53): QA, segurança e review não podem commitar na mesma branch em paralelo; o review só veio às 13:12, 14 min depois do QA (12:58), em parte porque o tech-lead terminava o PR do K-174. Sem dado de espera por papel, o custo real da sequência é **não medido**.
- **Segurança com A1 e A2 recomendados** (pilha de erro do banco sem tratamento mostra host, porta e usuário, já existia; data só por regex, sem `dataCivilValida` nem checagem de argumentos): não bloqueiam, mas viraram o K-271; o review somou A1 (carregador repetido em 8 entradas), A2 (uso sem o nome do script) e A3 (ramo não ENOENT sem teste). O mesmo script teve 5 recomendados em 2 portões, o que indica que o carregador do `.env` é dívida técnica compartilhada, não defeito do K-270.
- **Quadro sem etapas intermediárias, de novo** (068, 090 a 095): nenhum movimento do K-270 no `historico.md`; lead time e relógios saem estimados.
- **Conferência de `entrega` sem linha em `conferencias.md`** (recorrência do 090 a 095).
- **PR aberto 62 min depois do último parecer** (13:12 às 14:14): o tech-lead estava no PR do K-174; espera de WIP do agente, não de processo, sem proposta.

## 4. Ação (uma causa nova) e linhas `MELHORIA:`
Causa nova escolhida, uma só: **o pedido não declara quem commita e envia o parecer de cada portão, e a conferência do brief só pega a lacuna depois do brief pronto**; ocorreu no 096 e no 097. A correção no pedido já existe (linha "Cada portão ... commita e envia o próprio parecer"). A proposta formal só entra em `docs/kanban/melhorias.md` pelo `forge-placar propostas`, sem proposta aberta em paralelo; fica com o `tech-lead` e o `agile-coach`.

MELHORIA: o brief do QA foi reprovado por escopo porque o pedido não dizia quem envia o parecer (docs/kanban/conferencias.md, 096-criterios-apontamento-env-qa-engineer-1, 12:54; repetido em 097-resumo-filtro-time-qa-engineer-1, 14:14); medida: briefs de portão reprovados por "push do parecer fora do pedido" = 0 nos próximos 5 pedidos, lido de `conferencias.md`; **vai ao Forge** (o modelo de pedido e o gerador do brief de portão trazem por padrão a linha "Cada portão commita e envia o próprio parecer na branch").
MELHORIA: o carregador do `.env` está repetido em 8 entradas do `server` e o 096 acrescentou a 9ª; review A1 e segurança A1 e A2 pedem extração e validação (docs/pedidos/096-criterios-apontamento-env.md, entradas 12:59 e 13:12); medida: entradas do `server` com carregador próprio (hoje 9, **medido** só pelo texto do review, sem contagem por comando) = 1 depois do K-271; projeto (já está no K-271, fica só como dado).
MELHORIA: portões em sequência porque só uma delegação escreve por branch (docs/pedidos/096-criterios-apontamento-env.md, entrada 12:53); QA ao review levou 14 min (12:58 a 13:12) com o tech-lead ocupado no PR do K-174; medida: tempo entre portões por pedido, a registrar nos próximos 3 pedidos de classe N; projeto (dado, sem mudança proposta).
MELHORIA: `historico.md` sem nenhum movimento do K-270 e conferência de `entrega` sem linha em `conferencias.md` (`grep K-270 docs/kanban/historico.md` vazio): recorrência do 068, 090 a 095, já em ação aberta, fica só como dado.
