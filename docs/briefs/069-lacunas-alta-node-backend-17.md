Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9c-projecao   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: codigo   Cobre: E1.2

## Objetivo
Lote L9-c do 069: projetar na dim_chamado as colunas da fatia F3 (campos de etapa do Acelerato que o L9-b já leva ao staging), com a regra do campo repetido decidida pelo dono e previsao_retorno como booleano, numa branch nova feature/069-l9c-projecao a partir da develop b8b2a22b77f80d9445a4af7aca7456ed6f7f731a (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção E4 · L9: a tabela das colunas, o Lote L9-b e o Lote L9-c, a D-L9-1 e a tabela de gatilhos); a ADR 0023 item 4 (fatia F3) em `/home/rodrigoisensee/MetricasDSPD-052c/docs/architecture/adr/`; o A1 do review em `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/069-l9-etapa.md` (campo repetido em várias etapas); `server/src/modulos/acelerato/` (allow-list.ts, normalizador.ts, projetor.ts) e a DDL em `server/src/plataforma/db/ddl.ts`.

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E4) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052c fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052c switch -c feature/069-l9c-projecao b8b2a22b77f80d9445a4af7aca7456ed6f7f731a` (a worktree está na feature/070-gate-fronteiras, já mesclada no PR 231; se tiver mudança local, pare e relate); conforme o Lote L9-c do desenho: projetar justificativa_informada (só se preenchida), prioridade_ajustada_manualmente, motivo_escalacao, motivo_encerramento, avaliacao_problema, motivo_pendencia_atual e previsao_retorno no normalizador e no projetor; quando o mesmo campo aparece em mais de uma etapa, vale o valor preenchido da etapa mais recente pela qual o chamado passou e um vazio nunca apaga um valor preenchido (decisão do dono abaixo), com teste para cada caso (valor, vazio depois de valor, dois valores diferentes); previsao_retorno passa a booleano "tem previsão" com migração aditiva que não sobrescreve histórico nem apaga linha (decisão do dono abaixo); valor fora do domínio segue nulo; a constante AJUSTE_PRIORIDADE_COM_FONTE continua false (a virada é PR próprio, fora deste lote); nenhum campo novo entra na lista fechada e nada de pessoa, título ou descrição chega a tabela nova; testes de unidade do normalizador, pg do projetor e paridade das métricas S2, S3, S4, S8 e S10 antes e depois; documentação técnica afetada atualizada; rodar `npx eslint .` com cwd em `server/` (rc=0), o vitest do server e dos pacotes com cobertura 100 por cento (no máximo 2 workers), `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052c add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/069-l9c-projecao`; sem PR.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "A" (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): calendário por domínio; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:20: Dono decidiu a D-L9-1 com "A" (DECISÃO DO DONO acima). DECISÃO TÉCNICA (Jarvis): o L9-c começa com o node-backend numa branch feature/069-l9c-projecao a partir da develop, na worktree 052c (a branch dela, feature/070-gate-fronteiras, já foi mesclada no PR 231): projeção das colunas da F3 pelo desenho (docs/analises/069-desenho.md, Lote L9-c), com a regra do campo repetido (decisão das 2026-11-05, A) e a migração de previsao_retorno para booleano; gatilho de segurança (banco e dado do Acelerato): parecer do security-engineer no review; o L9-c não entra na release em preparo.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, outros lotes, os pareceres, as ADRs, a lista fechada de campos (allow-list) além de ler dela, o contrato da API, a constante AJUSTE_PRIORIDADE_COM_FONTE, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052c ls-remote origin feature/069-l9c-projecao` · espera: contém 'refs/heads/feature/069-l9c-projecao'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --name-only b8b2a22b77f80d9445a4af7aca7456ed6f7f731a origin/feature/069-l9c-projecao -- server` · espera: linhas>=1
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052c/server && npx eslint .` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).