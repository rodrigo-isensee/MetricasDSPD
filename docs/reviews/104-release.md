---
tipo: review
contrato: 1
pedido: 104-release-2026-11-14
branch: docs/104-release
commit: 61286dac966797ba93e6cb8b80a89e81ad3cbeaa
parecer: aprovado
revisor: tech-lead
data: 2026-11-14
---

# Code review: release 104 (develop em b544000d contra a main)

Escopo: `git log --first-parent origin/main..origin/develop`, 25 PRs (#383, #384, #386 a #401 e #403 a #409) sobre a `main` em 8fe42306 (release 103, PR 385); `git diff origin/main...origin/develop`, 234 arquivos, +7792 −758. Etapa E1.1 do pedido `104-release-2026-11-14`. Ficam fora o #402 (K-295) e o lote K-236/K-243, ainda fora da `develop` em b544000d. Cada PR teve review e QA próprios e, quando a classe pediu, segurança (`docs/reviews/097-*`, `099-*`, `102-*`, `fix-forge0442-001.md`, todos `parecer: aprovado`); este parecer lê a release por amostragem dos riscos e não refaz os itens.

## Conferências

- **Diff por área:** biblioteca (`packages/metricas`: O17 por sistema, S1 com `exibirEm`, versão de critério do O17), servidor (migração 0037, `ac:ref-sync` com a unidade de exibição, projetor do Acelerato com o calendário escolhido por rodada e o comando `ac:reprojetar-etapas`, dicionário de setores no `bm:ref-sync`), contratos (`exibirEm`, O17 com `porCausa` anulável e `motivoCausaRaiz`, filtro de equipe da sustentação só por slug, `setores` opcional), web (recolher cartão, AP-PROJETO com os 10 maiores, ajustes do Apontamento, do Resumo e do estado sem dado real), ferramentas (pre-push, lint, suíte única) e documentos.
- **Migrações:** uma nova, a 0037 (`server/migrations/0037_ac_alvo_prioridade_exibicao.ts`), com `checksums.json` atualizado: duas colunas nulas, sem DEFAULT nem preenchimento das linhas existentes (não infere unidade nem reescreve vigência gravada), CHECK de par e de "dia" só em tempo útil, `down` simétrico. A migração a partir da `main` é do portão da homolog (E1.5).
- **Contratos:** `exibirEm` no S1 é aditivo; no O17, `porCausa` passa a anulável e entra `motivoCausaRaiz` (único consumidor é a web deste repositório; snapshot e OpenAPI regravados no #406 e #408); K-287 encerra o apelido `totvs`, `senior` e `fluig` anunciado na 103. Os três estão em "Mudanças que quebram".
- **Critério de cálculo (T2.6):** O17 com `criterio-2026-11-12-o17-por-sistema-dado-real` na biblioteca; K-308 grava `099:D-7-528` só pelo `ac:reprojetar-etapas`, com a data em que roda, e até lá o projetor segue com 8 h (`calendarioDaMontagem` escolhe uma vez por rodada, sem misturar 8 h e 8 h 48 na mesma tabela). K-314 só muda exibição e não grava versão.
- **Regras invioláveis:** BusinessMap e Acelerato seguem separados (o dia de 8 h 48 vale só no calendário do Acelerato; setores só no fluxo); cálculo pela biblioteca (o projetor usa `horasUteisEntre` e o calendário passou a parâmetro obrigatório, sem padrão silencioso); histórico preservado: o `ac:reprojetar-etapas` refaz só a projeção derivada `fato_etapa_chamado`, numa transação, sem tocar `stg_*`, `dim_chamado_versao` nem versões gravadas (ADR 0027, item 7.4). Nome de setor nunca vem do nome do quadro (que traz o sobrenome do responsável) e o rótulo com sobrenome em caixa alta ou arroba é recusado. Sem ranking nem comparação entre times: o recolher é por cartão e o filtro Equipe do Resumo segue consolidando.
- **Pessoa e segredo:** o comando novo imprime só contagens e, no erro, a categoria (`categoriaDoErro`); credencial do migrador lida do ambiente. Segurança da release é da E1.2; cito, não refaço.
- **CI:** `gh run list --branch develop`: push na `develop` em b544000d, workflow CI, run 43576994627 `completed success`; os quatro pushes anteriores (0beacc19, 53009e73, 2a941ced, d7b7bd1a) também `success`.
- **CHANGELOG:** os 25 PRs do range citados em [Não publicado] (conferido por script, número a número); a seção de ações da 103 passa a dizer "depois da release 103" e entra a "Ações do dono na base real depois da release 104", em ordem: `db:migrate` (0037), `ref:sync-calendario`, `ac:ref-sync` em dia diferente do último, `bm:ref-sync`, `coleta ac --reconhecer-mudanca`, `ac:reprojetar-etapas` com a coleta parada e as coletas.

## Achados
- A1 (recomendado) CHANGELOG.md:147 · Nenhum PR da 104 muda os parâmetros comparados pela coleta; o `--reconhecer-mudanca` só vale se o da 103 (D1a, K-305) não rodou. Fica na lista pelo pedido (E3), com o motivo escrito.
- A2 (recomendado) CHANGELOG.md:105 · O K-287 faz link antigo com `equipe=totvs` (e os outros dois) deixar de filtrar; a validação manual da release (E1.6) inclui um link antigo da Sustentação para ver o aviso de equipe inválida.

## Delta: b544000d até 61286dac (#402)

- **Diff lido:** `git diff b544000d 61286dac` (ponta da `origin/develop`), um PR só, o #402 (097 K-295, squash 61286dac): 14 arquivos, +408 −33; 273 linhas de código e teste, cerca de 170 de teste novo. Review próprio em `docs/reviews/097-k295.md` (aprovado, sobre d1ea2991), QA em `docs/qa/097-k295-ajustes-l6-web.md` e UX em `docs/ux/097-revisao-k295.md`; cito, não refaço.
- **Contrato:** `packages/contratos/src/filtros.ts` ganha só a exportação `TIPO_POR_ID`, derivada de `TIPO_ID` e retirada do `codec.ts` da web; nenhum tipo de resposta, rota ou OpenAPI muda. Não é mudança que quebra.
- **Migração e base real:** nenhuma migração, nenhum comando novo; as ações do dono da release 104 não mudam.
- **Critério de cálculo:** nenhum; o PR só mexe em listas de opção, abas do T11, mensagens de lista vazia, mock e testes (unitários e e2e de filtros). Regras invioláveis mantidas: BusinessMap e Acelerato separados, sem pessoa nem comparação.
- **CI:** `gh run list --branch develop`: push na `develop` em 61286dac, workflow CI, run 43587005536 `completed success` (rapida, testes, build, banco, openapi, seguranca, filtro, imagem; e2e e perf pulados, push sem PR).
- **CHANGELOG:** linha do #402 em `### Corrigido` da seção [Não publicado], com "sem migração, sem mudança no contrato da API e sem ação do dono". O #412 (K-326) e o lote K-236/K-243 não entram na 104.
- **Achados:** nenhum novo; A1 e A2 seguem como estão.

## Parecer

Aprovado sobre a develop em 61286dac (delta abaixo). Na primeira leitura, sobre b544000d: se o #402 ou o lote K-236/K-243 entrarem antes da E1.4, a develop vem por merge para esta branch e este parecer ganha a atualização do delta. A release segue para a homolog com os pareceres de segurança (E1.2) e QA (E1.3) gravados; o meu não depende deles.
