Agente destino: forge:tech-lead
Pedido: docs/pedidos/040-banco-local-no-computador-novo.md
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 306cf6ef29db7bbae2509194406e0b7fcc6ab232

## Objetivo
Instalar as dependências do projeto neste computador novo (E4), que o hook de conformidade reservou ao tech-lead, para destravar o banco local (pedido 040, prioridade do dono) e o pre-push das branches. Etapa E1.2 do pedido 040, cartão K-136. Repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD` (branch atual `docs/jarvis-2026-10-20-noite`, do Jarvis): não troque de branch nem commite; é ambiente, sem commit.

## Ler
- `docs/pedidos/040-banco-local-no-computador-novo.md`, seções "Diagnóstico", "Etapas" e "Andamento".

## Entregar
- (E4) Com o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` na frente (lá estão o node v24.22.1 e o pnpm 10.34.6, já baixado pelo corepack), rodar `pnpm install --frozen-lockfile` na raiz do repositório principal. Lockfile divergente ou erro de instalação: pare e relate, sem mudar `package.json` nem `pnpm-lock.yaml`.
- (E4) Instalar também na worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-025` (`pnpm install --frozen-lockfile`), que é preciso para o pre-push dela; nada de push nesta delegação.
- (E4) Relatar se `pnpm` aparece num shell interativo novo (`bash -ic 'command -v pnpm'`) e, se não aparecer, a linha exata para o dono pôr no `~/.bashrc`, sem editar o arquivo.

## Fora do escopo
- "E3.1 (dono): `cp .env.example .env` na raiz (E3), como manda o README; o hook não deixa agente tocar no `.env`." · etapa do dono.
- "E0.1 (dono): instalar o Docker neste computador (precisa de sudo ou de instalador do Windows), conforme a decisão sobre a forma de instalação." · etapa do dono.
- "E1.3 (forge:devops-engineer): E1 (db:up e db:migrate), depois do E0.1, do E3.1 e do E1.2." e "E2.1 (forge:devops-engineer): E2 (db:seed e a consulta de prova), junto com o E1.3." · etapas de outro papel, depois desta.
- "E1.1 (forge:devops-engineer): E3, E4, E1 e E2, com o relatório do que ficou de pé (banco no ar, migrações aplicadas, seed carregado, consulta de prova). Feita em parte: pnpm 10.34.6 ok; E3 e E4 barrados pelo hook (ver Andamento)." · etapa de outro papel, cumprida em parte.
- Push do 025 e qualquer commit, PR ou arquivo versionado; o `.env`; sudo ou pacote do sistema; o banco.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "troquei de computador, talvez o banco dedados nao exista verifique e refaca a criacao e dos dados tambem".
- DECISÃO DO DONO (2026-10-22): prioridade, "coloque essa questao de banco na frente da fila": o 040 passa à frente de 025 e 037. O tech-lead-6 do 025 (git, sem banco nem pnpm) já tinha sido disparado e segue em paralelo, porque não disputa recurso com o 040.
- DECISÃO DO DONO (2026-10-22): recibo aceito ("ok no recibo").
- DECISÃO DO DONO (2026-10-22): Docker, opção A ("decisao A"): Docker Engine dentro do WSL, instalado pelo dono com sudo (E0.1).
- R-TETO: as duas instalações uma depois da outra, não em paralelo. R-VERIFY e R-CONFORMIDADE: bloqueio não se contorna, vira relato.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/node_modules/.modules.yaml`
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD-025/node_modules/.modules.yaml`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD status --porcelain -- package.json pnpm-lock.yaml` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
