---
tipo: revisao-devops
contrato: 1
pedido: 105-k405-ci-passos
branch: ci/105-k405-diagnostico
commit: b67a4cbf7c408da87b2bf99722465c529e07258d
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-17
---
# Review de devops: 105-k405-ci-passos (K-405 passos 1 e 2a, E7.564)

## Parecer
Aprovado. O diff sobre `origin/develop` tem 4 arquivos: `.github/workflows/ci.yml` e `homolog.yml` (12 linhas cada), `changelog.d/ci-105-k405-diagnostico.md` e o diagnóstico `docs/devops/105-k405-diagnostico.md`. A mudança nos dois workflows é a mesma: o passo `pnpm run cobertura` vira três passos, "Medir o runner" (`nproc`, `free -m`, `uptime`), "Cobertura (todos menos o web)" e "Cobertura do web" (com `time`).

Conferido:
- **Filtro.** `pnpm -r --if-present --filter '!@metricas-dspd/web' run cobertura` pega os 8 pacotes com script `cobertura` que não são o web: `packages/contratos`, `mock`, `metricas`, `server`, `tools/homolog`, `docs-contratos`, `pesquisa`, `spec-check` (o `e2e` não tem o script). O nome `@metricas-dspd/web` confere com `web/package.json:2`; `pnpm-workspace.yaml` lista os mesmos pacotes. Nenhum pacote fica sem cobertura nem roda duas vezes.
- **`env` da espera de 15 s.** Agora só no passo do web (`ci.yml:65-66`, `homolog.yml`). A variável só é lida por `web/vite.config.ts` e `web/src/test/setup.ts` (grep): o server e os demais não a usavam, então não há perda.
- **Resumo e artefato.** Continuam lendo `server`, `web` e `tools/homolog` em `*/coverage` (`ci.yml:67-85`, inalterados) e têm `if: always()`.
- **Gates.** Sem `continue-on-error`, retry, `[skip ci]`, teste pulado ou check desligado (`R-VERIFY`). `time` é palavra reservada do bash e preserva o código de saída. Cobertura de 100% segue bloqueante nos dois passos. `permissions`, SHAs das ações, `concurrency` e agregador intactos; nenhum job novo, então os checks exigidos não mudam. Custo de dinheiro zero (`R-CUSTO`): mesmo runner, mesmos passos de teste, três comandos de leitura a mais.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:42 e homolog.yml:69 · a duração do job `testes` pode crescer, porque server e web deixam de correr juntos. Estimativa com os números do diagnóstico (seção 1): hoje o passo leva 13 min 36 s (verde) a 21 min 15 s (vermelho) com server e web em paralelo. Em sequência, metricas e demais (~2,5 min) + server sozinho (até 638 s, menos sem concorrência) + web sozinho (350 a 450 s estimado; 672 s se a contenção não for a causa) dá cerca de 17 a 24 min no melhor caso, contra o teto de 25 min no `ci.yml` (20 min no `homolog.yml:69`, que o diagnóstico não mediu). No `homolog.yml` o teto de 20 min pode estourar com a soma sequencial. Como o passo é diagnóstico, não bloqueia: o run mede exatamente isso. Se o `testes` passar de ~20 min, aplicar 2b ou o passo 4 do diagnóstico; não subir teto para mascarar.
- A2 (recomendado) ci.yml e homolog.yml, passo "Cobertura (todos menos o web)" · se um pacote não web falhar, o passo do web não roda (comportamento padrão do Actions), e o run perde a medida que a etapa quer produzir. Aceitável para a primeira medida; se acontecer, reexecutar o mesmo sha, nunca `continue-on-error` (`R-VERIFY`).
- A3 (informativo) · o passo "Medir o runner" não confere nada além do que imprime; `uptime` antes dos testes mostra o runner ocioso, e a carga durante o teste só aparece pelo `time` do web. Basta para a pergunta "quantos núcleos" (`nproc`) e "quanto o web leva sozinho".

## Notas
- Arquivos protegidos de `.github/` mudam: o PR pede o rótulo `afrouxa-regra` do dono (catraca); avise o `tech-lead`. O envio de workflow é do dono (o token do bot não tem o escopo `workflow`); a branch já existe em `origin`.
- Rollback: reverter o commit `e0690ec0`; o passo único `pnpm run cobertura` com a espera de 15 s volta.
- Lacunas: `actionlint` ausente do PATH, não executado (YAML do bloco `run` em `|` e do `env` revisado a olho); `shellcheck` está no PATH, mas não há script novo, só três comandos simples. Não rodei a suíte nem afirmo CI verde: sem PR para a branch, a suíte inteira fica para o CI do PR; o PQ do autor é o que o parecer cita.
- O diagnóstico `105-k405-diagnostico.md` é documento, sem efeito sobre o pipeline; os passos 2b a 6 dele são etapas próprias, fora deste parecer.
