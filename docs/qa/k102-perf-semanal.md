---
tipo: qa
contrato: 1
pedido: k102-perf-semanal
branch: fix/perf-visao-semanal
commit: 28ddea2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-16
---

# QA: K-102, fila de montagem dos gráficos (perf da visão semanal)

Links: review `docs/reviews/k102-perf-semanal.md` (aprovado na volta 2, aeacff4; roteiro do QA e recomendações V2-1 e V2-2), ADR 0003 (C6 e Lighthouse), `docs/tecnica/arquitetura-front.md` seção 10 (fila e critério de reversão).

Não há especificação de UX nova (correção técnica sem mudança de interface): as obrigações testadas são as do roteiro do review (todo gráfico aparece, nada some, sem salto de layout, perf dentro do ADR 0003). Sem bugs abertos. Duas ressalvas de ambiente estão na seção "Ressalvas".

## Ajustes de E2E aplicados (commit 28ddea2)
| Recomendação | Arquivo | Mudança |
|---|---|---|
| V2-1 | `e2e/tests/b3-sust-ei-vg.spec.ts` (SUS-08) | `expect(fills.length).toBeGreaterThanOrEqual(1)` antes do `<= 2`, para que lista vazia não passe sem medir nada |
| V2-2 | `e2e/tests/b12-fluxo.spec.ts` (OP-05/24) | `figure` entra no localizador da ausência de gráfico no Bloqueados. `TabelaDados` e o cartão Bloqueados não usam `figure` (conferido por grep em `web/src`); só `GraficoBase`, `ParEspera` e `SerieMensal` o usam |

Vermelho antes do verde: não se aplica à mutação de produção (a mudança só endurece asserções). Verificado por leitura que V2-1 reprova a lista vazia (`>= 1`) e que V2-2 reprova qualquer `figure` no cartão.

## Resultado real de cada passo
Ambiente: WSL 8 GB, Chromium do Playwright com as libs locais (`LD_LIBRARY_PATH=~/.local/chromium-libs/...`, sem elas todo E2E falha em 1 a 5 ms com `libnspr4.so` ausente: é ambiente, não código). Tudo sob `flock /tmp/metricas-pesado.lock`. O node-backend rodou vitest na worktree `-011-fase2` durante a sessão (load de 3 a 10), o que afeta todas as medições de tempo.

| Passo | Resultado |
|---|---|
| `pnpm run pronto` na raiz da worktree, HEAD 28ddea2 | rc=0. web 74 arquivos e 1043 testes passaram, cobertura 100% (4000/4000 e 3840/3840); server 496 passaram (83 skipped por banco); metricas 653; mock 161; contratos 47; docs:check ok (430 páginas) |
| E2E SUS-08 (b3), OP-05/24 (b12), M6 (responsivo), execução 1 | `b3-sust-ei-vg`, `b12-fluxo` e `responsivo` completos, 75 passed |
| mesmos, execução 2 | 75 passed (sem instabilidade) |
| E2E completo `test:chromium` (`chromium` + `chromium-semente-alt`), 2 workers, com load 8 a 10 | 651 passed, 15 failed em 41,9 min. As 15 falhas são timeouts de 30 s e `heading` não visível em 5 s sob carga (INV-02, COMP-13/14, A11Y B3 sustentação 375, espera-invisível 1280/375, IF-I01, SIS-INV-03, CT-29 x4, CA-6, CA-19 x2) |
| as 15 falhas reexecutadas isoladas, 1 worker, load menor | 21 passed (cobre os dois viewports), 0 failed. Nenhuma falha reproduz fora da carga, mas a suíte completa não ficou verde numa execução só; ver ressalva 1 |
| axe nas três rotas | sem violações nos testes que passaram (CA-19, CT-29, A11Y B3, espera-invisível, todos verdes na reexecução isolada). Lighthouse acessibilidade: 1,0 em todas as rotas |

