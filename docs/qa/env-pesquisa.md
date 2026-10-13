# Parecer de QA - fix/env-exemplos-pesquisa

Escopo: `DSPD_PWD_PESQUISA` nos exemplos de `.env`, `restauracao.yml`, remoção da exceção `AGUARDA_EXEMPLO_DO_USUARIO` e teste novo em `tools/homolog/src/artefatos.test.ts`. Sem mudança de código de produção.

## Mutação do teste novo
Removida a variável, em cada ponto, e rodado `artefatos.test.ts` (restaurado depois de cada rodada; árvore limpa):

| Ponto | Resultado |
|---|---|
| `.env.example` | falha (1) |
| `docker-compose.yml` (dev) | falha (1) |
| `.github/workflows/ci.yml` | falha (1) |
| `.github/workflows/homolog.yml` | falha (2) |
| `.github/workflows/restauracao.yml` (tudo) | falha (1) |
| `-e DSPD_PWD_PESQUISA` só do `docker run` | falha (1) |
| `scripts/test-pg.sh` | falha (1) |
| `docker/postgres/reparar-papeis.sh` | falha (1) |

Todas as mutações são detectadas.

## Segredos
- A linha adicionada nos dois `.env*.example` é `DSPD_PWD_PESQUISA=` (vazia). Os únicos valores são `pesquisa_dev`, em workflows de CI com banco descartável (mesmo padrão das demais senhas). Nenhum segredo real no diff.
- `docker-compose.homolog.yml` usa `${DSPD_PWD_PESQUISA:?}` (obrigatória) e não contém `*_dev`; o teste existente (`/_dev\b/`) e o do init (sem `:-` nem `_dev`) seguem verdes. Homologação não aceita padrão.
- Só `.env.example` e `.env.homolog.example` são versionados.

## Execução
- `docs:check`: ok (342 páginas, 51 métricas, 2 eventos).
- `artefatos.test.ts`: 23/23.
- `pnpm run pronto`: falhou duas vezes na etapa de cobertura do web, com timeouts de 15 s em testes diferentes (1ª: 6 falhas; 2ª: 10 falhas, em `semanal`, `preferencias`, `tatico`). A branch não altera `web/` em relação à `develop`. `src/features/preferencias` isolado: 48/48. Instabilidade por carga da máquina (WSL), não relacionada à mudança; reportada, sem skip. Convém confirmar na CI.

## Parecer
Aprovado para a mudança em si (sem bug aberto). Pendência: confirmar o verde do `web` na CI, por causa do timeout sob carga.
