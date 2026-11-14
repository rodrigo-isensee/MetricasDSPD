---
tipo: revisao-seguranca
contrato: 1
pedido: 101-release-filtros-sem-simulado
branch: docs/101-release
commit: 5d7fe1aac6db8b7f4a9f547719fc73cff7a887e5
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: release 101 (develop 5d7fe1aa contra homolog, PRs 329 a 357)

Propósito: parecer de segurança da release 101 (E1.2, cartão K-273). Li `git diff origin/homolog...ea826a9c` em `server/`, `packages/`, `web/`, `e2e/`, `scripts/`, `.github/` e nos manifestos, mais a seção "Não publicado" do `CHANGELOG.md` da branch `docs/101-release` (72cc6d38, que só soma o CHANGELOG e o review a ea826a9c). Os lotes que já tiveram parecer próprio (097 L2, K-275, K-277, K-281 e 099 L2d) foram conferidos no estado final, sem refazer as sondas deles. Nada rodou contra a base real e nenhum `.env*` foi lido. Revalidado na develop 5d7fe1aa (PR 357), seção abaixo.

## Gatilhos
- Dado de pessoa e GRANT por coluna: `server/src/plataforma/db/grants.ts:17` (`dim_card.equipe` no papel da aba Apontamento) e as provas de GRANT por `COLUNAS_PESSOA` (K-282).
- Recorte por equipe (risco de reidentificação e de comparação entre times): Apontamento (097 L2 e L3), Resumo (L4 e L5), Sustentação (L7a e L7b).
- Entrada da API: parâmetros `equipe` novos ou alterados nas rotas de sustentação, tendência e apontamento.
- Ferramenta com credencial: `scripts/consultas-leitura-098-099.sh` (K-275, K-277, K-281).
- Build da web: `web/vite.config.ts` e a guarda G1 (`web/scripts/sem-mock.mjs`).

## Resultado
- **GRANT por coluna e COLUNAS_PESSOA: conforme.** A única coluna nova no papel do Apontamento é `bm.dim_card.equipe` (`grants.ts:17`), nome do time, que não está em `COLUNAS_PESSOA` (`server/src/plataforma/db/lgpd.ts:11`) nem é pessoa. `responsaveis` de `dim_card` continua fora; o GRANT é montado excluindo `COLUNAS_PESSOA` (`grants.ts:83`). As provas de GRANT passam a derivar as colunas proibidas da lista única e falham se a coluna listada não existir (`server/tests/pg/colunas-pessoa.ts:8-28`), o que fecha a deriva entre teste e esquema.
- **Nenhum dado de pessoa novo na API: conforme.** As consultas novas leem só `equipe`, `tipo` e `prioridade` (`server/src/modulos/apontamento/repositorio.ts:157`, `server/src/modulos/referencia/repositorio.ts` em `lerTiposBM`, `lerEquipesAC`, `lerPrioridadesAC`), sem contagem por time nem coluna de pessoa; a resposta do Apontamento ganha só `opcoes.equipes` (`id` slug, `rotulo` nome do time). O contrato do Acelerato não recebe coluna de pessoa (o CT-07 de `server/tests/acelerato-estatico.test.ts:135` segue válido).
- **Recorte por equipe no Apontamento: conforme, com pergunta aberta ao dono.** O filtro só restringe linhas (`packages/metricas/src/businessmap/apontamento/filtros.ts`, `passa(f.equipe, ...)`), não agrupa nem ordena por time; o SQL dos incompletos recebe os nomes por parâmetro `$5::text[]` e `$6::boolean` (`repositorio.ts:194`), resolvidos de slug validado (`servico.ts:28`), sem SQL montado com valor da requisição. O aviso do parecer do 097 L2 continua: em time pequeno, o recorte por equipe facilita reidentificar "Pessoa n" no cartão de capacidade; piso de pessoas por recorte é regra de negócio e segue como pergunta não bloqueante ao dono (pedido 097, registro de 2026-11-11 18:56). Não é achado novo desta release.
- **Opções de equipe e tipo do dado real, sem texto livre: conforme.** Tipos do fluxo filtrados contra a lista fixa `TIPOS_FILTRO`; prioridades contra o enum `PRIORIDADES` (`referencia/servico.ts:22-39`); equipes da sustentação são `DISTINCT equipe` do corte de `lerChamados` (`cortes.ts:6`), com slug único e desempate por bytes (K-288). Nenhum campo de título, descrição ou comentário entra nas opções. A entrada `equipe` nas rotas é `lista(idSlug)` com `^[a-z0-9][a-z0-9-]{0,59}$` (`server/src/modulos/metricas/schemas.ts:10`, `:41`, `:60`, `:76`) e `idEquipe` com o mesmo formato no Apontamento (`packages/contratos/src/apontamento.ts:40`), limite de 50 itens e recusa de repetidos. O `z.array(z.string())` de `packages/contratos/src/filtros.ts:64` é só o tipo interno, depois da validação da rota.
- **Web sem mock no build api (G1 e G2): conforme.** `web/vite.config.ts` fixa `VITE_FONTE` como `'api'` no build; a G2 (`web/src/test/lint.meta.test.ts:349`) e a G1 (`web/scripts/sem-mock.mjs`) existem. Rodado nesta passada: `vite build` para pasta temporária e `node scripts/sem-mock.mjs <pasta>`, saída `G1 ok: sem chunk, sentinela ou texto do mock`. A G1 roda no `pronto` da web, mas não nos jobs de build da CI (A1).
- **Nenhum segredo: conforme.** Busca no diff por apikey, token, senha, password, secret, chave privada, URL com credencial, `ghp_` e `AKIA`: só valores falsos de teste (`scripts/consultas-leitura-098-099.test.sh`) e instruções com `read -rs` em documentação, sem valor. O comando de consultas mantém a senha fora do argv (arquivo `0600`) e o certificado fixado, como nos pareceres 099-consultas-leitura, K-277 e K-281.
- **Workflows e dependências: conforme.** Nenhuma mudança em `.github/` nem no `pnpm-lock.yaml`; os manifestos só ganham scripts (`consultas:098-099`, `sem-mock`), sem dependência nova.
- **Testes dos arquivos tocados (rodados):** `server`: `apontamento-rota.test.ts`, `metricas.test.ts`, `corte-unico.test.ts`, 156 verdes; `web`: `lint.meta.test.ts` e `filtros/codec.test.ts`, 68 verdes. As suítes de banco (`*.pg.test.ts`) ficam com o CI e o QA.
- **Lacunas de ferramenta:** `gitleaks`, `osv-scanner`, `semgrep`, `zizmor` e `actionlint` não estão no PATH; não rodei nenhum. Sem dependência nova e sem workflow alterado, fica com o CI.

