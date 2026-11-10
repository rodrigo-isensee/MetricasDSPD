Agente destino: forge:react-frontend
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: feature/077-l8b-tela-contagem-parcial   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: codigo   Cobre: E2.5

## Objetivo
Lote 8b das tendências com dado real (K-211, pedido 077, E2.5): a web não mostra a contagem (concluídos e volume) do mês marcado com `contagemParcial` (o 8a, já na develop, marca na API o mês que começa antes do início do histórico), pela decisão do dono P-077-5 = A; no lugar do número, o mês aparece como "histórico incompleto" pelo padrão de sem-valor do 4a. Worktree `/home/rodrigoisensee/MetricasDSPD-052d` (livre: 8a e 3b já estão na develop), branch nova `feature/077-l8b-tela-contagem-parcial` a partir da ponta do 6b (`origin/feature/077-l6b-tela-ressalva`, entrega conferida no Histórico de 2026-11-10 09:11; mesmo `SerieMensal.tsx`, série por arquivo).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "4. Contrato", "Lote 4a", "Lote 8" e "P-077-5 revista".
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md`: só a seção da janela incompleta (marcador, lista de sem-valor, tabela, `figcaption`), que é o padrão a seguir.

## Entregar
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." (E2.5) Nesta delegação, só o Lote 8b do desenho (a tela da contagem parcial, P-077-5 = A).
- (E2) (E2.5) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin feature/077-l6b-tela-ressalva`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c feature/077-l8b-tela-contagem-parcial origin/feature/077-l6b-tela-ressalva`; logo depois conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` = `feature/077-l8b-tela-contagem-parcial` e `status --short` vazio (se o HEAD não trocar, pare e relate a saída literal); `pnpm install --frozen-lockfile` nela (não apagar as branches antigas).
- (E2) (E2.5) Implementar o Lote 8b como o desenho descreve: o mês com `contagemParcial` não tem o número de concluídos (fluxo) nem de volume (sustentação) plotado, na tabela nem no `figcaption`; aparece com o motivo "histórico incompleto" pelo padrão de sem-valor do 4a em `SerieMensal`, nos mapeadores de `TendenciaFluxo.tsx` e `TendenciaSustentacao.tsx`; os outros meses e as outras séries não mudam; nenhum cálculo na tela (T2.5), nenhum componente novo além do necessário. Testes de unidade: o número do mês marcado nunca aparece em gráfico, tabela ou `figcaption`; mês sem a marca mostra o número; série sem nenhum mês marcado não muda.
- (E2) (E2.5) Herdados da branch do 6b, nada a entregar aqui: a branch nasce da ponta do 6b (`origin/feature/077-l6b-tela-ressalva`, conferida); o escopo desta entrega é o intervalo `origin/feature/077-l6b-tela-ressalva..HEAD`.
- (E2) (E2.5) eslint, `tsc -b` e os testes dos arquivos tocados com no máximo 2 workers verdes, com a cobertura dos arquivos tocados (a CI exige 100%); teto de 150 linhas de código e teste, pela saída literal de `git diff --numstat --no-renames origin/feature/077-l6b-tela-ressalva...HEAD -- web e2e`; commits com `Cartão: K-211` (mensagem gravada por Write num arquivo de caminho literal no scratchpad e `git commit -F`), `git add` explícito por caminho; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse --abbrev-ref HEAD` = feature/077-l8b-tela-contagem-parcial e enviar em primeiro plano, timeout de 600 s na ferramenta, com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/077-l8b-tela-contagem-parcial` (`github.com` em allowed_domains); sem PR.
- (E2) (E2.5) Artefatos gerados: antes do push, rodar `pnpm run docs:gerar` e `pnpm --filter @metricas-dspd/server run openapi:gerar` e conferir que `docs/api/openapi.json`, `docs/contratos/metricas/` e os snapshots em `docs/contratos/snapshots/resultados/` não mudam (o lote não toca contrato); se mudarem, pare e relate.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- forge-check: o do PATH aponta para a cópia do Windows, quebrada (DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56); se precisar dele e falhar, relate, sem contornar.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; `docs/ux/080-revisao-leia-junto.md` (não rastreado, de outro pedido) fica como está.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d merge-base --is-ancestor origin/feature/077-l6b-tela-ressalva origin/feature/077-l8b-tela-contagem-parcial` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only origin/feature/077-l6b-tela-ressalva origin/feature/077-l8b-tela-contagem-parcial -- server packages docs/contratos docs/api` · espera: linhas=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
