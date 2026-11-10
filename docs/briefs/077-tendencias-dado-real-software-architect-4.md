Agente destino: forge:software-architect
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Revisar o desenho das tendências do Resumo (K-211, pedido 077, E1.1) com os achados da revisão do tech-lead (aprovado com ressalvas, 2 bloqueantes), antes do código. O código se lê na develop atual (d1f22008) com a ferramenta Read ou Grep sobre o repositório principal só para os arquivos citados nos achados; o software-architect não tem Bash, então os trechos citados pelo tech-lead (arquivo:linha em origin/develop) valem como referência.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md` (inteiro; é curto) e o seu `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`.
- Do pedido `docs/pedidos/077-tendencias-dado-real.md`, as DECISÃO DO DONO e a linha do `## Histórico` que registra a revisão do tech-lead.

## Entregar
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." (E1.1)
- (E1) (E1.1) Reescrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` pela ferramenta Write, sem commit, resolvendo os bloqueantes A1 (regra do início de histórico do Acelerato, que não grava data em `ctl_coleta`; lotes 3a e 3b) e A2 (origem da data no BusinessMap só pela tarefa dos cards, menor `inicio_carga` entre as cargas iniciais com sucesso) e aplicando os recomendados A3 a A11 ou dizendo por que não; lotes até 150 linhas, uma seção `## Lote <n>` por lote, cada mudança de contrato classificada pela política (aditiva ou incompatível).
- (E1) (E1.1) Seção `## P-077-5 revista`: o custo real da opção A (mudança incompatível em `concluidos` e `volume`, entrada em `aceitas.json`, lotes afetados) e da opção B, com a recomendação refeita e o motivo; se o A1 mudar o que a P-077-4 decidiu para o Acelerato, isso vira pergunta nova ao dono, não decisão técnica.
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- 2026-11-06 14:54: DECISÃO DO DONO: "A" (P-077-4, pela recomendação): a primeira carga é a data em que o histórico carregado começa (inicio_carga da carga inicial), não o dia em que a carga rodou. Destrava o Lote 3. PERGUNTA: P-077-5 vai ao dono; na fila: tabela P-E10-2, P-E10-5 e P-E10-6 (073).
- ADR 0019 (citada no pedido): o cálculo das tendências já existe por ela (uma fonte por tendência, mínimo de 20); o desenho não muda o cálculo de O3, O4, S2 e S3 (Fora do escopo do pedido).
- 2026-11-06 15:33: DECISÃO TÉCNICA (Jarvis): a P-077-5 fica suspensa até este desenho revisto trazer o custo da opção A e a recomendação refeita.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: código, a especificação de UX, o pedido, `KANBAN.md`, a revisão do tech-lead, outras worktrees, a `develop`, a `homolog` e a `main`; sem commit.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; feita
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; feita
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep '^## Lote' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` · espera: linhas>=2
- PQ-2 (cmd): `grep -c '^## P-077-5 revista' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
