---
tipo: review
contrato: 1
pedido: 067-dia-atipico-10h
branch: feature/067-dia-atipico
commit: 4181b56a1c8be5f07f03383a0b0ac29818ebb270
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-04
---
# Code review: 067 dia atípico acima de 10 h (E1.2)

Escopo: diff `origin/develop...4181b56`, 14 arquivos. Teto M14: cerca de 96 linhas de código e teste (limite 150), um comportamento só.

Conferido:
- Constante única: `LIMITE_ATIPICO_HORAS_PADRAO` e `LIMITE_ATIPICO_SEGUNDOS_PADRAO` em `achados.ts`, exportadas pela biblioteca; o server (`servico.ts`) e a versão de critério (`criterios-apontamento.ts`) leem dela. Não sobrou `16 * 3600` em código de produção.
- Versão de critério `067:limite-dia-atipico`, com descrição e motivo (decisão do dono, 2026-11-04). A vigência é a data passada ao `criterios-apontamento`, que o dono roda; a lista é idempotente (registra só as que faltam).
- Fronteira: teste novo mostra que 10 h e 1 min é atípico e 10 h exatas não; o teste existente do limite estrito foi ajustado para 10 h. O front lê o limite da API (só fixture e teste mudaram).
- Os outros cinco limites de `LIMIARES_ACHADO_PADRAO` seguem intactos (nenhuma linha deles no diff), como o dono decidiu.
- Docs: `docs/api/apontamento.md` e o plano 059 atualizados, com a data e a referência do critério.
- Marca nunca descarta: preservado. Sem dado de pessoa, sem custo, sem segredo.
- Limite declarado: o teste com banco (`apontamento-rota.pg.test.ts`) foi ajustado e não rodou; o dono roda `test:pg` depois do deploy. Fica como pendência de execução, não de leitura.
- Não consegui rodar `git pull` (rede do sandbox recusou github.com); HEAD local já era 4181b56.

## Achados
- A1 (recomendado) packages/contratos/src/apontamento.ts:304 · o comentário do campo ainda diz "16 h por pessoa e dia"; trocar por "10 h (decisão do dono, 2026-11-04)", sem exigir nova volta.
