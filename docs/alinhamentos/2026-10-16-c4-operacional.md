# C4 do Operacional no B12 (pedido 011), 2026-10-16 (rascunho)

- **Estado:** rascunho do tech-lead, para consolidar com o parecer do software-architect (definição do C4 na ADR 0003).
- **Gatilho:** o B12 (branch `feature/011-metricas-tambem-back`, commits `00591f2` e `412b935`) registrou C4 do Operacional em 559 ms (fechada) e 636 ms (aberta), acima do C4 vigente (300 ms) e da emenda C4 (450 ms), o que bateria no critério de reversão da emenda.
- **Escopo:** medição e proposta. Não houve mudança de código, de orçamento nem de composição do painel.

## 1. Método
- Duas worktrees temporárias (já removidas): `origin/develop` em `600d925` (base sem o 011, que é também o merge-base da branch) e `412b935` (com o 011).
- O mesmo script nas duas, copiando o método do `packages/mock/src/orcamentoC4.test.ts`: CPU time (`process.cpuUsage`), contexto novo a cada medição, mediana de 5, semente e `hoje` padrão, filtros padrão (12s) e o pior filtro conhecido (12m). A única diferença é um aquecimento de JIT de 2 rodadas antes de medir.
- O script rodou 3 vezes em cada árvore, alternando base e 011, sob `flock /tmp/metricas-pesado.lock nice -n 19`, com a máquina ociosa (load de 1 min entre 0,95 e 1,16). Os números abaixo são o intervalo das 3 execuções.
- Máquina: Intel i5-1335U (WSL, 8 núcleos), Node 24.21.0.
- Para comparar, o `orcamentoC4.test.ts` do autor também rodou sem alteração na árvore do 011, na mesma condição.

## 2. O que o C4 vigente mede hoje
- **Texto da ADR 0003:** "todas as métricas do painel, incluindo `VISAO_GERAL`". Na tabela "Como medir": "`VISAO_GERAL` medido como painel".
- **Teste automático vigente (`desempenho.test.ts`, it "VISAO_GERAL (painel)"):** uma chamada de `VISAO_GERAL`, num contexto já aquecido pelas 33 métricas. Nenhum teste anterior ao 011 mede a soma das métricas de um painel.
- **O que a tela pede (develop e 011, `OperacionalPage.tsx`):**
  - cadência diária (padrão): O2, BLOQUEADOS, O1;
  - cadência semanal: O3, O9, O4, O12, O10, O7, O15, O18, EI_FL1.
  - As complementares anteriores ao 011 (O5, O6, O8, O11, O14, O13, O16) já estavam na seção "Mais métricas", fechada por padrão e com carga lazy.
  - `VISAO_GERAL` é da rota `/` (`VisaoGeralPage`), não de `/operacional`.
- **Composição do autor (B12):** os 19 ids do `CATALOGO_CARTOES` do painel (núcleo, as 7 complementares anteriores e EI_FL1), mais `VISAO_GERAL`, chamados em sequência num contexto novo.

## 3. Medições (CPU time em ms; intervalo de 3 execuções, cada uma mediana de 5)

