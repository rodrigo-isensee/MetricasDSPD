---
tipo: qa
contrato: 1
pedido: 011-front-estrategicas
branch: feature/011-front-estrategicas
commit: cb68ace
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
aceite_usuario: nao
data: 2026-10-17
---
# QA do front do lote 1 do 011 (Estratégico: E9, E6, E7 sem R$, E8)

Cartão K-109, pedido 021 (etapa E1.3). Base: `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§10, com CA-46 e as revogações CA-18, CA-25 e CA-35), review aprovado (`docs/reviews/011-front-estrategicas.md`, volta 7) e reconferência da UX (`docs/ux/revisao-011-front-estrategicas.md`, seção 9).

Revalidação de 2026-10-17 sobre cb68ace (testado: 65f46c1 passou a cb68ace): o delta desde 65f46c1 é só documentação. Tocou a pasta de UX (b13dfe6, seção 10 da reconferência), a pasta de pareceres de review (3d48780 e cb68ace, volta 8) e o parecer de QA anterior (e850788, sem código); nenhum código nem teste mudou. A prova da suíte é o run da CI do PR #108 no head cb68ace: https://github.com/rodrigo-isensee/MetricasDSPD/actions/runs/39029217011 (conclusão success; testes 7m38s, rapida 1m43s, banco 1m8s, e2e 28m11s, build, openapi, imagem, seguranca e filtro pass). Rodada local não repetida (nada de código mudou). Parecer segue aprovado, zero bug aberto.

Nota do merge da develop (revalidação 2026-10-17, commit testado: 79c3df5 passou a 65f46c1): o tech-lead trouxe a develop para a branch (a9c2348, #108), com os lotes 2 e 3 do back (#107 e #109: O22 e O26, só back), e revisou o merge na volta 7 (65f46c1, só documentação). O merge não alterou o código do front do lote 1. A prova da suíte completa sobre o novo head é o check `e2e` da CI do PR #108 (pass, 28m5s); localmente rodei só o spec do lote (10 de 10, load 0,82 antes), pela regra de uma tarefa pesada por vez.

Nota de revalidação anterior (3d2ee5b para 79c3df5): a suíte E2E completa local, duas vezes sobre 3d2ee5b, deu 704 passaram e 1 falhou (IF-I01, teto de 30 s estourado sob paralelismo local), bug baixo 011F-002, corrigido em 357936b (`test.setTimeout(120_000)` só no IF-I01, saída (a) da decisão técnica do pedido 021, sem aceite do usuário) e aprovado pelo tech-lead. O 011F-002 está fechado.

## Parecer

**Aprovado** para o front do lote 1 sobre 65f46c1. Zero bug aberto de qualquer severidade. As regras D2 = A (E7 sem R$) e R-1 = B (E8 sem nome de sistema) estão cumpridas, medidas no navegador. O nome do E7 ("Capacidade por sistema") segue o da especificação, pendente da confirmação do usuário; não é critério de reprovação. A suíte completa local não foi repetida (teto de uma tarefa pesada por vez); a prova é o check `e2e` da CI.

Nota K-115: IF-U-operacional e o axe do CA-19 são instáveis só sob carga local (pré-existentes, fora deste PR); a CI não os reprovou. Seguem no cartão K-115.

## Suíte completa e reteste

| Verificação | Resultado |
|---|---|
| Check `e2e` da CI no PR #108 em 65f46c1 (`gh pr checks 108`) | pass (28m5s); nenhum outro check vermelho |
| `pnpm exec playwright test tests/estrategico-011-lote1.spec.ts` (de `e2e/`, load 0,82 antes, Chromium) sobre 65f46c1 | 10 de 10 passaram (12,5 s), rc=0 |
| `pnpm run e2e` local sobre 3d2ee5b, rodadas 1 e 2 | 704 passaram, 1 falhou (IF-I01), rc=1 nas duas (19,0 e 20,4 min) |
| SIS-CONS-01 (catálogo com 53 linhas) | passou nas duas rodadas locais e na CI |
| Reteste do 011F-002 sobre 79c3df5: `pnpm exec playwright test tests/intensivo-filtros.spec.ts -g "IF-I01" --repeat-each=3` | 3 de 3 passaram (25,1 a 25,7 s), rc=0; antes da correção 3 de 3 falhavam em 30 s |
| Check `e2e` da CI no PR #106 em 79c3df5 | pass (27m28s) |

Não marquei teste algum como `skip`. A correção do 011F-002 é de orçamento de tempo do teste, não de produto.

## Execução da validação anterior (sobre d542aa9; vale para o código de produção do front, que não mudou)

| Verificação | Resultado |
|---|---|
| `pnpm run pronto` (raiz da worktree, com o spec novo presente) | rc=0: lint, format, tipos, cobertura 100% (web 1075 testes, contratos 134, métricas 985, mock 221, server 569 e 84 pulados do banco real, ferramentas) e `docs:check` ok (478 páginas, 65 métricas) |
| E2E novo `e2e/tests/estrategico-011-lote1.spec.ts` (ET-01 a ET-10) | 10 de 10 (também em 65f46c1) |
| E2E existentes do Estratégico e acessibilidade: `complementares`, `a11y`, `responsivo`, `espera-invisivel-nos-paineis` (Chromium) | 95 de 95, axe AA sem violação crítica ou séria |
| Perf C6 (tarefa longa, `/estrategico`, seção fechada, mediana de 15) | 136 ms (< 200 ms); com a seção aberta (E6 a E9 montados), mediana de 7 cargas: 130 ms (pico 177 ms) |
| Perf demais (`pnpm run test:perf`) | 19 de 19: CLS `/estrategico` 0,001 a 1366 e 0,000 a 375; INP 64 ms; F4 p95 54 ms; F5 p95 430 ms; heap 20,9 MB |
| Lighthouse `/estrategico` (desktop, 3 execuções) | Performance 0,99 nas três; Acessibilidade 1,00; LCP 829 a 876 ms; CLS 0,007 (F10: 90 e 95) |

Observação de método: o Lighthouse e o C6 do `test:perf` medem a página com a seção "Mais métricas" recolhida; por isso medi o C6 também com ela aberta (script descartável, não versionado). Lighthouse com a seção aberta não foi medido. O `pronto` completo não foi repetido nas revalidações: os diffs posteriores são só de testes E2E, documentação e o back dos lotes 2 e 3 (testado pelo back e pela CI).

## Critério, teste, resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-3 (seção com título A, E9/E4/E6/E5/E7/E8) | ET-01 (e `complementares` COMP-01, 6 cartões) | título antigo ausente | passou |
| CA-3 e catálogo (53 linhas depois de E6 a E9) | SIS-CONS-01 (`intensivo-sistemico.spec.ts`, corrigido em 59dfb37) | contagem do catálogo | passou (suíte completa local, 2 rodadas; CI) |
| CA-13 e D2 = A (E7 sem R$, sem custo) | ET-02: texto do cartão e da tabela sem `R$`, "reais", "custo", "rateio" | nenhum valor em dinheiro; selo fictício ausente | passou |
| CA-46, CA-9 e R-1 = B (E8 sem nome de sistema ou pessoa) | ET-03: nomes de sistema da tabela do E7 não aparecem no E8; só a legenda "1 pessoa, 2 pessoas, 3 ou mais"; sem tabela, sem `@`; três `dt` | nenhuma lista de sistemas | passou |
| CA-18, CA-25 e CA-35 (revogados) | ET-02 e ET-03 (ausência) | n/a | passou |
| CA-10 (recorte < 5 sistemas, texto exato) | `web/src/features/complementares/estrategicas.test.tsx` (unitário, cobertura 100%) | 4 e 5 sistemas | passou; o mock do E2E tem mais de 5 sistemas, então o texto não aparece no navegador |
| CA-5 (abaixo de 20, sem estatística) | ET-08 (E9 sem referência com "menos de 20 projetos concluídos", sem P85 numérico) e unitários do E7 e do E6 | 3 concluídos no mock (< 20) | passou |
| CA-16 ("Como ler", tabela, selo fictício só se mock) | ET-05: "Como ler" nos 4; selo só em E6 e E8; tabela inline em E6, E7 e E9 | status `mock` x real | passou, com a nota 1 |
| CA-20 (E6, `data_acordada`, replanejamentos) | unitários do E6 e do contrato (sem E2E dedicado) | casos 0, 1 e vários na leitura | passou |
| CA-23 (E7 em quatro naturezas) | unitário do E7 (cálculo é do back, pedido 011 fase 2) | n/a | passou |
| Acessibilidade AA da seção aberta | ET-07 (1280) e ET-10 (360) | zero crítica ou séria; sem erro de console | passou |
| Reflow 360 px (WCAG 1.4.10) | ET-10: sem rolagem horizontal; E8 com as 3 faixas empilhadas (`grid-cols-1`); cada cartão cabe na largura | 360 px | passou |
| `aria-hidden` do ícone `info` (UX) | ET-04: `svg` do selo do E8 com `aria-hidden="true"` | n/a | passou |
| Foco visível e teclado no seletor do E9 (UX) | ET-06: `Home` move o foco, `aria-selected` muda, a linha "Mostrando N de M" muda; outline 2 px | só teclado | passou |
| Anúncio da troca de tipo (`aria-live`) (UX) | ET-06 e `ui.test.tsx` (SeletorLocal) | troca de aba muda o texto da região | passou (011F-001 fechado) |
| Falha da API de um cartão | ET-09: E7 abortado, o painel e os demais cartões seguem | falha de rede | passou |
| Permissão | n/a: sem autenticação neste painel, sem dado de pessoa | n/a | n/a |

Vermelho antes do verde: não executado para ET-02 e ET-03. Mostrar o teste falhando exigiria alterar `web/src` (fora do meu escopo). A capacidade de falhar foi vista nas execuções intermediárias (ET-02, ET-03, ET-05 e ET-06 falharam por seletor e premissa errados do meu lado antes de acertar, o que prova que as asserções são avaliadas, mas não prova que detectam R$ ou nome de sistema em produção). As obrigações de R$ e de nome também são protegidas por testes unitários do autor (D2 = A e R-1 = B). O SIS-CONS-01 é do autor: o vermelho foi observado pela CI do PR #106 (49 esperado, 53 obtidas) e o verde, aqui. O IF-I01: vermelho visto no reteste anterior (3 de 3 em 30 s em 3d2ee5b), verde em 79c3df5 (3 de 3). Mutação: sem ferramenta no `pronto` para o front; não rodada.

## Notas e ressalvas (nenhuma bloqueia)

1. **CA-16 literal:** o cartão do E6, E7 e E9 mostra a tabela equivalente sempre aberta, sem o botão "Ver como tabela" no cabeçalho (`semTabela`), padrão dos demais cartões complementares. O E8 não tem tabela (três números em `dl`). A intenção do CA (mesmos números, alternativa ao gráfico) está atendida; o texto "Ver como tabela" não. Decisão de UX: manter ou alinhar o texto do CA.
2. **011F-001: fechado** (região `aria-live` do E9, reconferida sobre 0a75f63).
3. **011F-002: fechado** (IF-I01 com orçamento de 120 s, 357936b; reteste 3 de 3; CI verde).
4. **Itens baixos da UX sem alteração:** A-9 (links do S12 no E7), A-11 (E8: `modo="percentual"` com unidade "sistemas" e o estado de zero sistemas), A-10 (nome do E7, com o usuário).
5. **Do review, não bloqueantes:** R-4 (comentário de desempate), R-5 ("Demais 1 sistemas" com 11 sistemas), R-6 (`docs/api/metricas.md:157`); R-4 a R-6 foram tratados em 0a75f63.
6. **Dependência do back:** o eixo do E6 segue a ordem por deslize até o contrato trazer a data de conclusão (aceito como provisório no review).
7. **Dados fictícios:** todo o E2E roda no mock; E6 e E8 trazem o selo "Dados fictícios". A validação com dado real depende da coleta.

## Dados de teste e arquivos

Mock padrão do front (7 projetos, 3 concluídos, 2 abas de tipo no E9). Arquivo do lote: `e2e/tests/estrategico-011-lote1.spec.ts`. Bugs: `docs/qa/bugs/011F-001-troca-de-tipo-do-e9-sem-anuncio.md` (fechado) e `docs/qa/bugs/011F-002-if-i01-estoura-30s-na-suite-completa-local.md` (fechado). As evidências reescritas pelos E2E em `docs/qa/evidencias/` foram restauradas com `git checkout` após cada rodada.
