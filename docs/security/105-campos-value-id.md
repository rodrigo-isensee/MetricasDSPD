---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-value-id
commit: ad04bc375ee5eedc505281b82b44c8d73badd514
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (E7.209, campos 48 e 49 pelo value_id)

Escopo: diff `2a4dc3b9..ad04bc37` (coleta, domínio do BusinessMap, mapa de métricas, arquivo de domínio, testes). Catálogo conferido contra o spike `allowedValues` (48: 114 a 125; 49: 126 a 131): os 18 `value_id` do arquivo batem um a um.

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
- Regras invioláveis: nada mistura BusinessMap e Acelerato; nada individual; versão de critério registrada (`afeta` O14 e O17).

Provas executadas: os três testes tocados (`allow-list`, `dominio-businessmap`, `metricas.mapa`) rodados local no head ad04bc37: 3 arquivos, 129 testes, todos passaram. Suíte inteira: só no CI do PR (sem PR nesta branch); este parecer não afirma CI verde. O CI do push no head (run 43874353570) terminou vermelho: 1 de 329 testes de banco falhou, `server/tests/dominio-businessmap.pg.test.ts:58` ainda espera 1 campo no arquivo (agora são 2). Defeito de teste, não de segurança; ver A1.

## Achados
- A1 (recomendado) server/tests/dominio-businessmap.pg.test.ts:58 · teste de banco do ref-sync desatualizado (espera 1 campo; CI vermelho): ao corrigir, provar no banco que as linhas valor_id_causa_raiz e valor_id_origem_demanda são gravadas pelo papel dspd_ref e lidas pela coleta

## Sondas

## Detalhe dos achados
A1: evidência `server/tests/dominio-businessmap.pg.test.ts:58` (e as contagens 13 e 370 logo abaixo, que não contam o campo 49 nem as 18 linhas `valor_id_*`) · caminho de ataque: nenhum; a lacuna é de prova, o papel e as colunas de `ref_dominio` não mudaram · severidade: informativa · correção mínima: atualizar as contagens e afirmar no banco as linhas `valor_id_*` gravadas e a leitura de `dominiosDaColeta` com elas · esforço P · dono: node-backend.

Observação informativa: opção nova criada no BusinessMap cai em `desconhecido` (contada) até o dono atualizar o arquivo de domínio, que é o comportamento fechado esperado.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática do diff e os testes da stack já instalados; nenhuma varredura externa. Varreduras de segredo e dependências ficam no CI (o diff não toca dependências nem configuração).
