# 0030 - Sem dado simulado na web de uso diário: revoga a ADR 0028 e devolve à 0026 o que ela tirou

Estado: vigente (decisões do dono de 2026-11-11 no pedido 099). Data: 2026-11-11.
Propósito: tirar da web de uso diário todo número simulado, revogando a ADR 0028 pelo critério de reversão que o dono acionou, e fechar a porta para a volta. Público: react-frontend, node-backend, ux-designer, qa-engineer, tech-lead, security-engineer, devops-engineer. Revisão: 2026-12-11.

- Origem: pedido 099 (`docs/pedidos/099-nenhuma-metrica-simulada.md`, K-275), varredura `docs/analises/099-varredura-simulado.md` (E1.1), plano de dado real `docs/analises/099-dado-real-operacional.md` (E2.2).
- **Revoga a ADR 0028** (`docs/architecture/adr/0028-simulado-por-cartao.md`, vigente desde 2026-11-05). O texto da 0028 não é editado nem apagado. O PR que leva esta ADR troca só a linha `Estado:` da 0028 para "substituída pela ADR 0030 em 2026-11-11" (tech-lead, no PR do L1).
- **Devolve à ADR 0026** (`docs/architecture/adr/0026-metricas-so-com-dado-real.md`) as consequências P4 e P5 que a 0028 tinha revisto. O texto da 0026 não muda.
- **Anota a ADR 0021** (`docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md`): o núcleo do mock deixa de servir à produção. O texto da 0021 não muda.

## Contexto

A ADR 0028 deixou cada cartão sem fonte real mostrar um número gerado no navegador pelo mock, com o selo "Simulado". A varredura do 099 achou 45 cartões nesse estado na web de uso diário: 20 no Operacional (12 na Semanal e 8 na Sustentação), 15 no Tático e 10 no Estratégico. Toda essa simulação sai por uma porta só: o decorador `FonteComSimulado`, ligado em `web/src/app/App.tsx:41-42`. A API nunca devolveu número simulado; ela só autoriza a simulação pelo campo `simulavel` (`packages/contratos/src/origem.ts:106`, `:126-150`).

Decisões do dono no pedido 099, literais:
- 2026-11-11 (pela sessão "WSL ativação"): "quero que nao tenha nenhuma metrica simulada".
- 13:55: "nao quero nenhuma simulada no operacional" e "faca tudo que for preciso para tornar elas com dados reais".
- 14:05: "pode desligaro  simulador" e "faca suas recomendacoes", com Q-099-1 A, Q-099-2 A e Q-099-3 A.

O critério de reversão da ADR 0028 diz: "Também reverte: o dono pedir que o simulado saia do painel de uso diário." **Esse fato aconteceu.** Esta ADR é a reversão que ele manda fazer.

## Decisão

Princípio: **na web de uso diário (fonte `api`), um cartão mostra número calculado sobre a base real ou mostra "Sem dado real" com o motivo. Nada entre os dois.** O mock existe só onde é declarado: testes, E2E, CI e homologação (`VITE_FONTE=mock`, `DSPD_MODO_MOCK=homologacao`).

**D1. A ADR 0028 está revogada por inteiro.** As decisões D1 a D7 dela deixam de valer. Saem o campo `simulavel`, a lista `METRICAS_SEM_SIMULACAO` e a função `podeSimular` do contrato; o decorador `FonteComSimulado` e a opção `simulado` do `useMetrica`; o selo, a faixa e a marca d'água "Simulado" e a origem `simulado` do contexto de origem dos cartões. Ordem e tamanho: lotes L1 a L3 da varredura (§7). O L1 (só desligar) já resolve o que o dono vê; os lotes L2a a L3 tiram o código parado (Q-099-3 A).

**D2. Volta a valer a ADR 0026 inteira na web.** O que a 0028 tinha revisto volta como estava:

| Item da 0026 revisto pela 0028 | Situação agora |
|---|---|
| Consequência P4: "o cartão fora do mapa mostra 'Sem dado real' e o motivo, sem número" | **Volta a valer**, para todo cartão fora do mapa real, sem exceção. |
| Consequência P4: "o mock fica só por `VITE_FONTE=mock` explícito, para testes" | **Volta a valer.** O código do mock não entra no build `api` (guarda G1). |
| Consequência P5: "os projetos `*-api` verificam que cartão fora do mapa não mostra número" | **Volta a valer** (guarda G3, no lugar do `e2e/tests-api/simulado-070-l3.spec.ts`). |
| Contexto: "o dono pediu dado real, não um dado fictício identificado" | **Volta a valer.** |
| P3: `sem-dado-real` sem chamar a biblioteca | Sem mudança no servidor. O corpo perde o campo opcional `simulavel` (L3); `semDadoRealSchema` continua `.strict()`. |

