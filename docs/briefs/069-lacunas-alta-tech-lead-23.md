Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2b-projecao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
Rodar de novo o job E2E que falhou no PR 221 (lote L2-b do 069) e mesclar por squash se a CI ficar verde (pedido 069, E1.6, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/069-l2b-projecao`.

## Ler
- O PR 221 (`gh pr view 221 --repo rodrigo-isensee/MetricasDSPD`) e o run 41950555713.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge por lote." (E1.6)
- (E3) (E1.6) `gh run rerun 41950555713 --repo rodrigo-isensee/MetricasDSPD --failed`; esperar os checks do head do PR por laço com pausa (sem `--watch`); `forge-check pr 069-lacunas-alta --ref origin/feature/069-l2b-projecao --base origin/develop` limpo; com todos verdes, `gh pr merge feature/069-l2b-projecao --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se o L3-01 falhar de novo, pare e relate a saída do axe, sem mesclar; se a develop andou, `gh pr update-branch 221 --repo rodrigo-isensee/MetricasDSPD` e esperar de novo; sem promover para a homolog.
- (E1, E2, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 22:40: Lote L2-b: portões aprovados (review 6ef5ab4, QA 4f23600 e segurança 8ce777b aprovados, todos com commit: 53361bc; 133 linhas, dentro do teto; testes pg não rodaram localmente e precisam ficar verdes na CI do PR antes do merge; recomendados A1 e A2 do review, A1 do QA e A1 a A3 da segurança ficam como dívida). DECISÃO TÉCNICA (Jarvis): PR do lote L2-b para a develop e merge por squash com a CI verde, incluído o test:pg.
- 2026-11-04 23:06: PR 221 do L2-b parado por um E2E de acessibilidade: test:pg verde no job banco (34 arquivos, 239 testes, inclui projetor-businessmap.pg com 17), mas e2e-parte (2/2) do run 41950555713 falhou em e2e/tests/operacional-lote3.spec.ts:22 (L3-01, axe target-size serious em leia-junto-o15, 3o link), igual no retry; o PR só muda server/ e a develop passou no mesmo SHA base (run 41945228382). DECISÃO TÉCNICA (Jarvis): rodar de novo só os jobs que falharam; verde, merge por squash; vermelho de novo, o defeito de alvo de toque vira lote próprio do react-frontend e o PR 221 espera.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados.
- Nada na `main` nem na `homolog`.
- NÃO tocar: código, testes, os pareceres, o corpo do PR, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/069-l2b-projecao --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).