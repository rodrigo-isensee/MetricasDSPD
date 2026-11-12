---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k280-corte-unico
commit: 3a8cb7876e9b749efe1d9c3e82bf5cc6ff401aa7
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-280, condição única do corte de cards e chamados (E4.3, review E3.2)

Diff lido: `git diff 167f3a13..3a8cb787` (5 arquivos, +35 -9; código e teste: 44 linhas, dentro do teto). Parecer do QA na mesma branch: `docs/qa/097-k280-corte-unico.md` (aprovado, 4e4223d8). Fecha o A1 de `docs/reviews/097-k279-opcoes-corte.md` (cortes copiados sem teste de divergência).

## O que foi conferido
- **Lugar da constante (ADR 0013):** `CORTE_CARDS` e `CORTE_CHAMADOS` vivem em `referencia/cortes.ts` e saem pela API pública `referencia/index.ts`. `metricas/repositorio.ts` importa de `../referencia/index.js` (não de arquivo interno), como `metricas/servico.ts` já fazia; `referencia/repositorio.ts` importa `./cortes.js` dentro do próprio módulo. Pôr as constantes em `metricas` obrigaria `referencia` a importar `metricas`, o sentido inverso da dependência existente; `referencia` é o lugar certo.
- **Ausência de ciclo:** nenhum arquivo de `referencia` nem de `operacao` (que `referencia/servico.ts` importa) importa `metricas`; a dependência continua só `metricas` → `referencia`. `cortes.ts` não importa nada.
- **SQL e contrato sem mudança:** as constantes são o texto exato que estava inline em `lerCards` (`metricas/repositorio.ts:60`) e `lerChamados` (`:114`) e em `referencia/repositorio.ts` desde o K-279; o SQL gerado é o mesmo, contrato e respostas intocados. Constantes fixas, sem entrada do usuário: sem injeção.
- **Teste que prova algo:** `server/tests/corte-unico.test.ts` captura o SQL das quatro leituras e exige `WHERE <corte>` em cada uma. Se a condição de uma lista ou de uma opção mudar inline, ou a constante mudar sem a lista acompanhar, o teste cai: é a divergência que o A1 do K-279 pedia para pegar. Prova presença do texto, não semântica no banco (essa fica com o .pg no CI), o que basta para uma refatoração sem mudança de SQL.
- **Regras invioláveis:** BusinessMap e Acelerato em constantes e consultas separadas; nenhuma coluna de pessoa; histórico intocado.
- **Commit:** `refactor(referencia): ...` em Conventional Commits, corpo diz o que muda e que o SQL não muda, com `Cartão: K-280`. Um commit, uma mudança coerente.

## Execução
- `VITEST_MAX_WORKERS=2 npx vitest run tests/corte-unico.test.ts tests/app.test.ts` (em `server/` da worktree 056d, head 4e4223d8 = 3a8cb787 mais o parecer do QA): 2 arquivos, 19 testes passam.
- `npx eslint` nos 5 arquivos do diff (inclui a regra de fronteira de módulo da ADR 0013): sem saída, verde.
- Nada contra a base real nem `.env*`; a suíte inteira e o .pg rodam no CI.

## Achados

## Veredito
Aprovado, sem achados.