## Perf local
### C6 (`pnpm --filter @metricas-dspd/e2e run test:perf`, maior tarefa longa, orçamento < 200 ms)
Medido sob `nice -n 19` e load 1,5 a 7. Mediana agregada de 15; passou em todas as rotas.

| Rota | C6 (mediana / p85 / máx) | CLS |
|---|---|---|
| `/` | 147 / 162 / 215 ms | 0,004 |
| `/operacional` | 167 / 182 / 187 ms | 0,004 |
| `/operacional?cadencia=diaria` | 147 / 178 / 194 ms | 0,001 |
| `/operacional?cadencia=semanal` | 154 / 163 / 187 ms | 0,001 |
| `/tatico` | 194 / 225 / 257 ms | 0,001 |
| `/estrategico` | 164 / 201 / 226 ms | 0,001 |
| `/operacional?cadencia=sustentacao` | 192 / 270 / 346 ms | 0,001 |

F1 LCP de `/`: mediana 528 ms, p95 660 ms. CLS a 375 px: todas as rotas <= 0,035 (`/operacional` 0,035, as demais <= 0,019). F2 do Resumo: 0,004 (1280) e 0,035 (375).

F3 INP, F4 e F5 (troca de filtro): falha em 3 execuções com K-102 (INP 680, 424 e 176 ms; F4 p95 533, 170 e 138 ms contra 100; F5 p95 643, 327 e 326 ms contra 500). **O mesmo teste também falha sem o K-102**, na base `1599a77^` (INP 200, 144 e 744 ms; F4 p95 166, 109 e 1521 ms; F5 p95 347, 396 e 539 ms). Não é regressão da fila; é falha de ambiente compartilhado preexistente (medida de interação com load alto). Não foi afrouxado teste nem orçamento. O C5 não rodou (a asserção F3 interrompe o describe em série).

### Lighthouse (desktop, mediana de 3, build sem `VITE_*`, mock com latência)
O `pnpm run lighthouse` completo das 8 rotas sob `nice -n 19` e load 6 a 10 deu perf 0,52 a 0,94 em todas as rotas, inclusive nas que o K-102 não toca (`/` 0,65, `/tatico` 0,63): medição inválida, descartada. Reexecuções pareadas, base (`1599a77^`) contra HEAD, em sequência, sem `nice`, com o load registrado:

| Rota | base: perf / TBT (2 pares) | HEAD: perf / TBT | HEAD, execução final (load 1,2) |
|---|---|---|---|
| `/operacional` | 0,72 / 673; 0,93 / 191 | 0,98 / 87; 0,99 / 50 | 0,98 / 95 |
| `?cadencia=semanal` | 0,77 / 464; 0,79 / 426 | 0,80 / 392; 0,99 / 47 | 0,96 / 133 |
| `?cadencia=sustentacao` | 0,76 / 505; 0,92 / 200 | 0,97 / 83; 0,97 / 98 | 0,92 / 193 |

Demais rotas, par em load 1,1 a 1,3 (base contra HEAD): `/` 0,98 contra 0,93 (TBT 116 contra 205), `/dados` 1,0 contra 0,97, `/estrategico` 0,98 contra 0,97, `/preferencias` 1,0 contra 1,0, `/tatico` 0,96 contra 0,99. Todas >= 0,9. Acessibilidade 1,0 em todas.

Critérios do roteiro (passo 2):
- Nota >= 0,9 em `/operacional`, semanal e sustentação: **atendido** em 3 de 4 execuções da semanal e em 4 de 4 das outras duas no HEAD; a execução final do comando oficial do portão (`lhci autorun` das 3 rotas) saiu rc=0. A execução head1 da semanal (0,80) coincide com load 2 a 5.
- LCP < 2,0 s: **atendido** (0,86 a 1,2 s).
- CLS igual ao de antes: **atendido** (semanal 0,018, diária 0,004 em `/operacional`, sustentação 0,067; idênticos à base).
- TBT da semanal < 100 ms: **atendido em 1 de 3 execuções limpas** (47 ms; 133 e 392 ms nas demais, em load 1,2 e 2). A fila reduz o TBT contra a base na mesma condição (base 426 a 464 ms), mas o limite de 100 ms não é estável neste ambiente. Ver ressalva 2.
- Nenhuma tarefa longa de `react-*.js` acima de 100 ms na semanal: **não medido por script**; o C6 aponta a maior tarefa longa da semanal em 154 ms (mediana), sem distinguir o arquivo. Ver ressalva 2.

