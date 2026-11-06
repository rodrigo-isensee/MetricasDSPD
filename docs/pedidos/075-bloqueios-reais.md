# Pedido 075: bloqueios reais na coleta do BusinessMap

- **Modo:** planejar
- **Objetivo:** a coleta do BusinessMap passa a gravar os bloqueios reais (fato_bloqueio e evt_bloqueio a partir do block_reason que já chega ao staging), para a tela de bloqueados e o O5 saírem do "sem dado real" (parte B da decisão "C" do dono no pedido 064)
- **Clareza:** 1 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Depende de:** 064 (decisão "C"), 065 (bloqueados sem dado real, na main)

## Escopo
- E1. Discovery: de onde vem o bloqueio no BusinessMap (campos já no staging, histórico de bloqueio e desbloqueio), como vira fato_bloqueio e evt_bloqueio, o que muda na tela (sai o "sem dado real"), o impacto em migração, testes e documentação, os riscos e as perguntas de regra de negócio · `confirmado`
- E2. Modelo de ameaças da mudança (coleta, banco, dado de pessoa no motivo do bloqueio) · `técnico`
- E3. Plano técnico com lotes, depois da validação do dono · `técnico`

## Etapas
- E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono.
- E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit.
- E1.3 (dono): validar o desenho e responder as perguntas.
- E3.1 (software-architect): plano técnico com lotes depois da validação.

## Fora do escopo
- Código antes da validação do desenho pelo dono · `confirmado`
- Tendências do Resumo (K-211) e o CA-8 do BusinessMap (K-234) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-06 10:33: pedido aberto (Jarvis) pelo recibo confirmado com "isso" (pedido 074, 10:29). Cartão K-204. DECISÃO TÉCNICA (Jarvis): discovery em paralelo: software-architect (E1.1) e security-engineer (E1.2), só leitura no checkout da develop (worktree /home/rodrigoisensee/MetricasDSPD-056d); sem UX nesta etapa porque a tela já existe e só troca o "sem dado real" pelo dado (o UX entra se o desenho mudar a tela).
- 2026-11-06 10:38: E1.2 entregue pelo security-engineer: docs/security/075-modelo-ameacas.md (sem commit): recomenda a via A (comparar entre coletas is_blocked, block_reason_id e current_block_time do stg_card; sem campo novo nem chamada nova); via B (expand=block_times, com comentário e autor) só com a revisão 5 da ADR 0020 lida pela segurança antes do código (ADR 0022 item 3 nega stg_bloqueio por padrão); via C (/blockReason por card) só com cota e teto. Achado T3: fato_bloqueio tem GRANT da tabela inteira ao dspd_api (grants.ts:53, 109-113) e coluna nova de texto ou autor com nome neutro escaparia do SEGMENTO_PESSOA (lgpd.ts:7-8): lista fechada de colunas no teste ou GRANT por coluna; diff em grants.ts ou lgpd.ts é bloqueante. 11 ameaças, 14 casos de abuso (CA-075-1 a 14). Perguntas P-075-1 a P-075-4 consolidadas com as do desenho antes de ir ao dono. MELHORIA (projeto): teste geral de colunas fechadas para toda tabela de PROJECAO com GRANT ao dspd_api (cartão).
- 2026-11-06 10:39: E1.1 entregue pelo software-architect: docs/analises/075-desenho.md (sem commit): a coleta já traz is_blocked, current_block_time e block_reason (só o id passa a fronteira) como foto por versão em stg_card; nada projeta bloqueio hoje (só o seed). Proposta via A: o projetor compara as versões de stg_card e grava evt_bloqueio só por acréscimo, com chave determinística; fato_bloqueio como pares início e fim, duração em horas úteis pela biblioteca; motivo por campo novo motivo_bloqueio no ref_dominio; reprojetar o stg_card já gravado recupera os bloqueios vistos desde a primeira coleta. Tela: BLOQUEIOS_COM_DADO_REAL, BLOQUEADOS e O5 de volta ao mapa real, sem cálculo novo; versão de critério para O1, O2, O5 e BLOQUEADOS; UX só se houver motivo não classificado ou aviso de início aproximado. Riscos: coleta manual perde bloqueio curto e torna início e fim imprecisos; falta confirmar se current_block_time é duração ou instante e se bloquear muda last_modified. Perguntas consolidadas (desenho e ameaças) na fila ao dono, uma por vez, depois da P-076-1: P-075-1 via A basta (com a precisão dela) ou via B; P-075-2 instante do início; P-075-3 mapa de reason_id para os 7 motivos e bloqueio sem motivo; P-075-4 fornecedor; P-075-5 card arquivado bloqueado (fecha?); P-075-6 janela do O5; P-075-7 cadência da coleta; P-075-8 escopo de O19, T10 e T12. MELHORIA (projeto): anexar ao repositório a forma do spike F1 da API do BusinessMap, sem dado de pessoa (cartão).
