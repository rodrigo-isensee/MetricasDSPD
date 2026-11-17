---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-k405-diagnostico
commit: b67a4cbf7c408da87b2bf99722465c529e07258d
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: K-405 passos 1 e 2a, medir o runner e rodar o web sozinho (E7.546, review E7.562)

## Escopo lido
`git diff origin/develop...b67a4cbf` (Base-sha `acb62951`): `.github/workflows/ci.yml` (+11 −1), `.github/workflows/homolog.yml` (+11 −1), `changelog.d/ci-105-k405-diagnostico.md` e `docs/devops/105-k405-diagnostico.md`. Código de controle: 22 linhas, dentro do teto M14, um comportamento só (ordem e medição do passo de cobertura). O item E7.546 tem commit (`e0690ec0`); o diagnóstico E7.545 tem `61006fb1`.

## Conferido
- **Filtro.** `pnpm -r --filter '!@metricas-dspd/web' exec pwd` (pnpm 10.34.6) lista 8 pacotes: `packages/contratos`, `packages/metricas`, `packages/mock`, `server`, `tools/homolog`, `tools/spec-check`, `tools/pesquisa`, `tools/docs-contratos`. São todos os que têm `cobertura`, menos o web; `e2e` não tem o script e já ficava fora pelo `--if-present`. A raiz não entra (o `-r` a exclui por padrão), então não há chamada recursiva do `cobertura` da raiz.
- **Espera de 15 s só no web.** `METRICAS_DSPD_ESPERA_ASYNC_MS` só é lida em `web/src/test/setup.ts` e `web/vite.config.ts`: tirar a variável dos outros pacotes não muda nada para eles.
- **Resumo e artefato.** O passo "Resumo de cobertura no job" (`if: always()`) e o `upload-artifact` seguem lendo `server/coverage`, `web/coverage` e `tools/homolog/coverage`; os caminhos não mudaram e cada pacote continua gravando no próprio diretório.
- **Falha.** Se o primeiro passo falhar, o passo do web não roda; antes, o `pnpm -r` também parava na primeira falha. O `time` é palavra reservada do bash (shell padrão do `run`) e preserva o código de saída do `pnpm`.
- **Sem afrouxar.** Nenhum `continue-on-error`, retry, `[skip ci]`, teste pulado nem custo novo no diff (o único `continue-on-error` do `ci.yml`, linha 300, é anterior e fora do diff). Os passos novos não usam `${{ }}` nem entrada externa.
- **YAML.** Os dois workflows carregam com `yaml.safe_load`. **Lacuna:** `actionlint` não está no PATH da estação; não rodou. Os scripts dos passos novos são comandos simples, sem expansão, e o `shellcheck` não tem o que apontar neles.
- **Guardas.** O diff não tem linha de guarda (`if`, `||`, `&&`, `exit`): sem mutante a declarar.
- **Regras do `praticas.md`.** Nenhuma regra "decidida por" alcança `.github/` ou os documentos do diff.
- **Suíte e CI.** Sem PR para a branch, a suíte inteira fica para o CI do PR; não afirmo CI verde neste head. O brief não traz PQ do autor para citar.
- **Pipeline e segurança.** Ficam com os pareceres do `devops-engineer` (`docs/devops/105-k405-ci-passos.md`) e do `security-engineer` (`docs/security/105-k405-ci-passos.md`); não os refaço. Lembrete para o PR: `ci.yml` e `homolog.yml` são arquivos protegidos e pedem o rótulo `afrouxa-regra` do dono, como o próprio diagnóstico registra.

## Estimativa contra os tetos (risco aceito, a acompanhar)
Os passos agora rodam em sequência. Medido nos runs, antes da mudança:
- `ci.yml`, job `testes`, teto 25 min (run 44133668763, verde): cobertura em paralelo 13 min 36 s, com mock e metricas 2 min 11 s, depois server (638 s) e web (672 s) juntos; o resto do job, 1 min 26 s. No pior caso, sem nenhum ganho da separação, a sequência daria 2:11 + 10:39 + 11:12 + 1:26, uns 25 min 28 s, acima do teto. Com o ganho que o diagnóstico espera (web entre 350 e 450 s sozinho, e o server também mais rápido sem o web disputando CPU), fica entre 16 e 19 min.
- `homolog.yml`, job `qualidade`, teto 20 min (run 44068550681, verde): cobertura em paralelo 8 min 47 s, resto do job 2 min 45 s. Em sequência, o pior caso fica perto de 18 a 20 min.

O passo 1 existe justamente para medir isso, e a proposta do diagnóstico (passo 2a) já admite o risco. Ainda não há defeito provado, por isso os achados abaixo são recomendados.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:42 · teto 25 min: em sequência, sem ganho da separação, o pior caso dá uns 25 min 28 s (run 44133668763). Acompanhar o primeiro run; se `testes` passar de 20 min, aplicar o 2b ou subir o teto, com parecer do devops, antes de mesclar.
- A2 (recomendado) .github/workflows/homolog.yml:69 · `qualidade` tem teto de 20 min, com cobertura em paralelo de 8 min 47 s e resto de 2 min 45 s (run 44068550681); em sequência pode chegar a 18 ou 20 min. Conferir o tempo no primeiro portão de homolog depois do merge.
- A3 (recomendado) .github/workflows/ci.yml:53 · o comentário E7.541 (folga de 15 s) ficou acima de "Medir o runner", longe do `env` que explica, no passo "Cobertura do web" (linha 63). Mover o comentário para cima da linha 63; o mesmo vale em homolog.yml:78 e :88.
- A4 (recomendado) docs/devops/105-k405-diagnostico.md:3 · "Nada de código, workflow ou configuração foi mudado" vale para a E7.545, mas a mesma branch muda os workflows. Escrever "nesta etapa (E7.545)" para o documento não se contradizer depois do squash.

## Sondas

## Parecer
**Aprovado.** O diff faz o que os passos 1 e 2a da proposta pedem e nada além: mede o runner (`nproc`, `free -m`, `uptime`), roda primeiro todos os pacotes menos o web e depois o web sozinho com `time`. O filtro foi conferido por execução: pega os 8 pacotes e deixa só o web de fora. A espera de 15 s fica onde é lida, e o resumo e o artefato de cobertura continuam íntegros. Os quatro achados são recomendados: dois são o risco de tempo nos tetos, que o primeiro run mede (A1, A2), e dois são de legibilidade (A3, A4). Nenhum deles bloqueia.
