Agente destino: forge:software-architect
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: codigo   Cobre: E1.1

## Objetivo
Registrar em ADR as decisões do L7 que o desenho já tomou, antes do lote L7-a (pedido 069, E1.1, K-220). Arquivo novo em `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0027-calendario-por-dominio.md`; a branch `feature/069-l7-calendario` ainda não existe e é criada pelo node-backend do L7-a, que leva o arquivo.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "E5 · L7: calendário e feriados", até "Fica para as pessoas e para o dono (E5)").
- Uma ADR recente como molde de forma: `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0025-coleta-do-worklog-businessmap.md` (só o cabeçalho e as seções).

## Entregar
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." (E1.1)
- (E5) (E1.1) Escrever `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0027-calendario-por-dominio.md` pela ferramenta Write, na forma das ADRs do projeto, com status proposto, contexto (tabelas vazias, calendário sem feriado na aba, feriados só no código até 2026-12-25), decisão (um calendário por domínio, arquivo inicial com os feriados nacionais 2025-2026 do código, carregador versionado com versão de critério por domínio, turnos fora, etapas sintéticas do Acelerato fora como pendência), alternativas descartadas, consequências e critério de reversão, tudo como está no desenho, sem decisão nova; sem commit.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- ADR 0027 (citada no pedido): é o arquivo que esta entrega escreve, com as decisões do L7 do desenho
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 19:05: DECISÃO TÉCNICA (Jarvis): as decisões do L7 no desenho (um calendário por domínio, arquivo inicial com os feriados nacionais 2025-2026 do código, turnos e etapas sintéticas do Acelerato fora) viram a ADR 0027 pelo software-architect na worktree MetricasDSPD-052d (arquivo novo, sem commit), antes do L7-a; o node-backend do L7-a leva o arquivo para a branch do lote e commita junto. O número 0026 está reservado ao pedido 060.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Decisão nova que o desenho não tomou vira pergunta no relatório, nunca texto na ADR.
- NÃO tocar: outros arquivos, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0027-calendario-por-dominio.md` existe e contém 'calendário por domínio'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).