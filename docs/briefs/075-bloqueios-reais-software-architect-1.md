Agente destino: forge:software-architect
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Desenho do discovery do pedido 075 (K-204): a coleta do BusinessMap passa a gravar os bloqueios reais (fato_bloqueio e evt_bloqueio a partir do block_reason que já chega ao staging), para a tela de bloqueados e o O5 saírem do "sem dado real" (pedido 075, E1.1). Leitura no checkout da develop em `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD f21220fe, sem branch).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/075-bloqueios-reais.md` (Escopo, Etapas, Fora do escopo).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md`: só as linhas da L1 (bloqueios) e da conferência dela.
- Na 056d: a allow-list e o staging do BusinessMap (`server/src/modulos/businessmap/allow-list.ts`, a coleta e o projetor), as tabelas `fato_bloqueio` e `evt_bloqueio` (migração que as cria e o seed que hoje as grava), o que o 065 fez para mostrar "sem dado real" (procure por `bloque` em `server/src/modulos/metricas/` e `web/src/`) e as seções do briefing sobre bloqueio (procure `bloque` em `docs/briefing-execucao-metricas.md`); só os trechos que a tarefa exige.

## Entregar
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." (E1.1)
- (E1) (E1.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-desenho.md` pela ferramenta Write, sem commit: o que a coleta já traz de bloqueio (campos, arquivo e linha) e o que falta pedir à API do BusinessMap (histórico de bloqueio e desbloqueio); como vira `fato_bloqueio` e `evt_bloqueio` (projeção, carga incremental que nunca sobrescreve histórico, cards arquivados); o que muda na tela e no O5 (sair do "sem dado real"; se a tela mudar, diga, para o UX entrar); versão de critério (T2.6) se o cálculo mudar; impacto em migração, testes e documentação; riscos; perguntas de regra de negócio ao dono (não decida por inferência). Até 100 linhas.
- (E2, E3) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO` própria; a origem é a decisão "C" do dono no pedido 064 (parte A no 065, parte B aqui).
- BusinessMap e Acelerato nunca se misturam; nenhuma métrica com cálculo próprio fora da biblioteca compartilhada (T2.5); abaixo de 20 itens não publica.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: outros arquivos (ADRs, código, testes, `CLAUDE.md`), as worktrees (só leitura na 056d), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-desenho.md` · o desenho existe e cita a coleta do BusinessMap com arquivo e linha

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
