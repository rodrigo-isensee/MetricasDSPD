---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k407-roteiro-vm
commit: 39daacb50b2949bfc081d87abb5f6fc3c5b988b1
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-k407-roteiro-vm (K-407 e K-409, E7.553 e E7.559)

Pedido só de documento (`docs/devops/105-implantacao-vm.md`). Sem especificação de UX, sem plano antecipado. Obrigações: (1) a reversão da 0041 descrita no roteiro funciona; (2) o `bm:ref-sync-sle` está na subida, na posição e com o nome certos, e o resumo diz 9 passos. Conferido contra `server/package.json`, `server/src/plataforma/db/vm-preparar.ts`, `server/migrations/0041_bm_ref_tipo_card_habilitador.ts` e o código dos comandos. Não há PR: a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| `bm:ref-sync-sle` existe com esse nome | `grep` em `server/package.json:37` (`tsx src/entradas/ref-sync-sle.ts`) e arquivo existe | nome do script | passa |
| É o passo 4, depois do `bm:ref-sync` e antes do `ac:ref-sync` | `PASSOS` em `vm-preparar.ts:15-23` | ordem | passa |
| Resumo de 9 passos | `PASSOS` tem 9 entradas, a de escala é `opcional`; 4 trechos do roteiro dizem 9 | contagem | passa |
| Fica fora do timer | `deploy/systemd/metricas-referencias.service:17-20` lista 4 `ExecStart`, sem o sle | timer | passa |
| Prazos 12,5 / 5,8 / 11,2 / 2,1 | `docs/architecture/fontes/businessmap-sle.json` | valores | passa |
| Papel `dspd_ref`, `PG_REF_URL` | `ref-sync-sle.ts:11,23` | papel | passa |
| Reversão da 0041: só backup com linha `habilitador`; `down 1` só com contagem 0 | leitura do texto contra a 0041 (`ADD CONSTRAINT ... CHECK` valida todas as linhas); revalidado em 39daacb5 | `down` com linha `habilitador` | passa |
| Documentação válida | `pnpm run docs:check` | n/a | passa |

## Revalidação (head 39daacb5, E7.559)
Delta e8b897f6..39daacb5: só `docs/devops/105-implantacao-vm.md` (mais o parecer do review). `forge-check parecer delta` no domínio do QA: "nenhum arquivo do domínio mudou"; reteste feito pela leitura do texto contra a 0041.
- A1 (era bloqueante): resolvido. A linha 258 não manda mais fechar vigência nem rodar `bm:ref-sync`; diz que a linha fechada continua `habilitador`, que com contagem maior que 0 a volta é só o backup, e traz o SQL de conferência (`SELECT count(*) FROM dspd_bm.ref_tipo_card WHERE categoria = 'habilitador'`). Coerente com a 0041 e com o schema `dspd_bm.ref_tipo_card`. O `down 1` só vale com contagem 0. A frase "provado pelo review num PostgreSQL 16" eu não reproduzi (sem PostgreSQL aqui); vale pela leitura do SQL e pelo parecer do review.
- A2 (era bloqueante, mesma causa): resolvido junto com o A1; o contorno que não funcionava sumiu.
- A3 (era recomendado, "categoria anterior"): sumiu com o A1 (frase removida).
- "Última migração aplicada" (linhas 113 e 263): conferido. Com a 0041 aplicada ela é a última (`server/migrations/` termina em 0041), e o `down 1` tira a 0041, não a 0040. As duas linhas concordam entre si e com o parágrafo da seção 7 (que começa na 220; o parágrafo da 0041 está na 258).
- `pnpm run docs:check` no head 39daacb5: `docs:check: ok (1764 páginas Markdown, 70 métricas, 2 eventos).`
- Os resultados do passo 4 (K-409), dos 9 passos, do timer e dos prazos seguem valendo: o delta não os tocou.
- Vermelho antes do verde e mutação: n/a (só documento, sem teste novo). Review (ordem entre código antigo e `down`): fora do meu domínio.
