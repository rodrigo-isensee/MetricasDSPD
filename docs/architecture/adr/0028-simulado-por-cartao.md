# 0028 - Dado simulado por cartão onde ainda não há dado real

Estado: proposta. Data: 2026-11-04.
Propósito: deixar cada cartão sem fonte real mostrar um dado simulado com o selo "Simulado" visível, sem misturar fictício e real, e rever o que a ADR 0026 decidiu para esses cartões. Público: node-backend, react-frontend, ux-designer, qa-engineer, tech-lead, security-engineer. Revisão: 2026-12-04.

- Origem: pedido 070 (`docs/pedidos/070-simulado-por-cartao.md`), decisão do dono de 2026-11-04, confirmada com "Sim" no recibo. Desenho: `docs/analises/070-desenho.md` (E1.1, K-221).
- **Revê a ADR 0026** (`docs/architecture/adr/0026-metricas-so-com-dado-real.md`, vigente desde 2026-11-02; hoje só na worktree `MetricasDSPD-052b`, ainda sem commit na develop). **O texto da ADR 0026 não é editado nem apagado.** Esta ADR diz o que dela muda e o que fica.
- Relacionadas: ADR 0021 (cálculo do mock em Web Worker), ADR 0003 (orçamento de desempenho), ADR 0007 (contratos), ADR 0011 (biblioteca única de cálculo), ADR 0018 (homologação).
- **Condição para passar a `vigente`:** (1) o selo e o texto validados pelo dono (E1.2 do pedido); (2) as respostas do dono às perguntas Q-070-1 a Q-070-6 do desenho, ou a confirmação das propostas.

## Contexto

A ADR 0026 transformou o mapa `METRICAS_ORIGEM_REAL` num portão: a métrica fora dele responde `sem-dado-real` com o motivo, e o cartão mostra "Sem dado real" sem número. O efeito previsto aconteceu ("o painel fica com muitos cartões sem número", Consequências da 0026). O levantamento do 064 (`docs/analises/064-lacunas-dado-real.md`) e o mapa atual (`packages/contratos/src/origem.ts`, já com o pedido 065) dão hoje:

- **BusinessMap:** 11 ids com dado real (O1, O2, O3, O4, O6, O7, O9, O10, O11, O13, EI_FL1). Sem dado real: BLOQUEADOS, O5, O8, O12, O14, O15, O16, O18, O19 a O26, todo o FL2 (T1 a T14, EI_FL2), todo o FL3 (E1 a E9, EI_FL3) e TENDENCIA_FLUXO.
- **Acelerato:** 5 ids com dado real (S2, S3, S4, S8, S10). Sem dado real: S1, S5, S6, S7, S9, S11, S12, O17, EI_SUST e TENDENCIA_SUST.
- Os painéis tático e estratégico ficam inteiros sem número.

O dono perguntou em 2026-11-04: "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?". Ao recibo (real só com real; sem real, simulado com o selo visível; sem misturar real e simulado no mesmo gráfico, sem misturar BusinessMap e Acelerato, sem simulado em métrica individual; a troca é por cartão), respondeu "Sim".

O critério de reversão da ADR 0026 diz: "O dono pedir número fictício ou modo demonstração no painel de uso diário (fora da homologação e dos testes)". **Esse fato aconteceu.** Esta ADR é a revisão que esse critério manda fazer. Ela é parcial: o pedido do dono é por cartão e com selo, não um modo demonstração geral, e ele manteve explícita a proibição de mistura.

## Decisão

Princípio: **o portão da ADR 0026 continua decidindo o que é real. O que muda é o que o cartão faz quando o portão diz "sem dado real" e a métrica é simulável: em vez de ficar sem número, mostra o simulado, inteiro, com o selo.**

**D1. A API continua sem mock e nunca devolve número simulado.** O corpo `sem-dado-real` ganha um campo opcional `simulavel: boolean` (ausente = `false`), calculado por `podeSimular(id)` no contrato. O DTO de métrica real não muda. A resposta HTTP não tem `origem: 'simulado'` em lugar nenhum.

**D2. O simulado é produzido só no navegador, pelo mock que já existe.** É o `MockFonteMetricas` com o núcleo no Web Worker (ADR 0021): `gerarBaseMock` e os outros geradores, mais `lib.calcularMetrica`. Ele roda com semente fixa, com `hoje` igual à data de referência real e com o período da tela. Os filtros de dimensão não se aplicam ao simulado (proposta Q-070-1) e o cartão diz isso. O chunk do mock e o Worker só são carregados quando aparece o primeiro cartão simulável.

