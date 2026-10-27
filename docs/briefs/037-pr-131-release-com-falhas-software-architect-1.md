Agente destino: forge:software-architect
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Propor como trazer o C6 de /operacional (maior tarefa longa na thread principal, limite < 200 ms na ADR 0003) para longe do limite, sem afrouxar o orçamento, para o portão de homologação do PR #131 ficar verde de forma estável. Etapa E1.5 do pedido 037, cartão K-113. A medição (1f715e8) mostrou que o Playwright novo não é a causa: o C6 vive no limite (local 171 a 211 ms; CI 208 a 225 ms).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/C6-operacional-playwright-1-64.md` (medição e conclusão).
- `docs/architecture/adr/0003-orcamento-de-performance.md`: tabela da linha 47 (C6) e a seção "Itens fora do orçamento hoje e remédio previsto" (linhas 118 a 128: memoização e Web Worker atrás da `MockFonteMetricas`).
- `e2e/perf/perf.spec.ts`, o teste "F2 CLS e C6 tarefa longa em" (como mede e agrega).
- O caminho de cálculo de /operacional no `web/` que roda na thread principal (o que o QA e o arquivo do bug apontarem).

## Entregar
- (E1) Proposta em `/home/rodrigoisensee/MetricasDSPD-037/docs/architecture/propostas/037-c6-operacional.md`, com: a causa provável do C6 em /operacional (qual cálculo ou renderização faz a tarefa longa); de 2 a 3 alternativas que reduzam o C6 com margem (ex.: memoização, Web Worker atrás da `MockFonteMetricas` como a ADR prevê, dividir o trabalho em fatias), cada uma com esforço, risco, impacto em outras rotas e como medir (meta de margem, ex.: mediana local abaixo de 150 ms); a recomendação do arquiteto; e o que NÃO muda (limite de 200 ms, método do teste). Se alguma alternativa mexer no método de medição, marque "afrouxa controle? sim/não" com a justificativa.
- (E1) Divisão do trabalho para implementar a recomendação (quem: forge:react-frontend; o que o QA mede depois).

## Fora do escopo
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A." e "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde." · etapas do dono.
- "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada)." e "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." · etapas de outro papel, cumpridas.
- Implementar a mudança, commitar (o arquiteto não tem Bash; o commit da proposta vai com a implementação, pelo autor do código), mudar o limite da ADR 0003 ou o teste de perf; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia; remédio previsto: memoização e, se não bastar, Web Worker atrás da `MockFonteMetricas` (a interface já é assíncrona; nenhum painel muda).
- Regras invioláveis do `CLAUDE.md`: todo cálculo de tempo, percentil e Monte Carlo passa pela biblioteca compartilhada (T2.5); a proposta não pode criar cálculo próprio fora dela.
- R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-037/docs/architecture/propostas/037-c6-operacional.md`
- PQ-2 (cmd): `grep -c -i 'recomenda' /home/rodrigoisensee/MetricasDSPD-037/docs/architecture/propostas/037-c6-operacional.md` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
