---
tipo: review
contrato: 1
pedido: 011-fase2-estrategicas
branch: feature/011-fase2-estrategicas
commit: 53a6495
parecer: aprovado
revisor: tech-lead
data: 2026-10-16
---

# Code review: back da fase 2 do pedido 011, lote 1 (estratégicas: E6, E7 com R$, E8)

**Origem:** commits `3297fda` (E1) e `11113d0` (E2) da `feature/011-fase2-back`, sobre `b73bad3`, revisados contra o plano (`docs/architecture/features/metricas-tambem-disponiveis.md` §2 E6, E7, E8; §4; §5 "Fase 2"), a ADR 0020 ("Decisão" e "Decisões do usuário"), as decisões do usuário do pedido 011 e as regras invioláveis do `CLAUDE.md`.

**Separação por nível** (decisão do usuário de 2026-10-17, lotes separados e nesta ordem): este lote é o commit `53a6495` sobre a `develop` (`f81567e`). Entram só E6, E7 com R$ e E8. Os arquivos compartilhados (`METRICA_IDS`, `APLICABILIDADE_FLUXO`, `COM_EXTENSAO_MOCK`, `REGRAS_METRICA`, `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`, `ExtensaoTambemBM`, gerador do mock, OpenAPI, fotografias, `docs/api`, `docs/tecnica`, `regras-metricas.md` e as contagens dos testes) levam só a parte deste nível. O gerador do mock tem uma stream por campo: tirar os campos de outro nível não muda os hashes de `datasProjeto` e `conhecimentoSistema` (o teste por campo continua igual); só o hash da extensão inteira mudou (`91b93a24`). Do `coletor/` entra só `faixaConcentracao`, com o teste próprio `coletor/faixaConcentracao.test.ts` (as duas partes que eram do `houveTroca.test.ts` original: a faixa e "não é pública"). Nenhuma lógica foi alterada na separação.

**Veredito:** **aprovado**, com 4 ajustes recomendados e nenhum que bloqueie o QA.

## Ferramentas (citadas, não refeitas)
- `pnpm run pronto` na raiz da worktree, nesta branch, sobre `53a6495` mais este parecer: **rc=0** (2026-10-16 11:05, load 3,73 no início). Cobre lint, `format:check`, tipos, testes com cobertura de 100% em todos os pacotes, `docs:check`, `spec:check`, build e tamanho do web.
- `docs:fotografar`: o enum `indicadores[].metrica` do `VISAO_GERAL` cresce com E6 e E8. O aceite de uso único foi registrado em `docs/contratos/snapshots/aceitas.json`, consumido pela fotografia e apagado em seguida (o `docs:check` recusa aceite sem mudança pendente).

## Regras de leitura (`praticas.md` §2, §3, §4 e §8)
| Item | Situação |
|---|---|
| Faz o que o plano pede | ok. E6 e E8 seguem §2; E7 com R$ por fixture, mock sem custo (CA-13) |
| Pessoa e comparação entre times | ok. E8 só conta sistemas por faixa, sem nome de sistema (R-1 = B, ADR 0020 item 9); E7 nunca por equipe nem pessoa; testes de pessoa no contrato (`tambem2.test.ts`), na rota (`metricas.test.ts`) e no gerador (texto do arquivo sem `responsaveis`) |
| Cálculo pela biblioteca | ok. `diasUteisNoIntervalo`, `estatistica`, `percentisDe`, `taxa`, `ordenarNeutro`, `janelaPercentis`; `custo.ts` usa só o calendário do núcleo |
| Mínimo de 20, janela, granularidade | ok. E6: `naData` e P50/P85 só com 20 (janela de 12 semanas, a do E1); E8 é censo com recorte de 5 sistemas (CA-10); E6 só projeto |
| BM × AC | ok, só BusinessMap |
| Mudança de critério (T2.6) | ok. E6 e E8 entram em `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO` (nunca existiram com o critério anterior) |
| Tipos e validação | ok. Schemas `strict`; `deslizeDiasUteis` inteiro; `faixas` anulável |
| Testes e bordas | ok. 19/20 no E6, 4/5 sistemas no E8, pró-rata (mês cheio, meio mês, meses de tamanhos diferentes, troca de vigência, ano bissexto, sem vigência = `null`), rateio só com 20 ou mais |
| Documentação no mesmo commit | ok. `docs/api/metricas.md`, `docs/tecnica/biblioteca-de-calculo.md`, contratos gerados, `regras-metricas.md` |

## Pontos que o autor deixou para o review
**(a) E7: R$ só para sistema com 20 ou mais entregas. Os documentos decidem; não vai ao usuário.** O plano, §2 E7, "Mínimo": "participação com ≥ 20 entregas no total; por sistema, abaixo de 20 só 'k de n'". O rateio e o custo por demanda são grandezas por sistema, e por isso a regra do plano os cobre. A regra do briefing ("abaixo de 20 itens, não publicar estatística") vai no mesmo sentido. O código faz isso (`e7.ts:44`). A frase "Suposição do back" em `docs/api/metricas.md:249` deve passar a citar o plano (R2).

