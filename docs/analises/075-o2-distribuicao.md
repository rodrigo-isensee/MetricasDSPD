# 075 E3.5: distribuição por motivo de bloqueio no O2 (K-204)

Autor: software-architect, 2026-11-06. Só leitura no checkout `/home/rodrigoisensee/MetricasDSPD-052c` (branch do lote 5a, a partir da develop); caminhos relativos a ele. Sem commit. Entradas: pedido 075 (escopo, etapas, histórico de 11:11, 11:47 e 14:16), `docs/analises/075-plano.md` (lotes 1a, 5a, 6b, §7), `docs/ux/075-bloqueios-reais.md` (§1 linha 13, linha 42, CA-2, CA-4).

## 1. O problema, medido no código
- O O2 só traz o motivo por item: `itens[].bloqueioMotivo` (`packages/contratos/src/schemas.ts:126-137`). A rota pagina só `itens` (`server/src/modulos/metricas/rotas.ts:27-31`; padrão 200 na página 1, 50 nas outras, `rotas.ts:16-17`, `docs/api/metricas.md:63-64`). Com mais de 200 itens em WIP, uma contagem feita na tela seria parcial. E, mesmo sem paginação, contar na tela é cálculo fora da biblioteca, o que a regra inviolável proíbe.
- O conjunto "itens do O2 com `bloqueioMotivo` não nulo" é **o mesmo** do BLOQUEADOS: os dois usam `selecionar(ctx, f, 'story')`, o mesmo instante `t` e `estadoEm(...).emWip` com `bloqueioAberto` (`packages/metricas/src/businessmap/o2.ts:34,47,66` e `bloqueados.ts:13-17`). O BLOQUEADOS não é paginado e já lista cada item bloqueado com o motivo (lote 5a entregue).
- O O19 já publica a distribuição por causa (8 motivos, "não classificado" por último, censo de contagem e dias úteis, percentual e percentis só com 20 ou mais por motivo, `o19.ts:11-49`), mas sobre bloqueios **encerrados no período**, não sobre os abertos agora. A marca do CA-2 e do CA-4 já está nele (lote 5a).
- O catálogo do briefing não pede distribuição por motivo no O2 (`docs/briefing-execucao-metricas.md:348`: idade por card aberto contra os percentis do tipo). A distribuição no O2 vem da especificação de UX (§1 linha 13, linha 42, CA-2).

## 2. Opção A: agregado `bloqueiosPorMotivo` no contrato do O2
**Forma (alto nível; o detalhe é do node-backend):**
```ts
// resultadoO2, campo novo
bloqueiosPorMotivo: z.object({
  total: z.number(),                       // itens bloqueados (censo)
  motivos: z.array(z.object({
    motivo: z.enum(MOTIVOS_BLOQUEIO_PUBLICADOS), // os 8, ordem neutra do domínio, "não classificado" por último
    itens: z.number(),                     // censo
    diasUteis: z.number(),                 // soma de horasUteisEntre(inicio, t) em dias úteis (biblioteca T2.5)
    participacao: taxaSchema,              // taxa(itens, total): 'insuficiente' abaixo de 20 (biblioteca)
  })),
}).nullable().optional()
```
Precedente de forma: `porMotivo[{ motivo, itens }] | null` do O25 (`docs/api/metricas.md:148`) e a lista de 8 do O19.

**Cálculo:** no mesmo módulo do O2 (`packages/metricas/src/businessmap/o2.ts`), sobre o conjunto completo de `itens` antes da paginação (a rota só fatia `itens`; `tipos` e contagens já seguem essa regra, `rotas.ts:26`). Horas por `horasUteisEntre` e `du` da biblioteca (como `bloqueados.ts:26`); participação só por `taxa` (`core/estatistica.ts:55-58`), que devolve `insuficiente` abaixo de 20. Contagem e dias úteis saem sempre, como censo (precedente O19 e BLOQUEADOS, "contagem pura"). Nada é somado, contado ou ordenado por quantidade na tela além da ordem de exibição da UX ("não classificado" por último, CA-2), que é apresentação, igual ao O19 (plano, Lote 1b).

**Sem dado real (interruptor desligado):** o agregado sai `null` (nunca zeros, que diriam "nenhum bloqueado"), na mesma função que hoje põe a nota no O2 (`server/src/modulos/metricas/parte-sem-dado.ts:25`). Com o 6b, passa a sair calculado; a versão de critério do 6a já `afeta` O2.

**Classificação pela política de mudança:** campo **opcional** novo na resposta = **compatível** (`docs/contratos/politica-de-mudanca.md:18`): PR normal, `pnpm run docs:fotografar`, `openapi.json` atualizado, sem entrada em `aceitas.json`. Por isso `.optional()`: como obrigatório seria incompatível (`:22`) e exigiria aceite (`:40-45`). O valor do enum de motivo já foi alargado no 1a. Confirmação esperada no `docs:check` do lote (se ele classificar como incompatível, vale o fluxo de aceite do 1a, com aprovação do arquiteto dada aqui).

