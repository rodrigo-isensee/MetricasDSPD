Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9-etapa   Base: develop   Base-sha: 138e012fbdd1de259fd88e93c2f6af5304fb868e
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
Merge do PR 224 do lote L9-b do 069 (campos de etapa do Acelerato até o staging), já aberto para a develop, por squash com a CI verde, incluído o test:pg (pedido 069, E1.6, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/069-l9-etapa`.

## Ler
- Os pareceres na branch: `docs/reviews/069-z9-l9b.md`, `docs/qa/069-z9-l9b.md` e `docs/security/069-l9-etapa.md`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge por lote." (E1.6)
- (E4) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/069-l9-etapa`; `forge-check pr 069-lacunas-alta --ref origin/feature/069-l9-etapa --base origin/develop` limpo antes do merge; conferir com `gh pr view feature/069-l9-etapa --repo rodrigo-isensee/MetricasDSPD --json body` que o corpo do PR 224 traz a linha `teto: excedido` e os pareceres; se faltar citar os pareceres renovados 069-z9-l9b, acrescentá-los com `gh pr edit feature/069-l9-etapa --repo rodrigo-isensee/MetricasDSPD --body-file <arquivo>` escrito pela ferramenta Write; se a develop andou, `gh pr update-branch` e esperar de novo; esperar os checks por laço com pausa (sem `--watch`), conferindo que o job dos testes pg rodou e ficou verde; com todos verdes, `gh pr merge feature/069-l9-etapa --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar, o test:pg não rodar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

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
- 2026-11-05 00:28: L9-b z9: review e QA renovados aprovados (review a589e20 e QA 464e47f, os dois com commit: 2ae89ee; patch do lote igual ao aprovado em fb8ea39; server 1706 testes e pacotes com cobertura 100%); forge-check pr aprovado na ponta 464e47f. DECISÃO TÉCNICA (Jarvis): merge do PR 224 (já aberto) por squash com a CI verde, incluído o test:pg, conferindo antes que o corpo traz a linha do teto; com ele, a release 068 pode seguir.
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
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/069-l9-etapa --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).