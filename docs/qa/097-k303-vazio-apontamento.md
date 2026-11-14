---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k303-vazio-apontamento
commit: 2ed9e70169451fddd3f11de63e81145203a890c5
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---

# QA: lote do Apontamento do 097, K-303, K-302 e K-289 (E4.30)

Links: especificação `docs/ux/097-k303-vazio-e-mapa.md` (CA-1 a CA-12), `docs/ux/097-revisao-l3.md` (A1, A2, A4 do K-289), revisão de UX `docs/ux/097-revisao-k303-k289.md`, review `docs/reviews/097-k303-vazio-apontamento.md`, pedido `docs/pedidos/097-resumo-filtro-time.md`. Base develop `e5092e05`; código revisado em `2ed9e701` (o head `eaa21810` só soma o parecer do review). Contrato da API: sem mudança (o lote é só web, mais um teste de `packages/metricas`).

## Veredito
**Aprovado.** CA-1 a CA-12 têm teste que passa e morre quando a regra é quebrada. A1, A2 e A4 do K-289 cumprem a decisão 2a do dono. O aviso novo do filtro Pessoa passa no axe (contraste de `text-atencao` incluído) nos dois temas e nas duas larguras. Nenhum bug.

## Execução (head com o commit de teste do QA sobre `2ed9e701`)
- `TZ=UTC npx vitest run src/features/apontamento --maxWorkers=2` (web): 15 arquivos, 215 testes passaram, 0 pulados.
- `npx playwright test --project=chromium --workers=1 tests/apontamento-qa.spec.ts`: 53 passaram, 0 pulados (inclui os 4 testes novos do QA).
- Suíte inteira: não rodada aqui. No sha `2ed9e701` o check-run `testes` está `success` (id 132236400303), junto de `build`, `banco`, `filtro`, `seguranca`, `openapi`, `rapida` e `imagem`; `e2e` sai `skipped` no push e roda no PR (check obrigatório). O repositório não tem check-run `bateria`.
- O vermelho antes do verde dos testes do K-303 e do K-289 foi provado por mutação (abaixo): M1 devolve o comportamento da base (vazio total sem índice próprio). `forge-testes` é do Forge e não existe neste projeto.

## Critério → teste → resultado
| Critério | Teste (web, salvo nota) | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 vazio só nos cartões do período; mapa fica | `vazio-e-mapa.test.tsx` CA-1 (ids das seções) | `kpis.apontamentos === 0` | passou |
| CA-2 mapa com dados no vazio | `vazio-e-mapa.test.tsx` CA-2 (mapa, legenda, modo tabela) | vazio do período com "Pessoa 1" na janela | passou |
| CA-3 seção "Período dos filtros", título e texto, antes do "Dia a dia" | `vazio-e-mapa.test.tsx` CA-3; e2e CT-03 (`apontamento-qa.spec.ts:206`); axe "vazia" em 1280 e 375 px | vazio | passou |
| CA-4 botões do vazio e URL | `vazio-e-mapa.test.tsx` CA-4 (Remover e Limpar atualizam URL e consulta); e2e CT-03 (um Remover por filtro) | filtro ativo | passou |
| CA-5 vazio do período + `diario-sem-pessoas` | `vazio-e-mapa.test.tsx` CA-5 (linhas vazias e só "Outra área") | mapa sem pessoa | passou |
| CA-6 sem índice no vazio | `vazio-e-mapa.test.tsx` CA-6 (sem índice no vazio, com índice com dados) | vazio contra com dados | passou |
| CA-7 anúncio na única região `status` | `vazio-e-mapa.test.tsx` CA-7 (texto, esvazia ao sair, uma só região, carregando tem precedência) | transição vazio para com dados | passou |
| CA-8 foco não se move | `vazio-e-mapa.test.tsx` CA-8 (`document.activeElement`) | foco no controle operado | passou |
| CA-9 janela do mapa não mexe nos filtros | `vazio-e-mapa.test.tsx` CA-9 (URL, nova busca, vazio mantido) | janela própria | passou |
| CA-10 rodapé do mapa igual nos dois estados | `vazio-e-mapa.test.tsx` CA-10 | vazio contra com dados | passou |
| CA-11 sem nome, total, ordem por equipe nem ranking | `vazio-e-mapa.test.tsx` CA-11; e2e CT-67 | vazio | passou |
| CA-12 seis seções e índice com dados; textos antigos fora | `vazio-e-mapa.test.tsx` CA-12; `apontamento.test.tsx`; e2e CT-03 troca o título antigo | `apontamentos > 0` | passou |
| K-302 atípico do mapa não muda com a Equipe | `packages/metricas` (teste do commit `38728ce2`), conferido pelo review; fora do meu escopo de execução | Equipe recorta só as horas da célula | passou (review) |
| K-289 A1 aviso do filtro Pessoa, sem a chave crua e sem eco | `apontamento.test.tsx` CA-9; `revisao-ux.test.tsx` "K-289 A1"; e2e CT-08 borda (`aviso-pessoa-retirada` visível, `em: Tipo, Agrupar por.`) | `pessoa=` com outro inválido | passou |
| K-289 A1, B1 de UX: contraste e axe do aviso | **novo** e2e `acessibilidade automática`: "aviso do filtro Pessoa retirado, tema claro/escuro em 1280/375 px" (texto exato, ícone, zero críticas ou sérias, zero `color-contrast`) | contraste de `text-atencao` em 2 temas e 2 larguras | passou (4 de 4) |
| K-289 A2 nota de Outra área só onde a linha é omitida | `revisao-ux.test.tsx` "K-289 A2" (com e sem Outra área); e2e "Outra área" | presença e ausência da linha | passou |
| K-289 A4 título "Capacidade mensal (total do recorte)" | `revisao-ux.test.tsx`; legenda e leitura do cartão | n/a | passou |
| Teclado | e2e CT-64 (Tab e setas no mapa; foco chega aos filtros e botões) | só teclado | passou |

