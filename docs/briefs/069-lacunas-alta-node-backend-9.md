Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2b-projecao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: codigo   Cobre: E1.2

## Objetivo
Lote L2-b do 069: projeção das colunas de lista do `dim_card` a partir do mapa `field_id` → coluna que o L2-a deixou na referência (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041` (livre desde o merge do PR 220), branch nova `feature/069-l2b-projecao` a partir da develop.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L2-b" e a linha L2-b da tabela de gatilhos de segurança).

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E3) (E1.2) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 fetch origin develop` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 switch -c feature/069-l2b-projecao origin/develop`; implementar o L2-b como o desenho descreve (carregarReferencia lendo `ref_dominio campo = 'campo_customizado'`, projetarCard preenchendo as colunas de lista a partir de `e.card.custom_fields`, código desconhecido vira nulo com a nota `campo_fora_do_dominio`, `LinhaDimCard` e `COLUNAS_DIM` com as colunas, append-only em `dim_card_versao`), sem mudar contrato nem regra de cálculo; testes de unidade do normalizador, pg do projetor e o teste de paridade (mapa vazio, `dim_card` idêntico ao de antes); vitest do server e dos pacotes com cobertura, no máximo 2 workers; `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; os testes pg não rodam no sandbox (relate isso); commits com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 add <arquivos>` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push -u origin HEAD:refs/heads/feature/069-l2b-projecao`; sem PR.
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
- 2026-11-04 20:20: Desenho atualizado pelo software-architect com A1 a A4 do modelo de ameaças (docs/analises/069-desenho.md, sem commit; A6 também; A5, A7 e A8 não). DECISÃO TÉCNICA (Jarvis): a lista positiva de tipos do L2-a começa vazia até o P-L2-1 e o PR que preencher o arquivo preenche a constante, como o desenho diz; "Categoria de solução" fica fora da constante do L9-b (o desenho a condiciona à preferência do dono, não registrada); lotes L2-a (worktree MetricasDSPD-041, branch feature/069-l2-campos) e L9-b (worktree MetricasDSPD-052c, branch feature/069-l9-etapa) começam ao mesmo tempo com duas instâncias do node-backend, cada lote levando os arquivos sem commit do desenho e do modelo de ameaças só se for o primeiro a commitá-los (o L2-a commita o modelo de ameaças; o desenho segue sem commit até o fim do pedido).
- 2026-11-04 21:59: PR 220 do L2-a mesclado na develop pelo dono (mensagem do assistente do app: "o PR 220 (L2-a, feature/069-l2-campos) foi mesclado na develop por squash (commit 9f9aa5c, CI verde). Pode seguir; o merge nao precisa mais ser pedido."); conferido no GitHub: MERGED, head 9f9aa5c67bbba9217e82a58684c11b3be84f747f, squash 97ec7af9055f247297ecdedda910cbac54562d72 na develop. DECISÃO TÉCNICA (Jarvis): fim da espera do dono pelo merge; o L2-b começa (depende do L2-a); limpeza da branch e da worktree 041 com o tech-lead (R-FLUXO, PR mesclado com head igual); o L1 do 070 passa para a worktree 052f, livre desde o merge do PR 218, porque a worktree nova 052e não pôde ser criada no sandbox.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- O mapa de campos fica como o L2-a deixou (lista positiva vazia até o de-para P-L2-1 do dono); o lote não preenche o mapa nem cria campo no quadro.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, a allow-list e o mapa de campos do L2-a, o desenho, outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

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
- PQ-1 (push): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 ls-remote origin feature/069-l2b-projecao` · espera: contém 'refs/heads/feature/069-l2b-projecao'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).