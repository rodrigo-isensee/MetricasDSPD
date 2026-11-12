---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l7a-sustentacao-equipe
commit: f8d4840d0fa3f0945c1240bdd85b23d64c68276c
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L7a e L7b do 097, equipe da Sustentação do dado real em slug (E3.2, K-273)

## Achados
- A3 (recomendado) packages/contratos/src/filtros.ts:12 · o apelido vale "por um ciclo de release" sem cartão; virou cartão: remover `APELIDO_EQUIPE_SUSTENTACAO`, `EQUIPES_SUSTENTACAO_ID` e `NOME_EQUIPE_SUSTENTACAO` na release seguinte à que levar o L7b; fora dos testes, ninguém mais usa os dois últimos.
- A4 (recomendado) packages/contratos/src/filtros.ts:63 · `filtrosSustentacaoSchema.equipe` aceita qualquer texto; entra no mesmo cartão do A3 (o contrato passa a usar a regra de slug quando o apelido sair).
- A5 (recomendado) server/src/modulos/referencia/servico.ts:38 · com dois nomes de mesmo slug, o `Map` guarda o último na ordem do `ORDER BY` (depende de collation); virou cartão próprio, de servidor: ficar com o primeiro e tirar a dependência do teste app.test.ts:17.
- A6 (recomendado) packages/contratos/src/filtros.ts:27 · `idEquipeSustentacao` lê o objeto de apelidos sem `Object.hasOwn`: `constructor` e `toString` devolvem a função do protótipo (sonda S1); no servidor só zera o recorte. Entra no cartão do A3/A4 (some com o apelido) ou usar `Object.hasOwn`.

## Sondas
- S1 · `destinoDaSustentacao('?equipe=constructor,toString', '')` em f8d4840d · espera: `sust_equipe=constructor,toString` · obtido: `sust_equipe=function+Object%28%29+%7B+%5Bnative+code%5D+%7D,function+toString%28%29+...`

## Parecer
Aprovado em f8d4840d. Revalidação da volta 1 do L7b: li só o delta `74cfbf43..f8d4840d` (2 arquivos, 17 adições e 4 remoções, em `web/src/app/`). O `f2bd220a` por cima é só o parecer do QA, que não refiz.

- **Correção (CA-11 do e2e do PR 344):** `destinoDaSustentacao` passa a gravar `sust_equipe` como slug pelos dois caminhos, o parâmetro antigo `equipe` e o já prefixado `sust_equipe`, com `idEquipeSustentacao` de `@metricas-dspd/contratos`; sem segunda tabela de ids na web. Os outros filtros seguem intactos (o desvio é só para a chave da equipe).
- **Teste que prova:** redireciona.test.tsx muda `sust_equipe=totvs` para `sssc-totvs` (caso tabular e o do roteador) e ganha o caso de lista mista `equipe=senior,sssc-fluig` → `sssc-senior,sssc-fluig`. As três expectativas falham no código de 74cfbf43, que copiava o valor cru. Local (VITEST_MAX_WORKERS=2): redireciona.test.tsx, 30 testes passando.
- **A6:** achado da leitura do caminho novo, mas o defeito está no contrato do L7a (fora do delta); sem gatilho de segurança (o valor reconstruído passa por `URLSearchParams`, sem redirecionamento aberto) e sem erro no servidor (o filtro só não casa). Não bloqueia; o Jarvis o junta ao cartão do A3/A4.
- **CI:** `gh pr checks 344` na hora do review com os jobs do head novo pendentes (inclusive `e2e-parte (1/2)` e `(2/2)`); o merge espera o e2e verde, que é a prova do CA-11. Não refiz o e2e localmente.
- **Tamanho:** 284 linhas de código e teste (`git diff --numstat --no-renames 608fd604...f8d4840d`, fora `.md`); o corpo do PR leva `teto: excedido, 284 linhas, L7a e L7b entram juntos (A1: a saída de opções mudou de ids)`.
- **Regras de `praticas.md`:** o arquivo não marca regras com "decidida por". Li o checklist da skill sobre o delta.
- **Commits:** `fix(web)` em Conventional Commits em português.
