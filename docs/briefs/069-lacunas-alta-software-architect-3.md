Agente destino: forge:software-architect
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2-campos   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: codigo   Cobre: E1.1

## Objetivo
Incorporar ao desenho do 069 os quatro achados bloqueantes do modelo de ameaças (A1 e A2 do L9-b, A3 e A4 do L2-a), antes desses lotes (pedido 069, E1.1, K-220). Arquivo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md`, sem commit.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/069-modelo-ameacas.md` (achados A1 a A4 e os casos de abuso).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seções "Lote L2-a" e "Lote L9-b").

## Entregar
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." (E1.1)
- (E3, E4) (E1.1) Editar `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` nas seções dos lotes L2-a e L9-b para trazer as condições A1 a A4 do modelo de ameaças como parte do lote (onde muda e testes), e citar o modelo na seção "Gatilhos de segurança"; se discordar de algum achado, não edite a parte dele e relate o motivo; sem commit.
- (E1, E2, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- ADR 0027 (citada no pedido): decide o calendário do L7; não muda nesta entrega, que trata só dos lotes L2-a e L9-b
- ADR 0025 (citada no pedido): citada no pedido só como molde de forma da ADR 0027; não muda nesta entrega
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 20:11: Modelo de ameaças da E1.8 escrito pelo security-engineer em docs/security/069-modelo-ameacas.md (sem commit): L2-a, L2-c e L9-b seguem com condição; bloqueantes antes do código: A3 (L2-a: lista fechada dos tipos de campo aceitos), A4 (L2-a: a remoção dos fields 36 e 42 continua depois da leitura do banco, com teste), A1 (L9-b: os nomes de campo da Q4 numa constante no código, como a S8, e não lidos do ref_dominio), A2 (L9-b: valor ou só "preenchido" decidido pelo nome no SELECT, não pelo tipo que a fonte informa); recomendados A5 a A8; nenhum GRANT novo. DECISÃO TÉCNICA (Jarvis): o software-architect incorpora A1 a A4 ao desenho antes dos lotes L2-a e L9-b.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Decisão nova que nem o desenho nem o modelo tomaram vira pergunta no relatório, nunca texto no desenho.
- NÃO tocar: outros arquivos (o modelo de ameaças inclusive), o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` contém '069-modelo-ameacas'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).