# FA-002 - Seed não grava as referências do fluxo nem as versões de critério: opções de filtro vazias e métricas divergentes do mock
- Status: verificado pelo QA em 2026-10-13 (paridade 52/52 e E2E chromium-api 18/18); era: corrigido (feature/front-via-api)
- Severidade: média (alta se a homologação adotar `VITE_FONTE=api` sem corrigir)
- Responsável sugerido: node-backend (seed derivado do mock, FA-4)
- Ambiente: feature/front-via-api, API `DADOS_FONTE=mock`

## Passos para reproduzir
`bash scripts/com-api-mock.sh pnpm --dir web run test:paridade` (sob `flock`). O seed usa `limite_wip_fluxo: {}, limite_frentes: 0, sle: [], alocacao: [], objetivos: [], criterios: [], equipes: [], sistemas: []`.

## Resultado esperado
Mesmo resultado do mock após o parse, para os mesmos filtros.

## Resultado obtido
- `GET /filtros/businessmap`: `equipes` e `sistemas` vazias (mock: 6 equipes e os sistemas).
- `GET /criterios`: `[]` (mock: 2 marcos, ex.: 2026-03-02); logo `criterios.serie/janela` somem em O7, O9, T1, S4, S6, EI_FL2, EI_FL3, EI_SUST nos períodos 6m e 12m.
- O1: `hoje.limite` 0 (mock 84), `acimaDoLimite` 89 (mock 5), `equipesConsideradas` 0 (mock 6). O2 com equipe+sistema: `etapas` diferentes. T2: `sle` nulo e `statusMeta` `sem-referencia`. T3: `acordadoPct` 0. T7: `limiteFrentes` 0. E2: categorias/objetivos diferentes. E3: `comFicha` 0 (mock 9).
- Sem `coleta_incremental` (o seed grava só `projecao`), `/fontes/:d/estado` diz "Nenhuma coleta concluída" e os painéis nem mostram cartões. O fixture do FA-4/FA-5 (`server/tests/pg/servidor-api-mock.ts`) insere essa coleta; o seed deveria gravá-la ou a homologação precisa de um passo equivalente.

## Evidência
Mensagens de diferença por caminho no teste `web/paridade/paridade.test.ts` (ver `docs/qa/front-via-api.md`).

## Correção
O seed grava `ref_quadro`, `ref_dominio` (sistema, objetivo, área interna), `ref_limite_wip_fluxo`, `ref_limite_frentes`, `ref_sle` (percentil 85; Intangível sem prazo não tem linha), `ref_alocacao_acordada`, `ref_ficha_resultado`, os critérios por fonte em `dspd_core` (BM com a versão 2026-03-02, AC com a de 2026-06-01; ids 1 e 2 do banco, a paridade os mapeia) e uma `coleta_incremental` por fonte (versão `seed-mock-coleta`). O fixture do servidor de paridade deixou de inserir a coleta. Dois ajustes de fixture/mock sem mexer na base: o servidor de paridade usa relógio fixo na data da base (`historico.fim` vinha de "hoje"), e `MockFonteMetricas.opcoesFiltro` ordena as equipes por nome (a API ordena por nome). Os helpers de teste `tests/pg/referencia.ts` passaram a só ler os ids dos critérios.
