Agente destino: forge:software-architect
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: codigo   Cobre: E1.1

## Objetivo
Desenho das cinco correções de prioridade alta (L3, M1, L2, L9, L7), em lotes pequenos (pedido 069, E1.1, K-220).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` (L2, L3, L7, L9, M1 e as consultas que as mediram); na worktree de leitura `/home/rodrigoisensee/Metricas/MetricasDSPD-041` (develop com 065, 066 e 067), o código citado em cada lacuna; a lista fechada de campos do Acelerato (ADR 0023) e a regra do CLAUDE.md sobre dado de pessoa.

## Entregar
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." (E1.1)
- (E1) (E2) (E3) (E4) (E5) (E1.1) gravar `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` pela ferramenta Write, sem commit: para cada lacuna, o que muda (arquivos e funções), se o contrato da API muda (e se é compatível pela política de contratos), se o cálculo muda (versão de critério com data), os testes, e o que fica para as pessoas (campos que o quadro ou o Acelerato não trazem, feriados); dividir em lotes pequenos (um comportamento por PR, teto de linhas do projeto), com a ordem sugerida; dizer se algum lote tem gatilho de segurança (campo novo vindo do Acelerato precisa da lista fechada sem dado de pessoa).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- 2026-11-04 17:53: pedido aberto pela resposta do dono ("pode comecar voce tem a diretiva de nunca ficar parado") à pergunta sobre começar as lacunas de prioridade alta; vale como recibo para o escopo perguntado. Sem gatilho de segurança previsto (a conferir no desenho: E4 lê colunas novas do Acelerato, que precisam respeitar a lista fechada sem dado de pessoa). Cartão K-220. DECISÃO TÉCNICA (Jarvis): E1.1 com o arquiteto, lendo a worktree MetricasDSPD-041 (develop com 065, 066 e 067).
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064-lacunas-dado-real) - 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064-lacunas-dado-real) - 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064-lacunas-dado-real) - 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica por pessoa; BusinessMap e Acelerato nunca se misturam; todo cálculo pela biblioteca compartilhada; mudança de critério registrada com data; nome, e-mail, usuarioKey, descrição e título do chamado nunca chegam ao staging.
- Sem código: só o desenho.
- NÃO tocar: código, testes, a worktree (só leitura), outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c 'Lote' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).