---
tipo: qa
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-deps-patch
commit: b9441f58e669e954a50e965ea8c5023bf38e7ca5
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-05
---
# Parecer de QA 073-deps-patch (E8, E3.3, K-232)

Commit testado: b9441f58 (só `pnpm-lock.yaml`: body-parser 1.20.8 para 1.20.9, qs 6.16.0 para 6.16.1, ip-address 10.7.3 para 10.7.4). A ponta da branch é 347106ef, que só soma os pareceres de segurança (e49e6a3c) e de review (347106ef), ambos em `docs/`, sem código: as execuções abaixo valem para o HEAD. Review e segurança estão aprovados (`docs/reviews/073-deps-patch.md`, `docs/security/073-deps-patch.md`). A entrega é troca de versão de dependência transitiva (sem CA novo, sem teste novo ou mudado): não há vermelho antes do verde nem mutação a rodar (nenhum código mudou).

## Achados

- A1 (recomendado) docs/qa/073-deps-patch.md:1 · os 4 arquivos de teste de entrada do server (25 testes) não rodaram neste ambiente; a prova deles é a CI do PR, antes de qualquer merge, junto da instalação congelada e da varredura de dependências (mesmo ponto do A1 do review).

## Ambiente
- Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, HEAD 347106ef, árvore limpa; load 0,58 e MemAvailable 15 GB antes das suítes; vitest com `--maxWorkers=2`, uma suíte por vez, TZ=UTC no web e nos pacotes.
- O store do pnpm da estação é somente leitura no sandbox (EROFS ao gravar os três tarballs novos); a instalação foi feita com `--store-dir` em diretório temporário. Limitação do ambiente, não da entrega.

## Resultado
| Verificação | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` (CI=true) | rc=0; lock com body-parser@1.20.9, qs@6.16.1, ip-address@10.7.4 |
| packages/contratos | 10 arquivos, 208 testes aprovados |
| packages/metricas | 43 arquivos, 1262 testes aprovados |
| packages/mock | 14 arquivos, 258 testes aprovados |
| web (vitest) | 97 arquivos, 1471 testes aprovados |
| server (vitest, 2 workers) | 85 arquivos aprovados, 36 pulados, 4 falhos; 1781 testes aprovados, 248 pulados, 25 falhos |
| `npx eslint .` | rc=0, sem saída |
| `pnpm run docs:check` | ok (1021 páginas Markdown, 69 métricas, 2 eventos) |

Falhas do server: todas nos 4 arquivos de entrada que lançam tsx em processo filho com env limpo (`apontamento-entradas` 12, `ref-sync-ac-entrada` 3, `ref-sync-businessmap-entrada` 5, `ref-sync-calendario-entrada` 5), com `ENOENT: mkdir '/tmp/tsx-1000'` (o sandbox nega `/tmp`). Limitação conhecida do ambiente (decisão técnica de 2026-11-05 19:42): registradas como **prova na CI do PR**, não como bug. Fora esses 4 arquivos, o server passa inteiro.

## Critério → teste → resultado
Não há especificação de UX nem CA: a obrigação é a regra de que a troca de versão não quebre o que já passava.

| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Lock instala congelado com as três versões | `pnpm install --frozen-lockfile` | aprovado | n/a |
| body-parser e qs (via express, e2e) não quebram o código | suítes de server, web, pacotes | aprovado, salvo os 4 arquivos de entrada acima | n/a |
| Lint e documentação seguem verdes | eslint, docs:check | aprovado | n/a |
| 4 testes de entrada do server | CI do PR | pendente na CI (A1) | n/a |

## Parecer
Aprovado para o commit b9441f58, sem bugs abertos. O PR (E3.4) só segue com a CI verde nos 4 arquivos de entrada.