**D3. Um cartão, uma origem.** O cartão mostra o DTO real ou o DTO simulado, nunca os dois e nunca partes de um e de outro. Cartão real com lacuna parcial (bloqueio de O1 e O2, classe do O6, SLE do O3, visão do cliente do O10, ajustes manuais do S3) continua real, com a nota de hoje, e não recebe preenchimento simulado.

**D4. Selo obrigatório, derivado no centro.** A origem `simulado` sai da camada de dados da web e chega ao `CartaoMetrica` pelo contexto de origem dos cartões. O selo "Simulado" e o motivo da falta de dado real aparecem sempre que o DTO é simulado. Forma e texto são da E1.2 (ux-designer), validados pelo dono. Se o mock falhar, o cartão volta a "Sem dado real", nunca a um número.

**D5. Fora da simulação** (lista `METRICAS_SEM_SIMULACAO` no contrato): `VISAO_GERAL` (junta os dois domínios), `TENDENCIA_FLUXO` e `TENDENCIA_SUST` (contradiriam O3, O4, S2 e S3 reais), `EI_SUST` (regra de cálculo não definida). Ficam fora também, por não usarem a rota de métricas: a aba Apontamento (individual, exceção do dono) e a PV1 real ("sem pesquisa" é a resposta real). Os três primeiros itens são propostas até o dono responder às Q-070-4 a Q-070-6.

**D6. O simulado não sai do cartão.** As faixas "Pede atenção", os números-chave e as tendências do Resumo, a contagem de origem do cabeçalho e a exportação usam só o real (propostas Q-070-2 e Q-070-3).

**D7. A troca é pelo mapa.** Uma métrica deixa de ser simulada quando entra em `METRICAS_ORIGEM_REAL` pelo plano dela, como manda a ADR 0026 P3. Não há interruptor por cartão nem por ambiente.

### O que muda na ADR 0026 e o que fica

| Item da 0026 | Situação |
|---|---|
| Contexto: "o dono pediu dado real, não um dado fictício identificado" (alternativa "mapa como rótulo") | **Revisto**: para cartão sem fonte real, o dono pede agora o dado fictício identificado, por cartão, com selo. O motivo da recusa antiga (o número misto do caso A12) não volta, por D1 a D3. |
| P1 (o seed nunca grava na base real) | **Mantido**, sem mudança. |
| P2 (a API de produção não tem modo mock; lint do server contra `@metricas-dspd/mock`) | **Mantido**, sem mudança (D1). |
| P3 (mapa real como portão; fora dele, `sem-dado-real` sem chamar a biblioteca) | **Mantido** no servidor. **Acréscimo**: o campo `simulavel`. |
| P3, `VISAO_GERAL` "sem dado real" | **Mantido** (D5). |
| Consequência P4: "o cartão fora do mapa mostra 'Sem dado real' e o motivo, sem número" | **Revisto**: o cartão fora do mapa e simulável mostra o número simulado com o selo e o motivo. O não simulável continua como antes. |
| Consequência P4: "o mock fica só por `VITE_FONTE=mock` explícito, para testes" | **Revisto**: o gerador do mock passa a ser carregado também na fonte `api`, sob demanda e só para cartões simuláveis. O modo mock global continua só por `VITE_FONTE=mock`, como antes. |
| Consequência P5: "os projetos `*-api` verificam que cartão fora do mapa não mostra número" | **Revisto**: verificam que o número só aparece com o selo "Simulado" e que os excluídos mostram "Sem dado real". |
| Decisão sobre o achado A3 (webhook) | **Mantida**, sem relação com esta ADR. |
| "O mapa `METRICAS_ORIGEM_REAL` é a fonte única de real ou não na fonte API" | **Mantido**. `podeSimular` deriva dele. |

## Alternativas