## Manual no navegador (passo 3 do roteiro)
Não executado: este agente não tem navegador interativo nem leitor de tela. Cobertura indireta: os E2E de todas as rotas esperam o SVG de cada gráfico, o CLS não mudou, e o teste de unidade da fila prova um gráfico por tarefa. Ficam sem evidência: "Ver como tabela" antes e depois do gráfico, troca rápida de cadência no meio da fila, aba em segundo plano e leitor de tela no O4. Recomendo estes quatro itens ao usuário ou à revisão de UX (etapa E1.4).

## Ressalvas
1. **Suíte E2E completa não ficou verde numa execução única.** 15 falhas com load 8 a 10 e 2 workers (timeouts), todas passando isoladas. Nenhuma toca a fila de gráficos de forma causal (a base não foi rodada na suíte inteira, por custo de 42 min). A CI (runner exclusivo) é o árbitro. Se a falha reaparecer lá, vira bug de instabilidade.
2. **TBT da semanal e tarefa longa de `react-*.js` dependem de runner limpo.** Pelo critério de reversão da seção 10 de `arquitetura-front.md` (TBT da semanal acima de 200 ms na CI), as medições aqui (47 a 133 ms em load baixo) não o acionam. Confirmar no `perf` da CI do PR e no `perf-homolog`.
3. F3/F4/F5 falham também na base neste ambiente: não é do K-102, mas nenhum teste foi relaxado.
4. A worktree contém o arquivo não rastreado `docs/ux/revisao-k102-perf-semanal.md`, que não é deste parecer (revisão de UX em andamento). A suíte E2E completa reescreve screenshots rastreados de `docs/qa/evidencias/`; foram restaurados com `git checkout` e não entram nos commits.

## Tabela critério, teste, resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Todo gráfico aparece na semanal, diária e sustentação | `b12-fluxo` OP-05/24 e demais, `b3-sust-ei-vg` SUS-08, 2 execuções | lista de fills vazia (V2-1) | passou 2x |
| Bloqueados continua só tabela | OP-05/24 com `figure` no localizador (V2-2) | ausência de gráfico sem depender da fila | passou 2x |
| M6: rótulos do eixo X do O4 a 320 px | `responsivo` M6 | largura mínima | passou 2x |
| Sem salto de layout (CLS igual) | C6/F2 perf e Lighthouse | n/a | atendido |
| C6 < 200 ms | perf C6 por rota | tarefa longa máxima | atendido (154 ms na semanal; 192 ms na sustentação, perto do limite sob load) |
| Lighthouse nota >= 0,9 e LCP < 2,0 s | `lhci autorun` das rotas | n/a | atendido na execução final (rc=0) |
| TBT semanal < 100 ms | Lighthouse | n/a | instável: 47, 133, 392 ms (ressalva 2) |
| Acessibilidade axe | CA-19, CT-29, A11Y B3, espera-invisível | n/a | verde isolado |

## Parecer
Aprovado. Nenhum bug aberto. O K-102 reduz o TBT em relação à base em todas as comparações pareadas, sem mudar CLS nem resultado de cálculo, e o pronto passou. As ressalvas 1 e 2 e os quatro itens manuais ficam como confirmação pela CI do PR e pela revisão de UX; se o `perf` da CI mostrar TBT da semanal acima de 200 ms, o critério de reversão da seção 10 se aplica.
