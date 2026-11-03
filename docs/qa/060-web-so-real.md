---
tipo: qa
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: df21afda697d9b4e4331950adfe31ab8754d15d4
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-03
---
# QA: 060-triagem-dependabot, branch do web com dado real (E2.21, K-195)

Histórico: 2026-11-03, commit atualizado para a ponta da branch; o código revisado em b85663e não mudou (depois dele entraram só pareceres e o parecer de interface, tudo em docs/).

Parecer sobre o código em `b85663e`. Diff `b446021...b85663e`: 38 arquivos, web mais Dockerfile, compose de homologação e documentos. Sem especificação de UX nova; as obrigações vêm do P4 e P5 do plano `060-sem-mock`, do contrato `docs/api/metricas.md` (estado sem dado real) e da ADR 0026.

## Achados
- A1 (recomendado) web/src/features/apontamento/sem-fonte-metricas.test.ts:12 · o glob do teste não vê arquivo novo na pasta enquanto o teste fica em cache: import proibido em `zz-mut.ts` passou local e caiu após tocar o teste. CI com cache frio pega.
- A2 (recomendado) docs/qa/060-web-so-real.md:1 · PR acima do teto M14, como no review (A3 dele): o PR leva a linha de teto excedido, com o número de linhas e o motivo.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Cartão sem dado real mostra "Sem dado real" e `Motivo:`, sem número | `coleta/origem.test.tsx` (O12 com O2 ainda com dado; cabeçalho conta) | cartão fora do mapa real | passou |
| Número-chave, tendência e Visão Geral sem número | `resumo/componentes.test.tsx`, `HttpFonteMetricas.test.ts` | resposta 200 sem número | passou |
| Faixa de atenção, inclusive caso misto (parte sem dado real) | `componentes.test.tsx` (dois testes novos) | faixa nunca diz "Nada pede atenção" | passou |
| PDF por fonte, sem número no bloco sem dado | `exportar/gerar.test.ts` | BusinessMap e Acelerato separados | passou |
| Fonte padrão é a API; mock só com `VITE_FONTE=mock`; valor inválido falha | `app/composicao.test.tsx` | env vazio e inválido | passou |
| Aba Apontamento fora de `FonteMetricas` e do mock | `apontamento/sem-fonte-metricas.test.ts` | mínimo de 5 arquivos | passou, mutante provado (A1) |
| Estado não depende só de cor | leitura de `EstadoSemDadoReal.tsx` (ícone + texto) e axe da suíte | contraste, dois temas | passou |
| Grupo @mock do E2E com `VITE_FONTE=mock` | `e2e/playwright.config.ts` + estados, a11y, shell | build mock explícito | passou |

## Execução
- vitest do web, `--maxWorkers=2`, nice 15 (MemAvailable 13 GB, load 2,2): 92 arquivos, 1412 testes, rc=0.
- E2E chromium, 2 workers, `E2E_SEM_ALT=1`, só `estados`, `a11y` e `shell`: 48 passaram, 0 falharam (axe em dois temas, 375 px, console limpo, aviso fictício em todas as rotas).
- Não rodei E2E completo, build, E2E da API nem `pnpm run pronto` (K-201: fica com o dono).

## Mutação no diff (feita à mão, restaurada depois)
- Tirar o rótulo `Motivo:` de `EstadoSemDadoReal.tsx`: `origem.test.tsx` falhou (1 de 18). Morto.
- Import de `useMetrica` em arquivo novo da aba Apontamento: o guard falhou depois de tocar o teste (A1). Morto.
- Vermelho antes do verde de testes inteiros não rodado: a base não tem o estado sem dado real, então esses testes não existiam nela.

## Parecer
Aprovado em `b85663e`. Sem bug aberto; A1 e A2 são recomendações que não devolvem a branch.
