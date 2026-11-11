Agente destino: forge:node-backend
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k174-docs-contratos-carga   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E3.1

## Objetivo
K-174: o teste "as páginas geradas coincidem com o código" de `tools/docs-contratos/src/insumos.test.ts` estoura o timeout padrão de 5 s quando o `pnpm run pronto` roda sob carga (passa isolado em cerca de 2,4 s) e derruba o pronto. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `fix/k174-docs-contratos-carga` (a partir da develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/tools/docs-contratos/src/insumos.test.ts` e o código que ele exercita.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-28-026-lote3.md`, item G.

## Entregar
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E3.1)
- (E3) (E3.1) Medir onde o teste gasta o tempo e torná-lo mais barato sem aumentar timeout, sem retry e sem afrouxar o que ele prova (todas as páginas geradas continuam comparadas com o código): por exemplo, gerar uma vez por arquivo de teste em vez de por caso, ou ler do sistema de arquivos só uma vez. Prova: tempo do teste isolado antes e depois, e o teste verde com a máquina carregada pela própria suíte do pacote. Rodar só os testes de `tools/docs-contratos` com no máximo 2 workers e o `pnpm run pronto` da raiz da worktree, sozinho na máquina; falhas dos testes de CLI do `server` por ENOENT na pasta temporária do tsx são do sandbox (K-264) e vão ao relatório, a suíte completa fica com o CI do PR. Commit com `Cartão: K-174` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k174-docs-contratos-carga` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Se precisar mudar o código de produção do gerador, pare e relate antes.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: tools/docs-contratos/src/insumos.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-121, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review de cada branch." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T). - E1.3, E2.3 e" · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR de cada branch para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-052g/tools/docs-contratos test` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log -1 --format=%B origin/fix/k174-docs-contratos-carga` · espera: contém 'Cartão: K-174'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
