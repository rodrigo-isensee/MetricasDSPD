Agente destino: forge:software-architect
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: develop   Base: develop   Base-sha: d2ec79d1cddddf1b43931654200f2fa187f10075
Etapa: codigo   Cobre: E1.1

## Objetivo
Desenho de como cada cartão de métrica escolhe entre dado real e dado simulado, e a ADR 0028 que revê a ADR 0026 sem apagá-la (pedido 070, E1.1, K-221). Arquivos novos, sem commit.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/070-simulado-por-cartao.md` (Escopo, Fora do escopo e a linha DECISÃO DO DONO).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md` (como o mock calcula hoje).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` (quais métricas estão sem dado real).
- `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/adr/0026-metricas-so-com-dado-real.md` (a ADR 0026; está só nessa worktree, sem commit, e não na develop).

## Entregar
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." (E1.1)
- (E1) (E2) (E1.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/070-desenho.md` pela ferramenta Write: a lista das métricas sem dado real hoje (por id do catálogo, BusinessMap e Acelerato separados), de onde vem o dado simulado (o gerador do mock que já existe), como o cartão decide real ou simulado (a regra, por cartão, sem misturar real e simulado no mesmo gráfico ou número), o contrato da API (o que a resposta diz para o cartão saber que é simulado), os testes, a divisão em lotes para node-backend e react-frontend e se há gatilho de segurança; sem commit.
- (E2) (E1.1) Escrever a ADR nova `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0028-simulado-por-cartao.md` pela ferramenta Write, com status proposta, que revê a ADR 0026 citando-a, sem editar nem apagar o texto da 0026; sem commit.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): web só com dado real; a ADR 0028 a revê sem apagá-la
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 21:38: pedido aberto com a decisão do dono acima (recibo confirmado com "Sim"). DECISÃO TÉCNICA (Jarvis): discovery em paralelo, software-architect (E1.1, desenho e ADR nova, a 0027 é do calendário do 069, então a próxima livre é a 0028) e ux-designer (E1.2, selo e protótipo); sem gatilho de segurança à primeira vista (sem dado de pessoa, sem credencial; o arquiteto confirma).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não consulta a base real nem as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual (nem simulada), BusinessMap e Acelerato nunca se misturam, todo cálculo pela biblioteca compartilhada.
- Dúvida de regra de negócio vira pergunta no relatório, nunca decisão no desenho.
- NÃO tocar: código, testes, a ADR 0026, outras ADRs, o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/070-desenho.md` existe e contém 'contrato'
- PQ-2 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0028-simulado-por-cartao.md` existe e contém '0026'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).