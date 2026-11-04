---
tipo: review
contrato: 1
pedido: 065-bloqueados-sem-dado-real
branch: feature/065-bloqueados
commit: a6294341107cadb3017da374f3278a5cbb631d2b
parecer: aprovado
revisor: tech-lead
data: 2026-11-04
---

# Code review: 065, BLOQUEADOS e O5 fora do mapa real, parte de bloqueio do O1 e do O2 como Sem dado real (E1.4)

Diff lido: `1f1da67..21fffba` (back `26692ba`, front `2050521` e `ae729b2`, parecer de interface `21fffba`, commitado nesta etapa, K-205). Base: `docs/analises/065-desenho.md`, seções 1 a 4 e 8 (decisão B do dono).

**Veredito: aprovado.** Nenhum achado bloqueante. Os achados abaixo são recomendações e não devolvem.

## Ferramentas (citadas)

- `vitest run --maxWorkers=2` do server em `21fffba`: 80 arquivos passaram (33 pulados, os `.pg`), 1622 testes passaram, 232 pulados. Do web: 94 arquivos, 1425 testes, todos passaram.
- `openapi:verificar`: "openapi.json em dia".
- O `praticas.md` não tem regra "decidida por: `<comando>`": pendência já registrada com o arquiteto. `test:pg` e `pronto` ficam com o dono.

## O que foi conferido

- Mapa real e motivos: `origem.ts` tira BLOQUEADOS e O5 do mapa (17 ids reais), cada um com motivo próprio em `MOTIVO_ORIGEM_MOCK`, sem número de cartão na tela. O server responde o estado sem dado real sem ler a base (S1 e S4 conferem zero chamadas). Correto.
- Null nunca 0 no O1: `semParteDeBloqueio` anula `hoje`, `porColuna` (inclusive `null`), `porTipoColuna` e `serie`, só na base real e com o interruptor `BLOQUEIOS_COM_DADO_REAL` falso; nada é recalculado, então a biblioteca segue como única fonte de cálculo. O resultado anulado é o que vai ao cache. Correto.
- Nota no O1 e no O2: id novo no enum da H-24, sem mecanismo novo; não repete nem apaga outra nota (S5b); não vaza para O3, O4, O6, O7 (S5). O web decide pela nota; o O1 também aceita o `null` como sinal, o que é só defensivo.
- Contrato e docs/api: campos `nullable` e `notas` opcionais conforme a tabela 2.3; `docs/api/metricas.md` atualizado nas duas seções (mapa e pedido 065); OpenAPI regenerada. O `resultadoO5` fica com os campos sem uso na base real, como o desenho §8 decide; o K-204 resolve.
- T2.6: `criterio-2026-11-04-bloqueio-sem-dado-real` na biblioteca, `afeta` O1, O2 e O5, marcada no período (S7) e ausente no O3.
- Testes: C1 a C3, S1 a S7 e W1 a W5 cobrem o desenho. Modo mock intacto (S6). Nenhum consumidor de `bloqueados` ou `horasBloqueio` fora dos cartões tratados (grep em `web/src`, `server/src`, `packages`).
- Regras invioláveis: nada por pessoa, sem mistura de fontes, sem histórico alterado (só a resposta muda), sem estatística abaixo de 20 nova. Segurança: sem gatilho (`R-SEGURANCA`), nada de banco, grant, autenticação nem dado pessoal.
- UX: A1 e M1 resolvidos pelo O5 inteiro sem dado. Na base real o cartão mostra só o estado sem dado real, sem percentual (W4 confere ausência de `%` e das barras); o "Como se calcula" e o "Leia" voltam a ser verdade no modo mock, que tem bloqueios. M2 e B1 a B3 seguem abertos (A3, A4).
- Decisão M14: 427 linhas de código e teste (sem `.md` e sem a OpenAPI gerada), um comportamento só: a parte de bloqueio sem dado real na base real, de contrato a tela. Aceito com a linha `teto:` no PR (A5).

## Achados

