---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-value-id
commit: 86591ab36dfc97fb25bc45d14b50e0854d1f5bad
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (E7.209 e E7.228, campos 48 e 49 pelo value_id)

Escopo: diff `2a4dc3b9..ad04bc37` (coleta, domínio do BusinessMap, mapa de métricas, arquivo de domínio, testes) e, na revalidação E7.228, o delta `ad04bc37..86591ab3` (merge da develop `ca444bfd`). Catálogo conferido contra o spike `allowedValues` (48: 114 a 125; 49: 126 a 131): os 18 `value_id` do arquivo batem um a um.

## Gatilhos
`R-SEGURANCA`: fronteira de coleta de fonte externa (allow-list de campo customizado) e dado que chega à base analítica. Sem migração, sem GRANT novo, sem rota de API nova.

Conferido:
- Fronteira (allow-list): `server/src/modulos/businessmap/allow-list.ts` (`reduzirCamposCustomizados`, sem alteração) só emite `{ field_id, valor }` com `valor` = código do domínio fechado ou `desconhecido`; o texto da opção e a descrição de "Outros" não são lidos para a saída. O `value_id` é só chave de busca em memória; o que vai ao staging é o código vindo do arquivo de domínio, nunca texto da API.
- Arquivo de domínio: `value_id` só dígitos (1 a 10) em `dominio-businessmap.ts:48` e `:53`, esquema `.strict()`; repetido (inclusive com zero à esquerda, normalizado por `Number`) é recusado em `:139`. Teste de recusa (repetido e `12a`) presente e verde.
- Leitura do `ref_dominio` (`dominio-businessmap.ts:268` a `:289`): linha `valor_id_<coluna>` só para coluna da lista fechada, `value_id` numérico, código seguro e não reservado; `value_id` ligado a dois códigos é anulado; só entra se o código existe na lista da coluna e não colide com um rótulo já no mapa. Linha adulterada na base não injeta valor fora do domínio.
- Consulta da coleta (`coleta.ts:50`): parâmetro posicional, nomes derivados de constante; sem interpolação de entrada.
- Normalizador: `desconhecido` vira nulo com a nota `campo_fora_do_dominio` (contagem, nunca o valor).
- GRANT: `origem_demanda` já existia (migrações 0005 e 0006) e não é coluna de pessoa; nenhuma coluna nem papel novo. `ref_dominio` recebe só rótulos de configuração (sem pessoa).
- Texto livre: nenhum entra. As 6 opções do 49 e as 12 do 48 são rótulos de configuração fixados no arquivo versionado.
- O14 (`mapa.ts:23`): só as 5 origens de falha do contrato passam; "Demanda nova" e qualquer outro valor viram nulo. Defesa em profundidade, sem efeito de segurança.
- Regras invioláveis: nada mistura BusinessMap e Acelerato; nada individual; versão de critério registrada.

## Revalidação E7.228 (merge da develop, 86591ab3)
`forge-check parecer delta`: no domínio, `businessmap-dominio.json`, `businessmap-causa-raiz-carga.md`, `dominio-businessmap.ts` e `mapa.ts`; os testes e o CHANGELOG ficam fora. O delta é o que veio da develop (régua de tamanho do E7.102 e a prioridade do E7.100, já revisadas no PR delas) mais a resolução do merge. Conferi a resolução contra as duas pontas:
- Código: o diff `ca444bfd..86591ab3` em `dominio-businessmap.ts` e `mapa.ts` é idêntico ao diff próprio da branch (`2a4dc3b9..72b8a956`), salvo a linha de import de `mapa.ts`, que junta `NIVEIS_PRIORIDADE_BM` e `ORIGENS_DEMANDA`. `origemDeFalha` e `nivelDePrioridade` ficam lado a lado, cada um com a sua lista fechada; a régua (`CODIGO_TAMANHO_REGUA`, esquema `.strict()`, chave repetida recusada, `reguaDeLinhas` com desconfiança do banco) chega intacta.
- Arquivo de domínio: `versao_criterio.afeta` = O8, O14, O17 (a marca da régua não se perde, T2.6); `campos` = 48 (12 opções) e 49 (6); `tamanho_regua` com as 63 linhas da develop, sem alteração; os fields proibidos 36 e 42 não aparecem em `campos` (o `42` da régua é `time_id`, outro espaço de chaves). Nenhum texto livre nem dado de pessoa novo.
- Sem migração, GRANT, rota, dependência ou workflow no delta.

Provas executadas: os três testes tocados (`allow-list`, `dominio-businessmap`, `metricas.mapa`) rodados local no head 86591ab3: 3 arquivos, 136 testes, todos passaram. CI do head 86591ab3: job `banco` verde no push (run 43892580569) e no pull_request (run 43892851278), o que fecha o A1 (o teste pg do domínio já espera os 2 campos e as linhas `valor_id_*`); `seguranca`, `build`, `rapida` e `openapi` verdes. Os jobs `testes` e `e2e` foram cancelados pela concorrência quando entraram os commits só de documentação (07a46647, b118afbb); este parecer não afirma a suíte inteira verde, que fica para o CI da ponta.

## Achados
- A1 (recomendado) server/tests/dominio-businessmap.pg.test.ts:58 · teste de banco do ref-sync desatualizado (espera 1 campo; CI vermelho): resolvido em 2ddd243d, job banco verde no head 86591ab3

## Sondas

## Detalhe dos achados
A1: evidência `server/tests/dominio-businessmap.pg.test.ts:58` (e as contagens que não contavam o campo 49 nem as 18 linhas `valor_id_*`) · caminho de ataque: nenhum; a lacuna era de prova, o papel e as colunas de `ref_dominio` não mudaram · severidade: informativa · correção mínima: atualizar as contagens e afirmar no banco as linhas `valor_id_*` gravadas e a leitura de `dominiosDaColeta` com elas · esforço P · dono: node-backend. Estado: corrigido em 2ddd243d; job `banco` verde no 86591ab3.

Observação informativa: opção nova criada no BusinessMap cai em `desconhecido` (contada) até o dono atualizar o arquivo de domínio, que é o comportamento fechado esperado.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática do diff e os testes da stack já instalados; nenhuma varredura externa. Varreduras de segredo e dependências ficam no CI (job `seguranca` verde no 86591ab3; o diff não toca dependências nem configuração).
