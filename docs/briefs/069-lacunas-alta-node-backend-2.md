Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-m1-frescor   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: codigo   Cobre: E1.2

## Objetivo
Lote M1-a do 069 no server: a coleta parcial do apontamento segue não valendo como ok, e a resposta ganha o campo opcional frescor.ultimaTentativa, pelo desenho (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch nova `feature/069-m1-frescor`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção do M1).

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E2) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-056d status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-056d fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-056d switch -c feature/069-m1-frescor origin/develop --no-track`; `pnpm install --offline --frozen-lockfile` se faltar pacote (se falhar, pare e relate); implementar só a parte do server do lote M1-a conforme o desenho (campo opcional e compatível no contrato, docs/api, testes); `pnpm run docs:check` verde (se acusar mudança incompatível de contrato, pare e relate); vitest do server e dos pacotes com cobertura, no máximo 2 workers; `pnpm exec prettier --check web packages tools` verde; commits com `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/069-m1-frescor` (se o pre-push barrar pelo web, pare e relate); sem PR.
- (E1, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- 2026-11-04 18:06: E1.1 cumprida pelo software-architect: desenho em docs/analises/069-desenho.md (sem commit), com lotes L3-a, M1-a, L7-a, L7-b, L9-a, L2-a, L2-b, L9-b, L9-c e L2-c; L3 com helper colunasDaEquipe (sem mudar contrato); M1 com parcial que segue não valendo como ok e frescor.ultimaTentativa opcional; L2: o mapa field_id está vazio, então nenhum campo customizado é coletado (L2-a carregador bm:ref-sync, L2-b projeção; de-para dos 20 campos é do dono e da WS1); L9: só data_primeiro_comentario existe na tabela (L9-a tira o 0 falso do S3 com mudança de tipo no contrato, D-069-1); L7 com calendário por domínio e os feriados nacionais 2025-2026 que já estão no código; gatilhos de segurança em L2-a, L2-c e L9-b. DECISÃO TÉCNICA (Jarvis): começar pelo L3-a com o node-backend na worktree MetricasDSPD-041; a D-069-1 (aceite na v1 do L9-a) vai ao arquiteto e ao tech-lead pela política de contratos quando chegar o lote; o de-para dos 20 campos do L2 vai ao dono quando chegar o lote.
- 2026-11-04 18:42: DECISÃO TÉCNICA (Jarvis): Lote M1-a em paralelo ao PR do L3-a, com o node-backend na worktree MetricasDSPD-056d (HEAD destacado, limpa), branch nova feature/069-m1-frescor a partir da origin/develop; a parte de tela vai ao react-frontend depois, na mesma branch.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064-lacunas-dado-real) - 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064-lacunas-dado-real) - 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064-lacunas-dado-real) - 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Só a parte do server do lote M1-a; a tela fica para o react-frontend; o passo operacional (rodar de novo a carga do worklog) é do dono.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, outros lotes, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056d ls-remote origin feature/069-m1-frescor` · espera: linhas=1
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-056d && pnpm run docs:check` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).