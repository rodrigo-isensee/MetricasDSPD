# Ata — Reunião de melhoria nº 1 (entrega: fase A do 001 e rodada de revisões)

Data: 2026-10-09 20:46 · Conduzida pelo Jarvis · Participantes: tech-lead, software-architect, qa-engineer, ux-designer (react-frontend em retrabalho; agile-coach registra no quadro)
Origem: pedido do usuário — "a cada entrega se reúnam para melhorar o processo de desenvolvimento e colocar as melhores práticas em curso".

## Fatos
Fase A em lote único (~66 min) → 14 bloqueantes + 19 recomendados de code review e ~37 achados de UX. Regras do briefing (EI segmentado, arquivado ≠ descartado, sem ranking) e o orçamento de performance não eram verificados por máquina; o lint não cobria `mock/` nem `charts/`. O Jarvis relançou revisores que estavam só lentos (gerando pareceres duplicados e um adendo) e registrou horários estimados. Revisões levaram 74–83 min; a UX revisou sem navegador.

## O que funcionou
Regras que viraram tipo/estrutura (`core`, `Amostra`, DTOs sem pessoa, pastas BM/AC) não tiveram achados; review em blocos com verificação executada; QA com hash da base e medição antes do código; commits pequenos; política de bugs.

## Decisões (valem a partir da fase B)
| # | Mudança | Responsável | Como medir |
|---|---|---|---|
| M-004 | **Portão automático antes do review:** `npm run pronto` em `web/` = lint (fronteiras BM×AC em todo `src/**`, sem `off`; proibição de `Math.min/max(...spread)`; meta-teste de lint com fixtures que devem falhar) + format:check + typecheck + test (inclui teste de orçamento: gerador < 1,5 s, métrica < 150 ms a frio e na 2ª chamada, painel < 900 ms, valores impressos) + build + size; mais `cd e2e && npm run gate` (fronteiras, hash da base, bundle). O Jarvis só abre review com as duas saídas anexadas ao cartão | tech-lead + arquiteto definem; react-frontend implementa (K-030); QA mantém o gate | Zero bloqueantes "a máquina deveria ter pegado" |
| M-005 | **Matriz de regras por métrica em código** (`REGRAS_METRICA satisfies Record<MetricaId, RegraMetrica>`: domínio, segmentação, ordem neutra/temporal, inclui arquivados, mínimo, referência do briefing; célula sem resposta = `pendente-usuario`, nunca inferência) + **testes de propriedade** parametrizados por ela (arquivar entregue não muda; classe isolada = classe no conjunto; AC não altera BM; n=19 insuficiente / n=20 publica; embaralhar falhas não muda a ordem; nenhuma chave por pessoa) + fechar saídas dos tipos (`Amostra` com marca, `descartado(card)` única, `ordenarNeutro`, schema que só aceita `ok` com n ≥ 20). Meta-teste "toda métrica tem teste" **bloqueia**, com exceções listadas nominalmente | arquiteto especifica; react-frontend implementa (K-030) | 100% dos `MetricaId` na matriz; zero bloqueantes de regra de negócio no review |
| M-006 | **Lote pequeno:** 1 cartão por entrega (3–5 métricas, ~30 min de agente), com tabela "regra do briefing → teste", medição antes/depois e dúvidas registradas como pergunta | autor; Jarvis confere | ≤ 3 bloqueantes por cartão; review ≤ 30 min; ≤ 2 rodadas |
| M-007 | **Parecer por rodada, imutável:** um revisor por parecer; arquivo `<pedido>-<etapa>-r1.md`, `r2` só com o delta; termina com "Parecer fechado: <hora real>" e é commitado na hora; autor só começa a partir de parecer fechado. **Regra do Jarvis:** antes de relançar um agente, checar atividade real (arquivos alterados, `git status`), nunca duas instâncias no mesmo arquivo; horários sempre com `date` | tech-lead; Jarvis | Zero adendos e zero instâncias duplicadas |
| M-008 | **Molde aprovado antes de replicar:** O4 corrigido aprovado pela UX como cartão de referência; `CartaoMetrica` gera selo, legenda e esqueleto a partir de `janelaPercentis`/`periodo` | react-frontend; ux-designer aprova | Zero achados "molde omitido" na fase B |
| M-009 | **Checklist de UX por cartão** (`docs/ux/checklist-cartao.md`, ~12 itens ligados à spec) rodado pelo dev e anexado; "faça / não faça" na spec | ux-designer escreve; dev roda | ≤ 3 achados altos/médios de UX por painel |
| M-010 | **QA por cartão sem gargalo:** testes de aceitação de regra de produto escritos pelo QA em paralelo ao dev; verificação de ~15 min por cartão (E2E, axe, perf) em paralelo ao code review; pacote para a UX (screenshots 320–1280 px nos dois temas e estados, JSON do axe, teclado) em pasta fixa; UX revisa por painel, uma instância, um arquivo por parecer | qa-engineer; ux-designer | Espera por QA < 20 min; revisão de UX ≤ 30 min; zero itens "verificar" |
| M-011 | **Reunião de melhoria a cada entrega**, formato curto (cada participante ≤ 10 linhas: funcionou, atrapalhou, até 1 mudança), ata em `docs/alinhamentos/`, mudanças em `docs/kanban/melhorias.md` | Jarvis conduz; agile-coach registra e mede | Uma ata por entrega |
| M-012 | **Branch `develop`** (decisão do usuário): devs commitam nela; tech-lead revisa por cartão e integra na `feature/dashboard-mock` após review e QA | tech-lead | — |

## Pendência para o usuário (opcional, não bloqueia)
Chromium do Playwright: `cd ~/MetricasDSPD/e2e && sudo npx playwright install-deps chromium` uma vez. Sem isso, vale o contorno local do QA (`e2e/scripts/setup-chromium-local.sh`).
