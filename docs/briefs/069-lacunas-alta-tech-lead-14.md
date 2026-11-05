Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2-campos   Base: develop   Base-sha: d2ec79d1cddddf1b43931654200f2fa187f10075
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
Merge do PR 220 (lote L2-a do 069) na develop por squash com a CI verde, incluído o test:pg (pedido 069, E1.6, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/069-l2-campos`.

## Ler
- Os pareceres na branch: `docs/reviews/069-z1-l2a.md`, `docs/security/069-z1-l2a.md` e `docs/qa/069-z1-l2a.md`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge por lote." (E1.6)
- (E3) (E1.6) PR 220 já aberto, com a linha de teto no corpo; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l2-campos`; `forge-check pr 069-lacunas-alta --ref origin/feature/069-l2-campos --base origin/develop` limpo; esperar os checks do head atual por laço com pausa (sem `--watch`), conferindo que o job dos testes pg rodou e ficou verde; se a develop andou, `gh pr update-branch 220 --repo rodrigo-isensee/MetricasDSPD`, conferir de novo o forge-check pr e esperar os checks; com tudo verde, `gh pr merge feature/069-l2-campos --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar, o test:pg não rodar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.
- (E1, E2, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 21:19: PR 220 do L2-a barrado de novo no forge-check pr: PR 220 aberto (teto na descrição); depois do gh pr update-branch (head 9341a0a, merge da develop com o M1-a) o forge-check pr passou a escolher os pareceres 069-m1-frescor.md de review e de QA, que vêm depois de 069-lote-l2a.md na ordem, e os acusa de desatualizados. DECISÃO TÉCNICA (Jarvis): os pareceres dos lotes que ainda não entraram levam nome com número de sequência na ordem planejada de merge, depois de todos os 069-l* e 069-m*: L2-a em 069-z1-l2a.md, L9-b em 069-z2-l9b.md e L7-a em 069-z3-l7a.md; o tech-lead, o qa-engineer e o security-engineer regravam pela ferramenta Write os do L2-a com o mesmo conteúdo e o mesmo commit: 1f62f20; depois o merge do PR 220. MELHORIA (Forge): o forge-check pr devia escolher o parecer pelo campo branch.
- 2026-11-04 21:27: Pareceres do L2-a regravados como 069-z1-l2a (segurança b27b6cc, review c0dc708, QA 9f9aa5c, todos com commit: 1f62f20); forge-check pr 069-lacunas-alta --ref origin/feature/069-l2-campos --base origin/develop com rc=0 no head 9f9aa5c. DECISÃO TÉCNICA (Jarvis): merge do PR 220 por squash com a CI verde, incluído o test:pg da CI.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; o hook `parecer` exige a branch no `gh pr merge`; `$?` e `$var` em comando com `gh pr` são barrados.
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
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/069-l2-campos --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).