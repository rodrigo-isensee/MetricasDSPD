Agente destino: forge:software-architect
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9a-sem-zero   Base: develop   Base-sha: d2ec79d1cddddf1b43931654200f2fa187f10075
Etapa: codigo   Cobre: E1.1

## Objetivo
Proposta de aceite na v1 da mudança de tipo do S3 (`ajustesManuais` de number para number ou null) do lote L9-a do 069, pela política de contratos, para o tech-lead assinar antes do código (pedido 069, E1.1, K-220). Arquivo novo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md`, sem commit; a branch `feature/069-l9a-sem-zero` ainda não existe.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L9-a").
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/contratos/politica-de-mudanca.md` (seções 1 e 2).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` (o molde: aceite na v1 do 065).

## Entregar
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." (E1.1)
- (E4) (E1.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md` pela ferramenta Write no molde de `065-decisao-contrato.md`: a mudança (S3 `ajustesManuais` vira anulável; `notas` opcional novo no S3 e no S2), a classificação pela política (incompatível e compatível), os consumidores (só o web do mesmo commit), a decisão proposta (aceite na v1, com a linha `contrato: incompatível (aceite na v1, ...)` no PR e a entrada em docs/contratos/snapshots/aceitas.json), os riscos e um espaço para a assinatura do tech-lead; sem commit.
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
- 2026-11-04 21:32: DECISÃO TÉCNICA (Jarvis): próxima versão com o L7-a (em volta), o L9-a e o L2-b; D-069-1 decidida: o L9-a entra no 069 (é o E4, L9, do escopo, e tira o zero falso do S3 e do S2 sem fonte nova); a mudança de tipo no contrato do L9-a vai primeiro ao software-architect, que escreve a proposta de aceite na v1 pela política de contratos (docs/contratos/politica-de-mudanca.md, aceite do arquiteto e do tech-lead) em docs/analises/069-l9a-contrato.md, sem commit; o L2-b começa depois do merge do L2-a; o L7-b depois do merge do L7-a; o L9-c espera a pergunta ao dono sobre campo repetido em várias etapas (A1 do review do L9-b).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Decisão nova que nem o desenho nem a política tomaram vira pergunta no relatório, nunca texto na proposta.
- NÃO tocar: outros arquivos (a política de contratos e o snapshot inclusive; esta entrega da E1.1 é só a proposta de contrato, e o desenho cumprido às 18:06 fica como está), o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

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
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md` existe e contém 'aceite na v1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).