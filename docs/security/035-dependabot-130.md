---
tipo: revisao-seguranca
contrato: 1
pedido: 035-resolver-prs-do-dependabot-124-125-126
branch: dependabot/npm_and_yarn/develop/dev-dependencies-71717c5124
commit: bb536e41ab7ded4b4bfb64d94233990166ce80a1
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-20
---
# Review de segurança: PR #130 do Dependabot (grupo dev-dependencies)

Propósito: parecer de dependência atualizada (`R-SEGURANCA`) do #130, que substituiu o #125 e o #129. Público: tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado.** Só dependências de desenvolvimento e de teste, sem versão maior, sem pacote de origem nova e sem script de instalação novo. Nada chega ao código de produção da API nem do coletor.

Revisão estática do diff do PR (954 linhas: sete `package.json` e `pnpm-lock.yaml`). Nada foi executado. Lacuna: não rodei `pnpm audit` nem `osv-scanner` (sem Bash neste papel); a evidência de varredura é a da CI do PR.

## Gatilho
Dependência atualizada (cadeia de suprimentos).

## Avaliação
- **Escopo (só dev/teste):** todas as mudanças estão em `devDependencies` (`package.json` raiz, `e2e`, `web`, `tools/docs-contratos`, `tools/pesquisa`; no `server`, só `vitest` e `@vitest/coverage-v8`). Nenhum `dependencies` mudou: a API e o coletor não recebem código novo em runtime.
- **Versões (todas correção, menor só o axe):** vitest e @vitest/coverage-v8 5.0.3 → 5.0.5; typescript-eslint 8.71.1 → 8.71.2; @testing-library/user-event 14.6.7 → 14.6.8; @playwright/test 1.64.0 → 1.64.1; jsdom 30.1.2 → 30.1.3; @axe-core/playwright 4.13.0 → 4.14.0 (menor, aceito pelo dono em 2026-10-21). TypeScript segue em ^5.9.3, eslint e @eslint/js em 9: nenhuma versão maior, conforme as decisões do dono.
- **Transitivos que mudaram (nenhum pacote novo de nome):** `playwright` 1.64.1, `obug` 2.2.1 → 3.0.0 (maior, transitivo de vitest e coverage; utilitário de debug, só em teste), `@asamuzakjp/dom-selector` 9.2.4 → 10.0.4 (maior, transitivo do jsdom, só em teste, mesmo engine Node já exigido), `@asamuzakjp/css-color` 7.1.7, `tinybench` 6.2.2, `undici` 8.11.2 → 8.12.2 (transitivo do jsdom), `whatwg-url` 17.3.0, `lilconfig` 3.1.4, `@vitest/mocker` e `@vitest/spy` 5.0.5, família `@typescript-eslint/*` 8.71.2. `axe-core` 4.13.0 saiu do lock e ficou só o 4.14.0 (deduplicação). Todos os nomes já existiam no lock; nenhum nome novo entrou.
- **Origem e integridade:** todas as linhas `resolution` alteradas são `{integrity: sha512-...}` no formato padrão do registry, sem `tarball`, URL, `git+` ou caminho local. Nenhuma troca de origem.
- **Scripts de instalação:** nenhum `requiresBuild`, `postinstall` ou similar foi adicionado no diff. O único campo novo é `engines: {node: '>=22.12.0'}` no `@axe-core/playwright`, compatível com o Node 22+ do projeto.
- **Peer deps:** `@vitest/mocker` passa a aceitar `msw ^2.4.9 || ^3.0.0` (peer opcional, não instalado).

## Achados
Nenhum achado bloqueante. Sem recomendações.

## Observações (informativas)
- O `obug` 3.0.0 e o `@asamuzakjp/dom-selector` 10 são saltos maiores em transitivos; o risco é de compatibilidade (cabe ao QA, pela suíte), não de segurança. Sem caminho de ataque, pois só rodam em teste e na CI.
- Convém que a CI do PR traga `pnpm audit` (ou `osv-scanner`) verde antes do merge, como evidência da varredura que não rodei.

## Riscos aceitos
Nenhum.