## Revalidação (develop 5d7fe1aa, PR 357)
- Delta `ea826a9c..5d7fe1aa` (PR 357, 101 E1.9): só `e2e/tests-api/api.spec.ts`, `e2e/tests-api/tatico-011-lote2.spec.ts`, `e2e/tests-api/tendencias.spec.ts` e `docs/reviews/101-specs-e2e-api.md`; nenhum arquivo de `server/`, `packages/`, `web/`, `scripts/`, `.github/` nem manifesto. `forge-check parecer delta`: "nenhum arquivo do domínio mudou".
- **Guarda de pessoa do CT-59 não afrouxou: conforme.** `PESSOA` (`usuarioKey`, `e-mail`, `nome`, `titulo`, `assignee`, `responsavel`) e o padrão de e-mail seguem aplicados ao corpo inteiro (`e2e/tests-api/tendencias.spec.ts:30`, `:80`, `:82`). Só `"descricao"` saiu da `PESSOA` e passou a ser checada no corpo sem as subárvores `criterios` (`tendencias.spec.ts:27-29`, `:81`), onde fica o texto fixo do marco de critério (T2.6, `ref_versao_criterio`). Sonda local com o mesmo `semCriterios`: `descricao` dentro de `criterios.serie[]` passa; `descricao` em `meses[]` é pega. A isenção vale só para chaves chamadas `criterios`, que não vêm do Acelerato.
- FA5-04 e FA5-16 (filtro `tipo=melhoria` no lugar de `incidente`) e TT-02 (sem selo fictício, ADR 0030) só acompanham a interface; o CT-58 passa a exigir 400 para `equipe` fora do slug (`A%20B`, `x_y`, `-x`) e 200 para slugs válidos, o que reforça a validação de entrada conferida acima.
- Os specs são e2e contra a API com Postgres; não os rodei (ficam com o CI e o QA da release). Veredito mantido: aprovado; A1 continua recomendado.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:186 · a guarda G1 (web/scripts/sem-mock.mjs) não roda na CI: os jobs que fazem pnpm run build (ci.yml:186, ci.yml:266, homolog.yml:82, homolog.yml:195) não chamam sem-mock; incluir o passo após o build. Dono: devops-engineer.

## Plano em cartões
Nenhum bloqueante. A1 ao devops-engineer (o envio de workflow é do dono, escopo `workflow`); hoje a G1 depende do `pnpm run pronto` do autor e a G2 roda na suíte da web na CI, então a volta do mock por import já é barrada; o que fica sem rede é um chunk de mock por outro caminho que só a G1 vê. Não segura a release. A pergunta do piso de pessoas por recorte de equipe (097 L2) continua com o dono pelo Jarvis.

## Riscos aceitos
Nenhum.