- A1 (recomendado) packages/contratos/src/origem.ts:47 · O JSDoc do interruptor ficou acima de `MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS`, empilhado com o do O5; `BLOQUEIOS_COM_DADO_REAL` (linha 51) ficou sem documentação. Mover o comentário da linha 47 para cima da linha 51.
- A2 (recomendado) web/src/features/complementares/fluxo.tsx:64 · RESOLVIDO em 742e4f3 (linha única de volta, format:check ok). Era sobra da volta 1: o "Leia" do O5 foi só quebrado em duas linhas com `{' '}`, sem mudar o texto.
- A3 (recomendado) web/src/components/ui/CartaoMetrica.tsx:270 · M2 do UX segue aberto no O1 e no O2 (nota em `text-xs`). Componente compartilhado, fora deste lote: cartão próprio com o ux-designer.
- A4 (recomendado) web/src/features/operacional/components/CartaoO1.tsx:107 · B1 a B3 do UX seguem abertos (O1 repete três vezes, O2 repete por linha, motivo técnico). O texto do motivo é decisão de UX; ficam para o PR ou cartão, sem devolver.
- A5 (recomendado) server/src/modulos/metricas/servico.ts:296 · Lote acima do teto M14 (563 linhas na revalidação anterior, com o E2E e a API de teste do QA; o W2b soma 33 de teste). A abertura do PR (E1.6) leva `teto: excedido, <n> linhas, <motivo>`, recontada na abertura; sem a linha vira bloqueante.
- A6 (recomendado) server/tests/painel-real-f6.test.ts:413 · O S2 prova a preservação do resto pela função pura com entrada sintética, não pela resposta da API contra o cálculo da biblioteca, como o desenho pedia. Suficiente, porque a função só troca `bloqueados`; o QA pode reforçar.
- A7 (recomendado) server/tests/pg/api-stub-065.ts:8 · A API de teste importa por caminho relativo entre pacotes (contratos, web, server), o que a ADR 0002 veda; só passa porque server/tests/pg está fora do lint. Sem gatilho: é só de teste e não entra em produção. Preferir @metricas-dspd/contratos onde houver export.

## Revalidação 1 (volta por delta, 21fffba..742e4f3)

Lido: o E2E e2e/tests-api/bloqueio-sem-dado-065.spec.ts (1-87), a API de teste server/tests/pg/api-stub-065.ts (1-52) e fluxo.tsx:64. Já lido, não relido: o resto de 1f1da67..21fffba.

- E2E: 7 casos Q65-01 a Q65-07 cobrem BLOQUEADOS, O1, O2, faixa de atenção, O5 e axe; só importa de ../fixtures, sem pacote interno e roda só com E2E_API_URL. Os testes de ausência procuram textos que a tela ainda tem no modo mock. Sem achado.
- API de teste: fora de src, sem entrar no build nem em produção; aplica semParteDeBloqueio do código do servidor, sem cópia da regra. Imports internos: A7, recomendado.
- Formatação: fluxo.tsx só junta duas linhas do texto do O5, sem mudar comportamento.

## Revalidação 2 (volta por delta, 742e4f3..a629434, E1.4 de K-205)

Delta lido: só `web/src/features/operacional/bloqueio-sem-dado.test.tsx` (+33, o teste W2b) e os pareceres do QA. Nenhum arquivo de produção mudou. Já lido, não relido: o resto de 1f1da67..742e4f3.

- W2b: força `porColuna` com duas colunas de `bloqueados: null` (equipe única, quebra por coluna), confere que o O1 mostra `o1-bloqueados-sem-dado`, que não pede equipe, e que a descrição do gráfico na tabela é "WIP por coluna do fluxo" sem "com bloqueados dentro do total". Cobre a ramificação de CartaoO1.tsx:68-69 que estava sem teste.
- Teste de ausência (item 11): o texto procurado ainda existe no código (CartaoO1.tsx:69 e :93), então o `not.toBeInTheDocument` não passa por vácuo; o par positivo (`findByText('WIP por coluna do fluxo')`) garante que a tabela abriu. O botão é escolhido por papel e nome, sem seletor frágil.
- Determinismo: sem relógio nem ordem; o `Object.create` só envolve a fonte de teste e devolve a base para os outros ids. Sem achado novo.
- Cobertura do web em 100% conforme a decisão do Jarvis; não rerodei a suíte, que é do QA (parecer regravado em a629434).
- Veredito mantido: aprovado, nenhum bloqueante.

## Pendências fora do código

- ADR 0026 (sem commit, worktree 052b): precisa da linha de revisão citando o 065, porque a premissa da BLOQUEADOS no P3 caiu (desenho §6).
