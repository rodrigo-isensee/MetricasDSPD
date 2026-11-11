# Retrospectiva do pedido 091: homolog-aprovada com nova tentativa (K-263)

Fontes: `docs/pedidos/091-homolog-reavalia-nova-tentativa.md` (Histórico inteiro), `docs/kanban/conferencias.md` (8 linhas do 091), `docs/kanban/historico.md` (K-263 e K-264, linhas 825 a 841). Horas no relógio local (-03:00), de 2026-11-11. Processo, nunca pessoa. PR do pedido: 304 (K-263, na develop, merge do dono às 10:30); PR 305 (K-264) tem o mesmo dono de merge.

## 1. Dados do fluxo
| Marco | Hora | Intervalo |
|---|---|---|
| K-263 entra em "Entrada" (melhoria vista no 090) | 03:24 | |
| Pedido aberto; K-263 para "Em andamento" | 08:50 e 08:55 | 5h26 em "Entrada" |
| E1.1 entregue (e40524fd e d1693a72) e conferida | 09:11 | 16 min |
| Segurança aprovada e QA aprovado | 09:24 | 13 min |
| PR 304 aberto, CI verde; review com forma corrigida | 09:48 | 24 min |
| PR 304 mesclado pelo dono (18701297) | 10:30 | **42 min de espera do dono** (a develop estava congelada para a release 093) |

- **Lead time de K-263: 7h06** (03:24 a 10:30, **medido** por `historico.md`); **cycle time: 1h35** (08:55 a 10:30, **medido**). Pedido aberto até PR aberto: 58 min (08:50 a 09:48). Amostra de 1 cartão: sem percentis.
- Dois relógios (D-4): K-263 tem 3 linhas (Entrada, Em andamento, Pronto), sem "Pronto para fazer" nem entrega em "Aguardando sua validação"; **"pronto para fazer para develop": não medido**; "pedido aberto para develop": 1h40 (08:50 a 10:30), **estimado** pelo Histórico do pedido, não pelo `forge-check voltas`.
- K-264 (testes de CLI sem TMPDIR, visto no pronto do K-263): "— para Entrada" 09:11 e "Entrada para Pronto" 10:31; **1h20 de lead time, medido**, mas sem passar por "Em andamento", Code review e QA no quadro, logo cycle time **não medido**.
- Custo (movimento "Pronto"): K-263 145 820 015 tokens e K-264 133 244 210 tokens, **medidos** pelo movimento; custo por agente: não rodado (`forge-check transcricao custo` fora do brief), **não medido**.
- Vazão do pedido: 2 cartões em "Pronto" no mesmo minuto da manhã (10:30 e 10:31).
- Retrabalho de cartão: 0 devoluções de pai (nenhuma linha de Code review, QA ou volta para Em andamento no `historico.md`). O review e o QA são pareceres em `docs/`, não colunas do cartão. O review chegou com forma recusada pelo `forge-check docs` (A2 longo, linha fora do bloco) e foi corrigido pelo tech-lead no passo do PR (8a6c2513): 1 correção de forma, não de conteúdo. QA: 0 bugs, mutações mortas. Segurança: A1 (comentários do `homolog-aprovada.yml` com "sem espera").
- Estabilidade (DORA): 2 PRs do pedido (304 e 305), sem falha, reversão ou hotfix registrados; tempo de recuperação: não se aplica. Lead time de mudança por PR: **não medido** (sem hora do primeiro commit nesta delegação). Velocidade e estabilidade juntas: sem falha; o maior intervalo foi a espera do dono, por regra (develop congelada).
- Escape: nenhum achado depois dos pareceres finais no Histórico.
- Clareza: o pedido não tem a seção "Registro de clareza", logo `PERGUNTA:`, `NAO-ENTENDI:`, `ESCOPO+:` e `DEVOLVIDA:` são **não medidas** pelo método. Lido à mão: 0 perguntas ao dono; marcas do cabeçalho: 0 confirmado, 2 técnico, 0 suposição, 0 delegado (0%). 0 `ERRO-JARVIS` no Histórico.
- Esperas, escapes, corrigidos, afrouxamentos (linha de base M14b): não rodados nesta delegação; **não medidos**.

### Briefs e conferências (8 linhas do 091)
6 briefs distintos (devops-1, tech-lead-1, tech-lead-2, security-1, qa-1, agile-coach-1), 8 conferências: 6 aprovadas, **2 reprovadas** (25% das conferências; 17% dos briefs), ambas do mesmo brief (tech-lead-1, rodadas 1 e 2; aprovado na 3, às 09:15), pegas antes de executar e resolvidas em 2 min.

| Classe de causa | Reprovadas | Casos |
|---|---|---|
| escopo | 2 | 09:13 tech-lead-1 r1 (critérios e commit do parecer sem texto no pedido; E1.2 ampliada) e 09:14 r2 (limite de 2 workers sem a regra citada; é R-TETO) |
| decisão, forma, prova, estado, etapa, ferramenta | 0 | |

Entregas: o Histórico do pedido registra "entrega conferida d1693a72" (09:11), mas **`conferencias.md` não tem linha de `entrega` do 091** (as 8 são todas de `brief`); a conferência da entrega não deixou número, como no 090.

