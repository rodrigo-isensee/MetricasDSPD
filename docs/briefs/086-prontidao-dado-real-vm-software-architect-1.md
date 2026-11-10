Agente destino: forge:software-architect
Pedido: 086-prontidao-dado-real-vm
Tipo: codigo
Etapa: codigo   Cobre: E1.1

## Objetivo
Inventário só de leitura para o dono (pedido 086): o que falta para os painéis Operacional (fluxo, BusinessMap), Sustentação (Acelerato) e a aba Apontamento ficarem prontos com dado real, antes da migração para a VM oficial.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` (o mapa das lacunas) e, da develop atual, `packages/contratos/src/origem.ts` (`METRICAS_ORIGEM_REAL` e `METRICAS_SEM_SIMULACAO`).
- Dos pedidos `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/064-lacunas-dado-real.md`, `069-lacunas-alta.md`, `075-bloqueios-reais.md` e `077-tendencias-dado-real.md`: só `## Escopo` e as últimas linhas do `## Histórico` de cada um.
- Em `/home/rodrigoisensee/Metricas/MetricasDSPD/KANBAN.md`: os cartões K-200, K-207, K-212 a K-215, K-231 e K-234.
- PRs abertos: `gh pr list --repo rodrigo-isensee/MetricasDSPD --state open` (`api.github.com` em allowed_domains, se o agente tiver Bash; senão, os PRs 279 (077 Lote 5), 280 (085) e o do Forge 0.45.2, e a branch `feature/077-l7-sust-real` (Lote 7, sem PR)).

## Entregar
- "E1.1 (software-architect): inventário só de leitura, em docs/analises/086-prontidao-dado-real-vm.md, sem commit." (E1.1)
- (E1) (E1.1) Escrever pela ferramenta Write `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/086-prontidao-dado-real-vm.md`, curto e em linguagem simples para o dono: uma tabela por painel (Operacional, Sustentação/Acelerato, Apontamento) com cada métrica ou bloco e o estado (dado real na develop; em PR aberto; lote pendente do time; preso), e, para cada item não pronto, o que trava (decisão do dono, pessoas/WS1, dado da fonte, governança) e o próximo passo; depois, a lista curta do que a migração para a VM exige do projeto (coleta agendada, variáveis de ambiente, banco, publicação), sem ler `.env*`; por fim, a ordem recomendada. Cada afirmação com a fonte (arquivo e linha, ou PR). Sem commit.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 086-prontidao-dado-real-vm até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/086-prontidao-dado-real-vm.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- (o pedido não tem outra etapa)
- "Implementar qualquer lacuna; mexer na VM ou no banco real" · fora do escopo do pedido; nada nesta delegação

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/086-prontidao-dado-real-vm.md`
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
