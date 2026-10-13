---
contrato: 0
---
# Parecer de QA - develop antes do PR para main
Commit testado: 2193c78 (worktree limpo, Chromium local, 2026-10-10). Escopo: pedidos 007 (preferências) e 008 (exportar PDF), server em Postgres, pnpm, CI.

## Resultado real
| Verificação | Resultado |
|---|---|
| `pnpm run pronto` | passou (exit 0; F6 inicial 184,80 KB < 200; F11 exportar-pdf 132,64 KB < 150, só sob demanda) |
| `pnpm run gate` | não existe na raiz (ERR_PNPM_NO_SCRIPT); rodado `pnpm --filter @metricas-dspd/e2e run gate`: APROVADO, base mock idêntica à linha de base |
| `pnpm run test:pg` | o script falha na raiz: `container_name: dspd-postgres` já em uso por outro stack na máquina (ambiente, não defeito). Mesma suíte rodada direto contra esse Postgres: 9 arquivos, 43 testes, todos passaram |
| Stack Docker (`up -d --build --wait`, projeto isolado, portas 5543/3143/8143) | api, worker e postgres saudáveis; `/health/ready` 200 `{"status":"ok"}`; `/api/v1/referencia` 200; `/api/v1/metricas/O1` 200; web 200; `down` limpo |
| E2E Chromium (+ semente alternativa), 289 testes, incluindo `preferencias.spec.ts`, `exportar.spec.ts` e axe | 289 aprovados, 0 falhos, 0 pulados. Axe nos dois temas, 375 e 1280, zero violações bloqueantes |
| `test:perf` | 1ª execução: 1 falha (C6 tarefa longa em /estrategico, 244 ms > 200). Repetido 3x isolado: 12/12 passaram (126 a 172 ms). Instável sob carga: ver bug 009 |
| Lighthouse (6 rotas do script) | sem falha; 1 aviso: CLS 0,121 em `/` (limite 0,1) |
| Lighthouse `/preferencias` e `/dados` (config temporária, 3 execuções) | sem avisos nem falhas |

## Fluxos 007 e 008
Cobertos por PREF-01..03, 10..15 e EXP-01..08, todos verdes: ocultar e desfazer com foco, painel vazio, alerta de métrica oculta em "Pede atenção" com selo, Visão geral sempre completa, link copiado sem `ocultar`, perfil por papel; PDF de um painel (campos obrigatórios, "Dados fictícios" em todas as páginas), Visão geral com BusinessMap e Sustentação separados, personalizada com limite de 12 e BusinessMap antes de Acelerato, métrica oculta ausente, sem nomes de pessoas.
Cobertura por rota/estado (`estrategia-de-cobertura.md`): o mapa continua coberto pelos specs estados/filtros/a11y/shell/preferencias/exportar, todos verdes.

## Bugs
- Média: 009, teste de performance C6 instável e lacuna do Lighthouse (`docs/qa/bugs/009-perf-c6-instavel-e-lighthouse-sem-rotas-novas.md`).
- Baixa: CLS do Lighthouse em `/` acima de 0,1 (0,121), só aviso; sem bug aberto separado, acompanhar.
- Ambiente (não é bug): `test:pg` e `stack:up` da raiz colidem com o nome fixo do container `dspd-postgres`. Sugestão ao responsável por infra: remover `container_name` ou torná-lo parametrizável.
- Nenhum bug crítico ou alto.

## Evidências
`docs/qa/evidencias/pre-pr/`: preferencias-1280-claro, painel-ocultas-1280-claro, exportar-dialogo-1280-claro, exportar-dialogo-375-escuro e `exemplo-operacional.pdf` (sem conversor de PDF para PNG no ambiente; abrir o PDF direto). Geradas por `e2e/tests/pre-pr-evidencias.spec.ts`. Observação: a suíte E2E completa regrava PNGs rastreados em `docs/qa/evidencias/b12` etc.; foram revertidos e não entram neste commit.

## Veredito
APROVADO COM RESSALVAS: critérios de pronto atendidos (sem bug crítico/alto, E2E verde, axe sem violações). Ressalvas: perf C6 instável, Lighthouse sem as rotas novas, `gate`/`test:pg` da raiz.
