Agente destino: forge:software-architect
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9c-projecao   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: codigo   Cobre: E1.1

## Objetivo
Desenho da volta do lote L9-c do 069: como aplicar a decisão "B" do dono (no campo repetido em várias etapas, vale a etapa que vem por último no desenho do fluxo de atendimento), já que a ordem das linhas da Q6 não é garantida (A1 bloqueante do review). Arquivo novo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9c-ordem.md`, sem commit (pedido 069, E1.1, K-220).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção E4 · L9, Lote L9-b e Lote L9-c).
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/069-zz4-l9c.md` (o A1, a ordem da Q6, e o A3, S9) no estado da branch: `git -C /home/rodrigoisensee/MetricasDSPD-052c show a4dd982ca95bc7b24794331e3a32c25ca86e8172:docs/reviews/069-zz4-l9c.md`.
- `/home/rodrigoisensee/MetricasDSPD-052c/server/src/modulos/acelerato/sql.ts` (Q2 e Q6), `allow-list.ts` (camposEtapa), `normalizador.ts` e `/home/rodrigoisensee/MetricasDSPD-052c/docs/architecture/fontes/acelerato-listas.md` §2 (forma de campos_personalizados_etapa e de estatisticas.workflow.etapas).

## Entregar
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." (E1.1)
- (E4) (E1.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9c-ordem.md` pela ferramenta Write: de onde vem a posição de cada etapa no desenho do fluxo de atendimento (por exemplo, a ordem de estatisticas.workflow.etapas ou outra fonte já coletada) e como ela se liga ao kanbanStatusKey de cada item de campos_personalizados_etapa; a mudança na Q6 e em camposEtapa (o que entra no SELECT e no ORDER BY, se precisa de dado novo do staging), com hash novo do SQL e versão de critério (T2.6); o que acontece quando a etapa do item não está no fluxo; os testes (linhas embaralhadas, etapas fora de ordem, vazio depois de valor); se a mudança toca a fronteira de pessoa ou texto livre (para a segurança); e o registro do A3 (a S9 segue no SDR só com o booleano). Se a fonte não der a ordem do desenho do fluxo de forma confiável, isso vira pergunta no relatório, não texto no desenho; sem commit.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
- DECISÃO DO DONO (2026-11-05): "B" (L9-c, ordem das etapas do campo repetido): a lista de campos de etapa do Acelerato não é tomada como cronológica; quando o mesmo campo aparece em mais de uma etapa, vale o valor preenchido da etapa que vem por último no desenho do fluxo de atendimento (não na passagem real do chamado); um vazio continua não apagando um valor preenchido.
- DECISÃO DO DONO (2026-11-05): "A" (L9-c, campo de etapa do Acelerato repetido em várias etapas, A1 do review do L9-b): vale o valor preenchido da etapa mais recente pela qual o chamado passou; um vazio nunca apaga um valor preenchido. [Nota do Jarvis: "etapa mais recente" foi refinada pela decisão "B" de 2026-11-05 (ordem das etapas): vale a etapa que vem por último no desenho do fluxo de atendimento.]
- DECISÃO DO DONO (2026-11-05): "A" (D-L9-1, previsao_retorno do L9-c): guardar só "tem previsão: sim ou não" (booleano), como a lista fechada já diz; a coluna de data muda de tipo no próprio L9-c; a data prevista não é coletada.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): calendário por domínio; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 14:02: Dono respondeu "B" à ordem das etapas do L9-c (DECISÃO DO DONO acima). DECISÃO TÉCNICA (Jarvis): o software-architect define de onde vem a ordem das etapas no desenho do fluxo (por kanbanStatusKey) e a mudança na Q6 e no normalizador, com versão de critério (T2.6); depois a volta vai ao node-backend com os achados do review (A1 a A3) e do QA (A2), e review, QA e segurança refazem em série (QA depois do review aprovado).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Decisão nova de regra que nem o dono nem o desenho tomaram vira pergunta no relatório, nunca texto no desenho.
- NÃO tocar: outros arquivos (o 069-desenho.md inclusive, o código e os pareceres), o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
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
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9c-ordem.md` existe e contém 'ORDER BY'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).