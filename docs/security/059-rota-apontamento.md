---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-rota-apontamento
commit: e38c51983002f195407d98e73fc3adafb1016593
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: rota da aba Apontamento (pedido 059, E2.24, K-193), rodada 2 por delta

Delta revisado: `8a92a49...e38c519` (base fixada pelo dono em 2026-11-02), restrito a `server/src/modulos/apontamento`, `server/src/plataforma`, `server/migrations/0033_bm_apt_pessoa_time.ts`, `server/eslint.config.js` e `docs/api`. O código vai até `abfd287`; `e38c519` só acrescenta o parecer do code review. O código do contrato e da coleta que veio por merge (`dbcb421`, `e7b1c17`) tem parecer próprio (`059-alfa.md` em `ccf9651`, `059-beta.md` em `82d1360`); dele li só o que a rota usa: o refinamento dos rótulos fixos do contrato, o filtro da biblioteca e o caminho da eliminação a pedido até a view. Os acréscimos de `config.ts` (comando do worklog e eliminação) vêm da coleta, já revisados lá. Revisão estática: o `.env` não foi lido, nada foi executado contra banco nem contra o BusinessMap, nenhum nome de pessoa neste documento.

**Veredito: aprovado.** Nenhum bloqueante. A1 e A2 da rodada 1 resolvidos; um recomendado novo (A3, teste). Os itens da rodada 1 fora do delta (papel e GRANTs restantes, 421, interruptor e guarda de partida, no-store, CORS, log) não mudaram e continuam valendo como descritos no parecer em `5f57925`.

## Gatilhos
Dado pessoal (chave opaca e nome real numa rota sem autenticação), GRANT por coluna novo ao papel da aba, view com o privilégio do dono (renumerada), exceções nomeadas nos guardas de view e de coluna de pessoa, regra de lint que protege o pool do papel. R-SEGURANCA.

## Achados
- A3 (recomendado) server/migrations/0033_bm_apt_pessoa_time.ts:24 · nenhum teste .pg prova que, depois da eliminação a pedido, a view de quem é do time deixa de devolver o pessoa_ref antigo; a garantia hoje é só estrutural (JOIN com dim_responsavel, cuja linha a eliminação apaga).

## Resolução dos achados da rodada 1
- **A1 (recomendado): resolvido.** `noInlineConfig` passa a valer em todo `**/*.ts` do server (`server/eslint.config.js:46`); `git grep` não acha nenhum `eslint-disable` em `server/src`, `server/tests` nem `server/migrations`. Fora dos módulos, o import de `modulos/apontamento` é proibido por regex (`:21`, `:48-49`) e só os três que montam a API o fazem (`src/app.ts`, `src/entradas/api.ts`, `src/entradas/openapi.ts`, `:22`, `:51`), mantendo para eles as demais restrições (arquivo interno de módulo, biblioteca do coletor, mock). Dentro dos módulos a regra por módulo (`:37`) segue.
- **A2 (recomendado): resolvido no ramo do discovery** (`9ac2855` em `docs/059-apontamento-discovery`): a R4-5 da ADR 0020 lista `apt_pessoa_time` (só `pessoa_ref` e `vigencia_ate`, lida só pelo papel da aba) e `ref_versao_criterio_metrica` (`:140`), e a alternativa (b) passa a "escolhida" só para essa view, com as alternativas reais deste parecer como não adotadas (`:165`).

## O que foi verificado no delta e está correto

**GRANT de `type_id` ao papel da aba (`server/src/plataforma/db/grants.ts:15`).** Uma coluna a mais em `COLUNAS_API_APONTAMENTO` para `fato_apontamento`, por coluna; `type_id` é o tipo do card no BusinessMap, não dado de pessoa, e não entra em `COLUNAS_PESSOA`. Nada muda para `dspd_api` nem para os outros papéis; a lista segue sem `logged_time_id`, hash, comentário, categoria e `qtd_palavras`.

**Filtro por tipo (`servico.ts:59`, `:143`; `repositorio.ts`).** A recusa 422 sai (`servico.ts` e `rotas.ts`) e o filtro passa a ser aplicado pela biblioteca (`packages/metricas/src/businessmap/apontamento/filtros.ts:53`) sobre `tipo.id`, que agora é o `type_id`. A entrada continua validada pelo contrato antes do banco: lista de dígitos com teto de 50 (`packages/contratos/src/apontamento.ts:141`), consulta estrita e recusa de repetido; o valor nunca vai ao SQL (a consulta de linhas só recebe `de` e `ate` por parâmetro e lê `f.type_id` como coluna). Valor inexistente devolve zero, sem erro que revele o catálogo de tipos (teste `.pg` com `tipo=999`). `opcoes.tipos` só traz `type_id` em dígitos e o rótulo da categoria (`dim_card.tipo`); a linha sem `type_id` soma, mas não vira opção. Sem caminho para pessoa.

