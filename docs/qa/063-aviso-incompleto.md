---
tipo: qa
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: feature/063-aviso-incompleto
commit: 27bae585b35733537e68c535746ddda3288e36da
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: lote do 063 (coleta lendo todas as páginas, sinal na API e aviso na aba), E2.6, K-200

Links: especificação `docs/ux/063-aviso-registro-incompleto.md` (branch de docs, 12 CA; o CA-4 vale como "abre ao ativar o selo"), revisão de interface `docs/ux/063-revisao-aviso-incompleto.md`, review `docs/reviews/063-aviso-incompleto.md` (aprovado), segurança `docs/security/` do lote (aprovado, commit `9a4effc`).

**Parecer: aprovado** (E2.14, regravado na ponta `27bae58`), sem bug aberto. Diff `b446021..675ed96` conferido contra a lista de CA: nenhum escopo novo. Nenhum teste de produção foi alterado; o QA acrescentou só `e2e/tests/apontamento-incompleto-063.spec.ts`.

## Regravação na ponta 27bae58 (E2.14)
Diff `675ed96..27bae58` (E2E do QA em a4c9bba e merge da develop com o 060 web, PR 208, e o PR 203): sem mudança no E2E. O único arquivo depois de 27bae58 é o parecer de segurança. E2E rodado de novo (Chromium, 2 workers, nice 15, `E2E_PORTA=4183 E2E_SEM_ALT=1`): `apontamento-incompleto-063.spec.ts` mais `apontamento-qa.spec.ts` (aba do apontamento, tocada pelo merge do 060): 56 de 56 passaram em 1,3 min, inclusive axe em 1280 e 375 px e tema escuro. Unitários na ponta: web 1420 e server 1614 verdes pelo tech-lead (E2.11), não repetidos por mim. Sem achado novo; A1 a A3 seguem recomendados. Os números da execução abaixo são da rodada anterior em `675ed96`.

## Execução (resultado real, máquina com limite: nice 15, no máximo 2 workers)
- server `vitest run --maxWorkers=2`: 80 arquivos passaram, 33 pulados (os `.pg`, que ficam com o dono); 1614 testes passaram, 232 pulados, 0 falhas.
- web `vitest run --maxWorkers=2`: 92 arquivos, 1409 testes, todos passaram.
- E2E (Chromium, 2 workers, `E2E_PORTA=4183 E2E_SEM_ALT=1`): `apontamento-incompleto-063.spec.ts` 7 de 7 passaram, 28 s. Controle: `apontamento-qa.spec.ts` CT-01 e CT-02 passaram no mesmo build.
- Não rodei: `test:pg` e `pronto` (do dono), mutação (a stack não tem ferramenta rodada neste pedido), `forge-testes --vermelho` (pedido do projeto, não do Forge; o teste E2E novo testa código que já existe, sem implementação para retirar). Vermelho do E2E: a primeira rodada falhou 7 de 7 porque meu mock pôs título de 220 caracteres, acima do `MAX_ROTULO` 200 do contrato (o servidor corta em 200, `servico.ts:138`); com título de 200 passou. Isso prova que a fixture é validada pelo schema estrito.

## Achados
- A1 (recomendado) web/src/features/apontamento/components/AvisoRegistroIncompleto.tsx:69 · selo "Horas incompletas" com `min-h-6` (24 px): cumpre WCAG 2.5.8 (mínimo), abaixo dos 44 px do botão da faixa; sem exigência de 44 px no CA-3. Não bloqueia.
- A2 (recomendado) docs/ux/063-aviso-registro-incompleto.md:100 · o CA-4 ("ao ativar o selo") está só na branch de docs (E2.10); o código e o E2E já seguem essa redação. Conferir no PR de docs.
- A3 (recomendado) e2e/tests/apontamento-incompleto-063.spec.ts:1 · contraste checado só pelo axe no tema do sistema (claro); o tema escuro não foi medido (item 6 do UX, baixo). Cabe rodada no tema escuro antes da validação do dono.

