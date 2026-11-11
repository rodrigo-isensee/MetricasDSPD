---
tipo: revisao-seguranca
contrato: 1
pedido: 090-release-2026-11-11
branch: docs/090-release
commit: 81e30293048c0448066ca1ebd831074e5c82ddfb
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança da release 090: develop (85394c5b) contra homolog (E1.3)

Revisão estática do diff `origin/homolog..85394c5b` (PRs 293 a 297, 44 arquivos) mais o CHANGELOG `81e30293`. Nada foi executado contra base real nem lido de `.env*`. Rodei só os testes de servidor dos arquivos tocados que não usam banco (`ref-sync-apontamento-entrada`, `criterios-apontamento`, `apontamento-classificador`, `apontamento-rota`): 4 arquivos, 92 testes, todos verdes.

## Gatilhos
Consulta SQL nova na rota da aba Apontamento (papel `dspd_api_apontamento`, GRANT por coluna), versão de critério T2.6 nova, teste que isola a leitura do `.env` (K-261), atualização do Forge e alertas do Dependabot.

## Resultado por pergunta
1. **089 sem dado de pessoa nem texto livre:** as duas consultas mudadas em `server/src/modulos/apontamento/repositorio.ts` (`lerRotulosSubgrupo` com `DISTINCT ON (codigo) ... ORDER BY codigo, incluido_por_versao_id DESC`; `lerCriterios` com a coluna derivada `familia`) leem só tabelas de referência (`ref_apontamento_subgrupo`, `ref_apontamento_termo`, `ref_apontamento_regra_tipo`, `ref_feriado`, `ref_versao_criterio`, `ref_versao_criterio_metrica`) e colunas que a consulta anterior já usava no `WHERE` (portanto já no GRANT da aba). Nenhum `logged_time_id`, `responsavel_id`, comentário ou tabela `stg_`/`evt_`. A única interpolação nova é a constante `METRICA_DICIONARIO_APONTAMENTO` (literal do código, sem entrada externa): sem injeção. O `id` devolvido passa a ter prefixo de família, sem dado novo.
2. **Tela:** `CartoesQualidade.tsx` (nota de execução técnica) e `CartaoDistribuicao.tsx` (explicação do subgrupo) mostram textos fixos de `textos.ts` e números agregados de `distribuicao.porSubgrupo`; o percentual respeita o piso de 20 (`participacao.status === 'ok'`, senão o texto do piso). O atalho só aplica o filtro de subgrupo à lista já existente, que segue lida pelo papel com GRANT por coluna (sem comentário).
3. **Avaliação individual:** nenhuma visão nova por pessoa, ranking ou meta. A mudança D2 retira `sem-vinculo` de `execucao-tecnica` (`classificarApontamento.ts`), o que reduz marcas de falha atribuíveis; a troca de critério é registrada por INSERT idempotente (`089:sem-vinculo-so-sem-comentario`, `criterios-apontamento.ts`) com data de vigência informada, sem editar as versões 059 e 067 (T2.6, sem sobrescrever histórico).
4. **Fontes separadas:** o delta só toca o domínio do apontamento (BusinessMap); nada do Acelerato.
5. **K-261, teste não lê o `.env` real:** `server/tests/ref-sync-apontamento-entrada.test.ts` roda o filho com `--import` de um módulo que torna `process.loadEnvFile` um no-op, `cwd` numa pasta temporária e `env` só com `PATH` mais o que o caso passa. A entrada lê o `.env` só por `process.loadEnvFile` (`server/src/entradas/ref-sync-apontamento.ts:18`), coberto pelo no-op. O caso novo prova o isolamento com um `.env` falso em pasta temporária (porta 1, credencial fictícia), com controle positivo; o `.env` real nunca é aberto. Rodado aqui: verde.
6. **Forge 0.45.5:** o delta do projeto muda só `.forge/versao` (0.45.2 para 0.45.5); `.githooks/`, `.github/`, `.claude/`, Compose, `server/migrations`, `package.json` e `pnpm-lock.yaml` sem mudança. Nada afrouxa controle no repositório.
7. **Dependabot (A3 do review):** dois alertas abertos, ambos médios, ambos já triados no parecer `073-dependabot-triagem.md` (A4 e A5) com a recomendação de esperar o pacote pai; o delta não os introduz nem os agrava (o lock não muda):
   - #27 `glob` 13.0.6 (GHSA-3g3m-2fjr-6pw4, "AbortSignal cancellation bypass allows post-timeout filesystem traversal"; corrigido em 14.0.2), transitiva de `node-pg-migrate`. Só o CLI de migração a usa, sobre o diretório de migrações do repositório, sem `AbortSignal` nem entrada externa: sem caminho de ataque realista.
   - #29 `minimatch` 10.2.6 (GHSA-g3hv-75wg-m249, negação de serviço por amplificação de padrões; corrigido em 11.0.1), escopo de desenvolvimento (`typescript-estree`, `glob`). Os padrões vêm do próprio repositório: sem atacante.
   Nenhum dos dois bloqueia a release. A correção é salto maior em transitiva; segue o cartão de acompanhamento do 073.

## Achados
- A1 (recomendado) pnpm-lock.yaml:3534 · Dependabot #27 glob 13.0.6 (média, GHSA-3g3m-2fjr-6pw4) via node-pg-migrate, só no CLI de migração sobre pasta do repositório; não bloqueia. Esperar o pai (salto 13 para 14); já triado no 073 (A4).
- A2 (recomendado) pnpm-lock.yaml:4179 · Dependabot #29 minimatch 10.2.6 (média, GHSA-g3hv-75wg-m249, DoS por padrões) só em desenvolvimento, padrões do próprio repositório; não bloqueia. Esperar o pai (salto 10 para 11); já triado no 073 (A5).

## Plano em cartões (propostas)
- Sem cartão novo: A1 e A2 continuam no cartão de acompanhamento do Dependabot proposto no 073 (dono devops-engineer).

## Riscos aceitos
Nenhum; A1 e A2 são recomendações e não bloqueiam. Parecer `aprovado`.

## Lacunas de ferramenta
`gitleaks`, `osv-scanner`, `semgrep`, `zizmor` e `actionlint` não foram usados (fora do PATH ou não aplicáveis: `.github/` não mudou); varredura de segredos e auditoria de dependências ficam com o CI. Os testes com banco (`*.pg.test.ts`) e do front não foram rodados aqui; são do QA e do CI.
