# Parecer de QA - homologação mínima (develop, homolog, main)

Branch `chore/homologacao-minima` (commit 4cf0b48), 2026-10-12. Escopo: `tools/homolog`, `docker-compose.homolog.yml`, workflows `ci`, `homolog` e `homolog-aprovada`. Review e correções: `docs/reviews/homologacao-minima.md`.

## Resultado
**Aprovado, com pendência da CI** (comportamento real dos workflows no GitHub). Nenhum bug aberto.

## Testes de `tools/homolog` com mutação
Cada mutação foi aplicada ao arquivo de produção, a suíte rodou e o arquivo foi restaurado (árvore limpa ao fim). Todas fizeram teste falhar.

| Mutação | Teste que falhou |
|---|---|
| Porta do Postgres sem `127.0.0.1` | `publica portas só em 127.0.0.1` |
| Porta da API em `0.0.0.0` | idem |
| Senha padrão (`:-api_dev`) no lugar de `:?` | `exige todos os segredos e não traz senha padrão` |
| Sem `mem_limit` no `web` / no `postgres` | `limita a memória e não reinicia sozinho` |
| `homolog-aprovada` aceita SHA que não é a ponta de homolog | `recusa candidato que não é a ponta` |
| Execução não concluída aceita (filtro do job `portao <sha>` anulado) | `recusa quando o job portao do SHA não fechou` e `recusa noturna ausente` |
| Noturna ignorada | 3 testes (noturna ausente, execução manual, execução manual fora de homolog) |
| Portão de push ignorado | 2 testes |
| Hotfix sem verificação do CI | `recusa quando o CI do PR não está verde` |
| Hotfix sem checar `atras` da main / sem limite de commits | um teste cada |
| PR de fork aceito / origem diferente de homolog aceita | `recusa PR de fork` (2 testes) / `recusa origem que não é homolog` |

## Workflows (leitura)
- Gatilhos: `homolog.yml` em push na `homolog`, cron 05:30 UTC e `workflow_dispatch`; `homolog-aprovada.yml` só em `pull_request` para a `main`; `ci.yml` mantém push, PR, cron e dispatch.
- `docs-only`: o job `escopo` classifica; `portao-docs` roda só com escopo `docs` e os jobs de código só com `codigo`, travado em teste.
- Permissions: `contents: read` em `homolog.yml`, sem permissão por job nem escrita; `homolog-aprovada` com `contents` e `actions: read`. Sem `pull_request_target`, sem `${{` em `run:`, actions por SHA, `head.ref` só por `env`. Checkout na base do PR (`base.sha`).
- Jobs obrigatórios do CI preservados com os mesmos nomes: `rapida`, `testes`, `banco`, `build`, `e2e` (mais `openapi`, `imagem`, `perf`, `seguranca`); `banco` passou a rodar sempre em PR para `homolog` e `main` (mais rígido). Nome do job obrigatório `homolog-aprovada` confere com o arquivo.

## Execução
| Verificação | Resultado |
|---|---|
| `homolog:subir` (load 1,6; 4,8 GB livres; uma vez) | ok: `:13000/health/ready`, `:18080/`, `:18080/health/ready`, 64 s |
| `homolog:smoke` | ok, exit 0 |
| `homolog:derrubar -- --volume` | ambiente derrubado e volume apagado; nenhum recurso `homolog` restou; containers `metricasdspd-*` de dev intactos; `.env.homolog` temporário (segredos aleatórios) removido |
| `pnpm run pronto` | exit 0: homolog 62 testes e 100% de cobertura (165/165 instruções, 109/109 ramos), metricas 461, mock 146, contratos 26, spec-check 14, server 261 (pg pulado sem `PG_TESTE_URL`), web 55 arquivos aprovados |
| `pnpm run docs:check` | ok (325 páginas, 50 métricas, 2 eventos) |

## Pendente para a CI
Leitura real da API de Actions (nome do job com SHA, `path`, filtros de evento), `actions: read` do token, comportamento de `homolog-aprovada` num PR de verdade, primeira release sem o script na base (aviso e `exit 0`), `e2e-homolog` contra a pilha implantada (M7 do review, já em cartão).

## Observações
- O fallback da primeira release deixa `homolog-aprovada` verde sem conferência enquanto a base não tem o script. É decisão registrada; a conferência é do usuário.
- A suíte valida texto e lógica com respostas simuladas; só a CI exercita o GitHub real.