## 2. O que funcionou
- **Pedido pequeno e bem cortado**: dois itens `técnico`, uma etapa de implementação e três conferentes em paralelo; da abertura ao PR aberto em 58 min, 0 devoluções.
- **Mudança sem afrouxar a regra**: nova tentativa de cerca de 60 s só no caso "portão sem sucesso", com espera injetável; os testes de `tools/homolog` com 100% e as mutações do QA mortas.
- **Controle de brief barato**: 2 reprovações pegas antes de executar, em 2 min, com a correção no texto do pedido (E1.2 ampliada).
- **Achado de ambiente virou cartão no mesmo dia**: o pronto local caindo no sandbox (31 testes de CLI do server sem `/tmp/tsx-1000`) foi anotado no Histórico em 09:11, virou o K-264 e foi mesclado (PR 305) às 10:31, em vez de bloquear a entrega do K-263.
- **Pareceres em paralelo e rápidos**: segurança e QA aprovados em 13 min.
- **Melhoria vista fechada no dia seguinte à sua origem**: K-263 saiu da E1.6 do 090 (03:24) e chegou à develop às 10:30.
- Nenhum bypass (`--no-verify`, `--force`, `--admin`).

## 3. O que atrapalhou (fatos)
- **Pronto local caindo no sandbox.** O `pnpm run pronto` do devops falhou por ambiente (o filho do teste roda com `env` só com `PATH` e o `tsx` não cria `/tmp/tsx-1000`); a suíte completa ficou com o CI do PR. Custo: o PQ-1 do brief ficou "não cumprido" e a prova completa saiu do CI, não da máquina de quem implementou. Já tem cartão (K-264, Pronto).
- **Forma do parecer de review recusada pelo `forge-check docs`** (A2 longo, linha fora do bloco), pega só no passo do PR (E1.5) e corrigida depois (8a6c2513, às 09:48); o parecer foi enviado antes de passar pela checagem local.
- **Brief de review reprovado duas vezes seguidas** (09:13 e 09:14): o texto do pedido não trazia o critério de pronto nem o commit do parecer, e o brief citava o limite de 2 workers sem a regra (R-TETO).
- **Quadro incompleto, de novo.** K-263 tem 3 linhas e K-264 tem 2, sem "Pronto para fazer", Code review ou QA; os dois relógios e o cycle time de K-264 saem não medidos (ação aberta desde o 068, repetida na 090).
- **Espera do dono por regra**: 42 min entre o PR com CI verde (09:48) e o merge (10:30); a develop ficou congelada para a release 093. Não é defeito de fluxo; entra só como dado.
- **Pedido sem "Registro de clareza"** e sem linha de `entrega` em `conferencias.md`.

## 4. Ação (uma causa nova) e linhas `MELHORIA:`
Causa nova escolhida, uma só: **o parecer de review chegou ao PR com forma que o `forge-check docs` recusa, e o conserto ficou para o passo do PR** (E1.5). As demais são recorrências ou já têm cartão.

1. **Forge, tech-lead (causa nova; vai ao Forge):** o agente que grava um parecer em `docs/reviews/`, `docs/qa/` ou `docs/security/` roda `forge-check docs` sobre o parecer antes de commitar e enviar. Medida: pareceres corrigidos depois de enviados por recusa do `forge-check docs` = 0 em 3 pedidos (no 091: 1, o review d315dea2 corrigido em 8a6c2513). Reverter se a checagem local não pegar o caso que o CI pegou. Entra em `docs/kanban/melhorias.md` só pelo `forge-placar propostas`.

MELHORIA: o `pnpm run pronto` de quem implementa caiu no sandbox por ambiente (31 testes de CLI do server falham porque o filho roda com `env` só com `PATH` e o `tsx` não cria `/tmp/tsx-1000`), e o PQ-1 do brief ficou "não cumprido" (docs/pedidos/091-homolog-reavalia-nova-tentativa.md, entrada 09:11; docs/kanban/historico.md, linha 833): já tem o cartão K-264 (Pronto, PR 305); fica só como dado.
MELHORIA: o parecer de review do K-263 saiu com forma recusada pelo `forge-check docs` (A2 longo, linha fora do bloco) e só foi corrigido no passo do PR, em 8a6c2513 (docs/pedidos/091-homolog-reavalia-nova-tentativa.md, entradas 09:24 e 09:48); medida: pareceres corrigidos depois de enviados por recusa do `forge-check docs` = 0 em 3 pedidos; vai ao Forge.
MELHORIA: o brief de review (tech-lead-1) foi reprovado duas vezes seguidas: critério de pronto e commit do parecer sem texto no pedido, e limite de 2 workers sem citar a regra (docs/kanban/conferencias.md, linhas 09:13 e 09:14 do 091; docs/pedidos/091-homolog-reavalia-nova-tentativa.md, E1.2); medida: briefs de review aprovados na 1ª conferência = 100% nos próximos 3 pedidos, com o pedido trazendo o critério de pronto e o commit do parecer já na etapa; projeto.
MELHORIA: K-263 tem 3 linhas e K-264 tem 2 no `historico.md`, sem "Pronto para fazer", "Code review", "QA" nem entrega na develop, e o cycle time de K-264 e o "pronto para fazer para develop" saem não medidos (docs/kanban/historico.md, linhas 825 a 841; mesma ação aberta desde o 068 e repetida na 090); medida: cartões do pedido com 4 linhas ou mais; projeto.
MELHORIA: o pedido 091 não tem a seção "Registro de clareza" e `conferencias.md` não tem linha de `entrega` do pedido, apesar da entrega conferida registrada às 09:11 (docs/pedidos/091-homolog-reavalia-nova-tentativa.md; docs/kanban/conferencias.md, 8 linhas do 091 todas de `brief`); medida: pedidos abertos com a seção e as tags e com linha de `entrega` na conferência = 100% nos próximos 3; projeto.

## 5. Pendências
- Revisão das propostas vencidas e `forge-placar comparar`: não rodados nesta delegação (fora do brief); a causa nova da ação 1 só entra em `docs/kanban/melhorias.md` pelo `forge-placar propostas`.
- Medir o efeito do K-263 na release seguinte: reavaliação do `homolog-aprovada` sem reexecução manual depois de portão verde recente (no 090: 1 reexecução manual). Dado a colher na 093.