### Operacional
| Composição | Período | Base (develop) | Com 011 | Orçamento |
|---|---|---|---|---|
| Autor, "fechada" (19 do catálogo + VG) | 12s | 258 a 275 | 250 a 277 | 300 |
| Autor, "fechada" | 12m | 368 a 384 | 384 a 426 | 300 |
| Autor, "aberta" (+ O19, O20, O21, O24, O25) | 12s | n/a | 282 a 290 | 450 |
| Autor, "aberta" | 12m | n/a | 420 a 513 | 450 |
| Catálogo sem VG (19 ids) | 12s | 150 a 156 | 141 a 153 | — |
| Catálogo sem VG | 12m | 311 a 323 | 272 a 284 | — |
| Núcleo sem VG (12 ids, sem complementares) | 12s | 112 a 129 | 111 a 116 | — |
| Núcleo sem VG | 12m | 193 a 206 | 189 a 201 | — |
| **Tela, cadência diária** (O2, BLOQUEADOS, O1) | 12s / 12m | 41 a 45 / 44 a 46 | 46 a 47 / 46 a 52 | 300 |
| **Tela, cadência semanal** (9 ids) | 12s / 12m | 66 a 69 / 154 a 209 | 65 a 80 / 148 a 159 | 300 |
| **Tela, seção aberta** (catálogo sem VG + novas) | 12s / 12m | n/a | 170 a 211 / 313 a 369 | 450 |
| `VISAO_GERAL` sozinha, contexto frio | — | 84 a 158 | 92 a 104 | 300 (como painel) |
| `VISAO_GERAL` em contexto quente (método vigente) | — | 87 a 110 | 74 a 85 | 300 |

### Tático e Estratégico (composição do autor)
- Tático: 124 a 200 ms nas duas árvores e nas duas condições.
- Estratégico: 117 a 124 ms nas duas árvores e nas duas condições.
- Sem VG, núcleo mais novas: Tático 24 a 34 ms e Estratégico 9 a 15 ms.

### C3 a frio, uma métrica isolada por contexto novo (12s, com o 011)
- Anteriores ao 011: O2 13, BLOQUEADOS 10, O1 23, O3 18, O9 24, EI_FL1 16, O11 8; as demais ficam entre 1 e 5.
- `VISAO_GERAL`: 84.
- Novas: O19 2, O20 31, O21 5, O24 6, O25 3.
- Na base, os mesmos ids medem igual (O1 22, VG 95).
- **O1 não custa 126 ms.** Os 126 ms e os 158 ms que o autor atribuiu a O1 e VG não se repetem com a métrica isolada.

### Teste do autor reexecutado, máquina ociosa
- Operacional 12s: fechada 273 ms e aberta 325 ms (fator de calibração 2,00 nessa rodada).
- Operacional 12m: fechada 370 ms e aberta 405 ms (fator 1,00).
- Tático: 152 a 173 ms. Estratégico: 117 a 124 ms. Gerador lazy: 7 ms.
- **Os 559 e 636 ms do B12 não se reproduzem.** É coerente com uma medição feita sob contenção: o próprio teste registra fator de até 2x, e o CPU time infla com disputa de cache e de SMT.

## 4. Classificação
**(c) composição errada, com uma parcela de (a).**

1. **Composição (c).** A "fechada" do autor tem dois problemas:
   - inclui as 7 complementares anteriores ao 011, que já eram lazy, ou seja, só são calculadas com a seção aberta;
   - inclui `VISAO_GERAL`, que pertence à rota `/` e tem medição própria.

   Medida como a tela pede, a fechada fica em 41 a 80 ms (12s) e em 46 a 209 ms (12m), com folga sobre 300 ms. A aberta fica em 170 a 369 ms, abaixo de 450 ms.
2. **Débito existente (a), só na composição do autor.** No pior filtro (12m), essa composição já passava de 300 ms na develop (368 a 384 ms), antes do 011. O 011 não piora de forma relevante: fechada 384 a 426 ms contra 368 a 384 ms, diferença dentro da variação entre execuções; núcleo e tela iguais.
3. **Não é (b).** O 011 não causa regressão em nenhuma composição. As novas somam 30 a 60 ms e só entram com a seção aberta.
4. **Critério de reversão da emenda não disparado com número válido.**
   - Com a composição da tela, a aberta fica abaixo de 450 ms nos três painéis.
   - Com a composição do autor, a aberta em 12m oscila em torno de 450 ms (420 a 513 ms). Nessa composição, o critério dispararia ou não conforme a carga da máquina, o que não serve como gatilho.

