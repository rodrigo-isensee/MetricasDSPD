---
tipo: revisao-seguranca
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l2-apontamento-equipe
commit: bca89b999ec509ffbdc118e97899bbd65878ed09
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: 097 L2, equipe no Apontamento

Propósito: parecer de segurança (gatilhos banco, por causa do GRANT por coluna e da consulta com entrada, e LGPD, por causa do recorte de pessoas por time; `R-SEGURANCA`) do L2 do pedido 097, commit `bca89b99` sobre a develop `1d697d6a`. É uma revisão estática do diff inteiro (13 arquivos, incluídos os 4 de `packages/` fora do escopo declarado no brief do autor), mais os testes dos arquivos tocados. Nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Banco: `server/src/plataforma/db/grants.ts:17` acrescenta uma coluna ao GRANT por coluna do papel `dspd_api_apontamento`. A consulta da aba ganha um filtro que vem da requisição (`repositorio.ts:194`).
- Dado de pessoa (LGPD): o filtro por time estreita o grupo de pessoas que aparece na aba (risco R3 do plano `docs/analises/097-filtros-plano.md`).

## Resultado
- **O GRANT acrescenta só `dim_card.equipe`: conforme.** `grants.ts:17` passa de `['card_id', 'titulo', 'tipo']` para `['card_id', 'titulo', 'tipo', 'equipe']`. As outras chaves de `COLUNAS_API_APONTAMENTO` não mudam. `equipe` é `varchar(60)` com o nome do time (`server/migrations/0006_bm_projecoes.ts:20`). Ela não está em `COLUNAS_PESSOA` (`server/src/plataforma/db/lgpd.ts`, que lista `dim_card.responsaveis`), e o GRANT continua só aditivo (`grants.ts:136-141`, reaplicado por `migrar.ts`). O teste `.pg` (`apontamento-rota.pg.test.ts`, caso 097 L2) confirma que o papel lê `equipe` e recebe `42501` em `responsaveis`, `responsavel_id` e `card_pai`. Esse teste roda no job banco do CI e não rodou aqui.
- **O valor do filtro chega ao SQL só por parâmetro: conforme.** O `zod` valida o slug no contrato com `^[a-z0-9][a-z0-9-]{0,59}$` (`packages/contratos/src/apontamento.ts:40`), em lista de até 50 itens (`:143`), e a rota recusa valor repetido (`rotas.ts:28`). Na biblioteca, o filtro compara ids em memória (`filtros.ts:54`). No SQL, só vão os **nomes** já resolvidos a partir do banco, em `$5::text[]`, e um booleano em `$6` (`repositorio.ts:194`, `:200-201`). `${S.bm}` é o esquema da configuração, não vem da requisição. `lerNomesDeEquipe` (`repositorio.ts:156-158`) não recebe entrada. O teste da rota garante que `time-alfa` e `inexistente` não aparecem no texto do SQL.
- **O slug não lê equipe fora da lista: conforme.** O slug volta ao nome por `SELECT DISTINCT equipe` (`servico.ts:28-31`). Um slug desconhecido não casa com nenhum nome e zera o recorte (testado: `equipe=nao-existe` dá 0). O filtro só restringe as linhas que o papel já lê sem filtro. Não amplia o acesso.
- **`opcoes.equipes` não expõe dado de pessoa: conforme.** Os itens trazem só `{ id: slug, rotulo: nome do time }`, ou "Sem time", vindos das linhas do período sem filtro de pessoa (`servico.ts:175`, `:207`). A ordem é neutra, alfabética (`ordenarNeutro`, `servico.ts:174`), sem contagem, soma ou horas por time. O schema usa `opcaoSchema` estrito e é opcional, o que mantém o contrato aditivo (`apontamento.ts:368`).
- **Nenhuma visão compara times nem agrega por pessoa a partir da equipe: conforme com a regra inviolável.** `equipe` aparece só em `filtrar()` como recorte (`filtros.ts:54`). `NIVEIS_MATRIZ` continua `['tipo', 'subtarefa', 'subgrupo']` (`apontamento.ts:67`): a matriz não ganha nível por time. O teste `times-sem-comparacao.test.ts` (097 L2) barra `GROUP BY`, `count`, `sum`, `avg`, `ORDER BY`, `sort` e `reduce` por equipe no repositório e no serviço, e também `porEquipe`, `porTime` e `matrizEquipe` no contrato. O teste da rota confirma que as chaves da resposta são as mesmas com e sem o filtro.
- **Entrada inválida dá 400 sem vazar erro do banco: conforme.** O tratador da aba (`rotas.ts:34-38`) responde só com caminho e código, sem a mensagem do schema e sem o valor recebido. O teste cobre `Time%20Alfa`, `a';--`, valor repetido e 61 caracteres, e confere que o corpo não ecoa a entrada. O erro do banco na leitura dos incompletos continua 500 genérico (teste do 063, sem mudança).
- **Recorte de pessoas por time (R3): sem bloqueante.** Com os nomes desligados, o rótulo `Pessoa ${ref}` é estável e não depende do recorte (`servico.ts:164`). O filtro por time tem a mesma natureza do filtro por projeto, que já existe, e o filtro `pessoa` continua aceito pelo servidor. Por isso o L2 não cria uma forma nova de isolar uma pessoa. O piso de 20 apontamentos continua na biblioteca. O risco que sobra é de reidentificação em time pequeno, e o dono decidiu "capacidade fica igual" (13:35). Um piso de pessoas por recorte seria regra de negócio, então fica como recomendação, para o dono decidir (A1).
- **Observação funcional, sem efeito de segurança (vai ao tech-lead e ao QA):** um nome de time cujo slug sai vazio vira "Sem time" na biblioteca (`servico.ts:24-25`), mas fica fora de `nomes` e do `IS NULL` no SQL dos incompletos (`repositorio.ts:194`). O sinal de incompletos então difere do recorte nesse caso raro. Dois nomes com o mesmo slug se fundem numa opção só (`unicos`, `servico.ts:173`). Nenhum dos dois casos amplia o acesso.
- **Testes dos arquivos tocados (`VITEST_MAX_WORKERS=2`):** `server/tests/apontamento-rota.test.ts` e `server/tests/times-sem-comparacao.test.ts`: 87 passaram. `packages/metricas/src/businessmap/apontamento/apontamento.test.ts`: 66 passaram. `apontamento-rota.pg.test.ts` fica com o job banco do CI.
- **Lacunas:** `gitleaks` e `semgrep` não estão no PATH e não rodaram. O diff não traz segredo, configuração nem dependência nova. O modelo de ameaças do L2 previsto no plano (`097-filtros-plano.md`, seção de segurança) não foi escrito antes da implementação. Os casos de abuso que ele traria (injeção no slug, slug fora da lista, valor repetido, tamanho, ausência de bloco por time) estão cobertos pelos testes do autor.

## Achados
- A1 (recomendado) server/src/modulos/apontamento/servico.ts:180 · recorte por time com cartão de capacidade por pessoa: em time pequeno, "Pessoa n" fica mais fácil de reidentificar; avaliar um piso de pessoas por recorte (regra de negócio, decisão do dono via Jarvis; R3 do plano).

## Plano em cartões
Nenhum bloqueante. A1 vai ao Jarvis como pergunta ao dono (`R-DECISAO`), junto com o L3, quando o filtro Time entrar na interface. A observação funcional vai ao tech-lead e ao QA no review do lote.

## Riscos aceitos
Nenhum.
