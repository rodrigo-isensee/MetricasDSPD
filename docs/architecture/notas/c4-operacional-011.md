# Parecer: C4 do Operacional no B12 (pedido 011)

- Data: 2026-10-15
- Autor: software-architect
- Base: ADR 0003 na worktree `MetricasDSPD-011-back` (C4 original, "Como cada item é medido", "O que bloqueia", "Emenda C4", leitura do B12); `packages/mock/src/orcamentoC4.test.ts`; `packages/mock/src/desempenho.test.ts`; `packages/contratos/src/cartoes.ts`; `web/src/features/complementares/MaisMetricas.tsx`; `web/src/features/operacional/OperacionalPage.tsx`; `web/src/features/visao-geral/VisaoGeralPage.tsx`.
- A ata `docs/alinhamentos/2026-10-16-c4-operacional.md` ainda não existia quando este parecer foi escrito.
- Não altera a ADR nem o código. As mudanças propostas aqui serão feitas depois, quando o pedido 011 for consolidado com o tech-lead.

## 1. A composição medida no B12 não é a do C4 vigente

O B12 mediu a C4-fechada do Operacional como `ANTERIORES('operacional') + VISAO_GERAL`. `ANTERIORES` são todos os ids do catálogo com `painel === 'operacional'`. São 19 ids: 12 do núcleo e 7 complementares anteriores ao 011 (O5, O6, O8, O11, O13, O14, O16). Com a `VISAO_GERAL`, a medida tem 20 cálculos. Essa composição tem dois erros.

1. **A `VISAO_GERAL` não faz parte do Operacional.** Ela só é pedida pela rota `/` (`VisaoGeralPage`). O C4 original diz "incluindo `VISAO_GERAL`", e o método da ADR explica como ela entra: "`VISAO_GERAL` medido como painel". A Visão geral é um painel próprio, com orçamento próprio. Ela não entra na soma de outro painel. No B12, ela custa 158 ms dentro da soma do Operacional.
2. **As complementares anteriores ao 011 também são carregadas sob demanda.** Elas ficam em "Mais métricas deste painel". Esse bloco é um `<details>` fechado por padrão, e os cartões só montam e consultam quando a pessoa o abre (`MaisMetricas.tsx`). É o mesmo mecanismo das complementares do 011. A emenda define a C4-fechada como "estado inicial, seção fechada". Por isso essas 7 complementares não entram na fechada, embora existissem antes do 011.

**Composição correta, por painel e sem a `VISAO_GERAL`:**

| Condição | O que entra |
|---|---|
| C4-fechada (Operacional) | Os 12 ids do núcleo: O2 (com o bloco do O23, que não é carregado sob demanda), BLOQUEADOS, O1, O3, O9, O4, O12, O10, O7, O15, O18 e EI_FL1. Entram também os ids pedidos pelos blocos "Pede atenção" diário e semanal, se algum deles não estiver nessa lista. |
| C4-aberta (Operacional) | A fechada mais todas as complementares do painel: as 7 anteriores e as 5 do 011 (O19, O20, O21, O24, O25). Abrir a seção monta todas elas juntas. |
| `VISAO_GERAL` | É um painel próprio, medido a frio num contexto novo, com orçamento de 300 ms. |

Observações para a nova medição:

- **Diária e Semanal.** Na tela, cada visão carrega só parte do núcleo: a Diária carrega O2, BLOQUEADOS e O1, e a Semanal carrega o restante. Medir o núcleo inteiro é o limite conservador e segue a letra "todas as métricas do painel". Se o tech-lead preferir medir por visão, a ADR precisa dizer isso.
- **A `VISAO_GERAL` nunca foi medida a frio.** O teste anterior (`desempenho.test.ts`) a mediu sozinha, num contexto já aquecido por todas as outras métricas. Por isso o débito anterior de C4, se existir, pode estar na Visão geral, e não no Operacional.
- **O custo por id depende da ordem.** O O1 aparece com 126 ms dentro do painel, mas com cerca de 10 ms em C3 depois do B8. A explicação provável é que o primeiro id a precisar de um índice preguiçoso do contexto paga a montagem dele. Isso não muda a soma, mas impede atribuir o custo a uma métrica sem antes medir isso.

Pela composição correta, o número do B12 cai, mas não sabemos quanto. Tirar a `VISAO_GERAL` reduz cerca de 158 ms, e tirar as 7 complementares anteriores reduz um valor que não foi medido. **É preciso medir de novo antes de qualquer veredito sobre a fechada.**

## 2. Ação que a ADR determina

**C4-aberta: o critério de reversão da emenda foi atingido e continua atingido com a composição correta.** A aberta correta é a do B12 menos a `VISAO_GERAL`, ou seja, 636 − 158 ≈ 478 ms, ainda acima de 450 ms. Todas as complementares da fase 1 estão em C3 < 50 ms (a maior é O20, com 35 ms). A ADR determina então que:

- as complementares passam a ser calculadas só por cartão, cada uma no seu `GET` (D7), sem entrar em nenhuma composição de painel;
- o C4 volta a valer só como C4-fechada;
- cada complementar fica sujeita apenas ao C3: menos de 50 ms a frio, com limite de 150 ms na CI.

