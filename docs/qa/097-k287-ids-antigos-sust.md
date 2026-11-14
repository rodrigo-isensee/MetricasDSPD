---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k287-ids-antigos-sust
commit: f1005198173f69e21bb7c41cbee7887c8d16e089
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---

# QA: K-287, a Sustentação só com o slug das equipes (097, E4.43)

Base develop 699af53e. Head da branch 06e98d93; código e testes em f1005198 (`Revisar-sha`). Diff `699af53e..HEAD` lido: contrato (`packages/contratos/src/filtros.ts`), seleção (`packages/metricas/src/acelerato/comum.ts`), codec e redirecionamento da web, schema do servidor (só comentário) e os testes e specs que trocam o id antigo pelo slug. Sem coluna de pessoa, sem cálculo novo, Acelerato e BusinessMap continuam separados.

## Veredito
**Aprovado.** Sem bug aberto. A suíte inteira fica com o check-run `bateria` do CI do mesmo sha; aqui rodei só os cenários do K-287.

## Execução (head f1005198, worktree MetricasDSPD-052h)
- `packages/contratos`, `vitest run --maxWorkers=2`: 12 arquivos, 219 testes passaram.
- `packages/metricas`, `TZ=UTC vitest run --maxWorkers=2`: 46 arquivos, 1314 testes passaram.
- `web`, `vitest run --maxWorkers=2` em `src/features/filtros`, `redireciona.test.tsx`, `resumo/equipe.test.tsx`, `MockFonteMetricas.test.ts`, `operacional/visoes.test.tsx`: 15 arquivos, 216 testes passaram.
- E2E, chromium, `--workers=1`: `tests/sustentacao-no-operacional.spec.ts` 40 passaram (inclui CA-11, `/sustentacao?...equipe=sssc-totvs` redireciona com `sust_equipe` intacto); `tests/intensivo-filtros.spec.ts -g IF-I12` 1 passou (`sust_equipe=sssc-fluig` com estado correto, nunca erro). O spec intensivo inteiro não foi rodado até o fim aqui (mais de 9 minutos, estourou o prazo da minha rodada; só o IF-I12, que é o que o autor mudou, está provado); o restante vem do CI.

## Vermelho antes do verde
Arquivos de produção (`filtros.ts`, `codec.ts`, `comum.ts`, `RedirecionaSustentacao.tsx`) trazidos de 699af53e sobre os testes novos, depois restaurados pelo conteúdo do HEAD (`git show HEAD:<arquivo>`; árvore limpa ao final):
- contratos: 1 falhou, "filtros da sustentação aceitam equipes..." (`expected true to be false`: nome fora do slug passava).
- web: 3 falharam (`redireciona.test.tsx` `?equipe=totvs,senior`; `codec.test.ts` "id antigo na URL não vira slug: é inválido e anotado (K-287)"; `equipe.test.tsx` "...a Sustentação descarta o id antigo").
- Na base os testes provam; no head passam.

## Mutação à mão nas regras (cada mutante restaurado com `git show HEAD:`)
| Mutante | Resultado |
|---|---|
| M1 `idEquipeSlug` vira `z.string()` | morto (contratos.test.ts) |
| M2 sem teto de 60 (`{0,}`) | morto (contratos.test.ts, fronteira 61) |
| M3 aceita maiúscula | morto (contratos.test.ts) |
| M4 aceita espaço | morto (contratos.test.ts) |
| M5 hífen inicial aceito | morto (contratos.test.ts) |
| M6 codec não anota inválido | morto (10 testes, entre eles o K-287 do id antigo) |
| M7 `v in {}` aceita `constructor`/`__proto__` | morto (codec.test.ts, teste A6) |
| M8 codec duplica slug repetido | morto (2 testes) |
| M9 `selecionarAC` compara com `equipeId` em maiúscula | morto (2 testes da tendência: o recorte por slug real seleciona dado) |

9 mutantes, 0 sobreviventes.

## Critério → teste → resultado
| Obrigação (E4.43 / K-287) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Contrato recusa nome que não é slug | contratos.test.ts "filtros da sustentação..." | espaço, maiúscula, vazio, hífen inicial, 61 caracteres; 60 aceito | passou |
| Link antigo com `totvs` vira inválido e aparece no aviso existente | codec.test.ts "id antigo..."; equipe.test.tsx "...descarta o id antigo" (URL limpa, Equipe: Todas); redireciona.test.tsx | id antigo (`totvs`, `fluig`) | passou |
| `constructor`, `tostring`, `__proto__` na URL são inválidos | codec.test.ts "nome do protótipo de objeto..." | chave herdada de Object | passou |
| Slug repetido entra uma vez | codec.test.ts "slug repetido..." | duplicado | passou |
| Recorte por slug real seleciona dado no mock | tendencia.test.ts (`sssc-totvs` 20, `sssc-senior` 5, `totvs` 0), complementares.test.ts S8, MockFonteMetricas.test.ts | recorte estreito com dado; id antigo = 0 | passou |
| `/sustentacao` redireciona preservando o slug | e2e CA-11 (chromium) | hash e Voltar | passou |
| Estado sem dado da combinação, sem erro | e2e IF-I12 com `sust_equipe=sssc-fluig` | combinação vazia | passou |
| Normalização somada fluxo + Sustentação (maiúscula vira slug) | equipe.test.tsx "...quando uma só ajusta o valor" | valor ajustável vs inválido | passou |

## Achados
