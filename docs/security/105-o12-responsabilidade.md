---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: f01fabf6cfdabd7463e86105d2a6e7775b0cd049
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11 (E7.279, revalidação do O12 pela Responsabilidade do Atraso, PR 499)

Escopo: revalidação por delta (`forge-check parecer delta`) de `1561e1b4` (parecer anterior, aprovado) até `f01fabf6`, o merge da `develop` (`a04bd2f2`) com conflito resolvido em `docs/architecture/fontes/businessmap-dominio.json` e `server/tests/dominio-businessmap.pg.test.ts`. No domínio, o delta toca só o arquivo de domínio e `packages/metricas/src/core/criterios.ts`; `server/src/` e `migrations/` ficam idênticos à `develop` (`git diff a04bd2f2 f01fabf6` sem mudança nesses caminhos).

## Gatilhos
`R-SEGURANCA`: campo customizado na fronteira de coleta do BusinessMap e a regra inviolável de não avaliar ninguém individualmente. Sem migração, GRANT nem rota nova neste delta.

Conferido no head `f01fabf6`:
- Resolução do conflito: o arquivo de domínio é a união exata das duas pontas. Contra a `develop`, a diferença é só o campo 51 (`businessmap-dominio.json:128`, três valores com código em enum fechado Interno, Solicitante e Terceiro e `value_id` 137 a 139) e o texto de `versao_criterio`/`regra` que o cita; contra o parecer anterior, a diferença é só o `motivo_bloqueio` com os 11 `reason_id` da E7.184 (`businessmap-dominio.json:150`), que veio da `develop` com parecer próprio, rótulos em enum fechado e nenhum texto livre.
- Campo 42 (Responsável CR, pessoa) continua fora pelas três camadas: `CAMPOS_CUSTOMIZADOS_FORA = ['36', '42']` (`server/src/modulos/businessmap/allow-list.ts:95`, sem mudança); o esquema do arquivo recusa o field mesmo com zeros à esquerda (`server/src/modulos/businessmap/dominio-businessmap.ts:145`); a leitura do `ref_dominio` ignora 36 e 42 mesmo com a linha adulterada na base (`dominio-businessmap.ts:268` a `:272`). A `regra` do arquivo mantém "Os fields 36 (ID Acelerato) e 42 (Responsável CR) são proibidos". O arquivo só tem os fields 48, 49 e 51 (`businessmap-dominio.json:24`, `:91`, `:128`).
- Domínio sem pessoa: nenhum campo, coluna ou rótulo novo de pessoa; os rótulos de motivo são categorias do quadro, não nomes. O `42` de `tamanho_regua` segue sendo id de time.
- `criterios.ts`: só a versão de critério do O12 (`packages/metricas/src/core/criterios.ts:310`) somada à da E7.184 vinda da `develop`; constantes, sem entrada externa.
- Interruptor `RESPONSABILIDADE_ATRASO_COM_FONTE = true` (`packages/contratos/src/origem.ts:111`), coberto pelo teste do interruptor desligado. O O12 segue só agregado por mês e total, sem dimensão por pessoa. Nenhum segredo no delta; nada mistura BusinessMap e Acelerato.

Provas no head `f01fabf6`, local: `server/tests/dominio-businessmap.test.ts` e `server/tests/allow-list.test.ts` (2 arquivos, 125 testes, todos passaram) e `packages/metricas/src/businessmap/fixtures.cobertura.test.ts` (36 testes, todos passaram). Suíte inteira: CI do head `f01fabf6` verde (workflow CI, runs 43924342956 push e 43924359355 pull_request, ambos success).

## Achados

## Sondas

## Detalhe dos achados
Sem achado novo. Mantida a observação informativa do parecer anterior: o código do campo 51 no arquivo não é conferido contra `RESPONSABILIDADES_ATRASO` no esquema; o arquivo é versionado e passa por PR, sem caminho de ataque.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura estática do delta e os testes da stack já instalados; nenhuma varredura externa. Segredos e dependências ficam com o CI.
