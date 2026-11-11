---
tipo: revisao-seguranca
contrato: 1
pedido: 096-criterios-apontamento-env
branch: fix/k270-criterios-env
commit: 3316cce9582e2c8aeda9180c60fc453aa123f4b0
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: K-270, `bm:criterios-apontamento` com o `.env` da raiz

Propósito: parecer de segurança do K-270 sobre `eac38a64..3316cce9` (4 arquivos, +95 -1): script novo em `server/package.json`, leitura do `.env` da raiz em `server/src/entradas/criterios-apontamento.ts`, teste novo e nota do CHANGELOG. Revisão estática mais o teste do arquivo tocado e sondas com segredo falso; nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Cadeia de suprimentos / manifesto: `server/package.json` (script novo).
- Segredos e configuração: leitura do `.env` (credencial do papel migrador, `PG_MIGRADOR_URL`).

## Resultado
- **Script novo só aponta para a entrada, sem dependência nova: conforme.** `server/package.json:31` é `tsx src/entradas/criterios-apontamento.ts`; `tsx` já é devDependency (`server/package.json:55`); `pnpm-lock.yaml`, `package.json` da raiz e `.github/` sem diff.
- **`.env` lido só da raiz do repositório: conforme.** `server/src/entradas/criterios-apontamento.ts:11-13` resolve `../../../` a partir do próprio arquivo (independe do `cwd`), trecho idêntico ao do modelo `server/src/entradas/ref-sync-apontamento.ts:15-23`; o teste confirma o caminho lido (`server/tests/criterios-apontamento-entrada.test.ts:75`). `process.loadEnvFile` não sobrescreve variável já definida no ambiente.
- **Nada do `.env` é impresso, nem na falha: conforme.** Erro de leitura imprime só o `code` (`:16`); ausência (`ENOENT`) é silenciosa e cai na validação, que imprime só nomes de variáveis (`server/src/plataforma/config.ts:118-123`); a saída normal é só `{ vigenteDesde, gravadas }` (`:29`).
- **Mensagem de erro não vaza a senha nem a URL: conforme, com ressalva (A1).** Sondas S1 a S3: URL malformada sai com `input: '*****REDACTED*****'` (o `pg-connection-string` redige); conexão recusada mostra só `address` e `port`; a senha falsa não apareceu em nenhuma saída. A falha do banco ainda sai como pilha não tratada (comportamento anterior ao diff, `:27-32`), ao contrário do modelo, que imprime só a categoria.
- **Teste usa só segredo falso em pasta temporária, sem base real: conforme.** `mkdtempSync` em `tmpdir()` (`server/tests/criterios-apontamento-entrada.test.ts:14`), `.env` de teste com `segredo-de-teste` (`:71`), "banco" é socket em `127.0.0.1` porta efêmera que fecha a conexão (`:64-69`); o isolador troca `process.loadEnvFile`, então o `.env` real nunca é lido; o filho herda só `PATH` e `TMPDIR` (`ambienteFilho`); `afterAll` apaga a pasta. Rodado: `vitest run tests/criterios-apontamento-entrada.test.ts`, 3 verdes.
- **CHANGELOG sem credencial: conforme.** A linha alterada (`CHANGELOG.md:56`) traz só o comando `pnpm --filter ... run bm:criterios-apontamento <data>`; busca por `postgres://`, senha, password, apikey, token, secret e e-mail nas linhas adicionadas achou só a URL falsa do teste.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH; não rodei nenhum. Sem dependência nova, fica com o CI.

## Achados
- A1 (recomendado) server/src/entradas/criterios-apontamento.ts:27 · falha do banco sai como pilha não tratada (host, porta e, na autenticação, o nome do usuário), anterior ao diff; alinhar ao modelo ref-sync-apontamento com catch que imprime só categoriaDoErro e sai com código 1. Dono: node-backend.
- A2 (recomendado) server/src/entradas/criterios-apontamento.ts:21 · validação da data só por regex (aceita 2026-13-40) e sem recusar argumento extra; o modelo usa dataCivilValida e argv.length > 3. Integridade da versão T2.6, não confidencialidade. Dono: node-backend.

## Sondas
- S1 · `PG_MIGRADOR_URL=postgres://migrador:SEGREDO-FALSO@127.0.0.1:abc/db` com `loadEnvFile` no-op e `env -i` · espera: sem `SEGREDO` na saída · obtido: 0 ocorrências, `ERR_INVALID_URL` com `input: '*****REDACTED*****'`
- S2 · `PG_MIGRADOR_URL=postgres://migrador:SEGREDO-FALSO@127.0.0.1:1/db` · espera: sem `SEGREDO` na saída · obtido: 0 ocorrências, `ECONNREFUSED 127.0.0.1:1` em pilha não tratada
- S3 · `PG_MIGRADOR_URL=postgres://migrador:SEG%ZZ@127.0.0.1:1/db` · espera: sem `SEG` na saída · obtido: 0 ocorrências, `ECONNREFUSED`

## Plano em cartões
Nenhum bloqueante. A1 e A2 ao node-backend, num cartão próprio (ou nesta branch, se o tech-lead preferir), sem segurar o PR.

## Riscos aceitos
Nenhum.
