# SNO-003 - E2E existentes não foram adaptados por inteiro: 124 testes vermelhos na suíte completa
- Severidade: alta (a suíte E2E completa não passava; o `pronto` não roda E2E e por isso não acusou)
- Responsável: react-frontend (F8, adaptação dos E2E existentes). **Corrigido pelo QA nos próprios testes**, sem tocar código de produção; resolvido neste HEAD.
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-sust`, branch `feature/sustentacao-no-operacional`, HEAD 67624ba, Chromium (`--project=chromium --project=chromium-semente-alt`)

## Passos para reproduzir
1. `cd e2e && E2E_SEM_ALT=1 pnpm exec playwright test --project=chromium --project=chromium-semente-alt --workers=3` no HEAD 67624ba (com as bibliotecas de sistema do Chromium disponíveis).

## Resultado esperado
Suíte verde, como no parecer do lote anterior (`docs/qa/bugs-intensivos.md`).

## Resultado obtido
549 passaram e 124 falharam (execução de 20 min). Causas, todas em teste, nenhuma em produção:

| Causa | Testes | Observação |
|---|---|---|
| A adaptação foi uma troca mecânica de `/operacional` por `/operacional?cadencia=diaria` que corrompeu os próprios auxiliares (`urlDe` gerava `cadencia=diaria?tipo=...`, `cadencia=dados,diaria?equipe=...`; a rota da Semanal ficou com `cadencia` duplicada) | `intensivo-filtros` IF-C (cerca de 60 combinações pairwise) | O prefixo `?` virou parte da busca |
| A URL canônica de Diária e Semanal agora carrega `cadencia=...`; o teste esperava busca vazia ou só `equipe=...` | `filtros` FIL-01/02, `intensivo-filtros-bordas` B01 a B29, B40, B44, B46 a B48, `intensivo-filtros` I06, I07 | Expectativa nova: filtros sem a visão |
| Filtros da Sustentação passaram a viver com o prefixo `sust_` (CA-5, CA-6); o teste ainda usava `equipe`, `prioridade`, `periodo` sem prefixo | IF-B04, B05, B16, B17, B35, B41, `intensivo-filtros` pairwise `sustentacao`, I01, I08, I10 a I13 | Parâmetro sem prefixo na Sustentação é descartado em silêncio (CT-08) |
| O comportamento mudou por especificação (CA-6, CA-12, CA-16, CA-24) e o teste afirmava o antigo | OP-02 (Diária deixou de ser o padrão), B3-002 (o hash `#o12` decide a visão Semanal), VG-06 (7 reuniões: entrou "Revisão da sustentação · semanal"), IF-D1 (filtros do fluxo ficam guardados na URL da Sustentação), `espera-invisivel` (`#ei-fl1` vive na Semanal) | |
| Textos novos por visão (CA-2 e microcopy): "Mais métricas desta visão", "Métricas desta visão", "Exportar · Operacional (fluxo de projeto)" | COMP-01 (4), PREF-02 (4), PREF-15, EXP-01, EXP-07 (4), pre-pr diálogo (2), `espera-invisivel` exportação | |
| Regex com `?` não escapado (`/\/operacional?cadencia=diaria$/`), que casa outra coisa | VG-02, `espera-invisivel` (3) | |
| Asserção de "8 destinos" no menu com 7 | SIS-ROB-03 | A Sustentação saiu do menu (CA-1) |
| Filtro de período da Sustentação ainda em `periodo` (a janela padrão de 6 meses cruza a mudança de critério) | SIS-CONS-06 | Troca para `sust_periodo` |
| Teste novo da própria demanda ficou preso no nome acessível do link (ver SNO-002) | SIS-CONS-02 (timeout de 300 s) | |
| PREF-12 esperava `cadencia=diaria` no link copiado da Semanal: o app estava certo (`cadencia=semanal`), o teste adaptado, errado | PREF-12 | Falhava sozinho, fora do lote |
| Medição que lia a página antes da visão montar (lazy + dados) | `responsivo` RESP-01 na Sustentação e `perf-api` A1 (Sustentação: 0 amostras, Resumo: 1 de 10 cargas) | Ver mutação M3 e A1 no parecer |

## Correção aplicada pelo QA
Edição só de código de teste, sem `skip`: `e2e/tests/{b12-fluxo,b3-sust-ei-vg,complementares,espera-invisivel-nos-paineis,exportar,filtros,intensivo-filtros,intensivo-filtros-bordas,intensivo-sistemico,pre-pr-evidencias,preferencias,responsivo}.spec.ts` e `e2e/perf/perf-api.spec.ts`. Reexecução: 672 passaram, 1 falhou (IF-A Semanal, instável por tempo sob carga; isolado passa em 25,7 s, ver parecer).

## Recomendação ao autor e ao tech-lead
Rodar `pnpm --filter @metricas-dspd/e2e run test:chromium` antes de entregar a adaptação de teste (a lista de 17 specs adaptados cobria só uma parte dos que mudam com a rota padrão). Melhoria de fábrica: o gate do autor poderia incluir um E2E por arquivo de teste tocado.
