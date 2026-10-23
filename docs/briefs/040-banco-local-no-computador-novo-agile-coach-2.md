Agente destino: forge:agile-coach
Pedido: 040-banco-local-no-computador-novo
Tipo: volta
Branch: docs/jarvis-2026-10-20-noite   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76
Volta-de: docs/briefs/040-banco-local-no-computador-novo-agile-coach-1.md sha256 75ab91369b065f345ed604b46874e64df9f622fdbbde6df5a8388cc569ca7c12

## Objetivo
Retrospectiva do pedido 040 (banco local no computador novo), etapa R.1, cartão K-136. O pedido tropeçou em ambiente: faltavam Docker, `.env`, pnpm e o grupo `docker`, e o hook barrou papéis. O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, branch `docs/jarvis-2026-10-20-noite` (do Jarvis); não troque de branch.

## Ler
- `docs/pedidos/040-banco-local-no-computador-novo.md` inteiro (é curto).
- `docs/kanban/historico.md`, linhas do K-136 e do K-110 de 2026-10-22.
- `docs/kanban/conferencias.md`, linhas do 040.
- `docs/retrospectivas/2026-10-20-036-estrategicas-pendentes.md`, só como modelo de forma; a seção "1. Dados do fluxo" registra que o mesmo `libnspr4` já tinha travado o K-118 no computador anterior.

## Entregar (volta 1)
- Escopo da entrega original, já conferido e inalterado; esta volta só corrige os achados abaixo (E1, E2, E3, E4).
- (E1) Achado da conferência de entrega de 2026-10-22 21:31 (fatos): na §2 de `docs/retrospectivas/2026-10-22-040-banco-local.md`, as contagens passam a bater com `docs/kanban/conferencias.md`: 6 rodadas de brief do 040 e 1 de entrega; 2 reprovadas em 6 (33%); aprovadas de primeira, 2. Recontar a partir das linhas do 040 no arquivo, sem estimar.
- (E1) Achado da mesma conferência (decisões): a §2 não lista rodadas por instância de agente (devops-1, tech-lead-1 e as outras), com o resultado de cada uma; ela agrega por classe de causa (forma, escopo, ambiente), no formato da retrospectiva do 036, "Métricas de processo, nunca de pessoa ou de agente individual".
- (E1) Gravar com Write ou Edit, nunca por Bash; um commit só da retrospectiva, `git add` explícito por caminho, linha `Cartão: K-136`; sem push. As linhas `MELHORIA:` continuam 5, sem mudar o mérito.

## Fora do escopo
- "E0.1 (dono): instalar o Docker neste computador (precisa de sudo ou de instalador do Windows), conforme a decisão sobre a forma de instalação." e "E3.1 (dono): `cp .env.example .env` na raiz (E3), como manda o README; o hook não deixa agente tocar no `.env`." · etapas do dono, cumpridas.
- "E1.1 (forge:devops-engineer): E3, E4, E1 e E2, com o relatório do que ficou de pé (banco no ar, migrações aplicadas, seed carregado, consulta de prova). Feita em parte: pnpm 10.34.6 ok; E3 e E4 barrados pelo hook (ver Andamento).", "E1.3 (forge:devops-engineer): E1 (db:up e db:migrate), depois do E0.1, do E3.1 e do E4.1 (ex-E1.2)." e "E2.1 (forge:devops-engineer): E2 (db:seed e a consulta de prova), junto com o E1.3." · etapas de outro papel, cumpridas.
- "E4.1 (forge:tech-lead): `pnpm install --frozen-lockfile` na raiz (E4); o hook atribui `pnpm install` a dev, qa e tech-lead." · etapa de outro papel, cumprida.
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os pedidos 025, 037 e 041; push.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "troquei de computador, talvez o banco dedados nao exista verifique e refaca a criacao e dos dados tambem".
- DECISÃO DO DONO (2026-10-22): prioridade, "coloque essa questao de banco na frente da fila": o 040 passa à frente de 025 e 037. O tech-lead-6 do 025 (git, sem banco nem pnpm) já tinha sido disparado e segue em paralelo, porque não disputa recurso com o 040.
- DECISÃO DO DONO (2026-10-22): recibo aceito ("ok no recibo").
- DECISÃO DO DONO (2026-10-22): Docker, opção A ("decisao A"): Docker Engine dentro do WSL, instalado pelo dono com sudo (E0.1).
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md).

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-22-040-banco-local.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-22-040-banco-local.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-22-040-banco-local.md` · espera: o sha40 do commit da retrospectiva

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
