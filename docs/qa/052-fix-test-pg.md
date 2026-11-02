---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-fix-test-pg
commit: 4e5958fe1db79d19a4e7f83d68b654607b21c9d2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---
# QA: correção do test:pg (override do vite 8.3.4), pedido 052, E2.113, K-182

Links: review `docs/reviews/052-fix-test-pg.md` (aprovado), segurança `docs/security/052-fix-test-pg.md` (aprovado). Sem especificação de UX nem contrato de API: é correção de dependência (tarefa técnica sem interface).

**Parecer: aprovado** sobre `4e5958f` (o HEAD da branch, 312e268, só soma os dois pareceres). A suíte `test:pg` volta a iniciar com cache frio e passa inteira; o vermelho na base foi reproduzido; o vite resolve em 8.3.4 em todo o repositório.

## Escopo e método
Obrigação: a develop deve voltar a ter o `test:pg` verde na CI (K-182, E2.107) sem mudar código de produção, só `pnpm-workspace.yaml` (+4) e `pnpm-lock.yaml`. Clones limpos e descartáveis em `/tmp/claude-1000/qa-052-e2113/` (HEAD `4e5958f`) e `/tmp/claude-1000/qa-052-e2113-base/` (base `4a01e39`), cache frio como a CI, `pnpm install --frozen-lockfile`, PostgreSQL 17 do Compose local (banco `metricas_test`, schemas de teste com prefixo, removidos no teardown), `CI=true` e `PG_TESTE_URL` igual ao da CI. Uma suíte por vez. O `.env` não foi lido e o banco do dono não foi tocado. Os dois clones foram apagados no fim.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| `test:pg` inicia e passa com cache frio, com o override | `pnpm --filter @metricas-dspd/server run test:pg` no clone de `4e5958f` | passou: 25 arquivos, 163 testes | cache frio do jiti (a causa da falha); n/a de dado |
| Vite único em 8.3.4 no repositório (server e web) | `pnpm why vite` | passou: só `vite@8.3.4` | versão efetiva sob o `^8.3.5` do `web/package.json` |
| O build e a suíte do web seguem verdes na 8.3.4 | `pnpm --filter @metricas-dspd/web test` | passou: 80 arquivos, 1228 testes | downgrade em todo o repositório |
| Instalação reprodutível | `pnpm install --frozen-lockfile` | passou (lockfile aceito sem alteração) | lockfile consistente com o override |
| Vermelho antes do verde | `test:pg` na base `4a01e39` (vite 8.3.5, cache frio) | falhou como esperado (abaixo) | a falha que o override corrige |

## Vermelho antes do verde
Não há teste novo (o conserto é de versão); o teste que prova é a própria suíte `test:pg`, vista falhando na base sem o override. Base `4a01e39`, clone novo, `pnpm why vite` = `vite@8.3.5`, mesmo comando e mesmas variáveis:

```
No test files found, exiting with code 1
⎯⎯⎯⎯⎯⎯⎯ Startup Error ⎯⎯⎯⎯⎯⎯⎯⎯
TypeError: code.charCodeAt is not a function
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @metricas-dspd/server@0.0.0 test:pg: `vitest run --project pg`
Exit status 1
```

No HEAD `4e5958f`, o mesmo comando: `Test Files 25 passed (25)`, `Tests 163 passed (163)`.

## Resultado da execução (2026-11-01, WSL, Node do ambiente, vitest 5.0.5)
- `test:pg` do server em `4e5958f`: 25 arquivos, 163 testes, verdes.
- Suíte do web em `4e5958f`: 80 arquivos, 1228 testes, verdes.
- Suíte unitária do server (56 testes, relato do autor e do review) não foi repetida: o diff não toca código nem a resolução do vite do server além do que o `test:pg` já exercita; a CI do push 41339030574 (relato do review) passou inteira.
- Mutação: não se aplica (nenhum arquivo de código no diff).
- Acessibilidade e E2E: não se aplicam (sem mudança de interface).

## Achados
- A1 (recomendado) pnpm-workspace.yaml:17 · o critério de reversão do override só é verificável em parte (a correção pode vir do vite, não do vitest); acompanha o A2 do review, para o cartão de depois de segunda.
- A2 (recomendado) .github/workflows/ci.yml:144 · PR de vite ou vitest do Dependabot roda `test:pg` com o override ativo e não prova a versão nova; mesmo ponto do A1 do review.
