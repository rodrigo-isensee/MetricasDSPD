Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9a-sem-zero   Base: develop   Base-sha: d2ec79d1cddddf1b43931654200f2fa187f10075
Etapa: codigo   Cobre: E1.10

## Objetivo
Parecer e assinatura do tech-lead na proposta de aceite na v1 do contrato do lote L9-a, antes do código (pedido 069, E1.10, K-220). Arquivo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md`, sem commit; a branch `feature/069-l9a-sem-zero` ainda não existe.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md` (a proposta inteira).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/contratos/politica-de-mudanca.md` (seções 1 e 2).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L9-a").

## Entregar
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." (E1.10)
- (E4) (E1.10) Conferir a proposta contra a política e o desenho, incluindo a decisão técnica de os ids das duas notas novas ficarem num enum só da sustentação; preencher pela ferramenta Edit o espaço da assinatura do tech-lead em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md` com o parecer (aceito, aceito com ressalvas ou recusado), a data e os motivos; sem commit.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): o L9-a segue o princípio dela (sem dado real, não publica número)
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 21:51: E1.9 cumprida pelo software-architect: docs/analises/069-l9a-contrato.md, sem commit (S3 ajustesManuais number para number ou null, incompatível, aceite na v1; notas opcional novo no S3 e no S2, compatível; único consumidor CartaoS3.tsx do mesmo commit; S3.md e openapi.json atualizados no PR do lote). PERGUNTA técnica do arquiteto: os ids das duas notas novas entram no enum único NOTA_CARTAO_IDS (muda também O1, O2 e O3, três aceites a mais) ou num enum só da sustentação (muda só S3 e S2)? DECISÃO TÉCNICA (Jarvis): enum só da sustentação, para a mudança incompatível ficar restrita ao S3 (menor superfície, sem aceite novo em O1 a O3); etapa E1.10 aberta para o tech-lead dar o parecer e assinar a proposta antes do código. MELHORIA: a política de contratos ainda não tem a coluna "aceite na v1 permitido quando" (cartão proposto no 065 e não feito).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Decisão nova que nem o desenho nem a política tomaram vira pergunta no relatório, nunca texto na assinatura.
- NÃO tocar: outros arquivos (a política de contratos, o snapshot `docs/contratos/snapshots/aceitas.json` e o desenho inclusive), o texto da proposta fora do espaço da assinatura, o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md` contém 'tech-lead' e o parecer preenchido no espaço da assinatura

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).