## Critério → teste → resultado
Fixtures só sintéticas (ids 9100000001 e 9100000002, títulos fictícios); nenhum teste lê `.env` nem chama o BusinessMap.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 faixa, singular e plural, abaixo da legenda | `aviso-incompleto.test.tsx` (CA-1/CA-10 e plural) | n = 1 e n = 2; posição após a legenda | passou |
| CA-2 lista por botão, `aria-expanded`, sem pessoa nem horas | `aviso-incompleto.test.tsx` (CA-2/CA-11) | lista oculta até ativar; "Fora dos quadros coletados" | passou |
| CA-3 selo no projeto e coluna Observação | `aviso-incompleto.test.tsx` (CA-3/CA-4); E2E 375 px do selo | uma linha marcada na tabela; sem estouro | passou |
| CA-4 dica ao ativar, não ao focar; Esc fecha | E2E "foco simples não abre; Enter abre; Esc fecha" e "Espaço abre" (Chromium real) | foco sem ativar = nada; foco volta ao selo | passou |
| CA-5 sem dispensa | `aviso-incompleto.test.tsx` (CA-5) | só 1 botão na faixa | passou |
| CA-6 sinal some no carregamento seguinte, nada no navegador | E2E CA-6 (resposta com sinal, depois sem; localStorage e sessionStorage); web it.each total 0 | total 0; campo ausente | passou |
| CA-7 filtros sem card no recorte | `apontamento-rota.test.ts` (recorte por período, projeto e tipo, parâmetros) | filtro por parâmetro, sem SQL com valor da requisição; pessoa fora do recorte | passou |
| CA-8 sem termos proibidos | `aviso-incompleto.test.tsx` (regex sobre título e corpo) | termos "teto", "lote", "1000", "worklog" | passou |
| CA-9 375 px | E2E 375 px: botão 44 px, lista aberta com título de 200 caracteres e trecho sem espaço, `scrollWidth <= innerWidth`, faixa dentro de 0..375 | título máximo; lista sem estouro | passou |
| CA-10 ícone, texto, `role="status"` único, contraste | web (ícone, 1 status); E2E axe 1280 e 375 com a lista aberta, sem violação crítica ou séria | contraste 4.5:1 pelo axe (tema claro) | passou (A3) |
| CA-11 sem pessoa, ranking ou ordenação | web (lista sem `Pessoa` nem horas); rota: nenhuma pessoa, hora ou contagem sai | contrato `strict` | passou |
| CA-12 campo ausente | web it.each "campo ausente"; contrato `optional` | ausência nunca vira "completo" | passou |

## Coleta paginada (critério do pedido, D-5)
Testes do autor lidos e rodados (`apontamento-paginas.test.ts`, 281 linhas, 96 testes com a rota): coleta completa (3 páginas, só a última folha `completo`; all_pages 0 e 1), instável (`all_pages` muda, some ou cai: `paginacao_instavel`, sem exclusão, sem `completo`), falha de página (5xx na página 2: parcial, página 1 gravada, nada excluído, não marca incompleto), recusa em qualquer página não marca completo (A1 do review: id inválido na página 1 com a última limpa), `page` na lista fechada (0, negativo, decimal, texto e 5 dígitos recusados sem chamar a API), contingência sem `pagination` (`lote_no_teto`), janela cheia da carga inicial (A2) e só a varredura de domingo grava `completo`. Todos passaram.

## Sinal na API
`apontamento-rota.test.ts` (6 casos de `registroIncompleto`): total 0 com campo presente, total igual a `cards.length`, `projetoIds` sem repetição, título cortado em 200, parâmetros de período, projeto e tipo, e erro do banco vira 500 genérico. Passou. O banco real (`.pg`, migração 0034) fica com o dono.

## Tela de 375 px e CA-4 no navegador (médio 2 do UX)
Conferido no Chromium real, viewport 375x812, com título de 200 caracteres e palavra longa sem espaço: sem rolagem horizontal da página nem da lista; botão "Ver quais cards" com altura de pelo menos 44 px; axe sem violação crítica ou séria com a lista aberta. CA-4: foco simples não abre a dica; Enter e Espaço abrem; Esc fecha e o foco permanece no selo. Médio 2 do UX: resolvido.

## Bugs
Nenhum. Pasta `docs/qa/bugs/` sem entrada nova.
