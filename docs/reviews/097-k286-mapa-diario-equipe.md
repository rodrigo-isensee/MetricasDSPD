---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/k286-mapa-diario-equipe
commit: 62a622abf9abecc9813c01e3a6ca015e21d21cb4
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: 097 K-286, mapa diário do Apontamento recortado pela Equipe (E3.2)

Revalidação da volta 1 (62a622ab), que atende à revisão de UX. O parecer anterior aprovou dfba8a37.

## Delta lido
`forge-check parecer delta` do parecer anterior, `dfba8a37..62a622ab`. Entram no domínio 5 arquivos, todos em `web/src/features/apontamento/`: `ApontamentoPage.tsx`, `components/CartaoDiario.tsx`, `dados.tsx`, `mapa-diario-equipe.test.tsx` (novo) e `textos.ts`. Biblioteca e servidor não mudaram. O delta não muda o veredito.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem banco)
- `web`, `vitest run` em `mapa-diario-equipe.test.tsx` e `apontamento.test.tsx`: 69 passaram.
- `eslint` nos 5 arquivos tocados: sem erro. `tsc --noEmit` na `web`: sem erro.

## Leitura do delta
- **DadosAba.** Ganhou dois campos, `equipes: string[]` e `removerEquipe`. Os dois são montados em `ApontamentoPage.tsx:92-93` a partir de `ativos` (só a chave `equipe`) e de `uso.remover('equipe')`, e `ativos` entrou nas dependências do `useMemo`. Só há um provedor, e o `tsc` confirma que nenhum outro consumidor ficou para trás.
- **Pessoa e comparação.** `daEquipe` (`CartaoDiario.tsx:83`) só junta os rótulos das equipes escolhidas, sem nome de pessoa. O único dado de pessoa continua sendo o `pessoaRef`, que já existia. Várias equipes aparecem como um só recorte ("das equipes A, B"), sem série nem comparação por equipe. Nenhuma regra inviolável foi tocada.
- **A1 (comoLer).** O texto agora diz que a Equipe recorta o mapa, que os demais filtros não o afetam e que o atípico é decidido sobre o dia inteiro. Isso bate com a biblioteca (`index.ts:58,72`).
- **A2 (vazio).** Sem linhas, o cartão mostra uma mensagem própria e esconde mapa e legenda. Com Equipe ativa, aparece o botão "Remover filtro Equipe", que limpa a URL (testado). Um detalhe: a classe `alvo` já está no botão.
- **A3 (dica do atípico).** A frase `dicaRecorteEquipe` só aparece com Equipe ativa. Os dois ramos estão testados.
- **A4 (aria-label e legenda).** O recorte entra no nome da grade e na legenda da tabela. Os dois ramos estão testados na grade.
- **Tamanho.** São 186 linhas de código e teste contra `origin/develop`, das quais 84 são do teste novo, acima da orientação de 150. O corpo do PR do lote precisa trazer `teto: excedido`. Não bloqueia.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/apontamento/apontamento.test.ts:350 · segue do parecer anterior (M3 do QA sobreviveu): falta um teste via `calcularApontamento` ou rota afirmando que `diario.linhas[].celulas[].atipico` não muda com `equipe`. Código correto; não bloqueia.
- A2 (recomendado) web/src/features/apontamento/components/CartaoDiario.tsx:283 · o vazio sem Equipe ("Nenhum apontamento nesta janela.") não tem teste: o caso `sem filtro de equipe` usa uma fonte com linhas. As duas mensagens também estão no componente, não em `textos.ts`. Não bloqueia.
