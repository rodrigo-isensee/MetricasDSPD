---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-c2a-o12-projecao
commit: 34ba37fc11f26e3d04fab964faf7c089b6f3abb8
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: C2a do O12, deadline nativo em data_acordada (E3.31)

Propósito: confirmar o §5 de `docs/analises/099-o12-deadline.md` no código do C2a (head `34ba37fc`, base `d9f32012`). Lidos: o diff inteiro (4 arquivos: `normalizador.ts`, `projetor.ts` e os dois testes), `allow-list.ts:17`, `projetor.ts:273-314`, `entradas/projetor-businessmap.ts`, `pool.ts:41-66`, migrações `0005` e `0006` (coluna `data_acordada date` já existente). Rodado: `vitest run tests/normalizador-businessmap.test.ts` (27 testes, todos passaram); o `.pg` não rodou aqui, foi lido. Nada contra base real; nenhum `.env*` aberto.

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/normalizador.ts:147 · dataAcordada aceita '0000-01-01' (o Date do JS valida) e o PostgreSQL recusa o ano 0 em date: um card com esse prazo derruba a projeção inteira do BusinessMap (transação única). Recusar o ano 0000 com a nota e testar.

## Sondas
- S1 · `docker exec metricasdspd-postgres-1 psql -U postgres -d postgres -Atc "select '0000-01-01'::date"` · espera: data aceita, se a guarda bastasse · obtido: `ERROR: date/time field value out of range: "0000-01-01"`
- S2 · `node -e "const v='0000-01-01';const d=new Date(v+'T00:00:00Z');console.log(!Number.isNaN(d.getTime()), d.toISOString().slice(0,10)===v)"` (Node 24, as duas condições de `normalizador.ts:147-149`) · espera: `false` em alguma, para a guarda recusar · obtido: `true true`

## Gatilhos
Nenhum gatilho da `R-SEGURANCA` (confirmação pedida pelo §5 do desenho): sem autenticação, pessoa, webhook, migração, GRANT, CI, Docker, dependência ou mudança de allow-list.

## Detalhe dos achados

**1. Sem mudança de allow-list, migração ou GRANT: conforme.** O diff não toca `allow-list.ts` (o `deadline` já está em `CAMPOS_CARD`, `allow-list.ts:17`), nem `server/migrations/`, nem `grants.ts`. A coluna `data_acordada` existe desde `0006_bm_projecoes.ts:22` e a API já a lê (`repositorio.ts:57`). Sem dado de pessoa: o prazo é data do card. O gatilho de segurança cai, como o §5 diz.

**2. O valor fora da forma não vai a log nem a tabela: conforme.** `dataAcordada` (`normalizador.ts:145-154`) empurra só o código `deadline_fora_da_forma`; o projetor transforma notas em contagem (`projetor.ts:211`, `:311`) e a entrada `bm:projetar` imprime só contagens e, no erro, `erro-interno` (`entradas/projetor-businessmap.ts`). O teste prova que o valor não aparece nas notas.

**3. A validação de forma fecha o B-K1 para o deadline: não conforme (A1).** O §2 promete que "só uma data válida chega à coluna `date`". A checagem é feita pelo `Date` do JavaScript, que aceita o ano `0000`; o PostgreSQL recusa esse ano numa coluna `date` (S1, S2). Como o projetor grava toda a staging numa transação só (`projetor.ts:273`), um card com `deadline` `0000-01-01` derruba a projeção inteira do BusinessMap, e a saída diz só `erro-interno`, sem apontar a causa. Caminho: quem edita um card no BusinessMap (pela interface ou pela API dele) grava esse prazo; o coletor o copia como texto (B-K1: só o tipo é conferido) e a projeção falha a cada execução até alguém corrigir o card. Ganho: indisponibilidade dos painéis do fluxo (dado parado), sem vazamento. Severidade baixa (ator interno com acesso ao quadro, efeito reversível), mas é defeito provado na guarda que o §5 pede para confirmar, e a correção é de uma linha: bloqueia o C2a.

Correção mínima (dono: `node-backend`): em `dataAcordada`, recusar o ano `0000` com a mesma nota (por exemplo `d.getUTCFullYear() >= 1` junto da comparação de `toISOString`, ou a regex começar por `(?!0000)`), e pôr `'0000-01-01'` na lista `ruins` de `normalizador-businessmap.test.ts:253`. Os demais anos de 4 dígitos (`0001` a `9999`) cabem no `date` do PostgreSQL. Nada mais muda.

Plano em cartões: A1 ao `node-backend`, no C2a; revalidação por delta neste parecer.

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum. Lacunas de ferramenta: `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH; sem efeito aqui (sem dependência, script ou credencial no diff, lido inteiro).
