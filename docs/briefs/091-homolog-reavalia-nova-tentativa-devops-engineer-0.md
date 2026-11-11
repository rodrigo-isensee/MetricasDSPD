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

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-056`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/fix/k263-reavalia-espera` · espera: contém 'Cartão: K-263'