- **Calcular o simulado na API**, com uma base mock em memória no processo e o DTO marcado com `origem: 'simulado'`. Um só lugar decidiria e rotularia, e a exportação receberia a marca pronta. **Rejeitada:** reabre a ADR 0026 P2 (o mock voltaria ao processo de produção, com exceção no lint), põe a base fictícia no mesmo processo que lê a base real, que é a vizinhança do caso A12, e entrega número fictício a qualquer leitor da API. O ganho é pequeno, porque o cálculo da web já existe (ADR 0021).
- **Selo por painel ou modo demonstração geral.** **Rejeitada pelo dono** ("a troca é por cartão"). Um painel com O3 real e O12 simulado deixaria de mostrar o real como real.
- **Preencher só a parte que falta de um cartão real** (por exemplo, o bloqueio do O1 com simulado). **Rejeitada:** é real e simulado no mesmo cartão, o que está no Fora do escopo do pedido.
- **Esconder o cartão sem fonte.** Já foi recusada pelo dono na 0026 (Q1 "A") e não atende ao pedido.
- **Simular todas as métricas fora do mapa, sem lista de exclusão.** **Rejeitada:** simularia a `VISAO_GERAL`, que junta os domínios, as tendências, que contradizem números reais, e a `EI_SUST`, que não tem regra (seria regra inferida). Vira pergunta ao dono (Q-070-4 a Q-070-6), com a exclusão como proposta.
- **A web decidir "simulável" pelo mapa do contrato, sem campo na resposta.** Funcionaria, porque a web já importa o contrato. **Rejeitada:** a 0026 fixou a API como fonte de "real ou não" na fonte `api`. Com o campo na resposta, o E2E e o QA conferem a decisão pela rede, e uma web antiga diante de uma API nova falha fechada (campo ausente = não simula).

## Consequências

- **Melhora:** os painéis FL2, FL3 e os cartões sem fonte do FL1 e da sustentação passam a mostrar como a métrica fica, com o selo, enquanto a fonte real não existe. O dono e os times veem o painel completo. O servidor e a base continuam só com dado real.
- **Piora:** número fictício na mesma tela que número real; o risco de leitura errada é real e depende do selo (por isso D4 falha fechada e o teste itera sobre todos os ids simuláveis). O chunk do mock (F9) passa a ser baixado em produção quando há cartão simulável, e o heap do Worker entra no C5. O primeiro cartão simulado espera a geração da base (< 1,5 s, C2) sem atrasar os reais. Os filtros de dimensão não valem no cartão simulado.
- **A manter:** `METRICAS_SEM_SIMULACAO ∩ METRICAS_ORIGEM_REAL = ∅` (teste de contrato); todo cartão novo de métrica passa pelo selo central, nunca por uma prop local; os testes de paridade da ADR 0021, porque agora o núcleo do mock também serve a produção; a regra de que faixas, Resumo e exportação leem só o real; e o portão de desempenho medido num painel com simulado.
- **Segurança (`R-SEGURANCA`):** nenhum gatilho. Sem pessoa, sem credencial, sem banco, sem dependência nova, sem mudança de CSP, Docker ou CI. `gatilhos_seguranca: []`.

## Por que o existente não basta

O mecanismo novo é o campo `simulavel` no contrato, mais a lista `METRICAS_SEM_SIMULACAO`. O resto é reuso (mock, Worker, contexto de origem, selo).

O que já existe para a mesma necessidade:
- **O mapa `METRICAS_ORIGEM_REAL` e `origemDaMetrica`** dizem se a métrica é real, mas não se ela pode ser simulada. A evidência está no próprio mapa: `VISAO_GERAL`, `TENDENCIA_FLUXO`, `TENDENCIA_SUST` e `EI_SUST` estão fora dele (`origem.ts:12-33` e `MOTIVO_ORIGEM_MOCK`) e não podem ser simuladas pelos motivos de D5. Usar "fora do mapa" como "simulável" simularia essas quatro.
- **O modo mock global (`VITE_FONTE=mock`)** já mostra tudo simulado, mas é por build e para a aplicação inteira (`criarFontePadrao`, `web/src/app/App.tsx:37-44`). Não há como ter O3 real e O12 simulado na mesma tela, que é o que o dono pediu.
- **O corpo `sem-dado-real`** já chega ao cartão com o motivo (`HttpFonteMetricas.ts:116`, `SemDadoRealErro`), mas sem a informação de simulável. Hoje o cartão não tem de onde tirar essa decisão sem repetir o mapa por conta própria, o que a 0026 proíbe ("fonte única na fonte API").

## Critério de reversão

**Um cartão mostrar número simulado sem o selo "Simulado" visível, ou um número simulado chegar a uma faixa de atenção, ao Resumo, à exportação ou a uma resposta da API**, achado pelo QA, pelo review ou pelo dono. Nesse caso, a web volta a tratar todo `sem-dado-real` como "Sem dado real" (é só ignorar `simulavel`; o servidor não muda) até a correção. Também reverte: o dono pedir que o simulado saia do painel de uso diário.

## Leituras

| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-12-04 | Cartões simulados sem selo achados (QA, review, dono); números simulados fora do próprio cartão (faixas, Resumo, exportação, API); `perf-api` com F6, C6 e F9 num painel com simulado | pendente |
