---
tipo: review
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-ajustes-back
commit: 95aa669e9ed6415de89d805c2b18e1519e0796dc
parecer: aprovado
revisor: tech-lead
data: 2026-10-29
---

# Code review: página de contrato da O23 (048, E3.1, cartão K-180)

Intervalo revisado: `7c94348b9bdc12850f40bad00cd38669ba8cc0e5..d9979ee8a2fe742d647738ce73cda4b42cee9e9d` (commits 6e917a2 e d9979ee). Dois arquivos, só documentação: `docs/contratos/metricas/O23.md` (novo) e `docs/contratos/metricas/README.md` (entrada manual e data de revisão). Sem código nem teste: teto da M14 não se aplica (0 linhas contadas). O K-093 não teve código e o K-129 está fora desta branch.

Revalidação (2026-10-29): delta 45991e4..95aa669 lido com git diff --stat: merge sem conflito da develop (c292908), só .forge/versao, docs/qa/049-forge-0-30-5.md e docs/reviews/049-forge-0-30-5.md; nada da entrega mudou, e O23.md e README.md seguem como em d9979ee (já lido). Parecer mantido: aprovado.

## Comandos
- `pnpm run pronto` (inclui `docs:check`) em d9979ee: verde, relatado pelo autor. Não rodado de novo neste review, por decisão do brief (uma suíte por vez; review por leitura do diff).

## Pontos revisados
- **Fidelidade ao código.** Conferido em `packages/metricas/src/businessmap/o2.ts:94-120` (filtro `semMoverHaDiasUteis > LIMITE_PARADO_DIAS_UTEIS` sobre o valor já arredondado por `r2`, `taxa(parados.length, itens.length)`, `porEtapa` sobre `etapas`), `packages/metricas/src/core/criterios.ts:17-25` (constante 5 e `VERSAO_CRITERIO_PARADOS_V1` com id, data e `afeta: ['O2']`), `packages/metricas/src/core/estatistica.ts:55` (`taxa`: abaixo de 20 devolve `insuficiente` com `minimo`, sem `pct`; 0 de 0 cai nesse ramo), `packages/contratos/src/tambem.ts:35` (`paradosSchema`) e `packages/metricas/src/businessmap/o23.test.ts` (casos listados na seção Testes batem com os `it`). O exemplo JSON é coerente com o schema e com o teste (5 de 20 = 25%) e se declara ilustrativo.
- **Sem regra inferida.** As duas dúvidas de negócio (U-11, 5 dias úteis como "uma semana", e item parado e bloqueado) estão declaradas como lacuna para o dono, não como decisão. A ausência de entrada própria do `o23` em catálogo ou Ajuda também está como lacuna; conferi por busca em `web/src` e só há o bloco e o teste.
- **Forma.** Cabeçalho com Propósito, Público e Revisão nas 5 primeiras linhas (`verificar-docs.ts:121-135`); seções Rota, Filtros, Regras de cálculo, Schema, Cartões e Testes na ordem das páginas geradas (modelo `O2.md`), mais Lacunas. A página não tem marcas `gerado:` e não é alvo do gerador (`alvosGerados` só cobre `METRICA_IDS`, o `README.md` e os agregados), então o `docs:gerar` não a toca nem a recusa.
- **Índice.** A seção "Bloco sem rota própria" fica depois de `<!-- gerado:fim -->`; `aplicarBloco` (`blocos.ts:37-52`) preserva o texto fora das marcas e o `conferirGerados` compara só o bloco. A data de revisão alterada à mão é a mesma que o gerador reescreveria. O link do índice torna a O23 alcançável a partir de `docs/README.md` (regra de órfãos). Links da página (`O2.md`, `../http.md`, `../snapshots/resultados/O2.json`) existem.
- **Pessoa e métrica individual.** Nenhum dado de pessoa, nenhuma quebra por pessoa nem comparação entre times; só BusinessMap, granularidade story.
- **Mínimo de 20.** A página promete percentual só com 20 ou mais itens em andamento e "k de n" abaixo, o que é o comportamento de `taxa` e do cartão (`CartaoO2.tsx`, texto "percentual não publicado, menos de 20").
- **Segurança e devops:** sem gatilho (só documentação, sem pessoa, sem pipeline).

## Achados
- A1 (recomendado) docs/contratos/metricas/O23.md:29 · "a soma dos k é igual ao k da taxa" não é garantida pelo código: com uma equipe, item iniciado que volta a coluna fora de trabalho/homologação (o2.ts:48-58) fica fora de porEtapa. Dizer que vale nos testes, ou levar a dúvida ao dono.
- A2 (recomendado) docs/contratos/metricas/O23.md:31 · "Status ok" convive com a lacuna da linha 59 (U-11 pendente de confirmação do dono). Alinhar o status ao que as outras páginas usam para regra pendente, ou citar a lacuna na própria linha.
- A3 (recomendado) docs/contratos/metricas/O23.md:51 · "linhas 208 a 239" não cobre a função: `BlocoParados` vai do JSDoc na 207 ao fecho na 273 de CartaoO2.tsx. Citar só o nome da função e o `data-testid` (`o23-parados`), que não envelhecem com a numeração.
