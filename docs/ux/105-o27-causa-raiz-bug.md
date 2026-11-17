# O27 Causa raiz dos bugs: especificação do cartão (pedido 105, E7.219, L3)

## Objetivo
Mostrar por que os bugs do BusinessMap acontecem, para o time escolher as 3 maiores causas como ação trimestral. Duas colunas, nunca somadas: Bug interno e Defeito em produção. Base: plano `plano-cartao-causa-raiz.md` (seção 1 e L3), alterada pelas decisões do dono de 16/11/2026 (D1 a D5, abaixo). Sem meta numérica. Sem pessoa.

## Decisões do dono que valem aqui (16/11/2026)
- D1: "Não é bug" é uma causa da distribuição, com n e %. Muda o plano, que a deixava fora.
- D2: entram bugs concluídos ou descartados na janela de 12 semanas. Bug em aberto é o O16.
- D3: mínimo de 20 por tipo, sobre os bugs com causa. Abaixo disso a coluna mostra só números, sem %.
- D4: causas na ordem do campo no BusinessMap; as 3 maiores com destaque, sem reordenar.
- D5: o "leia junto" do O15 aponta para o O27 (não mais para o O17).

## Local e identidade
- Painel Operacional, seção complementar `qualidade-compl` ("Qualidade"), ao lado do O13 e do O16. Rota `/api/v1/metricas/O27`.
- Título: "Causa raiz dos bugs". Pergunta: "Por que nossos bugs acontecem?". Meta: "Sem meta numérica; as 3 maiores causas viram ação trimestral."
- Leia junto: O15 e O16.

## Definições para ler o contrato
- Cada coluna (`porTipo[]`, um item por `tipo`) tem: `n` (bugs do tipo na janela), `naoInformada`, `comCausa` (= `n` - `naoInformada`) e `causas` (`[{causa, n, pct}]` ou `null`).
- Com D1, **"Não é bug" está dentro de `causas`** e dentro de `comCausa`. Só "Causa não informada" fica fora. O `naoEBug` separado do plano deixa de existir como campo próprio (ajuste para o node-backend, E7.218).
- `pct` = `n` da causa / `comCausa`. A soma dos % de uma coluna dá 100%.
- `causas` é `null` quando `comCausa` < 20. Nunca mostrar % nesse caso.

## Layout (ASCII)
```
Causa raiz dos bugs                         [marca de versão de critério]
Por que nossos bugs acontecem?
Bug do BusinessMap, não incidente do Acelerato; não somar com o O17 nem com o S3.

 Bug interno (48 bugs)               Defeito em produção (31 bugs)
 ---------------------------         ---------------------------
 Requisito mal definido  9 (22%) [3 maiores]   ...
 ...                                 ...
 Outros                  2 (5%)
 Não é bug               4 (10%)
 ---------------------------         ---------------------------
 Causa não informada: 7 bugs         Causa não informada: 0 bugs
 Base dos %: 41 bugs com causa       Base dos %: 31 bugs com causa
```
Em tela estreita (< 768px) as colunas empilham: Bug interno, depois Defeito em produção. Cada coluna é um bloco com título próprio (`<h3>`).

## Comportamento por coluna

### Cabeçalho
`{Tipo} ({n} bugs)`; com n = 1: `{Tipo} (1 bug)`; n = 0: `{Tipo} (nenhum bug)`. Números com `fmtInteiro`.

### Lista de causas (`comCausa` >= 20)
- 12 linhas, sempre as 12 opções do campo, na **ordem do campo no BusinessMap** (a ordem em que `causas` vem do contrato; o front não ordena). Causa com n = 0 aparece com `0 (0%)`, para a lista ser estável entre colunas e períodos.
- Cada linha: rótulo da causa, `n` e `%` (inteiro, `fmtPct`), e uma barra horizontal proporcional ao %. A barra é complemento: o texto é a informação.
- "Outros" é uma linha como as outras. A descrição de "Outros" nunca aparece.
- "Não é bug" é uma linha como as outras, na posição que tem no campo.
- **Destaque das 3 maiores:** as 3 linhas de maior `n` (empate no 3º lugar: destacam-se todas as empatadas; causa com n = 0 nunca é destacada). Destaque = barra em cor forte **e** o texto "3 maiores" ao lado do número (`data-testid="o27-maior"`), para não depender só de cor. A ordem das linhas não muda. "Não é bug" entra na disputa como qualquer causa (D1); é hipótese de UX a confirmar com o dono se ela deve ou não receber o destaque.
- Abaixo da lista, `data-testid="o27-base"`: `Base dos percentuais: {comCausa} bugs com causa.`

### Linha "Causa não informada" (sempre visível, fora da distribuição)
`Causa não informada: {naoInformada} bugs` (1: `1 bug`; 0: `0 bugs`). Fica fora do % e nunca é distribuída entre as causas. Valor fora do domínio conta aqui. `data-testid="o27-nao-informada"`.

### Aviso abaixo de 20 (`comCausa` < 20, `causas` = null)
No lugar da lista, só números:
- `Bugs do tipo: {n}`
- `Causa não informada: {naoInformada}`
- `Bugs com causa: {comCausa}`
- Aviso (`data-testid="o27-aviso"`, texto normal, sem cor de alerta): `Menos de 20 bugs com causa ({comCausa} de 20 mínimos); a distribuição não é mostrada.`
Sem % e sem barras. A outra coluna é independente: uma pode mostrar a lista e a outra o aviso.

