---
tipo: qa
contrato: 1
pedido: espera-invisivel-nos-paineis
branch: feature/espera-invisivel-nos-paineis
commit: f1cf072
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-13
---

# Parecer de QA: espera invisível dentro de cada painel

Especificação: `docs/ux/espera-invisivel-nos-paineis/especificacao.md`. Review: `docs/reviews/espera-invisivel-nos-paineis.md` (aprovado). Revisão de UX: `docs/ux/espera-invisivel-nos-paineis/revisao-ux.md` (aprovada).

## Veredito
**Aprovado.** Nenhum bug aberto. Todos os critérios (1 a 12) têm teste automatizado verde, e os testes exploratórios a 375 e 1280 px não encontraram defeito.

## Execução
- Comando: `pnpm exec playwright test espera-invisivel-nos-paineis a11y filtros exportar responsivo b3-sust-ei-vg` (projeto `chromium`, preview em `localhost:4173`, dados mock).
- Resultado real: **150 de 150 passaram** (4,2 min), sem skip e sem repetição por instabilidade. O spec novo tem 23 testes, com axe (violações bloqueantes = 0) a 375 e 1280.
- Unitários do back e do front e `pnpm run pronto`: rodados pelo autor (verde, cobertura de 100%) e pelo tech-lead (contratos 45/45, web 799/799). Não repeti a suíte unitária.
- A execução do E2E regravou imagens e JSON de `docs/qa/evidencias/`; restaurei com `git checkout` e não entram no commit.
- Vermelho antes do verde e mutação: não executados por mim nesta rodada (o autor registrou os testes unitários e o E2E novos, mas o parecer não tem a falha observada sem a implementação). Fica como lacuna de processo, sem impacto no veredito.

## Atualização para f1cf072 (catálogo com 49 métricas)
- Mudança desde 3ad62a7: `5fc3a7d` ajusta `complementares.spec.ts` (COMP-03 e COMP-12) e `lacuna-de-valor.spec.ts` (LV-14) de 46 para 49 métricas (Núcleo 29 para 32, Complementar 17); o resto são pareceres de review.
- Os números 49 / 32 / 17 estão corretos e são consequência prevista do critério 8: `web/src/features/catalogo/linhas.ts` deixou de recolher a espera invisível em uma linha (antes `FORA` omitia EI_FL2, EI_FL3 e EI_SUST) e passou a listar uma linha por nível. Conta: 46 - 1 + 4 = 49; as 3 linhas novas são Núcleo (29 + 3 = 32); as 17 complementares não mudam. O catálogo de dados (`catalogo-metricas.ts`) só troca o painel das 4 entradas EI; não há efeito colateral da remoção da página.
- Execução: `flock /tmp/metricas-pesado.lock pnpm exec playwright test complementares lacuna-de-valor espera-invisivel-nos-paineis --project=chromium`: **77 de 77 passaram** (1,6 min), sem skip nem repetição. A execução da rodada anterior (150 de 150) cobriu os demais specs e as mudanças desde então não tocam código de produção.
- Veredito mantido: **aprovado**, sem bugs abertos.

