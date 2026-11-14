---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-c2a-o12-projecao
commit: e3212e6ec351048a8f0c13e6abc5783486a424af
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: C2a do O12, deadline nativo em data_acordada (E3.31, volta 1 em E3.39)

**Volta 1 (E3.39, head `e3212e6e`): aprovado.** Revalidação por delta (`forge-check parecer delta`, intervalo `34ba37fc..e3212e6e`). No domínio: `normalizador.ts:150` passa a exigir `!valor.startsWith('0000')` junto das duas condições do `Date`, e `data-model.md:116` registra a origem de `data_acordada` (prazo nativo, parse estrito, ano >= 0001, nota `deadline_fora_da_forma`). Fora do domínio: o teste põe `0000-01-01` e `0000-12-31` na lista `ruins`, grava as sondas S1 e S2 literais e confere `0001-01-01` aceito. A regex `^\d{4}-\d{2}-\d{2}$` (sem flag `u`, só dígitos ASCII) limita o ano a `0000`-`9999`; `0000` vira nulo com a nota e `0001` a `9999` cabem no `date` (conferido no PostgreSQL local: `select '0001-01-01'::date, '9999-12-31'::date` devolve as duas datas). Rodado: `vitest run tests/normalizador-businessmap.test.ts` (29 testes, todos passaram). A1 (bloqueante da rodada 1, `normalizador.ts:147`) fechado em `normalizador.ts:150`; nenhum achado novo, por isso o bloco `## Achados` fica vazio. O texto da rodada 1 segue abaixo como histórico.

Propósito (rodada 1): confirmar o §5 de `docs/analises/099-o12-deadline.md` no código do C2a (head `34ba37fc`, base `d9f32012`). Lidos: o diff inteiro (4 arquivos: `normalizador.ts`, `projetor.ts` e os dois testes), `allow-list.ts:17`, `projetor.ts:273-314`, `entradas/projetor-businessmap.ts`, `pool.ts:41-66`, migrações `0005` e `0006` (coluna `data_acordada date` já existente). Rodado: `vitest run tests/normalizador-businessmap.test.ts` (27 testes, todos passaram); o `.pg` não rodou aqui, foi lido. Nada contra base real; nenhum `.env*` aberto.

## Achados

## Sondas
- S1 · `docker exec metricasdspd-postgres-1 psql -U postgres -d postgres -Atc "select '0000-01-01'::date"` · espera: data aceita, se a guarda bastasse · obtido: `ERROR: date/time field value out of range: "0000-01-01"`
- S2 · `node -e "const v='0000-01-01';const d=new Date(v+'T00:00:00Z');console.log(!Number.isNaN(d.getTime()), d.toISOString().slice(0,10)===v)"` (Node 24, as duas condições de `normalizador.ts:147-149`) · espera: `false` em alguma, para a guarda recusar · obtido: `true true`

## Gatilhos
Nenhum gatilho da `R-SEGURANCA` (confirmação pedida pelo §5 do desenho): sem autenticação, pessoa, webhook, migração, GRANT, CI, Docker, dependência ou mudança de allow-list. A volta 1 não muda isso (delta: uma condição no normalizador, uma linha de documentação e testes).

## Detalhe dos achados

**1. Sem mudança de allow-list, migração ou GRANT: conforme.** O diff não toca `allow-list.ts` (o `deadline` já está em `CAMPOS_CARD`, `allow-list.ts:17`), nem `server/migrations/`, nem `grants.ts`. A coluna `data_acordada` existe desde `0006_bm_projecoes.ts:22` e a API já a lê (`repositorio.ts:57`). Sem dado de pessoa: o prazo é data do card. O gatilho de segurança cai, como o §5 diz.

**2. O valor fora da forma não vai a log nem a tabela: conforme.** `dataAcordada` (`normalizador.ts:145-155`) empurra só o código `deadline_fora_da_forma`; o projetor transforma notas em contagem (`projetor.ts:211`, `:311`) e a entrada `bm:projetar` imprime só contagens e, no erro, `erro-interno` (`entradas/projetor-businessmap.ts`). O teste prova que o valor não aparece nas notas.

**3. A validação de forma fecha o B-K1 para o deadline: conforme na volta 1 (era A1 na rodada 1).** O §2 promete que "só uma data válida chega à coluna `date`". Na rodada 1 a checagem era feita só pelo `Date` do JavaScript, que aceita o ano `0000`; o PostgreSQL recusa esse ano numa coluna `date` (S1, S2). Como o projetor grava toda a staging numa transação só (`projetor.ts:273`), um card com `deadline` `0000-01-01` derrubaria a projeção inteira do BusinessMap, e a saída diria só `erro-interno`. Caminho: quem edita um card no BusinessMap grava esse prazo; o coletor o copia como texto (B-K1: só o tipo é conferido) e a projeção falha a cada execução até alguém corrigir o card. Ganho: indisponibilidade dos painéis do fluxo, sem vazamento. Severidade baixa, mas defeito provado na guarda do §5. Correção aplicada em `e3212e6e` (`normalizador.ts:150`, `!valor.startsWith('0000')`), com `0000-01-01` e `0000-12-31` na lista `ruins` e o bloco das sondas no teste.

Plano em cartões: A1 ao `node-backend`, no C2a; concluído na volta 1 (`e3212e6e`).

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum. Lacunas de ferramenta: `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH; sem efeito aqui (sem dependência, script ou credencial no diff, lido inteiro).