## Mutação à mão nas regras (restaurada; `git status` sem mudança em código de produção)
| Mutante | Arquivo | Resultado |
|---|---|---|
| M1 índice de seções volta a aparecer no vazio (`{!vazio && ...}` sai) | `ApontamentoPage.tsx` | morto: `vazio-e-mapa.test.tsx` CA-6 |
| M2 anúncio do vazio some (`vazio ? VAZIO.anuncio : ''` vira `''`) | `ApontamentoPage.tsx` | morto: `vazio-e-mapa.test.tsx` CA-7 |
| M3 a chave `pessoa` deixa de sair do aviso genérico (`filter(() => true)`) | `BarraFiltrosApontamento.tsx` | morto por 3 testes: `apontamento.test.tsx` CA-9, `revisao-ux.test.tsx` "K-289 A1" (e os de CA-6 e CA-7, pelo M1 e M2 ainda ativos nessa rodada) |
| M4 `pessoas.length < ...` vira `<=` na nota de Outra área | `CartoesCapacidade.tsx` | morto no review (`revisao-ux.test.tsx` "K-289 A2"); não repeti |
| M5 "Dia a dia" de volta só no ramo não vazio | `ApontamentoPage.tsx` | morto no review: 8 testes de `vazio-e-mapa.test.tsx`; não repeti |

Observação de método: os três primeiros mutantes rodaram em sequência e o `git checkout` de restauração falhou dentro do sandbox (árvore `.git` somente leitura), então M2 e M3 rodaram sobre o anterior ainda aplicado. A atribuição acima segue o teste que cai e a regra que cada um guarda. Restaurei os dois arquivos com `git checkout` fora do sandbox e rodei a suíte de novo: 215 passando.

## Dados e fronteiras
Fixtures fictícias ("Pessoa n", "Ana Exemplo" só como valor de URL que nunca volta à tela). Fronteiras tocadas: vazio, janela do mapa própria, `pessoa=` com e sem outro valor inválido, 1280 e 375 px, tema claro e escuro, só teclado.

## Bug
Nenhum aberto. Médios e baixos: nenhum. As observações da UX (B2, A3 da revisão do L3: nomes ocultos só na capacidade) já estão registradas como recomendadas pelo review e pela UX, sem exigência de QA.

## Achados
