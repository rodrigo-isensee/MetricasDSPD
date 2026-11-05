Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7b-leitura   Base: develop   Base-sha: 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
Abrir o PR do lote L7-b do 069 (as métricas do fluxo e da sustentação leem a referência de calendário e feriados) para a develop e mesclar por squash com a CI verde, incluído o test:pg (pedido 069, E1.6, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7b-leitura`.

## Ler
- Os pareceres na branch: `docs/reviews/069-zz3-l7b.md` e `docs/qa/069-zz3-l7b.md` (sem gatilho de segurança, decisão das 12:25 no Histórico).

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge por lote." (E1.6)
- (E5) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7b-leitura`; `forge-check pr 069-lacunas-alta --ref origin/feature/069-l7b-leitura --base origin/develop` limpo antes de abrir; abrir o PR com `gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/069-l7b-leitura --title <título> --body-file <arquivo>`, corpo escrito pela ferramenta Write citando `docs/reviews/069-zz3-l7b.md` e `docs/qa/069-zz3-l7b.md`, sem gatilho de segurança, e a linha `teto: excedido, 153 linhas, um comportamento só (leitura do calendário por domínio), 61% teste`; esperar os checks por laço com pausa (sem `--watch`), conferindo que o job banco (test:pg) e o build com o gate de fronteiras rodaram e ficaram verdes; se a develop andou, `gh pr update-branch` e esperar de novo; com todos verdes, `gh pr merge feature/069-l7b-leitura --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar, o test:pg não rodar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): é a decisão que este lote implementa
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 12:39: QA zz3 do L7-b aprovado: parecer docs/qa/069-zz3-l7b.md do qa-engineer (dc5e3f38, commit: ddbc45a): server 1755 testes (244 pg pulados), metricas 1262, mock 258 e contratos 208, cobertura 100%; eslint, prettier e docs:check verdes; paridade sem mudança, cada domínio com a própria classe, sem mistura de BusinessMap e Acelerato, nada fora da T2.5; A1 recomendado: servico.ts:156 usa CALENDARIO_PADRAO para o início, hoje sem efeito (os dois -180). DECISÃO TÉCNICA (Jarvis): E1.6 com o tech-lead: abrir o PR do L7-b para a develop citando docs/reviews/069-zz3-l7b.md e docs/qa/069-zz3-l7b.md, com a linha teto: excedido, 153 linhas, um comportamento só (leitura do calendário por domínio), 61% teste; merge por squash com a CI verde, incluído o job banco (test:pg) e o gate de fronteiras; se a develop andar, update-branch e, se o forge-check pedir parecer novo, para e relata; A1 do QA e A2 do review viram cartão de melhoria técnica.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados.
- Nada na `main` nem na `homolog`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

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
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/069-l7b-leitura --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).