**Para ciência do usuário, sem mudança de código:** com o rateio por contagem de entregas (D-1' = A com D-2), o `custoPorDemanda` sai **igual em todos os sistemas** e vale o custo do período dividido pelo total de entregas. O fixture do teste mostra isso: Fluig e Protheus com 1.000 cada (`e7.custo.test.ts:103-104`). É a aritmética da decisão, não um defeito. Se o usuário esperava um custo por demanda que diferencie os sistemas, a decisão D-1' precisa ser revista com ele.

**(b) Enum `indicadores[].metrica` do `VISAO_GERAL`: ratificado.** O motivo é o mesmo da fase 1: o contrato não está publicado, nenhum consumidor o lê, o enum só cresce e `visaoGeral.ts` emite só ids do núcleo. Neste lote o enum cresce com E6 e E8. Falta o registro do architect no plano ("Aceites de contrato"), como foi feito no lote B2 a B10.

**(c) Mudanças em testes do QA e em `regras-metricas.md`: aceitas.**
- `qa011-fase1.api.test.ts`, A-2: a premissa da fase 1 era "fase 2 sem rota = 404" e deixou de valer com as rotas. A adaptação está certa: a id do lote responde 200 no schema, e a de lote seguinte, da fase 3 ou inexistente, responde 404. O título promete mais do que o teste confere (R3). O QA confirma no E1.4.
- `o23.test.ts` e `t11.test.ts`: mudanças mecânicas, que só acompanham a lista nominal e o tipo da extensão.
- `regras-metricas.md`: espelha `REGRAS_METRICA` e confere com o código. O documento é do architect, que precisa ratificar.

**(d) Suposições do lote:**
- **E6 com `semData`: aceita.** Pela D-7 e pelo CA-20, vale a data registrada no compromisso. O projeto concluído sem ela não tem deslize, e o campo torna visível o que de outro modo sumiria em silêncio. É um acréscimo ao contrato do plano. O architect precisa atualizar o §2 E6.
- **E8 só com o período (aceito e ignorado): aceita.** A janela é fixa (D-3), e o filtro de sistema reduziria o recorte a uma linha. Isso também fecha, na rota, o risco residual (a) da ADR 0020: alternar o filtro de sistema não muda o E8.

## Achados
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R1 | `packages/metricas/src/businessmap/extensao.ts:66` e `e8.ts:26` | `ConhecimentoSistema.entregas` é uma contagem, e o E8 a lê (`s.entregas > 0`). Pela ADR 0020, item 5, o `dspd_api` **não** lê `entregas` de `agg_conhecimento_sistema`, e o contrato usa só a existência de entrega. Na fase 3, a leitura pela API bateria no GRANT | Trocar por `temEntrega: boolean`, espelho de `tem_entrega`, no tipo, no gerador e no teste do gerador | recomendado (antes da fase 3, junto do K-100) |
| R2 | `docs/api/metricas.md:249` | "Suposição do back (pergunta ao usuário se discordar)": o mínimo de 20 do R$ é regra do plano, não suposição | Citar o plano §2 E7, "Mínimo" | recomendado |
| R3 | `server/tests/qa011-fase1.api.test.ts:60` | O título diz "sem a extensão do mock, o estado vazio", mas o teste só confere 200 e schema | Ajustar o título ou acrescentar a conferência do estado vazio | recomendado (QA, no E1.4) |
| R4 | `docs/ux/metricas-tambem-disponiveis/02-especificacao.md:17` | A especificação põe "E7 com custo" em `COM_EXTENSAO_MOCK`; o plano §4 e o código, não (o mock não tem custo) | Alinhar no E3.2 (UX) | recomendado (UX) |

Nota para a fase 3, sem achado neste lote: a ADR 0020, item 2, prevê a entrada `./coletor` no `exports`, e o item 3 prevê a regra de lint de import. As duas ainda não existem, e `faixaConcentracao.test.ts:25` afirma que o `package.json` não cita `coletor`. Quando o módulo `coleta*` nascer, o teste muda junto com a entrada e a regra. O cartão é da fase 3.

## Fora deste review
- **Segurança** (E1.3/E2.3, `security-engineer`, gatilho: dado pessoal no E8): não refeito aqui.
- **QA** (E1.4/E2.4), **UX** (E3.2) e o PR (pedido 020).

## Commits
`53a6495 feat(metricas): back da fase 2 do pedido 011, lote das estratégicas (E6, E7 com R$, E8), em mock`. A mensagem segue Conventional Commits em português, com o cartão e as linhas de atribuição. O conteúdo é o dos commits do autor, recortado por nível.
