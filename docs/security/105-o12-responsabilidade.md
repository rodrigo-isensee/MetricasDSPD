---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: 1561e1b4010956b35837823b33bc9baccc588a70
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (E7.235 e revalidação E7.267, O12 pela Responsabilidade do Atraso)

Escopo: revalidação por delta (`forge-check parecer delta`) de `27453898` (parecer anterior, aprovado com A1 recomendado) até `1561e1b4`. O delta é o merge da `develop` (régua de tamanho E7.102, prioridade E7.100, já com pareceres próprios) e a resolução do bloco `versao_criterio` do arquivo de domínio, mais o teste do interruptor desligado do O12.

## Gatilhos
`R-SEGURANCA`: campo customizado na fronteira de coleta do BusinessMap e a regra inviolável de não avaliar ninguém individualmente. Sem migração, GRANT nem rota nova neste delta.

Conferido no head `1561e1b4`:
- Campo 42 (Responsável CR, pessoa) continua fora pelas três camadas: `CAMPOS_CUSTOMIZADOS_FORA = ['36', '42']` (`server/src/modulos/businessmap/allow-list.ts:95`); o esquema do arquivo recusa o field mesmo com zeros à esquerda (`server/src/modulos/businessmap/dominio-businessmap.ts:145`, normalizado por `Number`); a leitura do `ref_dominio` ignora 36 e 42 mesmo com a linha adulterada na base (`dominio-businessmap.ts:268` a `:272`). O arquivo real só tem os fields 48, 49 e 51 (`docs/architecture/fontes/businessmap-dominio.json:19`, `:86`, `:123`). O `42` que aparece em `tamanho_regua` é o id de time (`ref_time`), lido só sob o campo `tamanho_regua` por `reguaDeLinhas`, nunca por `colunasDosCampos` (que filtra `campo_customizado`); não abre caminho para o field 42.
- A1 do parecer anterior resolvido: `versao_criterio.afeta` agora é O8, O14 e O17 numa só versão (`businessmap-dominio.json:8` e seguintes), travado no teste (`server/tests/dominio-businessmap.test.ts:51` e `:88`). O O12 mantém versão própria na biblioteca (`packages/metricas/src/core/criterios.ts:297`).
- Interruptor: `RESPONSABILIDADE_ATRASO_COM_FONTE = true` (`packages/contratos/src/origem.ts:111`); o teste novo prova que, desligado, o mesmo dado com o campo 51 preenchido sai nulo, com o motivo e `statusMeta = sem-referencia`, e que ligado publica a causa interna (`packages/metricas/src/businessmap/fixtures.cobertura.test.ts`, caso "O12 (E7.214, interruptor desligado)"). Nunca 0 falso.
- Avaliação individual: sem mudança; o O12 segue só agregado por mês e total, sem lista de cards nem dimensão por pessoa.
- Merge da `develop`: a régua de tamanho entra com esquema fechado (código canônico `time_id:size`, rótulo em enum de seis faixas, `strict`, sem chave repetida) e leitura que desconfia do banco (`dominio-businessmap.ts:364` em diante); nenhum texto livre nem pessoa. Nenhum segredo no delta; nada mistura BusinessMap e Acelerato.

Provas executadas no head `1561e1b4`, local: `server/tests/dominio-businessmap.test.ts`, `server/tests/metricas.mapa.test.ts` e `server/tests/allow-list.test.ts` (3 arquivos, 138 testes, todos passaram) e `packages/metricas/src/businessmap/fixtures.cobertura.test.ts` (36 testes, todos passaram, inclui o do interruptor). Sem PR nesta branch: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde.

## Achados

## Sondas

## Detalhe dos achados
Sem achado novo. A1 (anterior) resolvido no delta. Mantida a observação informativa: o código do campo 51 no arquivo não é conferido contra `RESPONSABILIDADES_ATRASO` no esquema; o arquivo é versionado e passa por PR, sem caminho de ataque.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática do delta e os testes da stack já instalados; nenhuma varredura externa. Segredos e dependências ficam com o CI.
