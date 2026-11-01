---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-fix-test-pg
commit: 4e5958fe1db79d19a4e7f83d68b654607b21c9d2
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-fix-test-pg (correção do test:pg na develop, E2.111, K-182)

**Veredito (E2.111): aprovado** em `4e5958f`. A causa registrada confere com o código do vite, o override é o menor ajuste que destrava a CI sem mexer em código, e a CI do push da branch passou inteira (banco e build incluídos). Dois recomendados, nenhum bloqueante.

## O que li
`git diff origin/develop..4e5958f` (base `4a01e39`): `pnpm-workspace.yaml` (+4) e `pnpm-lock.yaml` (+28 −27). Para o contexto: `web/package.json`, `.github/dependabot.yml`, a linha E2.107 cumprida no Histórico do pedido e o `module-runner.js` das duas versões do vite instaladas na worktree.

## Foco pedido

**Causa registrada.** Conferi no `node_modules/.pnpm` da worktree: o `dist/node/module-runner.js` da 8.3.5 tem `extractInlineSourceMap` (linhas 355 e 362), que chama `code.charCodeAt(dataEnd - 1)` (linha 366); a 8.3.4 não tem a função. Com o código do globalSetup entregue como Buffer pelo vitest 5.0.5, o `prepareStackTrace` estoura assim que uma stack passa por `tests/pg/global-setup.ts`, o que só acontece com o jiti do node-pg-migrate transformando as migrações (cache frio). Explica a falha só na CI e em clone novo, e a mensagem enganosa ("No test files found"). A causa não foi inferida: o autor a reproduziu em clone limpo nas duas versões.

**Override como menor ajuste.** Sem código tocado, sem trava em `package.json` e sem mudar o vitest. O lockfile muda só o vite e as referências a ele (vitest nos importadores, `@tailwindcss/vite`, `@vitejs/plugin-react`, o `@vitest/mocker`); nenhum outro pacote mudou de versão. `pnpm install --frozen-lockfile --lockfile-only --offline` passa sem alterar o lockfile. A alternativa de restringir o override ao vitest (`vitest>vite`) não vale aqui: o vite é dependência par do vitest, e o vite do web precisa ser o mesmo que o vitest do web usa. O custo é o downgrade do vite no repositório inteiro, inclusive o build do web: o job `build` da CI passou com a 8.3.4. Se a 8.3.5 trazia correção de segurança é a revisão da E2.112, que corre em paralelo; este parecer não a refaz.

**Comentário e critério de reversão (`pnpm-workspace.yaml:17-20`).** O comentário diz a causa, o cartão e onde a falha aparece, no mesmo estilo do override do dompurify logo acima. O critério ("reverter quando sair vitest com a correção") é verificável só em parte: a correção pode vir do vite (aceitar Buffer) e não do vitest, e não há issue de referência. Ver A2.

**`web/package.json` com `^8.3.5` sobreposto pelo override.** Não é defeito: o pnpm aplica o override ao especificador do importador (o lockfile do `web` registra `specifier: 8.3.4`), o `--frozen-lockfile` aceita e a CI instalou. Deixar o `^8.3.5` no manifesto é o certo: trocá-lo por `8.3.4` faria o Dependabot reabri-lo e a reversão teria dois lugares. Quem lê o `package.json` vê 8.3.5 e roda 8.3.4; o comentário no `pnpm-workspace.yaml` é o único registro, e basta.

**Efeito no Dependabot.** O grupo `dev-dependencies` (semanal, `target-branch: develop`) vai continuar propondo vite novo no `web/package.json`; o override segura o lockfile em 8.3.4, então o PR sai com diff no manifesto e nada efetivo, e o check `banco` não diz se a versão nova já resolve. Ver A1. O PR 182 foi mesclado com o `banco` em falha (run 41332550930): a melhoria de processo fica no relatório ao Jarvis, fora deste diff.

**Teto de linhas (decisão M14).** `git diff --numstat --no-renames origin/develop...4e5958f`: 4 linhas em `pnpm-workspace.yaml` e 55 no lockfile gerado; abaixo do teto de qualquer modo. Um comportamento só.

## Checklist (leitura)
Faz o que a E2.107 pede, sem mais. Nenhuma regra inviolável do `CLAUDE.md` alcançada (só dependência de desenvolvimento e build). Commit único, Conventional Commits em português, com a causa e o caminho de volta no corpo e `Cartão: K-182`.

## Outros pareceres e ferramentas (citados, não refeitos)
- CI do push da branch, run 41339030574 em `4e5958f`: `rapida`, `filtro`, `testes`, `seguranca`, `imagem`, `openapi`, `build` e `banco` com sucesso; `perf` e `e2e` pulados (só em PR).
- Relatório da E2.107: test:pg em clone limpo com 163 verdes, server 56 verdes e web 1228 verdes.
- Segurança da dependência: E2.112 (`docs/security/052-fix-test-pg.md`), em paralelo, ainda não commitada quando este parecer foi escrito.
- O `praticas.md` não tem regra "decidida por: `<comando>`": nenhuma saída de ferramenta a citar.

## Achados
- A1 (recomendado) .github/dependabot.yml:10 · Com o override, PR do Dependabot que suba o vite muda só o web/package.json e não testa a versão nova. Registrar no K-182 que todo PR que toque vite ou vitest roda o test:pg sem o override antes de mesclar.
- A2 (recomendado) pnpm-workspace.yaml:19 · Critério de reversão sem gatilho verificável: a correção pode vir do vite e não do vitest. Sugestão: reverter quando o test:pg passar em clone limpo sem o override, com o link da issue upstream se houver.