**Rótulos fixos com `nomesReais` falso (`servico.ts:115-117`).** Desligado, o rótulo é só `Pessoa n` derivado do próprio `pessoaRef`, e o banco não recebe consulta ao nome; ligado, o nome ou `ROTULO_PESSOA_NAO_IDENTIFICADA` do contrato. A resposta é validada por `respostaApontamentoSchema`, cujo `superRefine` recusa com `nomesReais` falso qualquer rótulo fora de `^Pessoa [1-9]\d{0,8}$`, `Pessoa não identificada` e `Outra área` (`apontamento.ts:169-175`, `:392-400`): um nome que escapasse por erro de código vira 500 genérico, não vazamento. É defesa em profundidade sobre o interruptor.

**Erro da rota (`rotas.ts:70-76`).** Saiu o repasse de `AppError`; toda exceção dentro de `montarApontamento` (que não lança mais nenhuma) vira 500 genérico, com log só da classe e do SQLSTATE. Menos superfície, não mais.

**View renumerada para 0033 (`server/migrations/0033_bm_apt_pessoa_time.ts`).** O SQL é idêntico ao da 0029 revisada na rodada 1 (`git diff` entre as duas sem diferença); só muda o número, para depois das migrações da coleta (0029 a 0032), das quais a view depende (`dim_card_raiz`, `dim_responsavel.pessoa_ref`). O `down` da 0032 desfaz também a 0033 (`abfd287`, teste de migração). As exceções nomeadas seguem presas ao nome exato: `catalogo.pg.test.ts:60` e `:90`, `migracoes.estatico.test.ts:90` e `:131`; a coluna de view em `COLUNAS_PESSOA` segue em `lgpd.ts:22`. A avaliação da rodada 1 (saída mínima, GRANT só ao papel da aba, `search_path` resolvido na criação, predicado sem alcance além das colunas de saída) vale sem mudança.

**A view não devolve `pessoa_ref` de pessoa eliminada (nota do parecer da coleta).** A view só emite `r.pessoa_ref` de `dim_responsavel` por JOIN interno (`0033:24`). A eliminação a pedido apaga a linha de `dim_responsavel` e anula `pessoa_ref` no fato na mesma transação (`server/src/modulos/businessmap/apontamento/eliminacao.ts:86-90`). O único `INSERT` em `dim_responsavel` em `server/src` é `resolverResponsaveis` (`server/src/modulos/businessmap/usuarios.ts:95`), que descarta os ids suprimidos antes de pedir e de inserir e não roda sem o sal com a lista não vazia (`:59-68`, A1 da coleta). Logo, depois da eliminação, a pessoa sai da view, não volta pela coleta, e a rota não a separa do time nem a mostra; as horas dela, com `pessoa_ref` nulo, ficam só no agregado do time. Mesmo que um id fosse recriado por erro, receberia `pessoa_ref` novo, sem vínculo com o fato antigo. Falta só o teste que prove isso de ponta a ponta (A3).

**Documentação da API (`docs/api/apontamento.md`, `openapi.json`).** Coerente com o código: 422 removido da tabela e do OpenAPI, filtro por `type_id` descrito, rótulos fixos com `nomesReais` falso, pseudonimização (não anonimato) mantida. Nenhum exemplo traz nome de pessoa.

## Detalhe dos achados

### A3 (recomendado): falta o teste da view depois da eliminação
Evidência: `server/migrations/0033_bm_apt_pessoa_time.ts:24` (JOIN com `dim_responsavel`) e `server/src/modulos/businessmap/apontamento/eliminacao.ts:89` (DELETE da linha); `server/tests/apontamento-eliminacao.pg.test.ts` não consulta `apt_pessoa_time`. Caminho: nenhum hoje; o risco é regressão futura (por exemplo, a view passar a ler `pessoa_ref` de outra tabela ou a eliminação trocar o DELETE por anulação do nome), que devolveria à rota a chave de quem pediu eliminação, contra a decisão do dono sobre retenção (P-2, 2026-11-01). Severidade baixa. Correção mínima: no `.pg` da eliminação ou no da rota, eliminar uma pessoa responsável por card do escopo e conferir que `SELECT pessoa_ref FROM apt_pessoa_time` não a devolve e que a resposta da rota não traz o `pessoaRef` antigo em `opcoes.pessoas`. Esforço P. Dono: node-backend (ou qa-engineer no QA da rota).

## Plano em cartões
- A3: node-backend ou qa-engineer, junto do QA da rota; não devolve.

## Riscos aceitos
Nenhum novo. Os da rodada 1 seguem: com o nome real ligado e `APONTAMENTO_REDE_LOCAL`, qualquer máquina da rede local lê a aba sem autenticação (decisões "C" e P-1 do dono, 2026-11-01, até o login pelo AD); `HOST=0.0.0.0` com `APONTAMENTO_PUBLICACAO_LOOPBACK=1` fora do contêiner é declaração do dono que a guarda não confere.

## Ferramentas e lacunas
Leitura estática, `git diff` e `git grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação e não foram rodados; as varreduras ficam no CI do `devops-engineer`. O delta não traz dependência nova nem credencial. Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
