Agente destino: forge:qa-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2-campos   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: qa   Cobre: E1.5

## Objetivo
Regravar o parecer do lote L2-a do 069 no nome `docs/qa/069-z1-l2a.md`, com o mesmo conteúdo e o mesmo `commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20`, para o forge-check pr achá-lo como o mais recente do pedido (pedido 069, E1.5, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/069-l2-campos`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/069-lote-l2a.md` (o seu parecer atual).

## Entregar
- "E1.5 (qa-engineer): QA por lote." (E1.5)
- (E3) (E1.5) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l2-campos`; ler `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/069-lote-l2a.md` e gravar o mesmo texto em `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/069-z1-l2a.md` pela ferramenta Write (sem mudar veredito, achados nem `commit:`); `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 add docs/qa/069-z1-l2a.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-220' -- docs/qa/069-z1-l2a.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/069-l2-campos`; o arquivo antigo fica como está; sem PR.
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
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Outros papéis regravam os seus pareceres ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l2-campos` antes do commit; se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, outros pareceres, o arquivo antigo, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/feature/069-l2-campos:docs/qa/069-z1-l2a.md` · espera: contém 'commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).