---
tipo: revisao-seguranca
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l2-apontamento-equipe
commit: 18424b56d70cb11bc0428f9cede542b8c4e85b62
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: 097 L2, equipe no Apontamento

Propósito: parecer de segurança (gatilhos banco, por causa do GRANT por coluna e da consulta com entrada, e LGPD, por causa do recorte de pessoas por time; `R-SEGURANCA`) do L2 do pedido 097. A primeira passada revisou o commit `bca89b99` sobre a develop `1d697d6a`: o diff inteiro, com 13 arquivos e incluídos os 4 de `packages/` fora do escopo declarado. Esta revalidação cobre a volta 1, commit `18424b56`, e lê só o delta `bca89b99..18424b56`: `repositorio.ts`, `servico.ts` e dois testes de rota. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Revalidação da volta 1 (delta `bca89b99..18424b56`)
- **A lista vazia nos incompletos não abre leitura fora do recorte: conforme.** `repositorio.ts:201` agora passa `null` só quando não há filtro (`equipes === undefined`). Com o filtro ativo, passa `[...equipes.nomes]`, mesmo vazio. No SQL (`repositorio.ts:194`), `$5 = '{}'` faz `$5 IS NULL` falso e `= ANY('{}')` falso. A linha só passa se `$6` for verdadeiro e a equipe for nula. Assim, um slug inexistente zera os incompletos, como já zerava as linhas. Com isso o A1 do QA fica fechado. A mudança só estreita o resultado: o caso que antes devolvia todos os incompletos do período agora devolve nenhum. `filtroDeEquipe` continua devolvendo `undefined` para lista ausente ou vazia (`servico.ts:29`), e o contrato já recusa `equipe=` vazio pelo regex do slug. Por isso não existe outro caminho de entrada até o "sem filtro".
- **O valor continua chegando ao SQL por parâmetro: conforme.** O texto do SQL não mudou. `$5` leva só nomes vindos de `lerNomesDeEquipe`, que lê do banco sem entrada, e `$6` leva um booleano. O teste novo (A1) confere os valores `[..., null, null, [], false]`, e o teste anterior continua garantindo que nenhum slug da requisição aparece no texto do SQL.
- **O ponto funcional do slug vazio está fechado: conforme.** `servico.ts:31-32` põe em `nomes` o nome cujo slug sai vazio quando, e só quando, `sem-time` foi pedido. É a mesma regra de `equipeDe` (`servico.ts:24-25`) nas linhas. O teste A2 confere `nomes = ['---']` e `semTime = true`, com a opção única "Sem time". Sem `sem-time` no pedido, esse nome não entra, então o slug vazio não vira curinga para outros recortes.
- **Testes dos arquivos tocados (`VITEST_MAX_WORKERS=2`):** `server/tests/apontamento-rota.test.ts` e `server/tests/times-sem-comparacao.test.ts` dão `Test Files 2 passed (2)` e `Tests 89 passed (89)`, com os 2 testes novos. `apontamento-rota.pg.test.ts` fica com o job banco do CI. O delta não toca GRANT, contrato, `packages/` nem `docs/api/`, então os itens da primeira passada valem como estão abaixo.

## Gatilhos
- Banco: `server/src/plataforma/db/grants.ts:17` acrescenta uma coluna ao GRANT por coluna do papel `dspd_api_apontamento`. A consulta da aba ganha um filtro que vem da requisição (`repositorio.ts:194`).
- Dado de pessoa (LGPD): o filtro por time estreita o grupo de pessoas que aparece na aba (risco R3 do plano `docs/analises/097-filtros-plano.md`).

## Resultado (primeira passada, `bca89b99`; sem mudança no delta)
- **O GRANT acrescenta só `dim_card.equipe`: conforme.** `grants.ts:17` passa de `['card_id', 'titulo', 'tipo']` para `['card_id', 'titulo', 'tipo', 'equipe']`. As outras chaves de `COLUNAS_API_APONTAMENTO` não mudam. `equipe` é `varchar(60)` com o nome do time (`server/migrations/0006_bm_projecoes.ts:20`) e não está em `COLUNAS_PESSOA` (`server/src/plataforma/db/lgpd.ts`). O GRANT continua só aditivo (`grants.ts:136-141`). O teste `.pg` (caso 097 L2) confirma que o papel lê `equipe` e recebe `42501` em `responsaveis`, `responsavel_id` e `card_pai`. Esse teste roda no job banco do CI.
- **O valor do filtro chega ao SQL só por parâmetro: conforme.** O `zod` valida o slug com `^[a-z0-9][a-z0-9-]{0,59}$` (`packages/contratos/src/apontamento.ts:40`), em lista de até 50 itens (`:143`), e a rota recusa valor repetido (`rotas.ts:28`). No SQL só entram os nomes já resolvidos a partir do banco (`$5::text[]`) e um booleano (`$6`). `${S.bm}` vem da configuração.
- **O slug não lê equipe fora da lista: conforme.** O slug volta ao nome por `SELECT DISTINCT equipe`. Um slug desconhecido zera o recorte, agora também nos incompletos. O filtro só restringe as linhas que o papel já lê.
- **`opcoes.equipes` não expõe dado de pessoa: conforme.** Os itens trazem só `{ id: slug, rotulo: nome do time }` ou "Sem time", em ordem alfabética neutra, sem contagem, soma ou horas por time. O schema é estrito e opcional, e o contrato continua aditivo.
- **Nenhuma visão compara times: conforme com a regra inviolável.** `equipe` só entra como recorte. `NIVEIS_MATRIZ` não ganha nível por time, e `times-sem-comparacao.test.ts` barra agregação e ordenação por equipe.
- **Entrada inválida dá 400 sem ecoar o valor; o erro do banco dá 500 genérico: conforme.**
- **Recorte de pessoas por time (R3): sem bloqueante.** O rótulo `Pessoa ${ref}` é estável, o filtro tem a mesma natureza do filtro por projeto e o piso de 20 apontamentos continua valendo. O risco que sobra é de reidentificação em time pequeno, que fica como recomendação ao dono (A1).
- **Lacunas:** `gitleaks` e `semgrep` não estão no PATH e não rodaram. O delta não traz segredo, configuração nem dependência. O modelo de ameaças do L2 não foi escrito antes da implementação, mas os casos de abuso estão cobertos pelos testes do autor.

## Achados
- A1 (recomendado) server/src/modulos/apontamento/servico.ts:182 · recorte por time com cartão de capacidade por pessoa: em time pequeno, "Pessoa n" fica mais fácil de reidentificar; avaliar um piso de pessoas por recorte (regra de negócio, decisão do dono via Jarvis; R3 do plano).

## Plano em cartões
Nenhum bloqueante. A1 vai ao Jarvis como pergunta ao dono (`R-DECISAO`), junto com o L3, quando o filtro Time entrar na interface. A observação funcional da primeira passada (slug vazio) foi corrigida na volta 1. Dois nomes com o mesmo slug ainda se fundem numa opção só, sem efeito de segurança; isso fica com o review.

## Riscos aceitos
Nenhum.
