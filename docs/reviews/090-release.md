---
tipo: review
contrato: 1
pedido: 090-release-2026-11-11
branch: docs/090-release
commit: 81e30293048c0448066ca1ebd831074e5c82ddfb
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: release 090 (develop em 85394c5b contra a homolog)

## Parecer
Aprovado. A release é a `develop` em `85394c5b` (PRs 293 a 297) contra a `homolog` em `3773e7da`, conforme a decisão A do dono (abre com o que estava na `develop` à 01:00). A branch `docs/090-release` só acrescenta o CHANGELOG (commit `81e30293`, 5 linhas novas e 1 trocada) e este parecer.

- **Reviews:** cada PR tem parecer de review aprovado em `docs/reviews/`: #293 `089-apontamento-d2-d3` (sobre `2ea9c636`, sem bloqueante), #294 `089-apontamento-d2-d3-web` (sobre `dafb325a`, sem bloqueante), #295 `078-retros-2026-11-10` (sobre `0e0b3049`; classe T, só documentação), #296 `chore-forge-0455` (sobre `fb24b343`) e #297 `088-k261-teste-hermetico` (sobre `0c16aeb5`). Os PRs de código têm também parecer de QA aprovado em `docs/qa/`.
- **CI:** os cinco entraram na `develop` por squash, estado `MERGED`, com os checks do PR sem falha (#293 e #297: 19 sucesso e 4 pulados; #294, #295 e #296: 18 sucesso e 5 pulados). O CI do push na `develop` em `85394c5b` terminou com sucesso. Não repeti a suíte (é do QA e do CI).
- **089 (D2 e D3):** a ordem de implantação registrada no corpo do PR 293 vai ao corpo do PR de release e agora também ao CHANGELOG (Mudanças de critério de cálculo), no mesmo dia e nesta ordem: 1) `ref:sync` do dicionário v3; 2) `criterios-apontamento <data da primeira varredura completa>`; 3) coleta com janela de 12 meses. Oráculo de término: zero linhas ativas com `subgrupo_codigo = 'execucao-tecnica'` e bit 4; zero com `versao_dicionario` diferente da vigente. A versão T2.6 `089:sem-vinculo-so-sem-comentario` entra por INSERT idempotente, sem editar as versões 059 e 067; a releitura gera versão nova na staging, sem sobrescrever histórico.
- **Migrações:** nenhuma nova (`git diff --name-only origin/homolog 85394c5b` não toca a pasta de migração; a última segue `0035_ac_previsao_retorno_booleano`).
- **Interruptores:** `BLOQUEIOS_COM_DADO_REAL` segue `false` em `packages/contratos/src/origem.ts:55`; o 6b (PR #298) está aberto e não entra nesta release, conforme a decisão A. O diff da release não toca o interruptor.
- **Regras invioláveis:** o diff mexe só no domínio do apontamento (BusinessMap) e no teste do K-261; sem mistura com o Acelerato, sem dado de pessoa novo, e o piso de 20 vale para o percentual da nota de execução técnica.
- **CHANGELOG:** as notas novas seguem o formato da `[Não publicado]`: Adicionado (089 e retrospectivas), Corrigido (K-261), Mudanças de critério de cálculo (versão 089 e ordem de implantação) e Dependências e Forge (0.45.5).

Não toquei na base real nem no `.env`, e não rodei `pnpm run pronto` (é do QA).

## Achados
- A1 (recomendado) CHANGELOG.md:51 · a ordem de implantação do 089 vivia só no corpo do PR 293 (A1 do review do 089); agora está no CHANGELOG, mas leve-a também ao corpo do PR de release `homolog` para `main` e ao roteiro de implantação da VM oficial.
- A2 (recomendado) CHANGELOG.md:33 · os dois achados recomendados do K-261 (`rmSync` fora de `try/finally` e o isolamento não afirmado pelo `rodar` padrão) e o A1 do review do 089 web (foco e anúncio do filtro, B-4 de UX) seguem abertos; confira se têm cartão no quadro.
- A3 (recomendado) CHANGELOG.md:56 · o push informa 2 vulnerabilidades moderadas na branch padrão no Dependabot; confira com a segurança (E1.3) se entram na triagem antes da main.
