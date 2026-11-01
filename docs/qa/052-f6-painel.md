---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f6-painel
commit: 8650fb9690342fcdf4d17c7d98bc0bf00ce31b94
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---
# QA: F6, painel operacional com dado real e selo de fictício por origem (pedido 052, E2.75, K-182)

Links: plano `docs/architecture/features/052-integracao-businessmap.md` (F6 e "Decisões técnicas da F6"), ADR 0024, review `docs/reviews/052-f6-painel.md` (aprovado em 8650fb9), segurança `docs/security/052-f6-painel.md` (aprovado em 1b7983b, sobre 469ee8f), delta de UX `docs/ux/integracao-real/06-delta-2026-10-29.md`.

**Parecer: aprovado**, sem bug aberto. Testado o código de `8650fb9` (ponta, depois do A1 do review resolvido em db37a4b). Suíte `.pg` e suíte do web rodadas uma por vez, ambas verdes.

## Escopo e método
Obrigações: o "Pronto" da F6 do plano, P-1 = B, P-3, P-4 = A, P-5 = B, H-12, H-13, H-24, ADR 0024 e as regras invioláveis (nenhuma comparação entre times, BusinessMap e Acelerato separados, abaixo de 20 não publica). Fora: a F6b (O19 a O26 com dado real, seguem fictícias), a soma do limite de WIP por time no O1 (pergunta aberta ao dono) e a revisão visual de UX (E2.74). Banco: PostgreSQL local do Compose; BusinessMap real nunca chamado, `.env` não lido.

## Execução
| Suíte | Comando | Resultado |
|---|---|---|
| Servidor `.pg` | `pnpm run test:pg` (raiz da worktree) | 23 arquivos, 152 testes, todos verdes (28 s) |
| Web | `pnpm --filter @metricas-dspd/web test` | 81 arquivos, 1252 testes, todos verdes (103 s) |
| Testes novos do QA | `vitest run --project unit qa-f6-painel` (3 execuções seguidas) e `vitest run qa-f6-tipo-produto` | 6 e 2 testes verdes, estáveis |

Nenhum teste marcado como `skip`.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Cada métrica lê uma base só (real ou seed), nunca as duas | `painel-real-f6.test.ts` "métrica real lê só a base real…" e "as origens do mapa decidem" (autor) | passou | uma leitura em cada base, zero na outra |
| FL2, FL3 e Sustentação iguais ao mock | `painel-real-f6.pg.test.ts` (d): mexer na base real não muda a resposta (autor) | passou | hash da resposta inalterado |
| Origem exata: reais = 12 da H-13; fictícias = O8, O12, O14 a O18 (com motivo) e O19 a O26; T, E, S e Visão geral no mock | QA `qa-f6-painel.test.ts` "fictícias do painel operacional são exatamente…" | passou | conjunto exato nos dois sentidos |
| Selo de fictício por cartão (O8, O12, O14 a O18, O19 a O26) e nota do cabeçalho com a contagem | `origem.test.tsx` (autor, 17 testes) | passou | contagem por painel; fonte mock sem selo extra |
| Visão geral com selo e "Dados fictícios: sim" no Exportar | `origem.test.tsx` (A1 do review) e `gerar.test.ts:114` (autor) | passou | Visão geral lê o seed |
| Exportar por cartão: fonte, "Atualizado em", frescor, calibração, fictício | `gerar.test.ts`, `modelo.test.ts`, `desenhista.test.ts` (autor) | passou | falha do estado de coleta: arquivo sai e diz "indisponível" |
| P-5: faixa de calibração e frescor visíveis com tudo oculto | `origem.test.tsx` "painel com todas as métricas ocultas" (autor) | passou | todas as métricas ocultas |
| Abaixo de 20 não publica, mesma mensagem (P-3) | QA "com 2 cards na base real nenhum percentil, taxa ou faixa…": percorre as 12 reais, 21 nós "insuficiente" (guarda mínimo 15), todos com `minimo: 20` e `n < 20`, nenhum número de estatística | passou | n = 2 (logo abaixo); a fronteira 19/20 está em `regras.property.test.ts` do pacote |
| O1 com limite 0 mostra o WIP sem limite (H-12) | `painel-real-f6.test.ts` "sem coluna com limite (0)…" (autor): limite 0, `sem-referencia`, coluna com limite `null` | passou | coluna sem limite |
| O3 com nota do SLE (H-24) | `painel-real-f6.test.ts` "O3 e a nota de SLE não definido" e `origem.test.tsx` "O3 mostra SLE não definido…" (autor) | passou | com SLE, sem nota; no seed, nunca |
| Tipo "Trabalho de produto" no filtro | `painel-real-f6.test.ts` (filtros da API); `painel-real-f6.pg.test.ts` (a); QA web `qa-f6-tipo-produto.test.tsx` (opção na barra, grava `trabalho-produto`, link abre aplicado) | passou | rótulo novo no fim de `TIPOS_FILTRO` |
| Nenhum cartão compara times | QA "dois times reais: nenhuma métrica sem filtro traz o nome de um time nem chave por time"; QA "o filtro só recorta"; `times-sem-comparacao.test.ts` (autor, guard de SQL e de arquivos) | passou | dois times na base, 12 métricas |
| Nenhum acesso ao BusinessMap real (abuso: API como ponte de saída) | QA "servir todo o painel e os filtros não chama fetch" (todas as `METRICA_IDS` mais os filtros, com `fetch` global que lança); QA "os módulos de leitura não importam o cliente nem a chave" (mínimo 3 arquivos por pasta) | passou | rede proibida na API |
| `dspd_api` sem coluna de pessoa; times só como filtro | `painel-real-f6.pg.test.ts` "o papel dspd_api lê os times ativos e as colunas…" (autor, papel real) | passou | GRANT por coluna |