Na interface, isso já é o comportamento atual. Cada cartão de "Mais métricas" faz o próprio `GET`, e nada é calculado em lote. Por isso, das três ações listadas, a que se aplica é:

- **Mudar a composição do painel: não.** Seria mudança de produto e de escopo, e a ADR não pede isso.
- **Carga sob demanda no Operacional: já existe.** A reversão diz que ela não basta como garantia de orçamento. O efeito é tirar a C4-aberta da ADR e do teste, não mexer na tela.
- **Registrar débito anterior: sim, para a C4-fechada,** se a nova medição confirmar que ela passa de 300 ms (veja o item 3).

**O que a ADR exige antes da homologação:**

1. Alterar a ADR 0003 para aplicar a reversão: tirar a C4-aberta e manter o C3 por complementar. Isso também libera o `orcamentoC4.test.ts` de medir a aberta, mas mantendo o C3 a frio dos ids novos.
2. Corrigir a composição no `orcamentoC4.test.ts`: fechada = só o núcleo, e `VISAO_GERAL` medida à parte, a frio.
3. Medir de novo a fechada do Operacional com e sem o 011. A medição sem o 011 é a que o tech-lead já está fazendo. A única coisa do 011 que entra na fechada é o bloco do O23 dentro do O2.
   - Se a fechada com o 011 ficar igual à fechada sem o 011, dentro do ruído, e ainda acima de 300 ms, é débito anterior. Ele vira exceção na ADR com item, valor medido, motivo, remédio e prazo, aprovada pelo arquiteto e pelo tech-lead e comunicada ao usuário, como manda a seção "O que bloqueia a entrega".
   - Se a fechada com o 011 for maior que a fechada sem o 011 além do ruído, a culpa é do bloco do O23. Isso é regressão do 011, que a emenda proíbe ("sem regressão permitida pelas novas"), e bloqueia até ser corrigido.

**Se bloqueia a homologação:** o 011 pode ir para a `homolog` com a ação acima, mas não antes dela. O motivo é que a emenda torna a C4-fechada < 300 ms bloqueante na pré-entrega do QA, e a ADR só admite sair do orçamento com exceção registrada nela, nunca com exceção silenciosa. Os passos 1 a 3 são alteração de documentação e de teste, mais uma medição, e não mudam código de produção. O limite de 900 ms na CI, que bloqueia o PR, passou nas 12 medições.

## 3. Rever o orçamento de 300 ms?

**Ainda não.** Há três motivos:

- **Ainda não está provado que o C4 do Operacional estourava antes do 011.** Os 559 ms incluem a `VISAO_GERAL` e 7 complementares que carregam sob demanda. O C4 por painel nunca teve número na máquina de referência: o documento `docs/tecnica/qualidade-e-testes.md` registra "número pendente", e o teste antigo media só a `VISAO_GERAL` com o contexto aquecido. Mudar o valor sem a medição correta seria ajustar o orçamento a uma medida errada.
- **O valor de 300 ms protege outras metas.** Ele garante o F5 (painel inteiro em menos de 500 ms) e o A1 (`GET` em menos de 300 ms). Depois do 002, os `GET` de um painel caem numa mesma instância Node, que tem uma única thread, de modo que a soma do C4 se aproxima do tempo até o último cartão responder. O caminho que a ADR já prevê vem antes de rever o número: montar os índices compartilhados uma vez por contexto, na criação (C1 e S1, "se o custo couber em C1"), em vez de deixar o primeiro cálculo pagar por eles. Esse é o remédio a registrar com prazo na exceção.
- **Rever o valor faz sentido em um caso específico.** Seria quando a fechada corrigida e a `VISAO_GERAL` a frio ficarem acima de 300 ms mesmo com o remédio, e ao mesmo tempo o F5 e o A1 medidos no painel ficarem dentro do orçamento. Isso mostraria que o C4 está mais apertado do que as metas que ele deveria proteger. Nesse caso, o valor ou a definição do C4 (por visão, por exemplo) mudam por alteração da ADR, com o número medido.

Essa revisão é decisão técnica do time, registrada na ADR, e não afeta escopo nem produto: nenhuma tela, métrica ou composição visível muda. A exceção e o eventual novo valor entram no resumo ao usuário, como a ADR exige.

## Riscos

- **A fechada corrigida pode continuar acima de 300 ms.** Nesse caso o débito é real, provavelmente nos índices preguiçosos e no O1 a frio dentro do painel. O remédio é montar os índices na criação do contexto, o que exige verificar que o C1 e o S1 continuam cabendo.
- **A `VISAO_GERAL` a frio pode passar de 300 ms.** Ela nunca foi medida assim. Se passar, é outro débito anterior, que também precisa de exceção registrada.
- **O bloco do O23 dentro do O2 é a única parte do 011 que pesa na fechada.** Se ele causar regressão, isso bloqueia o 011.
- **Diferença entre as worktrees.** A composição do Operacional difere entre a worktree do 011 e a da Sustentação no Operacional, que tem a visão Resumo com 12 `GET`. A definição por painel precisa valer nas duas.
