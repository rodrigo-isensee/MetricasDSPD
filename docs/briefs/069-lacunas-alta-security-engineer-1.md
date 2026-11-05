Agente destino: forge:security-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2-campos   Base: develop   Base-sha: 939e091725f880bf57cdf1d0ef7753b0f7c0a02e
Etapa: codigo   Cobre: E1.8

## Objetivo
Modelo de ameaças dos lotes do 069 com gatilho de segurança (L2-a, L2-c e L9-b), antes da implementação deles (pedido 069, E1.8, K-220). Arquivo novo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/069-modelo-ameacas.md`; a branch `feature/069-l2-campos` ainda não existe e é criada pelo primeiro desses lotes, que leva o arquivo.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seções "Gatilhos de segurança", "Lote L2-a", "Lote L2-c", "Lote L9-b" e "Perguntas e decisões em aberto").
- `/home/rodrigoisensee/Metricas/MetricasDSPD/CLAUDE.md` (seção "Regras invioláveis", parte de credenciais, allow-list do Acelerato e GRANT por coluna).

## Entregar
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." (E1.8)
- (E3, E4) (E1.8) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/069-modelo-ameacas.md` pela ferramenta Write: para cada lote (L2-a, L2-c, L9-b), ativos, fronteiras, ameaças (dado de pessoa e texto livre chegando ao staging, campo novo fora da allow-list, papel com GRANT a mais, segredo em arquivo versionado, entrada não confiável do arquivo de mapa), controles exigidos e os testes de segurança que o lote deve trazer; veredito por lote (pode seguir, segue com condição, bloqueia) e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); sem commit e sem tocar código.
- (E1, E2, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- ADR 0027 (citada no pedido): não se aplica (L7)
- ADR 0025 (citada no pedido): não se aplica
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 20:03: DECISÃO TÉCNICA (Jarvis): etapa nova E1.8 (security-engineer): o desenho lista gatilhos de segurança em L2-a, L2-c e L9-b; o modelo de ameaças desses lotes sai agora, em paralelo ao M1-a, como arquivo novo docs/security/069-modelo-ameacas.md no clone principal, sem commit, até a branch do primeiro desses lotes levá-lo.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não consulta bases.
- Só leitura e o arquivo do modelo; decisão nova que o desenho não tomou vira pergunta no relatório.
- O pre-push e o forge-check docs barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- NÃO tocar: código, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/069-modelo-ameacas.md` existe e contém 'L9-b'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).