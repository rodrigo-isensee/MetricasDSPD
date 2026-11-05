Agente destino: forge:ux-designer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-m1-frescor   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: review   Cobre: E1.7

## Objetivo
Revisão de interface do aviso de coleta parcial no cabeçalho da aba Apontamento, lote M1-a do 069, na ponta db7a8e19966d1d46963d81d01fa25465c0f56498, e texto final do aviso (pedido 069, E1.7, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-m1-frescor`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056d/web/src/features/apontamento/components/CabecalhoApontamento.tsx` e o teste `/home/rodrigoisensee/MetricasDSPD-056d/web/src/features/apontamento/apontamento.test.tsx` (casos do aviso).
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/059-aba-apontamento.md` e `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/059-aba-apontamento-textos.md` (só as partes do cabeçalho e do selo).
- O desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote M1-a").

## Entregar
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." (E1.7)
- (E2) (E1.7) Revisar o aviso contra a especificação validada da aba (posição ao lado do selo, ícone, texto, leitura por leitor de tela, contraste) e fechar o texto final; parecer em `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/069-m1-frescor-revisao.md` pela ferramenta Write com `pedido: 069-lacunas-alta`, `commit: db7a8e19966d1d46963d81d01fa25465c0f56498`, veredito e bloco `## Achados`; se o texto final for diferente do provisório, ele vai no parecer como achado para o react-frontend; sem commit (o agente não tem Bash).
- (E1, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- ADR 0027 (citada no pedido): não se aplica a este lote (é do L7)
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 19:05: Lote M1-a, parte do server, entregue pelo node-backend: feature/069-m1-frescor em bfaf8072ccd9d58b385c316c669606b7d9a24386 (frescor.ultimaTentativa opcional e nullable em packages/contratos/src/apontamento.ts, montarApontamento preenche, docs/api/apontamento.md e openapi.json regenerado, testes em apontamento-rota.test.ts; docs:check ok, server, contratos 204 e metricas 1258 verdes, prettier ok). DECISÃO TÉCNICA (Jarvis): a parte de tela do M1-a vai ao react-frontend na mesma worktree e branch, depois o review e o QA do lote inteiro.
- 2026-11-04 19:18: Lote M1-a, parte da tela, entregue pelo react-frontend: feature/069-m1-frescor em db7a8e19966d1d46963d81d01fa25465c0f56498 (aviso "Última coleta parcial em dd/mm hh:mm: o período pode estar incompleto." no CabecalhoApontamento, texto provisório; testes com e sem aviso; web 1434 verdes, cobertura 100%, typecheck e prettier ok). DECISÃO TÉCNICA (Jarvis): etapa nova E1.7 (revisão de interface pelo ux-designer, porque o lote muda tela); review, QA e revisão de interface do lote M1-a ao mesmo tempo citando db7a8e1.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Achado com até 300 caracteres e regra citada só pelo ID.
- NÃO tocar: código, testes, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/069-m1-frescor-revisao.md` existe e contém 'commit: db7a8e19966d1d46963d81d01fa25465c0f56498'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).