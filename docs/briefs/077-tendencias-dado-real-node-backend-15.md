Agente destino: forge:node-backend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l7-sust-real   Base: develop   Base-sha: 04fe7b86568705c17e4da922d54febbe8148ec2d
Etapa: codigo   Cobre: E2.1

## Objetivo
Lote 7 das tendências com dado real (K-211, pedido 077, E2.1): `TENDENCIA_SUST` entra no mapa real (`origem.ts`), com a constante da virada do Acelerato em `VERSOES_DA_BIBLIOTECA` e os testes de rota de ponta a ponta. Worktree `/home/rodrigoisensee/MetricasDSPD-052f` (livre: o 075 4c já está na develop), branch nova `feature/077-l7-sust-real` a partir da ponta do Lote 5 (`origin/feature/077-l5-fluxo-real`, review conferido no Histórico de 2026-11-10 10:08; mesmos `origem.ts` e `criterios.ts`, série por arquivo).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "4. Contrato", "Lote 6a", "Lote 7" e "5. Ordem, teto e conflito com o 075".
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md`: só A8, A9 e A11.
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc origin/feature/077-l5-fluxo-real -- packages` (o que o Lote 5 fez em `origem.ts` e `criterios.ts`, o molde deste lote).

## Entregar
- "E2.1 (node-backend): implementação por lote." (E2.1) Nesta delegação, só o Lote 7.
- (E2) (E2.1) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052f status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin feature/077-l5-fluxo-real`; `git -C /home/rodrigoisensee/MetricasDSPD-052f switch -c feature/077-l7-sust-real --no-track origin/feature/077-l5-fluxo-real` (com `--no-track`: sem ele, o switch a partir de ref remota grava o rastreio na configuração do repositório, que o sandbox nega, e deixa o HEAD para trás); logo depois conferir `branch --show-current` = `feature/077-l7-sust-real` e `status --short` vazio (se não, pare e relate a saída literal); instalar as dependências com `CI=true pnpm install --frozen-lockfile --store-dir` num diretório do scratchpad (o store padrão é somente leitura no sandbox; `registry.npmjs.org` em allowed_domains).
- (E2) (E2.1) Implementar o Lote 7 como o desenho descreve: id `TENDENCIA_SUST` em `METRICAS_ORIGEM_REAL`; `origem.test.ts` afirma o id fora do mock por lista (A9); constante da virada do Acelerato em `VERSOES_DA_BIBLIOTECA` (`core/criterios.ts`), `afeta: ['TENDENCIA_SUST']`, data de hoje (corrigida no merge se escorregar, A8). Testes de rota sobre a base de teste, sem mock: prioridade com 19 apuráveis sai `insuficiente` (abaixo de 20 não publica); dado do BusinessMap não altera o resultado; marca da virada em `criterios`; a nota da ressalva do S2 presente no resultado real (CA-8 de ponta a ponta). Pela P-077-6 = (a), o Acelerato não tem início de histórico: nenhum ponto sai com janela incompleta por isso. Nenhum cálculo novo (T2.5); BusinessMap e Acelerato nunca misturados.
- (E2) (E2.1) Artefatos gerados: antes do push, rodar `pnpm run docs:gerar`, `pnpm run docs:fotografar` e `pnpm --filter @metricas-dspd/server run openapi:gerar` e commitar à parte os que mudarem; `pnpm run docs:check` verde; sem entrada em `docs/contratos/snapshots/aceitas.json` (se o `docs:check` acusar mudança incompatível, pare e relate).
- (E2) (E2.1) eslint (por arquivo tocado), tsc e os testes dos pacotes tocados com no máximo 2 workers verdes, com a cobertura dos arquivos tocados (a CI exige 100%); teto de 150 linhas de código e teste pela saída literal de `git diff --numstat --no-renames origin/feature/077-l5-fluxo-real...HEAD`; commits com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad), `git add` explícito por caminho; conferir `rev-parse --abbrev-ref HEAD` = `feature/077-l7-sust-real` e enviar em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/077-l7-sust-real` (`github.com` em allowed_domains); esperar a CI do push com `gh run watch <id literal> --exit-status` (`api.github.com` em allowed_domains) e relatar; sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- forge-check: o do PATH aponta para a cópia do Windows, quebrada (DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56); se precisar dele e falhar, relate, sem contornar.
- NÃO tocar: a web, `server/migrations`, `docs/contratos/snapshots/aceitas.json`, os pareceres, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/077-l7-sust-real --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f merge-base --is-ancestor origin/feature/077-l5-fluxo-real origin/feature/077-l7-sust-real` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only origin/feature/077-l5-fluxo-real origin/feature/077-l7-sust-real -- web server/migrations docs/contratos/snapshots/aceitas.json` · espera: linhas=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
