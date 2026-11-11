Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-9b   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E1.9

## Objetivo
PR do lote 9b dos bloqueios reais (K-204) para a develop: branch `feature/075-9b`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, head 39906ef0 (código e4eaa56c; QA aprovado em 8c3d905c; review aprovado em 39906ef0). A develop andou depois da base (tem o PR 321 do K-272, com o check `banco` vermelho por um teste `.pg` que está sendo corrigido em outra branch).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/docs/reviews/075-l9b-contrato.md` (A1: o corpo do PR traz as entradas do aceite e a linha §6) e `/home/rodrigoisensee/MetricasDSPD-056/docs/qa/075-l9b-contrato.md`.

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, o PR do lote 9b.
- (E1) (E1.9) Rodar da worktree `forge-check pr 075-bloqueios-reais --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref feature/075-9b --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Não atualizar a branch com a develop (R-FLUXO: só na hora do merge). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: o que muda, a linha do checklist §6 (`contrato: incompatível (valor de enum removido em notas de O1, O2 e O3; aceite em aceitas.json, fotografado e removido no mesmo PR)`) e os hashes dos aceites do relatório do autor, os pareceres e `Cartão: K-204`. Se o hook recusar, pare e relate a mensagem literal. Esperar os checks e relatar cada um; se o `banco` falhar só pelo teste do K-272 que veio da develop, diga isso. Não mesclar: o merge é do dono.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até c166a8738a8bd344c2b9d3c3d78fffc1ddf47073e303a80503f9145ee45b4171 (21 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head feature/075-9b --state all --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
