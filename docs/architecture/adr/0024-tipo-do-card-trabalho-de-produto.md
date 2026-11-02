# 0024 - Tipo do card: rótulo "Trabalho de produto" no contrato e `dim_card.tipo` sempre com o rótulo do contrato

Estado: vigente (decisão técnica do time, E2.67 do pedido 052, aplicando a H-17 do dono de 2026-10-30). Data: 2026-10-31.
Propósito: fechar o achado A3 do review da F4 (`docs/reviews/052-f4-projetor.md`) antes do servidor da F6. Público: node-backend, react-frontend, ux-designer, tech-lead, QA. Revisão: na F6b ou quando FL2 passar a dado real, o que vier antes.

## Contexto
- A H-17 do dono (2026-10-30) põe cada tipo real do BusinessMap numa categoria da taxonomia do briefing §4.3, e os tipos restantes em "trabalho de produto sem categoria especial". A F2 gravou isso em `ref_tipo_card.categoria` como código (`bug_interno`, `defeito_producao`, `requisicao`, `divida_tecnica`, `melhoria`, `produto`; migração 0018).
- O projetor da F4 copia esse código para `dim_card.tipo` (`normalizador.ts:197`). A base do seed grava em `dim_card.tipo` o rótulo do contrato `TipoCard` (`packages/contratos/src/comum.ts`), e `mapa.ts:40` passa o valor direto à biblioteca, que compara com os rótulos de `TIPOS_CARD` (O7 por tipo, O13 por `'Defeito em produção'`, `ehDemanda` em `comum.ts:77` por `'Bug interno'`, filtro por tipo em `comum.ts:69`, e toda segmentação por tipo).
- Resultado com dado real (achado A3): nenhum card bate com nenhum rótulo; O7, O13 e o filtro por tipo saem vazios. E mesmo convertendo o código, `produto` não tem rótulo em `TIPOS_CARD`, e esse é o grupo da maioria dos tipos reais (H-17).

## Decisão
1. `TIPOS_CARD` ganha o valor `'Trabalho de produto'`, **no fim da lista** (a ordem fixa dos cartões O2, O3, O9 e O10 e o desempate do Resumo não mudam). `TIPOS_FILTRO` também o recebe, com `TIPO_ID` `'trabalho-produto'`: a segmentação por tipo (§4.2 do briefing) precisa conseguir isolar o grupo que a H-17 criou. Nenhuma natureza, meta ou regra nova é atribuída a ele.
2. O domínio de `dim_card.tipo` é o rótulo do contrato `TipoCard`, nas duas bases (seed e real). O projetor converte a categoria da H-17 para o rótulo por uma tabela fechada, única, em `packages/contratos` (`TIPO_DA_CATEGORIA`, tipada `Record<CategoriaTipoCard, TipoCard>`):

   | `ref_tipo_card.categoria` | `dim_card.tipo` |
   |---|---|
   | `bug_interno` | Bug interno |
   | `defeito_producao` | Defeito em produção |
   | `requisicao` | Requisição |
   | `divida_tecnica` | Dívida técnica |
   | `melhoria` | Melhoria |
   | `produto` | Trabalho de produto |

   `ref_tipo_card.categoria` continua com o código (a migração 0018 não muda). "Incidente" e "Iniciativa" seguem no contrato para o mock; a H-17 não leva nenhum tipo real a eles.
3. `mapa.ts` continua mapeamento puro, sem conversão: só deixa de fazer cast cego do tipo. Card com `tipo` fora de `TIPOS_CARD` não entra no contexto e é contado (só o número) no log estruturado da montagem do contexto.

## Alternativas
- **Converter em `mapa.ts` e manter o código em `dim_card.tipo`.** Rejeitada: a base do seed grava rótulos; o mesmo campo teria dois formatos conforme a base, ou o seed mudaria e quebraria o critério da F6 de manter FL2 e FL3 com o hash da base do mock.
- **Mapear `produto` para um rótulo existente (por exemplo, Melhoria).** Rejeitada: inventa regra de negócio; a H-17 diz "sem categoria especial".
- **`produto` como `tipo` nulo.** Rejeitada: `lerCards` exige `tipo IS NOT NULL`; a maioria dos cards reais sumiria de todas as métricas.
- **Deixar `produto` fora de `TIPOS_FILTRO`.** Rejeitada: o filtro por tipo nunca conseguiria isolar a maior parte dos cards.

## Consequências
- Toda métrica que percorre `TIPOS_CARD` passa a ter uma linha a mais por tipo. As que filtram por "tem dado" (O7, O10, O21, O24, O25, T13) não mudam no mock; as que mapeiam todos os tipos (O2, O3, O4, O5, O8, O9, O11, O14, O22, O26) ganham uma linha com zero ou "abaixo de 20" no mock. Testes de forma e snapshots desses cartões precisam da linha; a base do seed (e seu hash) não muda.
- `T3.naturezaDe` (FL2, em mock) cai no ramo padrão "Evolução" para o rótulo novo. Não vale para dado real agora; quando FL2 passar a dado real, a natureza de "Trabalho de produto" vira PERGUNTA ao dono antes do código.
- URL de filtro salva com os seis tipos antigos deixa de significar "todos" (`codec.ts` compara com `TIPOS_FILTRO`) e passa a excluir "Trabalho de produto". Efeito só em links antigos; o padrão (lista vazia) segue "Todos".
- `dim_card_versao` guarda `tipo` (`COLUNAS_VERSAO`): a primeira projeção real precisa rodar já com esta decisão; se rodar antes, a reprojeção grava uma versão nova por card só pela troca de formato (append-only, sem como desfazer).
- O texto do rótulo é interface: o ux-designer o confere na revisão da F6.

## Por que o existente não basta
Não cria mecanismo novo: estende um enum do contrato e fixa o domínio de uma coluna que já existe. Evidência de que o existente não basta: `normalizador.ts:197` grava o código e `TIPOS_CARD` não tem rótulo para `produto` (achado A3, review da F4 revalidado em e1e5f86).

## Critério de reversão
Reverter (voltar a sete rótulos e reabrir a decisão) se o dono mudar a H-17 de forma que nenhum tipo real caia em "trabalho de produto" (a contagem de cards com `dim_card.tipo = 'Trabalho de produto'` na base real for zero depois de uma reprojeção completa), ou se a WS1 aplicar no quadro a taxonomia do §4.3 com tipos próprios para todos os cards (lista de conferência sem nenhum tipo com categoria `produto`).

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-10-31 | Decisão escrita (E2.67); nenhuma projeção real ainda | manter |
| pendente | Contagem por `dim_card.tipo` depois da primeira projeção real (E2.58 e projeção) | pendente |
