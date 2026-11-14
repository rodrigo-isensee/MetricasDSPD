---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l8a-recolher
commit: 78c80ecee71ea6361578bf97e9d53015bfe132b3
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L8a do 097, mecanismo de recolher cartão (E3.2, K-273)

## Achados
- A1 (recomendado) web/src/components/ui/Recolhidos.tsx:10 · `CODIGO_CARTAO` aceita só `[A-Z0-9-]{1,20}`; cartão com código fora disso recolhe, mas não volta recolhido ao recarregar. No L8b, ao ligar os painéis, um teste que percorra os códigos dos cartões recolhíveis e afirme o formato.
- A2 (recomendado) web/src/components/ui/Recolhidos.tsx:110 · o foco do "Restaurar" vai ao primeiro `[data-cartao-titulo]` do documento; o `ProvedorPainelPreferencias` já restringe a `main [data-cartao-titulo]`. Mesmo seletor aqui evita cair num título fora do painel.
- A3 (recomendado) docs/tecnica/arquitetura-front.md:236 · a seção de preferências descreve o que vive em memória e o que não vai a storage; a nova chave `metricas-dspd:recolhidos:v1` (forma, teto, só códigos) não está lá. Documentar no L8b, quando o provedor entra nas páginas.

## Parecer
Aprovado em 78c80ece. Li o diff inteiro `origin/develop...78c80ece` (4 arquivos) e as linhas 79 a 98 de `docs/analises/097-plano-e5-e7.md`. O `ce0f0648` por cima é só o parecer do QA, que não refiz.

- **Provedor por painel:** `ProvedorRecolhidos painel=...` guarda um conjunto por painel; `gravarPainel` relê a memória e troca só a entrada do painel (lista vazia apaga a entrada; memória vazia apaga a chave). Fora do provedor `useRecolhido` devolve `null` e o cartão não mostra o botão (Visão geral e testes isolados não mudam). Prova: CA-29 e "expandir apaga o painel da memória e preserva os outros painéis".
- **Validação da memória:** zod na forma (`versao: 1`, registro de listas), depois filtro de id de painel e de código, dedup e teto de 100 na leitura e na gravação; `try/catch` em leitura e escrita com comentário (escolha vale só na visita). Prova: os 5 casos de memória corrompida, o teto com repetidos e os dois de armazenamento bloqueado. Só códigos de cartão vão ao `localStorage`; nada de pessoa, URL ou servidor.
- **Acessibilidade do botão:** `aria-expanded`, `aria-controls` para o `div` do corpo (presente nos dois estados), `aria-label` "Recolher/Expandir cartão: <título>", texto visível diferente de "Ocultar" (R6 do plano fica para a revisão de UX). Foco preservado no mesmo nó (CA-28). "Restaurar" com região `role="status"` sempre montada e foco no título (CA-30).
- **O que some recolhido:** nota, ações, alternar tabela, base e selos, pergunta, notas, estados, corpo e rodapé; ficam título, "Ocultar", o botão e a linha de resumo. Resumo neutro pela base ou `resumoRecolhido`, nunca a `leitura` (CA-32, prova com "Ana fez 40 h"); com erro, a frase do CA-31. `recolhivel={false}` ignora a memória (Q-8).
- **Diff do `CartaoMetrica`:** 173 adições e 121 remoções, quase tudo reindentação pelo `{!recolhido && ...}`; conferi que nenhum ramo existente mudou de condição.
- **Testes locais (VITEST_MAX_WORKERS=2):** `vitest run` em `componentes.test.tsx`, `ui.test.tsx`, `recolhidos.test.tsx`, `coleta/origem.test.tsx` e `coleta/calibracao.test.tsx`: 5 arquivos, 117 testes passando; `Recolhidos.tsx` com 100% de linhas, ramos e funções nesses testes. `eslint` nos 3 arquivos e `tsc --noEmit` do web sem erro. Suíte completa e e2e no CI do PR.
- **Tamanho:** 664 linhas de código e teste (`git diff --numstat --no-renames origin/develop...78c80ece`), 294 delas reindentação do `CartaoMetrica` e 249 de teste; o corpo do PR leva `teto: excedido, 664 linhas, reindentação do corpo do CartaoMetrica e testes de CA-25 a CA-32 e da memória corrompida`.
- **Regras de `praticas.md`:** o arquivo não marca regras com "decidida por"; li o checklist da skill e o da seção 8 sobre o diff.
- **Commits:** um `feat(web)` em Conventional Commits em português.
