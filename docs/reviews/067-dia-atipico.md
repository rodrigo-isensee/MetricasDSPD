---
tipo: review
contrato: 1
pedido: 067-dia-atipico-10h
branch: feature/067-dia-atipico
commit: 46ea94151e1d33658d6dea295400cc338e324a11
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-04
---
# Code review: 067 dia atípico acima de 10 h (E1.2, regravado em E1.5)

Escopo: diff `origin/develop...46ea941`, 14 arquivos de código, teste e documentação. Teto M14: cerca de 101 linhas de código e teste (limite 150), um comportamento só. A regravação na ponta nova cobre só a formatação do `index.ts` (+6 -1, quebra da reexportação em várias linhas, linhas 19 a 24).

Delta lido (`forge-check delta --parecer`, de `4181b56` a `46ea941`): só `packages/metricas/src/businessmap/apontamento/index.ts` +6 -1, linhas 19 a 24. Já lido e mantido do parecer anterior: a constante única do limite, a versão de critério `067:limite-dia-atipico`, a fronteira de 10 h, os cinco limites intactos, a documentação e a marca que nunca descarta.

Conferido:
- Formatação: `pnpm exec prettier --check web packages tools` sem achado (rc=0). Lint e typecheck passaram no pre-push do envio de `46ea941`.
- Constante única: `LIMITE_ATIPICO_HORAS_PADRAO` e `LIMITE_ATIPICO_SEGUNDOS_PADRAO` em `achados.ts`, exportadas pela biblioteca; o server (`servico.ts`) e a versão de critério (`criterios-apontamento.ts`) leem dela. Não sobrou `16 * 3600` em código de produção.
- Versão de critério `067:limite-dia-atipico`, com descrição e motivo (decisão do dono, 2026-11-04). A vigência é a data passada ao `criterios-apontamento`, que o dono roda; a lista é idempotente (registra só as que faltam).
- Fronteira: teste novo mostra que 10 h e 1 min é atípico e 10 h exatas não; o teste existente do limite estrito foi ajustado para 10 h. O front lê o limite da API (só fixture e teste mudaram).
- Os outros cinco limites de `LIMIARES_ACHADO_PADRAO` seguem intactos (nenhuma linha deles no diff), como o dono decidiu.
- Docs: `docs/api/apontamento.md` e o plano 059 atualizados, com a data e a referência do critério.
- Marca nunca descarta: preservado. Sem dado de pessoa, sem custo, sem segredo.
- Limite declarado: o teste com banco (`server/tests/apontamento-rota.pg.test.ts`) foi ajustado e não rodou; o dono roda `test:pg` depois do deploy. Fica como pendência de execução, não de leitura.

## Achados
- A1 (recomendado) packages/contratos/src/apontamento.ts:304 · o comentário do campo ainda diz "16 h por pessoa e dia"; trocar por "10 h (decisão do dono, 2026-11-04)", sem exigir nova volta. Ainda presente em `46ea941`.