## Casos de abuso
O gatilho de segurança da F6 (base real separada da do seed, `ref_time` lido pela API, nada de pessoa na API) não tem arquivo de casos de abuso próprio em `docs/security/ameacas/`; os cobertos aqui vêm do parecer de segurança: comparação entre times por regressão (testes de dois times e do guard), mistura das duas bases (teste de uma leitura por origem), API como ponte de saída (teste do `fetch`) e leitura de coluna de pessoa (teste `.pg` com o papel real).

## Vermelho antes do verde e mutação
Os testes do QA verificam um comportamento que já está no HEAD, então o "vermelho" é provado por mutação numa cópia descartável do HEAD (`git archive`, fora da árvore do autor). Todos morreram:
- `O12` acrescentado a `METRICAS_ORIGEM_REAL` (`packages/contratos/src/origem.ts`): cai "fictícias exatamente…".
- `publicavel` com `n >= 0` (`packages/metricas/src/core/estatistica.ts:15`): caem o teste do mínimo de 20 e o do `fetch`.
- `fetch(...)` inserido em `server/src/modulos/metricas/rotas.ts`: cai "os módulos de leitura não importam o cliente".
- `'Trabalho de produto'` removido de `TIPOS_FILTRO` (`packages/contratos/src/comum.ts`): caem os 2 testes web do filtro.
Sem mutante para o nome do time vazar no resultado: não achei linha de produção onde forçar o vazamento sem reescrever o mapa; o teste fica como guarda de regressão.

## Achados
- A1 (recomendado) packages/contratos/src/origem.ts:30 · O19 a O26 saem fictícias com selo, mas sem motivo próprio (só O8, O12, O14 a O18 têm "aguardando campo no quadro"). Dizer "até a F6b" ao usuário na tela; decisão de UX (E2.74), não devolve a F6.
- A2 (recomendado) server/src/modulos/metricas/mapa.ts:92 · Soma do limite de WIP por time no O1 segue como pergunta aberta ao dono (regra inferida pelo autor); até a resposta o O1 tende a "fora". Já registrada no review (A2) e na segurança (A3); sem teste novo do QA enquanto a regra não existe.
- A3 (recomendado) server/tests/painel-real-f6.pg.test.ts:104 · A prova de que FL2, FL3 e Sustentação são "iguais ao mock" compara a resposta da API com a da base do seed, não com o hash do pacote mock antes da F6; é suficiente para a regra (uma origem por métrica), registrado só para quando a F6b mexer na origem.

## Riscos
Dado real ainda não foi servido (carga inicial E2.58 por rodar): os testes usam banco falso e `.pg` com fixtures, não o quadro real. P-3 conferida cartão a cartão sobre n = 2; com a carga real o número de cartões "insuficiente" muda, a regra não. `.env.example` sem `DSPD_SCHEMA_PREFIXO_SEED` (segurança A2) fica para o dono.
