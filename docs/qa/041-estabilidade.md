---
tipo: qa
contrato: 1
pedido: 041-estabilidade
branch: feature/041-estabilidade
commit: 6d40d688f7d7cb3cf61983a544eadb51761269f8
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 1
bugs_medios: 1
bugs_baixos: 0
aceite_usuario: sim
data: 2026-10-27
---

# Diagnóstico medido das instabilidades (E1.1 do pedido 041, K-138)

As seções 1 a 10 são o diagnóstico (E1.1, base c4db73e). A seção 11 é a prova de estabilidade e o parecer de QA da entrega (E4.1), sobre o commit 6d40d68; o frontmatter e o bloco `## 11. Prova de estabilidade e parecer da entrega (E4.1)

Base `e342a2c`, head testado `6d40d68`, 2026-10-27, Node 24.22.1, WSL2 (7,9 GB), Chromium headless, uma suíte por vez, `--retries=0`. Banco local saudável. Comandos de E2E com `E2E_PORTA=4273 E2E_PORTA_ALT=4274`, `--workers=1` nas repetições. Não há `jarvis.slice` visível no cgroup desta sessão (`/proc/self/cgroup` é `0::/`), então o pico do slice não pôde ser lido; vale `free -m` (usados): 1 051 MB antes das unidades, 1 539 MB com o E2E completo recém-subido, 3 273 MB depois do último teste, sem processo morto por memória nem queda do WSL.

### 11.1 Repetições (20 seguidas por teste corrigido)

| Teste corrigido | Comando (filtro novo) | Falhas em 20 | Duração mediana / máxima | n do F4 |
|---|---|---|---|---|
| F4 `e2e/perf/perf.spec.ts:96` "F3 INP, F4 resposta visual e F5 ..." (K-138) | `playwright test --project=perf -g "F3 INP" --repeat-each=20` | 0/20 (3,3 min) | 8,5 s / 8,8 s | n = 20 em 20 de 20 repetições (40 trocas em 19 repetições, 42 em 1); p95 do F4 de 41,9 a 47,9 ms (limite 100 ms); a frio fora da amostra: 48,2 a 144,7 ms (mediana ~126 ms) |
| IF-U-operacional dividido (K-092): 4 janelas x 2 testes (URL ida e volta; Voltar/Avançar) + "outra aba" = 9 testes x 20 = 180 execuções | `playwright test --project=chromium -g "IF-U-operacional" --repeat-each=20` | 0/180 (24,1 min) | 7,9 s / 9,5 s (por teste, médias entre 6,6 e 9,0 s) | n/a |
| CA-19 axe (K-115), um teste por visão a 375 e 1280 px = 8 testes x 20 = 160 execuções | `playwright test --project=chromium tests/sustentacao-no-operacional.spec.ts -g "CA-19 axe" --repeat-each=20` | 0/160 (9,3 min) | 3,3 s / 4,4 s | n/a |
| K-107 `packages/metricas/src/core/montecarlo.test.ts` (arquivo, 14 testes, 2 propriedades `fast-check` com seed fixa) | `pnpm exec vitest run src/core/montecarlo.test.ts` em `packages/metricas`, 20 vezes | 0/20 | 822 ms / 853 ms (processo inteiro) | n/a |
| K-123 `packages/mock/src/mock.test.ts` "gera a base completa em menos de 1,5 s de CPU, calibrado" | `pnpm exec vitest run src/mock.test.ts` (arquivo inteiro, 22 testes), 20 vezes; e mais 20 só com `-t "gera a base completa"` | 0/20 e 0/20 | arquivo: 2 690 ms / 2 762 ms; o gerador gasta 281 a 330 ms de CPU, com limite calibrado de 1 705 a 2 465 ms (fator 1,14 a 1,64) | n/a |

Leitura: margem. Os E2E corrigidos usam 8 a 32 % do orçamento de 30 s (antes 70 a 88 %), o F4 tem n = 20 sempre (antes 3 a 11) e o K-123 usa ~17 % do limite calibrado. Nenhuma falha em 380 execuções E2E e 40 de unidade. Observação ao review A3: o `{ timeout: 30_000 }` de `esperarPronto` não foi exercido por nenhuma falha; mantida como recomendação. Segurança A2: este commit leva só o Markdown, sem PNG; a E2E desta rodada gravou evidências em `e2e/evidencias-local` (fora do git), `git status` limpo.

### 11.2 E2E completa, 2 workers (padrão local), `--retries=0`

`pnpm exec playwright test --retries=0` em `e2e/` (portas 4273/4274): 736 testes, **733 passaram, 3 falharam**, 23,4 min, rc=1. O F4 e todos os testes corrigidos passaram na suíte completa. As 3 falhas são de outros testes:

| Teste | Falha | Repetição isolada, 1 worker | Na base `e342a2c` (arquivos de teste da base, mesmo `web`) |
|---|---|---|---|
| `complementares.spec.ts:45` "COMP-01 /operacional?cadencia=sustentacao: recolhida, abre com 6 cartões ... axe AA" (variante 1280 px) | axe `target-size` (serious) no botão "Sobre a janela fixa" de `#ei-sust` | 5/5 falham | 3/3 falham (as outras 3 variantes de COMP-01 passam) |
| `perf.spec.ts:174` "F2 CLS a 375x812 em /operacional" | CLS 0,115 (limite 0,1) | 5/5 falham; as outras 3 rotas passam | 3/3 falham |
| `perf.spec.ts:195` "F2 CLS do Resumo a 375px" | CLS 0,115 | 5/5 falham | 3/3 falham |

