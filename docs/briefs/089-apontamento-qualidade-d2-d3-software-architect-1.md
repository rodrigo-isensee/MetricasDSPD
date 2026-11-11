Agente destino: forge:software-architect
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: codigo
Branch: feature/089-apontamento-d2-d3   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.1

## Objetivo
Plano curto (pedido 089, E1.1) para aplicar as respostas do dono às dúvidas D2 e D3 do K-213: `execucao-tecnica` deixa de contar em `sem-vinculo` (só `nao-classificado` continua como falha de qualidade) e aparece à parte como insumo para ampliar o dicionário, com versão de critério com data marcada nos gráficos (T2.6); e o rótulo "Não classificado" vira "Sem comentário". Ler o código da develop (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, em origin/develop, só leitura). Sem rodar nada contra a base real e sem commit.

## Ler
- `docs/analises/087-k213-qualidade-apontamento.md` (seções 3 a 5).
- Na worktree: `packages/metricas/src/businessmap/apontamento/`, `server/src/modulos/apontamento/servico.ts`, o cálculo e a gravação de `flags_qualidade` no servidor e `web/src/features/apontamento/`.

## Entregar
- "E1.1 (software-architect): plano curto: onde a flag é calculada e gravada, como a versão de critério entra (ref_versao_criterio, T2.6), o que acontece com os apontamentos já gravados (nunca sobrescrever histórico), o impacto na tela e no achado; sem commit, parecer em docs/analises/." (E1.1)
- (E1) (E2) (E1.1) Parecer em `docs/analises/089-plano-apontamento-d2-d3.md` (novo), sem commit: arquivo:linha de cada ponto a mudar; como a versão de critério entra e como fica o dado já gravado (recalcular na leitura ou na carga, sem sobrescrever histórico); o que muda no achado `nao-classificado-alto`; a divisão de trabalho entre node-backend e react-frontend (arquivos de cada um, sem arquivo em comum); e qualquer dúvida de regra de negócio como pergunta ao dono com uma recomendação (sem decidir por inferência).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 089-apontamento-qualidade-d2-d3 até f41b6b2d55fc20ad4885a765956393cb17dd2f5bbfc4c919a2f78c5b175bf5e6 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/089-apontamento-qualidade-d2-d3.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (node-backend): implementação de E1 e da parte de E2 no servidor e na biblioteca de métricas, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): parte de tela de E1 e E2, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA;" · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/089-plano-apontamento-d2-d3.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
