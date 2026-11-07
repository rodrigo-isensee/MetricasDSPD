---
tipo: revisao-seguranca
contrato: 1
pedido: 082-conflito-pr-256
branch: dependabot/npm_and_yarn/develop/producao-d435e0b6dd
commit: cb440b3d6afc04a799c9824c4c20bb3a84f4313f
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: PR 256 do Dependabot (grupo producao), sem conflito com a develop

Propósito: parecer de dependência de produção atualizada (`R-SEGURANCA`) do PR 256 depois do merge da develop e do lockfile regerado (E1.5). Público: tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado.** As três dependências vêm do registro público, com integridade igual à publicada, sem pacote novo, sem script de instalação novo e sem aviso de segurança conhecido nas versões resolvidas. O `fastify` 5.12.8 é release de segurança e corrige um DoS (GHSA-3qgw-9275-xf8w) que não atinge este projeto, porque ele não usa `handlerTimeout`. Há uma recomendação (A1): o lockfile resolveu o `@tanstack/react-query` em 5.107.1, não em 5.105.3.

Revisão do diff `origin/develop...cb440b3d` (`server/package.json`, `web/package.json`, `pnpm-lock.yaml`; 26 linhas a mais e 26 a menos). Nenhum arquivo de código mudou, então não há teste de arquivo tocado para rodar (D-5).

## Gatilho
Dependência de produção atualizada (cadeia de suprimentos).

## Avaliação
- **package.json:** só as três versões mudam: `server` `@fastify/swagger` ^9.9.2 → ^9.9.3 e `fastify` ^5.12.7 → ^5.12.8; `web` `@tanstack/react-query` ^5.105.0 → ^5.105.3.
- **Resolução no lockfile:** `@fastify/swagger` 9.9.3, `fastify` 5.12.8, `@tanstack/react-query` **5.107.1** e `@tanstack/query-core` **5.107.1** (transitiva). O especificador `^5.105.3` aceita a 5.107.1, e o `pnpm install --lockfile-only` pegou a mais recente. O `fastify-type-provider-zod` 7.0.0 só muda a chave de peer. Nenhum pacote entrou ou saiu, nenhuma versão maior, e o resto do lockfile não mudou: os snapshots de `fastify` e `@fastify/swagger` mantêm as mesmas dependências.
- **Origem e integridade:** as `resolution` alteradas são só `{integrity: sha512-...}`, sem `tarball`, URL, `git+` ou caminho local. Não há `.npmrc` no repositório. Conferi no registry.npmjs.org: o sha512 de `fastify@5.12.8`, `@fastify/swagger@9.9.3`, `@tanstack/react-query@5.107.1` e `@tanstack/query-core@5.107.1` é igual ao do lockfile. Datas de publicação: swagger 9.9.3 em 2026-11-01, fastify 5.12.8 em 2026-11-02, react-query e query-core 5.107.1 em 2026-11-06 às 23:04 UTC (cerca de 16 h antes deste review). Mantenedores no registro: fastify 5, swagger 2, TanStack 3.
- **Scripts de instalação:** nenhum `requiresBuild`, `install` ou `postinstall` nas versões novas. O `onlyBuiltDependencies` segue só com `esbuild`.
- **Notas de versão:**
  - `fastify` 5.12.8 é release de segurança. Corrige o GHSA-3qgw-9275-xf8w (médio, afeta >= 5.8.0 e < 5.12.8): com `handlerTimeout` diferente de zero e resposta em stream, um cliente sem autenticação derruba o processo. `grep handlerTimeout server/src` não acha nada, então a versão anterior não estava exposta. Ainda assim, a atualização tira a classe de risco. Os backports trazem só correções: `statusCode` de erro limitado a 400..599, trailers de stream e tipos.
  - `@fastify/swagger` 9.9.3: correção na emissão de schemas aninhados nas rotas e bump de workflow. Muda só o documento OpenAPI gerado, sem nova rota exposta. A CI cobre o `openapi:verificar`.
  - `@tanstack/react-query` 5.105.0 → 5.107.1 (só no web, no navegador): correção que mantém estável o timestamp de erro do seletor (evita laço de render). A 5.107.1 só republica a dependência.
- **Varreduras:** no OSV (api.osv.dev, `/v1/query`), nenhuma vulnerabilidade nas versões novas das três nem na query-core. O `pnpm audit --prod` na branch dá 2 moderadas preexistentes, nenhuma nas três: `glob` e `minimatch` pelo caminho `server>node-pg-migrate>glob`, que este PR não toca.

## Achados
- A1 (recomendado) pnpm-lock.yaml:255 · react-query e query-core resolvidas em 5.107.1 (publicada 16 h antes), não na 5.105.3 do PR; integridade conferida, sem aviso, mas é versão diferente da do recibo ao dono; tech-lead decide manter ou fixar 5.105.3

## Lacunas
- O `osv-scanner` e o `gitleaks` não estão no PATH: consultei a API do OSV direto, por pacote. O diff não traz texto que possa conter segredo (só versões e hashes).
- A suíte inteira fica com o QA e com a CI (D-5).

## Riscos aceitos
Nenhum.
