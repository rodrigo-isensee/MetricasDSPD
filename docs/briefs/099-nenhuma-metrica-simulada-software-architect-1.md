Agente destino: forge:software-architect
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
O dono quer que nenhuma métrica da web mostre dado simulado, fictício, de mock ou inventado fora do modo homologação. Varredura completa, com a lista para o dono e a proposta por item. Código de referência (só leitura): a develop em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo` (a mesma versão que o dono usa na demo).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/099-nenhuma-metrica-simulada.md`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-demo/docs/architecture/adr/0026-metricas-so-com-dado-real.md`, se existir; senão, a ADR de mesmo tema em `docs/architecture/adr/`.
- Pontos já vistos: `web/src/data/FonteComSimulado.ts`, `web/src/data/simulado.ts`, `web/src/data/simulacao.ts`, `web/src/components/ui/Ficticios.tsx`, `packages/contratos/src/comum.ts:48` (TIPOS_FILTRO fixo) e `packages/contratos/src/filtros.ts:12` (times fixos da sustentação).

## Entregar
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." (E1.1)
- (E1) (E2) (E3) (E1.1) Análise `docs/analises/099-varredura-simulado.md` (novo), pela ferramenta Write, no repositório principal, começando pela aba Operacional (onde o dono viu o problema) e depois o resto da web: tabela com cada ponto (arquivo e linha, aba e cartão onde aparece, o que é simulado, se aparece fora do modo homologação, e a proposta: dado real, "sem dado real" ou sair da tela); o que já é tratado pelos pedidos 097 e 098 marcado como tal; a guarda contra regressão (teste ou checagem de build que falha se a web de produção importar mock ou mostrar número fixo); lotes de até 150 linhas; perguntas ao dono só onde houver escolha de produto (esconder ou mostrar "sem dado"), cada uma com recomendação. Sem ler a base real nem `.env`. Sem commit.
- arquivos: docs/analises/099-varredura-simulado.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0026
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- (o pedido não tem outra etapa)

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md` · espera: existe e tem a tabela de pontos
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
