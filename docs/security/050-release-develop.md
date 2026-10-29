---
tipo: revisao-seguranca
contrato: 1
pedido: 050-release-develop
branch: docs/promocao-2026-10-29
commit: 6aa0ac38c35e8298f50511077527368b53ca08f7
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-29
---
# Review de segurança: promoção da `develop` à `homolog` (pedido 050, release O19 a O26)

Candidata: `develop` em `311691bace0582d80ea06ffc12f20096f1248b87`. Revisão estática do diff `origin/homolog..origin/develop` em `.github/workflows/`, `package.json`, `server/package.json`, `web/package.json`, `e2e/package.json`, `pnpm-lock.yaml` e `packages/`. Nada foi executado (workflow, suíte, `pnpm audit`); `gitleaks` e `osv-scanner` não rodados (lacuna: sem rede nesta etapa; as varreduras e o Dependabot rodam no CI).

Volta E1.7: a candidata passa a ser o commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; ele só acrescenta `CHANGELOG.md` e muda o `version` do `package.json` (0.1.0 → 0.2.0), sem dependência nem código. O veredito e os achados não mudam.

**Veredito: aprovado.** Nenhum defeito provado; duas recomendações.

## Workflows
- `homolog-reavalia.yml` (novo): `permissions` mínimas (`contents: read`, `actions: write`, `pull-requests: read`), sem checkout nem código da branch, sem segredo além do `github.token`. Gatilho `workflow_run` com filtro `event == 'push'` e `head_branch == 'homolog'` (push só de quem escreve no repositório, não de fork). `SHA` vem do evento e entra no `--jq` entre aspas; é hexadecimal de commit, sem caminho de injeção. A única ação é reexecutar `homolog-aprovada`, que continua avaliando pela regra da base. `actions: write` é o mínimo para o rerun. Só vale com o arquivo na `main` (declarado no cabeçalho).
- `homolog-aprovada.yml`: permissões inalteradas (`contents: read`, `actions: read`); checkout do `base.sha` com `persist-credentials: false`, regra lida da base (não da candidata). Os valores do PR (`head.ref`, `head.repo.full_name`) entram por `env`, nunca interpolados no `run`. `GH_TOKEN` é o `github.token` somente leitura de `actions`; a consulta `gh api` é GET. O critério de aprovação não mudou: só a mensagem e o tratamento de portão em curso.
- `homolog.yml` e `ci.yml`: a E2E vira matriz de 2 partes (`--shard`) com um job agregador que mantém o nome do check (`e2e`, `e2e-homolog`). `permissions: contents: read` mantido; ações continuam fixadas por SHA; nenhum `pull_request_target`; nenhum segredo novo. O agregador usa `if: always()` e falha se `needs.e2e-parte.result != success` (cancelada e ignorada também reprovam), então a matriz não enfraquece o portão. Artefato de falha com nome por parte, retenção de 3 dias, como antes.

## Dependências
- `typescript-eslint` 8.71.2 → 8.72.0 (raiz e `server`), `ignore` 7.0.12 → 7.0.13, `@tanstack/react-query` 5.104.2 → 5.104.5: patch/minor de ferramenta de desenvolvimento e de cliente, sem pacote novo.
- `react-router` 7.18.4 → **8.5.0** (`web`): salto de versão maior em dependência de runtime do navegador; sai `cookie` e `set-cookie-parser`, entra `cookie-es` 3.1.1 (só na árvore transitiva). Sem caminho de ataque identificado: a SPA não usa cookie de sessão do roteador. Lockfile versionado, com `integrity` nas entradas novas. Ver A1.
- Alertas abertos conhecidos: o do `dompurify` (K-178) está fora do 050 por decisão do dono e não bloqueia este parecer.
- Nenhuma dependência nova no `server` além do `typescript-eslint` de desenvolvimento; scripts de instalação não foram alterados no diff.

## Dados de pessoa e texto livre
- Nenhuma migração, SQL, GRANT, rota ou código de coletor mudou (`server/src`, `docker`, migrações fora do diff); só `server/package.json` e `server/tests/plataforma2.test.ts`. A allow-list do coletor e o GRANT por coluna do `dspd_api` ficam como nos pareceres k084 e k085.
- `packages/` (contratos, métricas, mock): o contrato dos cartões ganha só rótulos O19 a O26 e ligações entre cartões. Não surgiu campo de pessoa, `usuarioKey`, título ou descrição de chamado do Acelerato; a busca por `email`, `token`, `apikey`, `senha` no diff retornou apenas um teste que procura (e proíbe) as chaves `nome`, `email`, `usuario`, `login` na saída.
- BusinessMap e Acelerato continuam separados: o diff não toca coleta nem cálculo de sustentação.

## T14 e Fase 2 contra o 025-t14 e o 048-t14
- Os pareceres 025-t14 (aprovado, c4db73e) e 048-t14-desenho/ameaças (aprovado) fixam: outros times como um inteiro só, nada de nome, número de pessoas nem ranking, projeto oculto sem dado dedutível, fail-closed. O diff mantém e reforça: união discriminada por `oculto`, ramo oculto só com `meuTime.k` (contrato `fechado`, `packages/contratos/src/tambem.ts`), oculto fora de `total` e de `base.n`, ordem dos visíveis por total e código e dos ocultos por código, `outrosPublicavel` ausente = oculto (`packages/metricas/src/businessmap/t14.ts`). A contagem de pessoas continua só no gerador do mock (`packages/mock/src/businessmap/membrosSimulados.ts`), ids `sim-NNN`, sem nome nem e-mail; teste varre a saída do mock. Sem regressão em relação aos pareceres anteriores.
- Permanecem em aberto, sem mudança, o A1 herdado do 025-t14 (ordem por total) e as recomendações A1 e A2 do 048-t14-desenho (fase 3), todos recomendados e já registrados; a pergunta do dono sobre membro em mais de um time segue aberta, sem decisão por inferência.

## Achados
- A1 (recomendado) web/package.json:32 · `react-router` saltou para a versão maior 8.5.0; confirmar, na rodada do CI (`osv-scanner`/Dependabot) e na suíte E2E do portão, que não há alerta aberto para ela e para `cookie-es` 3.1.1; sem varredura local de rede nesta etapa
- A2 (recomendado) .github/workflows/homolog-reavalia.yml:36 · o laço de rerun tenta por ~60 s e então falha; sem risco de segurança, só operacional: mantido como está, e o `devops-engineer` pode avaliar no parecer dele se vale um limite explícito de tentativas já presente (6)

## Riscos aceitos
Nenhum.