O que a 0028 manteve da 0026 (P1, P2, P3, a decisão sobre o achado A3 e "o mapa `METRICAS_ORIGEM_REAL` é a fonte única de real ou não") continua como está.

**D3. O cartão sem dado real fica visível com "Sem dado real" e o motivo** (Q-099-1 A, como no pedido 060, Q1 "A"). O Tático e o Estratégico ficam no menu, com cada cartão em "Sem dado real" e a nota de cabeçalho que já existe (Q-099-2 A).

**D4. O caminho para sair de "Sem dado real" é um só: dado real.** Uma métrica entra em `METRICAS_ORIGEM_REAL` pelo plano dela, quando a fonte real existir e a consulta só de leitura mostrar o dado na base (ADR 0026, P3). Para os 20 cartões do Operacional, o plano está em `docs/analises/099-dado-real-operacional.md`, pela decisão do dono de 13:55 ("faca tudo que for preciso para tornar elas com dados reais"). Não existe preenchimento, valor de exemplo nem simulado como passo intermediário.

**D5. Nota na ADR 0021.** O núcleo do mock (`web/src/data/mock/nucleoMock.ts`) e o Worker voltam a servir só ao modo mock (`VITE_FONTE=mock`: testes, E2E, homologação e o portão de desempenho do mock). O "a manter" da 0028 sobre os testes de paridade "porque agora o núcleo do mock também serve a produção" perde o motivo. Os testes de paridade continuam pelo motivo original da 0021: a homologação e o E2E mock usam o Worker.

**D6. A guarda contra a volta** são as quatro da varredura (§6), que o QA prova com "vermelho antes do verde":

| Id | O que é | Onde roda | Falha quando |
|---|---|---|---|
| G1 | `web/scripts/sem-mock.mjs` depois do `build` no `pronto` da web; o `App.tsx` escolhe a fonte por `import.meta.env.VITE_FONTE === 'mock'` com o mock num `import()` desse ramo; o pacote mock ganha uma sentinela em texto | `pnpm run pronto` e a CI, pelo mesmo comando | chunk do build `api` com nome `nucleoMock*` ou `mock-*`, com a sentinela, ou com os textos "Simulado" ou "Dados de exemplo" |
| G2 | Regra de lint: fora de testes, só `app/App.tsx` (ramo mock) importa `web/src/data/mock/` | `web/src/test/lint.meta.test.ts` | módulo de produção importa `data/mock` |
| G3 | E2E `*-api`: com a API respondendo `sem-dado-real`, todo cartão do catálogo mostra "Sem dado real" e nenhum número; sem selo, faixa ou marca d'água "Simulado"; o navegador não baixa o chunk do mock nem o Worker | projeto `chromium-api` | cartão sem dado real com número, selo, ou download do mock |
| G4 | Vitest "painel sem nenhum dado real": fonte de teste em que toda métrica responde `SemDadoRealErro`; todo cartão do `CATALOGO_CARTOES` do painel no estado `sem-dado-real`; sem os textos "Simulado", "Dados de exemplo" e "fictíci" | Vitest da web | cartão com conteúdo que não veio da fonte |

**D7. Fora desta ADR:** o modo homologação (`docker-compose.homolog.yml`, `VITE_FONTE: mock`, `DSPD_MODO_MOCK: homologacao`) continua com dado de teste e selo global (ADR 0018, ADR 0026 Q3 "A"). Os textos "fictício" do Catálogo e das notas (WB-1, OP-21, TA-16 a TA-18, ES-11, ES-12) saem pelo L4 da varredura (ux-designer e react-frontend).

## Alternativas

- **Só desligar o simulador e deixar o código parado (Q-099-3 B).** Recusada pelo dono (Q-099-3 A). Código parado continua no build de produção e pode ser religado sem querer; a G1 só é possível com o mock fora do build `api`.
- **Manter a 0028 com um interruptor por ambiente.** Recusada: é a mesma porta com outra chave. A 0028 já tinha recusado interruptor por cartão ou por ambiente (D7 dela), e o pedido do dono é que não haja simulado.
- **Esconder o cartão sem dado real (Q-099-1 B ou C).** Recusada pelo dono (Q-099-1 A), como no pedido 060.
- **Tirar Tático e Estratégico do menu, ou um aviso único no lugar dos cartões (Q-099-2 B ou C).** Recusada pelo dono (Q-099-2 A).
- **Calcular na API, com dado de exemplo marcado, o que falta.** Recusada: reabre a ADR 0026 P2 e entrega número que não é real a qualquer leitor da API.

