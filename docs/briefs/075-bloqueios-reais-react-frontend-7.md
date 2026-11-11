Agente destino: forge:react-frontend
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-9a   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.5

## Objetivo
Lote 9a dos bloqueios reais (K-204, pedido 075): a web deixa de depender da nota `bloqueio-sem-dado-real`, que a API não emite desde o lote 6b (validado pelo dono em 2026-11-11 13:06, decisão "A"). Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `feature/075-9a` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9a" e a §7 (ordem).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` (como a nota entrou). Usos do id na web hoje: `CartaoComplementar.tsx`, `CartaoO1.tsx`, `CartaoO2.tsx` e `bloqueio-sem-dado.test.tsx`.

## Entregar
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." (E1.5) Nesta delegação, o lote 9a do plano (a parte web; o plano chama de 9a o lote de tela e de 9b o de contrato).
- (E1) (E1.5) Tirar os ramos "sem dado real" de BLOQUEADOS, O1, O2 e da faixa "Pede atenção"; `web/src/features/operacional/bloqueio-sem-dado.test.tsx` sai ou se inverte (cartões sem a nota mostram o dado). Nenhum uso do id `bloqueio-sem-dado-real` fica em `web/src` (provar com grep no relatório). Sem mudar contrato, API, migração nem texto de outra métrica.
- (E1) (E1.5) eslint, `tsc -b` e os testes dos arquivos tocados com no máximo 2 workers verdes; `pnpm run pronto` da raiz da worktree verde. Commits com `Cartão: K-204` (mensagem gravada por Write no scratchpad e `git commit -F`), `git add` explícito por caminho; push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9a` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Relatar o total de linhas contra a base (`git diff --shortstat eac38a64b0b580d7c920f4b2b501287f7fb56599`); teto 150 com remoções (se passar só por remoção e dividir quebrar a compilação, declare `teto: excedido` com o motivo).
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação (o O19 não muda neste lote).
- arquivos: web/src/features/operacional/, web/src/features/complementares/, web/src/components/ui/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até c166a8738a8bd344c2b9d3c3d78fffc1ddf47073e303a80503f9145ee45b4171 (21 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- aplicáveis a E1.5 (copiadas literalmente):
- - 2026-11-11 13:08: DECISÃO DO DONO (literal, pedido 093): "A". O 6b fica validado pelas provas já feitas, sem conferência com dado real (risco aceito pelo dono). Libera o lote 9a. DECISÃO TÉCNICA (Jarvis): vale a divisão do plano corrigido (docs/analises/075-plano.md §7): 9a é o lote de tela (react-frontend, E1.5) e 9b o de contrato (node-backend, E1.4, depois do 9a); as listas de lotes das linhas E1.4 e E1.5 deste pedido são anteriores ao plano. Worktree 056 na branch feature/075-9a a partir da develop eac38a64.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/feature/075-9a` · espera: contém 'Cartão: K-204'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
