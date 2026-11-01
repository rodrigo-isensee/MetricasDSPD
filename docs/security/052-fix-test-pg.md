---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f6-painel
commit: 52c201ea9b6949a9188fcea0f18c68e52e5bcfe4
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Review de segurança: 052-fix-test-pg (E2.112, K-182)

**Veredito: aprovado** em `52c201e` (renovado por delta na E2.134; antes na E2.130; revisão original em `4e5958f`). O downgrade do vite de 8.3.5 para 8.3.4 não reabre nenhum aviso de segurança conhecido: a 8.3.5 não trouxe correção de segurança, a 8.3.4 não tem aviso publicado e o lockfile só troca o vite. Um recomendado, nenhum bloqueante.

## Gatilhos
Cadeia de suprimentos: override novo em `pnpm-workspace.yaml` e lockfile regenerado, com downgrade de dependência de desenvolvimento e de build usada no repositório inteiro (inclusive o build do web). Sem toque em código, dado pessoal, credencial, pipeline nem hook.

## O que li
`git diff origin/develop..4e5958f` (base `4a01e39`): `pnpm-workspace.yaml:17-20` e `pnpm-lock.yaml` (+28 −27). Para o contexto: `web/vite.config.ts`, o review `docs/reviews/052-fix-test-pg.md` (5e71696), a linha E2.107 cumprida no Histórico do pedido, o `package.json` das duas versões do vite no `node_modules/.pnpm` da worktree e, por leitura na API do GitHub (só GET), o banco de avisos (GHSA) e as notas da versão v8.3.5.

## Foco pedido

**Avisos corrigidos na 8.3.5: nenhum.**
- Banco de avisos do GitHub, ecossistema npm: `affects=vite@8.3.4` devolve 0 avisos; `affects=vite@8.3.5` também 0; `affects=vite@8.3.2` devolve 6 (controle da consulta).
- Os avisos da linha 8.3 (GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22, GHSA-vfpm-58rq-9qcg, e os do launch-editor GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm e GHSA-698v-4r3x-3vcv) afetam `>= 8.3.0, <= 8.3.2` e foram corrigidos na 8.3.3; a 8.3.4 já os contém. O aviso mais recente (GHSA-8g5g-mxqh-grgj, 2026-10-29) afeta só a `= 6.4.4`.
- Notas da v8.3.5 (2026-10-21): só correções de bug, desempenho (a extração do mapa de fonte sem regexp, que é a causa da quebra), dependências não-maiores e refatoração; nenhuma marcada como segurança. Os dois itens de servidor ("only strip base when path matches a full segment" e "handle socket errors on upgrade requests") são do servidor de desenvolvimento, sem aviso associado.
- Alcance do vite: devDependency do `web` e dependência par do vitest; não vai para a imagem nem para o tempo de execução (o web sai como estático do build). O servidor de desenvolvimento não define `host` (`web/vite.config.ts:14`), então escuta só em localhost. Mesmo um aviso futuro de servidor de desenvolvimento teria caminho de ataque só na estação de quem desenvolve.

**Lockfile sem pacote novo.** As linhas acrescentadas do `pnpm-lock.yaml` são só `vite: 8.3.4` em `overrides`, a entrada `vite@8.3.4` (integridade sha512 presente) e as referências a ela (vitest nos importadores, `@tailwindcss/vite`, `@vitejs/plugin-react`, `@vitest/mocker`). A 8.3.5 sai inteira; nenhum outro pacote mudou de versão. As dependências do snapshot `vite@8.3.4` ficaram as já travadas (`rolldown 1.2.15`, `postcss 8.5.32`, `lightningcss 1.33.0`, `picomatch 4.0.7`, `tinyglobby 0.2.17`), que atendem às faixas da 8.3.4 (`rolldown ~1.2.12`, `postcss ^8.5.29`): o downgrade não arrasta transitivo para trás. As faixas `peerDependencies` reescritas para `vite: 8.3.4` são efeito do override do pnpm, sem pacote novo. O `@vitejs/devtools` estreita a faixa do par opcional, que não está instalado.

**Critério de reversão do override.** `pnpm-workspace.yaml:17-20` registra a causa e o cartão, mas o gatilho ("quando sair vitest com a correção") só olha a quebra funcional. Como a versão exata fica fixa, um aviso futuro que afete a 8.3.4 não seria corrigido pelo PR do Dependabot (ele mexe só no `web/package.json` e o override segura o lockfile), como o A1 do review já nota. Ver A1 abaixo; complementa o A2 do review (gatilho verificável em clone limpo).

## Achados
- A1 (recomendado) pnpm-workspace.yaml:19 · O override exato barra correção de segurança futura do vite. Somar ao critério de reversão: aviso que afete a 8.3.4 revoga o override no mesmo dia (subir para a corrigida e tratar o test:pg à parte). Dono: tech-lead, no K-182.

## Riscos aceitos e ferramentas
Sem riscos aceitos. Ferramentas: leitura estática do diff, do lockfile e dos manifestos instalados; consulta só leitura ao banco de avisos do GitHub (`gh api /advisories`) e às notas da versão. `osv-scanner`, `gitleaks`, `semgrep`, `trivy`, `zizmor` e `actionlint` não estão no PATH (lacuna); a varredura de dependências roda no job `seguranca` da CI, verde no push da branch (run 41339030574, citada no review), e pelo Dependabot.

## Renovação por delta (E2.130, K-182)
Revisado em `802fad3` (`feature/052-f6-painel`, depois do merge da develop `db00570`, que já traz o override do vite 8.3.4 pelo PR 189). O comando acusava o parecer desatualizado só pelo `.env.example`. Delta desde `4e5958f`: o `.env.example` ganhou uma linha comentada (`DSPD_SCHEMA_PREFIXO_SEED`, só texto de documentação, sem valor, credencial nem dado pessoal). `pnpm-workspace.yaml` e `pnpm-lock.yaml` não diferem da develop (`git diff origin/develop..HEAD`: vazio), então o override do vite e o lockfile são os já revisados. Veredito mantido: aprovado; o recomendado A1 segue aberto, sem devolver.

## Renovação por delta (E2.134, K-182)
Revisado agora em `52c201e`. `forge-check delta --parecer` sobre `802fad3..52c201e` lista só `e2e/tests/intensivo-filtros.spec.ts:21` (+1 −1): a constante `TIPOS` de um teste E2E ganhou o valor `trabalho-produto`, uma lista literal de rótulos de filtro, sem credencial, dado pessoal, rede nem lógica. `git diff --stat 802fad3..52c201e` sobre `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.env.example` e `.github` é vazio: o override do vite, o lockfile e o pipeline são os já revisados. Os outros arquivos do intervalo são pareceres de QA e review (documentação). Nenhum gatilho de segurança novo. Veredito mantido: aprovado; o recomendado A1 segue aberto, sem devolver.
