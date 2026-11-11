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

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/feature/075-9a` · espera: contém 'Cartão: K-204'
