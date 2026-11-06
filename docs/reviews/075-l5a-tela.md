---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l5a-tela
commit: 7724d087ede7b1b881899cd71d104eb51eb31abd
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 075 L5a, motivo "não classificado" em BLOQUEADOS, O2 e O19 (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 5a" de `docs/analises/075-plano.md` pede, já com a especificação ajustada (nota de 2026-11-06 de `docs/ux/075-bloqueios-reais.md`, decisão técnica de 14:20): BLOQUEADOS e a coluna "Bloqueado" do O2 marcam o motivo por texto, itálico e ícone decorativo; o O2 não ganhou distribuição por motivo; o O19 põe "não classificado" por último, com hachura e legenda própria, e soma no total. Também cobre o O19 da E4 (P-075-8) neste lote.

## O que foi lido (diff `da61dbc2...7724d087`, 3 commits)

- `web/src/components/ui/MotivoBloqueio.tsx` (novo): `MotivoBloqueio` (itálico, `text-texto-2`, `Icone info`), `textoMotivo` ("por motivo não classificado", CA-3), `ordenarMotivos` (decrescente, "não classificado" por último, CA-2) e `ApoioMotivoNaoClassificado` com o texto literal da UX §1. Usa `MOTIVO_NAO_CLASSIFICADO` e `MotivoBloqueioPublicado` do contrato (Lote 1a), sem tipo duplicado.
- `TabelaDados.tsx`: `descritoPor` opcional (`string | undefined`, pelo `exactOptionalPropertyTypes`) vira `aria-describedby`; com `undefined` o atributo some, então os outros usos de `TabelaDados` não mudam (testes `ui.test.tsx` e `componentes.test.tsx` verdes).
- `CartaoBloqueados.tsx`: motivo pelo componente, leitura pelo `textoMotivo`, apoio de precisão do início (CA-11) e de "não classificado" ligados por `aria-describedby`. O bloco só aparece com itens e o `CartaoMetrica` só renderiza filhos no estado `ok`, então não vaza para carregando, erro nem "Sem dado real". CA-10 preservado.
- `CartaoO2.tsx`: só a coluna "Bloqueado" muda; "Sem dado real" (pedido 065, CA-12) segue com precedência.
- `operacionais.tsx` (O19): a ordenação passa ao `ordenarMotivos` também na leitura; série `nc` separada com `padrao: 'hachura'` e `cor: 7` (neutra, não alerta); a legenda só aparece com "não classificado" presente; `totalDiasUteis` e `pctDoTotal` vêm do servidor.
- Nenhuma contagem ou agregado calculado na tela: só ordenação, `some` e formatação de campos do DTO.
- `server/` e `packages/`: sem diff no intervalo.
- Teste novo `motivo-nao-classificado.test.tsx`: CA-1, CA-3, CA-4, CA-10, CA-11 no BLOQUEADOS; coluna do O2 com apoio e sem coluna nova; O19 com "não classificado" maior e mesmo assim por último, valor 70 na linha, leitura sobre o maior motivo de negócio e CA-5 por varredura de `th`, `caption`, `figcaption`, `legend`, legendas e `svg text`, com mínimo de itens afirmado (checklist 11).
- Regras invioláveis: nenhum campo de pessoa, nenhum ranking, nenhum dado novo.

## Ferramentas

- CI do push na ponta `7724d087`: workflow CI, evento `push`, `completed`/`success`.
- Testes dos arquivos tocados (D-5), `vitest run --maxWorkers=2` em `web`: `motivo-nao-classificado`, `bloqueio-sem-dado`, `operacionais`, `ramos`, `ui` e `componentes`: 6 arquivos, 137 testes, todos verdes.
- Teto M14: 275 linhas no web (258 adições e 17 remoções; código 143, teste 132). Aceito com exceção: um comportamento só (a marca do 8º motivo nos três cartões que o mostram), e dividir separaria o componente compartilhado dos seus usos ou o teste do código que ele cobre. O corpo do PR leva `teto: excedido, 275 linhas, um comportamento (marca do motivo não classificado em BLOQUEADOS, O2 e O19), metade é teste dos CA`.

## Achados

- A1 (recomendado) web/src/features/operacional/components/CartaoO2.tsx:71 · naoClass ignora semBloqueio; com a nota bloqueio-sem-dado-real e motivo vindo no item, o apoio apareceria sob a coluna "Sem dado real". Sugestão: naoClass = !semBloqueio && lista.some(...).
- A2 (recomendado) docs/ux/075-bloqueios-reais.md:1 · A especificação da tela não está na branch; pela seção 8 item 10 do praticas, ela entra commitada pelo ux-designer antes do merge, e o PR (E1.9) leva a linha de exceção do teto descrita acima.