## Critério, teste e resultado
| CA | Teste (e2e/tests) | Resultado |
|---|---|---|
| 1 Menu sem "Espera invisível" | `espera-invisivel-nos-paineis` "menu sem Espera invisível" (375 abrindo o menu, 1280) | passou |
| 2 Redirecionamento por hash, filtros, replace | "redirecionamento da rota antiga" (4 destinos, sem hash, Voltar) e exploratório abaixo | passou |
| 3 Operacional: seção após Qualidade, fora de Tempo, "Ir para", ausente na diária | "Operacional (critério 3)" | passou |
| 4 Seção com título-pergunta e um só nível de EI por painel | teste por painel e por largura (`metrica-EI-*` = 1) | passou |
| 5 Botão de evolução: URL fixa, `aria-expanded`, Esc/2º clique, foco, sem botão com <20 | teste por painel, "aba com menos de 20 itens" | passou |
| 6 Aba atualiza `ei_*` e o gráfico acompanha | "aba por tipo atualiza ei_fl1" | passou |
| 7 Visão geral: links chegam ao cartão | "os links de espera apontam e chegam ao cartão certo" | passou |
| 8 Catálogo: 4 linhas, sem opção no filtro Painel | "catálogo: quatro linhas" | passou |
| 9 Preferências: formato do 007, estado antigo, marcador, "Ir para" | "Preferências" (estado salvo) e "Preferências pela UI" (grava `{tatico:[ei-fl2]}`) | passou |
| 10 Exportação por painel, sem opção antiga, sem mistura de fontes | "Exportação (critério 10)", `exportar.spec` EXP-01 a EXP-08 (EXP-05: Sustentação só Acelerato, sem nome de pessoa) | passou |
| 11 Sem rolagem horizontal a 375 e 1280, gráfico aberto | teste por painel e por largura; `responsivo.spec` | passou |
| 12 Rota antiga sem chunk de página | "a rota antiga não carrega chunk de página" | passou |
| Acessibilidade (axe, alvo 44 px em 375, teclado) | `a11y.spec` e o teste por painel | passou |
| Filtros (FIL-08: filtros do fluxo não vão para a sustentação) | `filtros.spec` | passou |

## Testes exploratórios (375 e 1280, ambos iguais)
| Entrada | Obtido |
|---|---|
| `/espera-invisivel?equipe=fluig&periodo=4s&tipo=incidente&sust_prioridade=P1#ei-sust` | `/sustentacao?prioridade=P1#ei-sust`; chips: Equipe Todas, Prioridade P1, Período 6 meses (padrões da Sustentação); nenhum parâmetro do fluxo |
| `/espera-invisivel?sust_prioridade=P1&ei_sust=p3#EI-SUST` (caixa mista) | `/sustentacao?prioridade=P1&ei_sust=p3#ei-sust`, cartão presente |
| `/espera-invisivel#xyz` e `/espera-invisivel?equipe=fluig` | `/` (Visão geral) |
| `/espera-invisivel?cadencia=diaria#ei-fl1` | `/operacional?cadencia=semanal#ei-fl1`, cartão presente |
| `/operacional?cadencia=diaria#ei-fl1` | permanece na diária, sem cartão EI-FL1 (conforme especificação) |
| `/sustentacao?equipe=fluig&periodo=4s&tipo=incidente&sistema=x#ei-sust` (digitado direto) | `tipo` e `sistema` descartados; equipe e período ficam como filtros próprios da Sustentação, com chips coerentes e o cartão mostrando os mesmos filtros |

## IS-004: resolvido nesta branch
Não existe arquivo `IS-004` em `docs/qa/bugs/` nem em nenhum outro lugar do repositório (busca em `docs`, `e2e`, `web/src`, `server`), então a verificação foi pelo comportamento descrito. O defeito (espera invisível da Sustentação mostrando filtros do fluxo como aplicados) **não acontece**: depois do redirecionamento, os parâmetros do fluxo (`equipe`, `periodo`, `tipo`, `sistema`) são descartados, os chips e o cartão mostram só filtros da Sustentação, e o teste de critério 2 afirma a ausência de `sust_`, `equipe` e `periodo=4s` na URL. Sugiro ao Jarvis registrar o `IS-004` em `docs/qa/bugs/` se o histórico dele existir só fora do repositório.

## Regras invioláveis
- BusinessMap e Acelerato separados: o redirecionador descarta os filtros do fluxo no destino da Sustentação, e o painel mostra só `EI-SUST` (um cartão de EI por painel).
- Nenhum dado de pessoa: EXP-05 passou; nenhuma visão individual ou comparação entre níveis foi encontrada.
- Abaixo de 20 itens: o cartão mostra "Amostra insuficiente" (P1 com 2 e 9 itens; EI-FL3 no mock) e não há botão de evolução nem estatística.

## Fora de escopo (conforme o pedido)
Levar `sust_*` para `/operacional?cadencia=sustentacao` (demanda seguinte); o título "Espera invisível · Operacional" é intencional.