### Os dois tipos abaixo de 20 (ou sem bug)
Cada coluna mostra seu aviso. Nada de soma entre colunas, nem total geral.

## Nota fixa do cartão
Abaixo do título, `data-testid="o27-nota"`: `Bug do BusinessMap, não incidente do Acelerato. Não somar com o O17 nem com o S3.` Sempre visível.

## Nota de recorte
`Bugs concluídos ou descartados nas últimas 12 semanas, inclusive arquivados. Bugs em aberto estão no O16. Filtros de equipe, sistema e setor valem; o filtro de tipo não.` (para a metodologia do cartão, "Como se calcula").

## Por sistema
Não há. `porSistema` é `null`; mostrar a linha `Por sistema: aguardando o campo Sistema afetado no BusinessMap.` (`motivoPorSistema`), em texto normal, abaixo das colunas.

## Mudança no O15 (D5)
No cartão do O15, o "leia junto" que apontava para o O17 passa a apontar para o O27. O O17 continua na Sustentação.

## Estados
- Carregando, erro e "sem dado": os do `CartaoMetrica` atual. Nenhum texto do O27 aparece enquanto `d` for indefinido.
- Sem bug nenhum no período (as duas colunas com n = 0): cada coluna mostra `nenhum bug` no cabeçalho e o aviso de menos de 20.
- Sem permissão: não se aplica (nenhum dado de pessoa).
- Marcação da versão de critério `criterio-AAAA-MM-DD-o27-causa-raiz-bug` em `criterios.serie`; sem série temporal neste cartão, a marca fica na legenda do cartão: `Critério desde {data}.` (data confirmada pelo dono).

## Fora do cartão (regras invioláveis)
- Sem segmentação por pessoa, responsável ou equipe (equipe é só filtro). Sem ranking de pessoa. Sem comparação entre times.
- Nenhum dado do Acelerato. Nenhuma soma entre Bug interno e Defeito em produção.
- Nenhuma causa descrita em texto livre aparece.

## Microcopy (resumo)
Títulos: "Causa raiz dos bugs", "Bug interno", "Defeito em produção". Rótulos das 12 causas: os do campo no BusinessMap (do contrato `CAUSAS_RAIZ_BUG`). Frases: as das seções acima.

## Acessibilidade (lido, pelo código; sem medição)
- Cada coluna é uma região com título `<h3>`; a lista de causas é `<ul>`/tabela com rótulo, n e % em texto. A barra é `aria-hidden`; o destaque tem texto "3 maiores".
- Destaque não depende só de cor; contraste de texto >= 4.5:1 e da barra >= 3:1 (o QA mede com axe).
- Nenhum elemento novo é interativo; ordem de leitura = ordem do campo.
- Colunas empilham em < 768px; alvos não se aplicam (sem controles).

## Critérios de aceite
- CA-1 QUANDO o cartão O27 é exibido O SISTEMA DEVE mostrar duas colunas, "Bug interno" e "Defeito em produção", e nenhum total ou soma entre elas.
- CA-2 ENQUANTO `comCausa` da coluna for >= 20 O SISTEMA DEVE listar as 12 causas na ordem do campo, cada uma com n e %, incluindo "Outros" e "Não é bug".
- CA-3 O SISTEMA DEVE calcular o % de cada causa sobre `comCausa`, que inclui "Não é bug" e exclui "Causa não informada".
- CA-4 O SISTEMA DEVE mostrar a linha "Causa não informada: N bugs" em cada coluna, fora da distribuição, inclusive com N = 0.
- CA-5 SE `comCausa` da coluna for < 20 ENTÃO O SISTEMA DEVE mostrar só `n`, `naoInformada` e `comCausa`, o aviso "Menos de 20 bugs com causa ({comCausa} de 20 mínimos); a distribuição não é mostrada." e nenhum %, sem afetar a outra coluna.
- CA-6 QUANDO a coluna mostra a distribuição O SISTEMA DEVE destacar as 3 maiores causas (todas as empatadas no 3º lugar, nunca n = 0) com a barra em cor forte e o texto "3 maiores", sem alterar a ordem das linhas.
- CA-7 O SISTEMA DEVE exibir a nota "Bug do BusinessMap, não incidente do Acelerato. Não somar com o O17 nem com o S3."
- CA-8 O SISTEMA DEVE exibir "Por sistema: aguardando o campo Sistema afetado no BusinessMap." enquanto `porSistema` for `null`.
- CA-9 O SISTEMA NÃO DEVE exibir nome de pessoa, responsável, descrição de "Outros" ou dado do Acelerato em nenhuma parte do cartão.
- CA-10 QUANDO o cartão O15 é exibido O SISTEMA DEVE apontar o "leia junto" para o O27, e não para o O17.
- CA-11 ENQUANTO a largura for < 768px O SISTEMA DEVE empilhar as colunas, Bug interno primeiro.

## Necessidades de dados (para o back-end)
Por tipo (`Bug interno`, `Defeito em produção`): `n`, `naoInformada`, `comCausa`, `causas` (`[{causa, n, pct}]` das 12 opções, com "Não é bug" dentro, ou `null` abaixo de 20), `porSistema` (null) e `motivoPorSistema`. Mais a versão de critério do O27. Nenhuma coluna de pessoa.

## Perguntas em aberto (hipóteses até o dono confirmar)
1. "Não é bug" pode receber o destaque das 3 maiores? (Hipótese: sim, por D1.)
2. Data da versão de critério do O27: a da primeira projeção com o campo, depois da recoleta.
