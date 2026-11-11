Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k174-insumos-carga   Base: develop   Base-sha: d8d52103c20837fce3ece3d5bed5f6c68c88c8a2
Etapa: codigo   Cobre: E3.2

## Objetivo
Review do lote 1 do K-174: branch `fix/k174-insumos-carga`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, commit e722029a (base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2). Mudança na biblioteca compartilhada de tempo (T2.5): feriados em número de dia e cópia do `Set` em `criarCalendario`, com teste de equivalência bit a bit contra o código antigo. Tempo a frio do `carregarInsumos` caiu 34% (1524 para 1004 ms, mediana de 10); `hash-base-mock --comparar` igual; cobertura 100%; pronto verde pelo autor.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff d8d52103c20837fce3ece3d5bed5f6c68c88c8a2 e722029a`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md`, lote 1 e prova.

## Entregar
- "E3.2 (tech-lead): review do K-174." (E3.2)
- (E3) (E3.2) Review: nenhum resultado da biblioteca muda (o teste de equivalência cobre datas, turnos, calendários estranhos, NaN e fuso, com `Object.is`); a cópia do `Set` não deixa o calendário mudar por fora; o `WeakMap` não vaza memória nem fica velho se o `Set` mudar; o servidor só ganha; o diff passa do teto de 150 linhas por causa do teste (declarar no PR). Rodar os testes de `packages/metricas` com no máximo 2 workers (R-TETO). Parecer `docs/reviews/092-k174-calendario.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k174-insumos-carga`, `commit:` o sha40 de e722029a e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-174` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/fix/k174-insumos-carga` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E5) (E6) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k174-calendario.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-121." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): K-121, frontmatter em docs/reviews/front-via-api.md, na mesma branch, depois da E1.1." · etapa de outra delegação; continua no pedido
- "E1.5 (software-architect): K-121, frontmatter em docs/architecture/features/front-via-api.md, na mesma branch (o tech-lead leva o arquivo ao commit)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-172." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-insumos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052c (primeira tentativa em fix/k174-docs-contratos-carga, 052g, sem PR)." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): plano do K-174: tornar mais barato o cálculo de tempo da biblioteca compartilhada (packages/metricas/src/core/calendario.ts: horasUteisEntre, diaDeIso, ehDiaUtil) e o gerarBaseMock, sem mudar nenhum resultado, com o efeito no servidor e a forma de provar; só leitura, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review e envio das retrospectivas do 091 e do 092 (worktree 052g, branch docs/retros-2026-11-11b): parecer de review, commit, push e PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.1 (react-frontend): K-268, teste intermitente de simulado.test.tsx, na branch fix/k268-simulado-intermitente, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-268." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-268." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-268; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/fix/k174-insumos-carga:docs/reviews/092-k174-calendario.md` · espera: contém 'branch: fix/k174-insumos-carga'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
