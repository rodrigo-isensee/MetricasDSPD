Agente destino: forge:security-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2-campos   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: review   Cobre: E1.8

## Objetivo
Regravar o parecer do lote L2-a do 069 no nome `docs/security/069-lote-l2a.md`, com o mesmo conteúdo e o mesmo `commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20`, para o forge-check pr achá-lo como o mais recente do pedido (pedido 069, E1.8, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/069-l2-campos`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/069-l2-campos.md` (o seu parecer atual).

## Entregar
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." (E1.8)
- (E3) (E1.8) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l2-campos`; ler `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/069-l2-campos.md` e gravar o mesmo texto em `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/069-lote-l2a.md` pela ferramenta Write (sem mudar veredito, achados nem `commit:`); `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 add docs/security/069-lote-l2a.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-220' -- docs/security/069-lote-l2a.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/069-l2-campos`; o arquivo antigo fica como está; sem PR.
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
- 2026-11-04 21:05: PR do L2-a barrado no forge-check pr: com a mesma data, o forge-check pr escolhe o parecer mais recente do pedido pelo nome do arquivo, e docs/reviews/069-l3-equipe.md e docs/qa/069-l3-equipe.md (do L3-a, já na develop) vencem os do L2-a e saem desatualizados contra a branch; e docs/security/069-l2-campos.md está sem registro de autoria do papel de segurança. DECISÃO TÉCNICA (Jarvis): o tech-lead, o qa-engineer e o security-engineer regravam pela ferramenta Write os seus pareceres do L2-a, com o mesmo conteúdo e o mesmo commit: 1f62f20, no nome docs/<pasta>/069-lote-l2a.md (que vem depois dos nomes 069-l* na ordem); os lotes seguintes do 069 usam o nome 069-lote-<lote>.md. MELHORIA: o forge-check pr devia escolher o parecer pelo campo branch, não pelo nome do arquivo (Forge).
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
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/feature/069-l2-campos:docs/security/069-lote-l2a.md` · espera: contém 'commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).