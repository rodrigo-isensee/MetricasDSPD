---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-apontamento-discovery
commit: fe8a3608efee17a53466fe3a0a97f99ed8281787
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review de modelagem: 059-aba-apontamento (§3.3 do plano, F2 do §7.2), renovação por delta

Escopo: §3.3 do plano `docs/architecture/features/059-aba-apontamento.md` (linhas 109 a 123), lido com a ADR 0025 (itens 5 a 8) e a revisão 4 da ADR 0020 (R4-2, R4-3, R4-6). Não há código nem migração nesta entrega; o parecer vale antes da A1 (migrações).

Delta lido (`forge-check delta --parecer`, intervalo 784659c..a2b4287 mais as alterações não commitadas, agora em fe8a360): §3.3 e §3.1/§3.2 do plano, itens 5 a 8 da ADR 0025 e R4-2/R4-3/R4-6 da ADR 0020. Já lido e fora do delta de modelagem: §3.9 (contrato zod), §4 a §7 do plano; o dicionário, os textos do UX, o plano de testes e o parecer de segurança têm parecer próprio.

Resultado do delta:
- A1 resolvida: `evt_apontamento` ganhou `UNIQUE (logged_time_id, tipo, chave_ocorrencia)` com `ON CONFLICT DO NOTHING`; na varredura a chave é a data civil da detecção, então reexecução e sobreposição no mesmo dia não duplicam, e o teste está declarado (plano linha 113, ADR 0025 item 7).
- A2 resolvida: `cfg_pessoa_eliminada` (HMAC-SHA256 do `user_id` com sal do `.env`), consultada pelo projetor antes de `/users` e de criar `pessoa_ref`; escrita só do `dspd_migrador`, leitura só do `dspd_coletor` (plano linha 114, ADR 0020 R4-6, ADR 0025 item 8).
- A3 resolvida: `registro_sha256` só sobre a allow-list gravável com a saída da classificação; edição só de comentário gera versão apenas se a saída mudar (ADR 0025 item 5).
- A4, A7 e A11 acolhidas no plano (linha 123) e vão para a A1; A7 ficou declarada e a eliminação do titular é do `dspd_migrador`.
- A10 (view de nomes) fica fora, com razão: conflita com a R3-3 da ADR 0020; vale o GRANT por coluna em `dim_responsavel` com a rota juntando só `pessoa_ref` presentes no fato. Aceito; reabre só com nova leitura do `security-engineer`.
- A6 decidida aqui: o fato grava `iniciativa_card_id` na mesma transação que refaz `dim_card_raiz`, com teste de igualdade entre os dois; a consulta não junta.

## Achados
- A1 (recomendado) docs/architecture/features/059-aba-apontamento.md:123 · A5 e A8 (índices parciais com excluido_em nulo, índice em raiz_card_id, CHECK de profundidade e ciclo em card_pai) seguem para a migração da A1 com EXPLAIN registrado; não devolvem.
- A2 (recomendado) docs/architecture/features/059-aba-apontamento.md:118 · A9: UNIQUE (termo_normalizado, subgrupo_codigo) e prioridade única nas ref_apontamento_*; registrar que mudar o dicionário não reclassifica o passado e marcar o gráfico (T2.6).

## Parecer
Aprovado. Os dois bloqueantes do parecer anterior (idempotência dos eventos e eliminação a pedido que sobrevive à recoleta) estão resolvidos no texto, sem refazer a arquitetura. Os recomendados restantes entram na A1 como ajuste e não devolvem. A forma final das colunas depende do spike (PE-1) e do histórico do worklog, hoje 403: se o dono liberar `/loggedTime/history`, a modelagem de `evt_apontamento` (origem `historico`) volta a este review por delta.

Fora deste review: segurança (parecer próprio, `docs/security/059-adrs.md`, renovação na E2.13).
