Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-m1-frescor   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: codigo   Cobre: E1.2

## Objetivo
Volta do server do lote M1-a do 069: os dois achados recomendados do review (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-m1-frescor`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/reviews/069-m1-frescor.md` (achados A1 e A2).

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E2) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-m1-frescor`; em `server/tests/apontamento-rota.test.ts`, fechar o app no fim do teste novo (A1) e acrescentar o caso de coleta com sucesso depois de uma parcial, com `ultimaTentativa.resultado = 'ok'` e o selo pela coleta ok (A2); vitest do server com cobertura, no máximo 2 workers; commit só do teste; push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/069-m1-frescor`; sem PR.
- (E1, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- ADR 0027 (citada no pedido): não se aplica a este lote (é do L7)
- ADR 0025 (citada no pedido): não se aplica a este lote
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 19:29: Lote M1-a: review aprovado em b0f597c (A1 recomendado: o teste novo em server/tests/apontamento-rota.test.ts:382 não fecha o app, falta await app.close(); A2 recomendado: falta o caso de coleta com sucesso depois de uma parcial, que o desenho pede) e revisão de interface aprovada com ressalva em docs/ux/069-m1-frescor-revisao.md (achado médio: texto final do aviso "Última coleta parcial em {dd/mm} às {hh:mm}: alguns apontamentos podem estar faltando.", a trocar em CabecalhoApontamento.tsx, no teste e em docs/ux/059-aba-apontamento-textos.md; fmtDataHoraCurta não muda). DECISÃO TÉCNICA (Jarvis): volta ao react-frontend (texto e registro do texto, e commit do parecer de UX) e ao node-backend (A1 e A2) ao mesmo tempo na worktree 056d, depois que o QA em curso gravar o parecer; depois review e QA de novo na ponta nova.
- 2026-11-04 19:42: Lote M1-a: QA aprovado em 485b7d7 (commit: db7a8e1, 0 bugs; contratos 204, server 1626, web 1434, docs-contratos 102, prettier e docs:check ok; A1 recomendado: falta o teste da fronteira em que o fim da parcial é igual a ultimaColetaOk). DECISÃO TÉCNICA (Jarvis): o teste da fronteira entra na volta do react-frontend.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- Outro agente trabalha ao mesmo tempo nesta worktree, em outros arquivos: `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-m1-frescor` antes de cada commit; `git -C /home/rodrigoisensee/MetricasDSPD-056d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` só com os próprios arquivos (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- Só o arquivo de teste do server; o código não muda.
- NÃO tocar: `web/`, `packages/`, código do server, pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d diff --stat origin/develop...origin/feature/069-m1-frescor -- server/tests/apontamento-rota.test.ts` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).