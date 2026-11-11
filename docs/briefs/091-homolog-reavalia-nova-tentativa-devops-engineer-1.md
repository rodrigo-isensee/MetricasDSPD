Agente destino: forge:devops-engineer
Pedido: 091-homolog-reavalia-nova-tentativa
Tipo: codigo
Branch: fix/k263-reavalia-espera   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E1.1

## Objetivo
K-263: a reavaliação do check `homolog-aprovada` falhou 12 s depois de o portão da homolog terminar verde (release 090, run 42970095292, tentativa 2), porque a consulta (`execucoes`/`jobsComSucesso` em `tools/homolog/src/aprovacao.ts`) ainda não enxergava o sucesso; a tentativa 3, sem mudança, passou. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `fix/k263-reavalia-espera` (a partir da develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/tools/homolog/src/aprovacao.ts` e `/home/rodrigoisensee/MetricasDSPD-056/tools/homolog/src/aprovacao.test.ts`.
- `/home/rodrigoisensee/MetricasDSPD-056/.github/workflows/homolog-reavalia.yml` e `/home/rodrigoisensee/MetricasDSPD-056/.github/workflows/homolog-aprovada.yml`.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/engineering/fluxo-homologacao.md`, seção do check `homolog-aprovada`.

## Entregar
- "E1.1 (devops-engineer): implementação em `tools/homolog/src/aprovacao.ts` e, se preciso, `.github/workflows/homolog-reavalia.yml` ou `homolog-aprovada.yml`, com teste em `tools/homolog/src/aprovacao.test.ts` e parecer de devops em docs/devops/, na branch fix/k263-reavalia-espera, worktree /home/rodrigoisensee/MetricasDSPD-056." (E1.1)
- (E1) (E2) (E1.1) Quando a avaliação conclui "portão sem sucesso" para o candidato, tentar de novo algumas vezes por cerca de 60 s no total antes de falhar, só nesse caso; a regra não muda (candidato = ponta da homolog, portão verde nesse sha); portão de fato vermelho ou ausente continua falhando. Testes com o cliente da API simulado (sem rede), vermelho antes do verde: falha transitória que vira verde na segunda consulta passa; portão vermelho falha depois das tentativas; o tempo de espera é injetável para o teste não dormir. Rodar só os testes de `tools/homolog` com no máximo 2 workers e o `pnpm run pronto` da raiz da worktree. Parecer `docs/devops/091-homolog-reavalia.md` (novo) pela ferramenta Write. Commits com `Cartão: K-263` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos caminhos); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k263-reavalia-espera` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Se precisar de arquivo fora da lista, pare e relate antes.
- arquivos: tools/homolog/src/aprovacao.ts, tools/homolog/src/aprovacao.test.ts, .github/workflows/homolog-reavalia.yml, .github/workflows/homolog-aprovada.yml, docs/devops/091-homolog-reavalia.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 091-homolog-reavalia-nova-tentativa até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/091-homolog-reavalia-nova-tentativa.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-056`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/fix/k263-reavalia-espera` · espera: contém 'Cartão: K-263'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