**Lotes novos:**
| Lote | Agente | Arquivos | Teto | Testes |
|---|---|---|---|---|
| 1c: agregado por motivo no O2 | node-backend | `packages/contratos/src/schemas.ts` (campo); `packages/metricas/src/businessmap/o2.ts` (cálculo); `server/src/modulos/metricas/parte-sem-dado.ts` (`null` com a nota); gerados: fotografia `resultados/O2`, `openapi.json`, `docs/contratos/metricas/O2.md`, `docs/api/metricas.md` | 150 (estimativa 90) | 8 motivos sempre, "não classificado" por último; soma de `itens` = `total` = itens do O2 com motivo; agregado igual com `page=2` e `pageSize=1` (independe da paginação); `participacao` `insuficiente` com 19 e `ok` com 20; `diasUteis` pelo calendário (feriado não conta); `null` com a nota `bloqueio-sem-dado-real`; CA-075-11 no schema (nenhuma chave de pessoa) |
| 5c: distribuição por motivo no `CartaoO2` | react-frontend | `web/src/features/operacional/components/CartaoO2.tsx` (barras e legenda; ordem por `itens` decrescente com "não classificado" por último; hachura ou contorno e ícone, CA-2 e CA-4; percentual só com `participacao.status === 'ok'`, UX linha 42; `null` mostra "Sem dado real", CA-12) | 150 (estimativa 100) | CA-1, CA-2, CA-4 e CA-12 no O2; CA-5 por varredura; nenhum cálculo de contagem na web (só lê o agregado) |

**Gatilho de segurança:** 1c muda contrato da API (controle 10, CA-075-11): parecer do security-engineer. 5c: nenhum novo.

**Onde entra no §7:** back-end, 1c depende só do 1a (já na develop) e entra na série do node-backend logo depois do cartão em andamento (2a): 1a → 1b → 3 → 2a → **1c** → 2b → 4a ... (pode trocar com o 2b, sem dependência). Front-end, 5c depois do 1c mesclado na develop (ou com fixture a partir do schema do 1c): 5a → 5b → **5c**, ou 5c antes do 5b se o 1c chegar antes; um cartão por agente. Nenhum dos dois atrasa o 6b: o 6b só precisa do 5c se a UX mantiver o CA-2 no O2.

**Custos e riscos de A:** dois lotes, um review, dois QA e um parecer de segurança a mais; abre as perguntas de regra da §5 (o que conta como bloqueio, sobre que base vale o mínimo de 20, se publica dias úteis), sem as quais o 1c não pode ser codificado; duplica a informação do BLOQUEADOS, que tem o mesmo conjunto de itens ao lado na daily (`briefing:236`, `:318`).

## 3. Opção B: a distribuição sai do O2 e fica só no O19
- O O2 mantém o que o 5a entregou: a coluna "Bloqueado" por item com a marca de "não classificado" (CA-1, CA-4) e o texto de apoio. Sem barras nem legenda de distribuição no O2.
- A distribuição por motivo fica no O19 (já com CA-2 e CA-4 pelo 5a) e o "quem está bloqueado agora, por quê" fica no BLOQUEADOS, que já é o censo completo, sem paginação.
- Ajuste só na especificação de UX (E3.6, outra delegação): tirar o O2 da linha 9 e da linha 42 e do CA-2 (ou restringir o CA-2 ao O19), e do CA-12 a parte "O2 (motivo)" se ela se referia à distribuição.
- Contrato: nenhum. Lote novo: nenhum. Ordem do §7: não muda. Pergunta ao dono: nenhuma (nenhuma regra nova de cálculo).
- Custo: a daily perde a visão "bloqueios abertos agora, por motivo" agregada; ela continua legível linha a linha no BLOQUEADOS e, encerrados, no O19.

## 4. Recomendação: B
Razão: o conjunto que o O2 contaria é exatamente o do BLOQUEADOS, que já está na tela completo e sem paginação, e a distribuição por causa já existe no O19 com a regra do mínimo de 20 decidida pelo dono (O19-pct = B, 2026-10-16). A opção A acrescenta contrato, dois lotes e três perguntas de regra para repetir uma informação que o painel já mostra, e o catálogo do briefing não a pede no O2. B fecha o CA-2 onde ele já está cumprido (O19) sem cálculo novo.

Se a UX ou o dono quiserem mesmo o agregado "abertos agora, por motivo", o lugar mais coerente é o BLOQUEADOS (mesmo conjunto, mesma forma e mesmos testes da tabela da §2, trocando `o2.ts` por `bloqueados.ts` e `resultadoO2` por `resultadoBloqueados`), não o O2; as perguntas da §5 valem igual.

## 5. Perguntas ao dono (só se a opção A, ou a variante no BLOQUEADOS, for escolhida)
- **P-075-O2-1:** na distribuição por motivo do O2, "um bloqueio" é (A) cada item em WIP bloqueado no instante de referência (o mesmo conjunto do BLOQUEADOS) ou (B) cada bloqueio aberto ou encerrado no período filtrado (como o O19, que hoje soma só os encerrados)?
- **P-075-O2-2:** o percentual de cada motivo é publicado, e o mínimo de 20 vale (A) sobre o total de bloqueios da distribuição ou (B) sobre os bloqueios do motivo, como no O19 (O19-pct = B)? E a participação é por número de itens ou por dias úteis bloqueados (no O19 é por dias úteis)?
- **P-075-O2-3:** a distribuição traz os dias úteis bloqueados por motivo (soma do tempo aberto até o instante de referência) ou só a contagem?
