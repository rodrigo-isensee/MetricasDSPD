Agente destino: forge:ux-designer
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: develop   Base: develop   Base-sha: d2ec79d1cddddf1b43931654200f2fa187f10075
Etapa: codigo   Cobre: E1.2

## Objetivo
Especificação do selo "Simulado" no cartão de métrica e do texto que explica o que ele quer dizer, com protótipo para o dono validar antes do código (pedido 070, E1.2, K-221). Arquivos novos em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/`, sem commit.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/070-simulado-por-cartao.md` (Escopo, Fora do escopo e a linha DECISÃO DO DONO).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/dashboard-metricas/especificacao.md` (só a anatomia do cartão de métrica e a nota de cada cartão).

## Entregar
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." (E1.2)
- (E1) (E3) (E1.2) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/especificacao.md` pela ferramenta Write: onde o selo fica no cartão, texto do selo e da explicação (curto, sem jargão), contraste e leitura por leitor de tela, como o cartão fica quando o dado real chega (o selo some), e o que nunca acontece (real e simulado no mesmo gráfico ou número, BusinessMap e Acelerato juntos); sem commit.
- (E3) (E1.2) Protótipo estático `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/prototipo.html` pela ferramenta Write com um cartão real e um cartão simulado lado a lado, para o dono validar; sem commit.
- (E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): web só com dado real; revista pela ADR 0028 do arquiteto
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 21:38: pedido aberto com a decisão do dono acima (recibo confirmado com "Sim"). DECISÃO TÉCNICA (Jarvis): discovery em paralelo, software-architect (E1.1, desenho e ADR nova, a 0027 é do calendário do 069, então a próxima livre é a 0028) e ux-designer (E1.2, selo e protótipo); sem gatilho de segurança à primeira vista (sem dado de pessoa, sem credencial; o arquiteto confirma).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada de nome de pessoa nem métrica individual no protótipo; dados fictícios.
- Dúvida de regra de negócio vira pergunta no relatório, nunca decisão na especificação.
- NÃO tocar: código, testes, outras especificações, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/especificacao.md` existe e contém 'Simulado'
- PQ-2 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/prototipo.html` existe e contém 'Simulado'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).