Todas são determinísticas (mesmo valor 0,11507 em todas as execuções) e iguais na base: não vêm das correções da branch, e `git diff c4db73e e342a2c -- web` é vazio. Não são as instabilidades do 041. Mas nas rodadas do diagnóstico (E1, base c4db73e, 1 e 2 workers) a suíte teve 1 falha em 710 (a do F4), logo estes três testes passavam antes; o que mudou entre as duas medições (data da máquina, 2026-10-23 e 2026-10-27, ou ambiente) não foi isolado: não afirmo causa. O CLS é compatível com o SNO-004 aberto (CLS do Resumo a 0,125 no Lighthouse).

### 11.3 Obrigação e resultado

| Obrigação (PQ-1 do pedido) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| F4 estável, limite 100 ms, n >= 20, sem a medição a frio (ADR 0003, 2026-10-23) | `perf.spec.ts:96` | 0/20, n = 20, p95 <= 47,9 ms | amostra mínima 20; p95 < 100 ms |
| IF-U-operacional dentro do orçamento sem aumentar timeout (K-092) | 9 testes | 0/180, máx 9,5 s | 30 s do Playwright |
| CA-19 axe dividido por visão (K-115) | 8 testes | 0/160, máx 4,4 s | 30 s do Playwright |
| K-107 determinístico | `montecarlo.test.ts` | 0/20 | k e k + 5 com o mesmo prefixo de sorteios |
| K-123 em CPU calibrado | `mock.test.ts` | 0/40 | 1,5 s x fator em [1, 2] |
| `pronto` verde (typecheck do e2e, K-134) | `pnpm run pronto` | rc=0 (docs:check ok, 736 páginas) | n/a |
| Suíte E2E completa sem falha (2 workers) | 736 testes | 3 falhas pré-existentes (11.2) | n/a |

Vermelho antes do verde e mutação: a mudança é de testes já existentes; o vermelho das correções está nas taxas de falha da seção 8 (F4 6/10, K-107 por contraexemplo registrado, K-123 sob carga) contra 0/20 aqui. Não rodei mutação (a ferramenta não é exigida para correção de teste).

Parecer: **reprovado**, só pelas 3 falhas fora do escopo, que não são das correções mas fazem a E2E completa sair com rc=1 (dívida pré-existente bloqueia e vira cartão). As correções do 041 estão provadas estáveis. Quem decide seguir sem corrigir os três é o usuário (`aceite_usuario: sim`, `R-DECISAO`).

## Achados

- A1 (bloqueante) e2e/tests/complementares.spec.ts:45 · COMP-01 `/operacional?cadencia=sustentacao` a 1280 px falha 100 % (axe `target-size` serious no botão "Sobre a janela fixa", `#ei-sust`). Igual na base. Corrigir no front (react-frontend): alvo de 24 px ou espaço.
- A2 (bloqueante) e2e/perf/perf.spec.ts:174 · F2 CLS a 375 px em `/operacional` = 0,115 (limite 0,1), 10/10 falhas; mesmo valor em `perf.spec.ts:195` (Resumo a 375 px). Igual na base, compatível com o SNO-004. Corrigir no front (react-frontend) ou decidir o aceite.
- A3 (recomendado) e2e/pages/PainelPage.ts:64 · `{ timeout: 30_000 }` do `esperarPronto` vale também para perf e api, que usavam 5 s; a falha aparece como timeout do teste. Nenhuma falha o exerceu na prova (review A3).
- A4 (recomendado) docs/qa/041-estabilidade.md:11 · pico de memória do `jarvis.slice` não medido (sem slice no cgroup da sessão); a prova usou `free -m`. Medir de dentro do slice na próxima prova longa.