## Consequências

- **Melhora:** a web de uso diário só mostra número calculado sobre a base real. Some o risco de leitura errada que a 0028 registrava em "Piora" (número fictício na mesma tela que número real). O chunk inicial deve cair cerca de 2,3 KB (nota do F6 na 0028), e o chunk do mock deixa de ser baixado em produção.
- **Piora:** com o L1, os 45 cartões voltam a "Sem dado real", e o Tático e o Estratégico ficam inteiros sem número até cada fonte real existir (efeito previsto na 0026). O `perf-api` (`e2e/perf/perf-api.spec.ts`) media um painel com simulado; o QA ajusta a referência (R2 da varredura).
- **A manter:** `METRICAS_ORIGEM_REAL` como fonte única de real ou não; G1 a G4 no `pronto` e na CI; toda métrica nova entra no mapa só pelo plano dela, com a consulta só de leitura que prova o dado na base.
- **Afrouxa? Sim, um controle:** saem os testes que exigiam o selo "Simulado" (`e2e/tests-api/simulado-070-l3.spec.ts`, `web/src/components/ui/simulado.test.tsx`, `web/src/features/coleta/simulado.test.tsx`, `web/src/data/simulado.test.tsx`). O dono autorizou em 2026-11-11 14:05 (Q-099-3 A: "o dono autoriza o afrouxamento desse controle"). Eles saem junto com a G3 e a G4 no lugar, nunca antes (L5 depois de L2d e L3). Nenhum texto de `docs/regras/` nem item de `tests/config.json` muda.
- **Segurança (`R-SEGURANCA`):** nenhum gatilho. Sem pessoa, credencial, banco, dependência nova, CSP, Docker nem workflow. A G1 roda dentro do `pronto` da web; um passo novo no workflow seria gatilho de CI e voltaria ao devops-engineer e ao security-engineer. `gatilhos_seguranca: []`.

## Por que o existente não basta

Mecanismos novos: G1 (script sobre o `dist`) e G4 (teste do painel sem dado). G2 e G3 trocam controles que já existem.

O que já existe para a mesma necessidade, e por que não basta (leitura do código da `develop` `ae009a75`, varredura §6):
- **Regra de lint do mock** (`web/src/test/lint.meta.test.ts:171-215`): só `web/src/data/mock/` importa `@metricas-dspd/mock`. Não impede a produção de carregar `data/mock`: `web/src/data/FonteComSimulado.ts:28` faz `import('./mock/MockFonteMetricas')`, passa no lint e entra no build `api`.
- **Orçamento F9** (`web/scripts/size.mjs:59-66`): só falha com o mock no bundle **inicial**. Com o mock num chunk sob demanda, o resultado é "ok"; a própria 0028 registra que esse chunk é baixado em produção.
- **E2E `e2e/tests-api/simulado-070-l3.spec.ts`**: exige o contrário (número com o selo).
- **Evidência de execução:** ainda não produzida. A varredura leu o código e não rodou nada. **Condição para o merge do L2d:** o QA registra na tabela de Leituras abaixo, na `develop` de hoje, a saída de `VITE_FONTE=api pnpm --filter web exec vite build` seguida de `ls web/dist/assets | grep -E '^(nucleoMock|mock)'` (tem de listar arquivos) e a G1 e a G3 vermelhas nesse estado; depois do L2, verdes. Sem essa linha, a G1 não entra.

## Critério de reversão

O dono pedir, num pedido registrado em `docs/pedidos/`, que algum cartão do painel de uso diário volte a mostrar número simulado ou de exemplo. Nesse caso, nova ADR; o desenho da 0028 e o histórico do git guardam o caminho.

## Leituras

| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| (L5, antes do merge do L2d) | Prova vermelho antes do verde da G1 e da G3 na `develop` (comando e saída copiados) | pendente |
| 2026-12-11 | G1 a G4 verdes na `develop` e na `homolog`; pedidos do dono por simulado no painel de uso diário; cartões do Operacional que saíram de "Sem dado real" pelo plano `099-dado-real-operacional.md` | pendente |