## 5. Proposta (decisão técnica do tech-lead e do architect)
1. **O architect fixa a composição do C4 na ADR 0003**, por emenda à emenda C4. Proposta do tech-lead:
   - **C4-fechada:** os ids que a página pede com "Mais métricas" fechada, na cadência mais pesada. No Operacional, a semanal; no Tático e no Estratégico, o núcleo.
   - **C4-aberta:** a fechada mais todas as complementares do painel, anteriores e novas.
   - **`VISAO_GERAL`:** sai da soma de cada painel e continua medida como painel próprio (rota `/`), como no `desempenho.test.ts`.
   - A lista de ids vem de uma fonte única (o catálogo por `grupo`, mais a cadência), não de uma lista escrita à mão no teste.
2. **O autor ajusta o `orcamentoC4.test.ts` à composição fixada.** Isso muda o teste, não a composição do painel. A leitura do B12 na ADR (559 e 636 ms) é substituída pelos números da seção 3, medidos com a máquina ociosa e com o load registrado.
3. **Método de leitura do orçamento.** Na pré-entrega, o QA registra o load de 1 min e o fator de calibração junto do número. Leitura com fator acima de 1,2 não vale como leitura de orçamento: só vale para o limite de CI.
4. **Não fazer agora:** lazy das complementares (já é lazy) nem otimização de O1 (23 ms a frio). `VISAO_GERAL` (84 a 104 ms sozinha) também fica de fora: está dentro do próprio C4.
5. **Débito com cartão próprio, só se o architect mantiver `VISAO_GERAL` e as complementares na soma.** Nesse caso, um cartão para o Operacional em 12m, débito anterior ao 011, com remédio a medir: compor `VISAO_GERAL` a partir do memo dos cartões, como já previa a ADR. Na composição proposta, não há débito.
6. **Bloqueio do PR do B12:** nenhum. O limite de CI (900 ms) passa nas duas condições e nos três painéis.

## 6. Precisa do usuário?
Não. A composição do C4 e a leitura são decisões técnicas, do architect com o tech-lead. Não muda orçamento, composição de tela nem regra de negócio. O usuário só recebe no resumo a correção da leitura do B12.

## 7. Riscos
- **Variação do CPU time.** Chega a 20% entre execuções (`VISAO_GERAL` mediu de 84 a 158 ms na base). Leituras perto do limite precisam de 3 execuções e do load registrado.
- **Prova sintética.** O que a tela pede foi lido no código de `OperacionalPage.tsx`, não medido no navegador. A confirmação de ponta a ponta é o F5 do QA.
- **Mudança de composição sem aviso.** Se a página passar a pedir mais ids fora de "Mais métricas", a composição do teste tem de acompanhar. Por isso a proposta 1 tira a lista do catálogo, numa fonte única.

## Decisão consolidada (Jarvis, 2026-10-16, com base nos pareceres do tech-lead e do architect)
- A medida do B12 usou a composição errada: somou a VISAO_GERAL e as complementares que já eram lazy, e foi feita sob carga. O 011 não piora o C4 em nenhuma composição (medição do tech-lead com a máquina ociosa). O critério de reversão da emenda não disparou com número válido.
- Composição que vale (ADR 0003, a cargo do architect):
  - **C4-fechada** = o que a página do Operacional pede com "Mais métricas" fechada;
  - **C4-aberta** = a fechada mais todas as complementares do painel;
  - **VISAO_GERAL** é medida à parte, como painel próprio.
  - A lista de ids vem do catálogo, numa fonte única. As leituras registram a carga da máquina e a calibração (≤ 1,2).
- Com a composição correta: fechada de 41 a 209 ms e aberta de 170 a 369 ms, dentro de 300/450. Sem lazy novo e sem otimização. Sem cartão de débito.
- Ações:
  - architect: ajustar a ADR 0003;
  - node-backend: corrigir o `orcamentoC4.test.ts` e trocar a leitura de 559/636 ms pelos números válidos;
  - QA: confirmar no navegador, pelo F5, dentro do QA do back.
- Não bloqueia a homolog depois dessas ações. Não precisa do usuário: é decisão técnica.
