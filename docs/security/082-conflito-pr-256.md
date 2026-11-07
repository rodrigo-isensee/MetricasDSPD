---
tipo: revisao-seguranca
contrato: 1
pedido: 082-conflito-pr-256
branch: dependabot/npm_and_yarn/develop/producao-d435e0b6dd
commit: 11713ebaf3f5f566c61626742c37cbd6b093249d
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: PR 256 do Dependabot (grupo producao), sem conflito com a develop

Propósito: parecer sobre as dependências de produção atualizadas no PR 256 (`R-SEGURANCA`), depois do merge da develop, do lockfile regerado (E1.5) e da volta que fixou o react-query em 5.105.3. Público: tech-lead, qa-engineer e Jarvis.

**Veredito: aprovado.** As três dependências e a transitiva `@tanstack/query-core` vêm do registro público, com integridade igual à publicada. Não há pacote novo, script de instalação novo nem aviso de segurança conhecido nas versões resolvidas. O `fastify` 5.12.8 é release de segurança: corrige um DoS (GHSA-3qgw-9275-xf8w) que não atinge este projeto, porque ele não usa `handlerTimeout`. O A1 da rodada anterior (react-query resolvido em 5.107.1) está resolvido: o lockfile agora traz a 5.105.3, a versão do PR e do recibo ao dono.

Revisão do diff `origin/develop...11713eba` (`server/package.json`, `web/package.json` e `pnpm-lock.yaml`; o quarto arquivo é este parecer). Nenhum arquivo de código mudou, então não há teste de arquivo tocado para rodar (D-5).

## Gatilho
Dependência de produção atualizada (cadeia de suprimentos).

## Revalidação (volta por delta)
- O `forge-check delta` sobre o parecer anterior, no intervalo `cb440b3d..11713eba`, lista só o `pnpm-lock.yaml`, com 8 linhas a mais e 8 a menos, nas linhas 255, 2135-2139, 7177, 7179 e 7181.
- O que essas linhas mudam: o importer do `web` e as entradas de `packages` e `snapshots` do `@tanstack/react-query` e do `@tanstack/query-core` passam de 5.107.1 para 5.105.3. Não mudou outra entrada, as chaves de peer seguem iguais e nenhuma dependência foi acrescentada.

## Avaliação
- **package.json:** só as três versões mudam. No `server`, `@fastify/swagger` vai de ^9.9.2 para ^9.9.3 e `fastify` de ^5.12.7 para ^5.12.8. No `web`, `@tanstack/react-query` vai de ^5.105.0 para ^5.105.3.
- **Resolução no lockfile contra a develop:** `@fastify/swagger` 9.9.3, `fastify` 5.12.8, `@tanstack/react-query` 5.105.3 e `@tanstack/query-core` 5.105.3 (transitiva). No `fastify-type-provider-zod` 7.0.0 só muda a chave de peer. Nenhum pacote entrou ou saiu, nenhuma versão maior apareceu e o resto do lockfile ficou igual.
- **Origem e integridade:** as `resolution` alteradas trazem só `{integrity: sha512-...}`, sem `tarball`, URL, `git+` nem caminho local. Conferi no registry.npmjs.org: o sha512 de `@tanstack/react-query@5.105.3` e de `@tanstack/query-core@5.105.3` é igual ao do lockfile; o de `fastify@5.12.8` e o de `@fastify/swagger@9.9.3` foram conferidos na rodada anterior e não mudaram. As duas do TanStack foram publicadas em 2026-11-02, às 20:39 UTC. A react-query 5.105.3 depende só da query-core 5.105.3, com versão exata.
- **Scripts de instalação:** nenhum `install`, `preinstall` ou `postinstall` nas versões novas. O `onlyBuiltDependencies` continua só com `esbuild`.
- **Notas de versão:**
  - `fastify` 5.12.8 é release de segurança e corrige o GHSA-3qgw-9275-xf8w (médio, afeta >= 5.8.0 e < 5.12.8). Com `handlerTimeout` diferente de zero e resposta em stream, um cliente sem autenticação conseguia derrubar o processo. Este projeto não usa `handlerTimeout` em `server/src`, então não estava exposto, mas a atualização elimina essa classe de risco.
  - `@fastify/swagger` 9.9.3 corrige a emissão de schemas aninhados nas rotas. Muda só o documento OpenAPI gerado, sem rota nova exposta, e a CI cobre o `openapi:verificar`.
  - `@tanstack/react-query` 5.105.0 → 5.105.3 roda só no web, no navegador. São correções de comportamento interno, sem superfície nova de entrada.
- **Varreduras:** no OSV (api.osv.dev, `/v1/query`), nenhuma vulnerabilidade na react-query nem na query-core 5.105.3; para o fastify 5.12.8 e o swagger 9.9.3, o resultado da rodada anterior também foi vazio. O `pnpm audit --prod` na branch dá 2 moderadas que já existiam, nenhuma nas três: `glob` e `minimatch`, pelo caminho `server>node-pg-migrate>glob`, que este PR não toca.

## Achados

## Lacunas
- O `osv-scanner` e o `gitleaks` não estão no PATH, então consultei a API do OSV diretamente, pacote por pacote. O diff não tem texto que possa conter segredo, só versões e hashes.
- A suíte inteira fica com o QA e com a CI (D-5).

## Riscos aceitos
Nenhum.
