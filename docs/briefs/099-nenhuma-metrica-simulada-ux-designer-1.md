Agente destino: forge:ux-designer
Pedido: 099-nenhuma-metrica-simulada
Tipo: review
Branch: fix/099-l2b-apaga-simulado   Base: develop   Base-sha: 58882fcf64fbf3c875ac2b85c43829bb7245b8b0
Etapa: review   Cobre: E2.17
Revisar-sha: 456e103e5556b7ff117f1762d4fffcf5ebe00fc7

## Objetivo
Revisão da interface implementada no L2b e L2c do pedido 099: a web não tem mais fonte simulada nem o selo Simulado; o cartão sem dado real mostra "Sem dado real" e o motivo. QA (da3e1219) e review (a8c6773f) aprovados no head 456e103e da branch `fix/099-l2b-apaga-simulado`. Os textos novos do catálogo e das notas (L4, `docs/ux/099-textos-sem-simulado.md`) entram depois, noutro lote.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff 58882fcf 456e103e -- web/src/components web/src/features` (o que mudou na interface).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/099-textos-sem-simulado.md` (o que vem no L4, para não pedir aqui o que já está planejado).

## Entregar
- "E2.17 (ux-designer): revisão da interface implementada no L2b e L2c (selo Simulado removido; cartão sem dado real com "Sem dado real" e o motivo), em docs/ux/099-revisao-l2b-l2c.md." (E2.17)
- (E2) (E2.17) Conferir, pelo código e pelos testes, que nenhum cartão, legenda ou estado ainda fala em simulado ou mostra o selo; que o estado sem dado real é claro e acessível (texto, motivo, sem depender de cor); que nada ficou órfão na tela (espaço do selo, alvo 44, legenda). Gravar a revisão, com veredito e achados, em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/099-revisao-l2b-l2c.md` (novo), pela ferramenta Write; sem commit.
- (E1) (E3) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/ux/099-revisao-l2b-l2c.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 967be5645c9bda0e509df2bf6ecb5085e03fbf1f3b49edd9968a74fa2952fa93 (6 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido
- "E2.6 (react-frontend): L2a, tirar a opção simulado de useMetrica e dos cartões, na branch fix/099-l2a-sem-opcao-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): review do L2a." · etapa de outra delegação; continua no pedido
- "E2.8 (qa-engineer): QA do L2a." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): PR do L2a; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.10 (react-frontend): L2b, apagar FonteComSimulado.ts, simulado.ts, as exportações em data/index.ts e SemDadoRealErro.simulavel, com os testes desses arquivos, na branch fix/099-l2b-apaga-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.11 (node-backend): L3, tirar do contrato simulavel, podeSimular e METRICAS_SEM_SIMULACAO, com testes, docs/api/metricas.md e o OpenAPI, na branch fix/099-l3-contrato-sem-simulavel, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.13 (qa-engineer): QA por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.14 (tech-lead): PR e merge por lote do 099 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E2.15 (react-frontend): L2b e L2c juntos (o selo importa o que o L2b apaga): além do L2b, tirar o selo Simulado da interface (SeloSimulado, ramos de CartaoMetrica, OrigemCartao.simulado, OrigemDosCartoes, StatusMeta, CartaoT3, tokens.css) com os testes do selo, e o simulavel de HttpFonteMetricas, na branch fix/099-l2b-apaga-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.16 (ux-designer): L4, texto do catálogo (WB-1) e das 8 notas (OP-21, TA-16 a TA-18, ES-11, ES-12) sem falar em simulado, em docs/ux/099-textos-sem-simulado.md, para o react-frontend aplicar depois do L2b e L2c." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido
- "E3.5 (devops-engineer): K-277, o comando de consultas de leitura recusa U&, UESCAPE e os prefixos pg_ e lo_ na lista de palavras (A5 da segurança), na branch fix/k277-consultas-escape a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): revalidação de segurança do K-277." · etapa de outra delegação; continua no pedido
- "E3.7 (qa-engineer): QA do K-277." · etapa de outra delegação; continua no pedido
- "E3.8 (tech-lead): review, PR e merge do K-277 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c 'eredito' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/099-revisao-l2b-l2c.md` · espera: contém '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
