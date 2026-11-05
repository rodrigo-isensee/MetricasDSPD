Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: f61570400a45a86917e5f0ee30eaaf4b0a2e7ebc
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
Merge do PR 222 do lote L7-a do 069 (carregador de calendário e feriados), já aberto para a develop, por squash com a CI verde, incluído o test:pg (pedido 069, E1.6, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7-calendario`.

## Ler
- Os pareceres na branch: `docs/reviews/069-zz1-l7a.md`, `docs/qa/069-zz1-l7a.md` e `docs/security/069-z8-l7a.md`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge por lote." (E1.6)
- (E5) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario` depois que o parecer `docs/qa/069-zz1-l7a.md` estiver no remoto; `forge-check pr 069-lacunas-alta --ref origin/feature/069-l7-calendario --base origin/develop` limpo antes do merge; conferir com `gh pr view feature/069-l7-calendario --repo rodrigo-isensee/MetricasDSPD --json body` que o corpo do PR 222 cita os pareceres zz1 de review e QA e o z8 de segurança e traz a linha `teto: excedido`; se faltar citar os pareceres zz1, acrescentá-los com `gh pr edit feature/069-l7-calendario --repo rodrigo-isensee/MetricasDSPD --body-file <arquivo>` escrito pela ferramenta Write; o update-branch já foi feito (ponta 95dab5d); se a develop andou de novo, pare e relate; esperar os checks por laço com pausa (sem `--watch`), conferindo que o job dos testes pg rodou e ficou verde; com todos verdes, `gh pr merge feature/069-l7-calendario --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar, o test:pg não rodar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.
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
- 2026-11-05 03:49: Review zz1 do L7-a aprovado: parecer 069-zz1-l7a do tech-lead (f35e1e6, commit: 95dab5d): o merge da develop não mudou arquivo do lote nem a ADR 0027; teto 909 linhas com a exceção do corpo do PR 222 aceita; A1 e A2 recomendados. DECISÃO TÉCNICA (Jarvis): merge do PR 222 depois do QA zz1, sem novo update-branch (se a develop andar, para e relata), citando os pareceres zz1 no corpo.
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
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/069-l7-calendario --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).