# Pedido 067: dia atípico do apontamento acima de 10 horas

- **Modo:** implementar
- **Objetivo:** o dia da pessoa passa a ser marcado como atípico acima de 10 horas (era 16 h, proposta do UX), pela decisão do dono na lacuna L6 do pedido 064
- **Clareza:** 2 confirmado; 0 suposição; 0 perguntas
- **Depende de:** 064-lacunas-dado-real (lacuna L6, mapa em docs/analises/064-lacunas-dado-real.md)

## Escopo
- E1. O limite do dia atípico passa de 16 h para 10 h, com a mudança de critério registrada com data e marcada no gráfico (T2.6), com testes e a documentação do apontamento atualizada · `confirmado`

## Etapas
- E1.1 (node-backend): troca do limite, versão de critério com data, testes e documentação.
- E1.2 (tech-lead): code review.
- E1.3 (qa-engineer): QA.
- E1.4 (tech-lead): PR para a develop e merge.

- E1.5 (tech-lead): formatação do index.ts do apontamento que o check rapida acusou, com o review regravado na ponta nova.
- E1.6 (qa-engineer): parecer de QA regravado na ponta depois da formatação.
- E1.7 (tech-lead): merge do PR 215 por squash com a CI verde.
- E1.8 (agile-coach): retrospectiva do pedido 067.
## Fora do escopo
- Os outros cinco limites dos achados (não classificado 20%, sem comentário 20%, concentração 50%, dias atípicos 1, variação mensal 10 pontos): seguem provisórios, como estão · `confirmado`

DECISÃO DO DONO (2026-11-04): "Atipico acima de 10 horas" (decisão 3, valores fixos da aba do apontamento): o dia da pessoa passa a ser marcado como atípico acima de 10 horas.

DECISÃO DO DONO (2026-11-04): "o demais pode seguir por enquanto" (recibo do 067): os outros cinco limites dos achados seguem como estão, provisórios.

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-04 14:13: pedido aberto pela resposta do dono à decisão 3 ("Atipico acima de 10 horas"). Recibo enviado (os outros cinco limites como suposição). Cartão K-218.
- 2026-11-04 14:14: recibo confirmado pelo dono: "o demais pode seguir por enquanto". Sem gatilho de segurança. Sem discovery novo: troca de um valor já desenhado pelo UX (P-4) e pelo arquiteto, com o padrão T2.6. DECISÃO TÉCNICA (Jarvis): E1.1 com o node-backend na worktree 052f (limpa), branch nova feature/067-dia-atipico a partir da origin/develop.
- 2026-11-04 14:34: E1.1 cumprida pelo node-backend: feature/067-dia-atipico em 4181b56a1c8be5f07f03383a0b0ac29818ebb270 (push ok): limite de 10 h numa constante única da biblioteca, lida pelo server; versão de critério 067:limite-dia-atipico (vigência 2026-11-04 só vai ao banco quando o dono rodar criterios-apontamento 2026-11-04); web lê o limite da API (só fixture e teste mudaram); docs/api/apontamento.md e o plano 059 atualizados; teste de 10 h e 1 min atípico e 10 h não; metricas 1258 e server 1615 com cobertura 100%, web 1420; docs:check ok; o teste com banco foi ajustado e não rodou. DECISÃO TÉCNICA (Jarvis): review (E1.2) e QA (E1.3) em paralelo na ponta 4181b56; sem revisão de interface (a tela só lê o valor da API); o dono roda criterios-apontamento e test:pg depois do deploy.
- 2026-11-04 14:51: E1.2 cumprida pelo tech-lead: review aprovado em 41d4ba7 (commit: 4181b56); constante única, sem 16 h em código de produção, versão de critério presente, fronteira testada, outros limites fora do diff; A1 recomendado: comentário em packages/contratos/src/apontamento.ts:304 ainda diz 16 h. QA (E1.3) não lançado por teto de agentes; segue quando abrir vaga.
- 2026-11-04 15:17: E1.3 cumprida pelo qa-engineer: aprovado sem bug em 0d7ce44 (commit: 4181b56); metricas 1258 e server 1615 com cobertura 100%, web 1420, docs:check ok; fronteira provada; mutante (10 trocado por 16) morto; a tela lê o limite da API; A1 recomendado: comentário em packages/contratos/src/apontamento.ts:304 ainda diz 16 h. DECISÃO TÉCNICA (Jarvis): E1.4 com o tech-lead: PR para a develop com o A1 como ressalva e merge por squash com a CI verde; se a permissão do ambiente negar o merge, parar e relatar.
- 2026-11-04 15:31: E1.4 parcial pelo tech-lead: PR 215 aberto (develop), sem merge: o check rapida falhou no format:check em packages/metricas/src/businessmap/apontamento/index.ts (run 41885563715); testes, banco, build, imagem, openapi e segurança passaram no push; forge-check pr limpo antes de abrir. DECISÃO TÉCNICA (Jarvis): E1.5 com o tech-lead (prettier só nesse arquivo, commit com -m, review regravado na ponta nova) e depois E1.6 com o QA regravando o parecer; então o merge no PR 215.
- 2026-11-04 15:39: E1.5 cumprida pelo tech-lead: formatação em 46ea94151e1d33658d6dea295400cc338e324a11 (só a reexportação do index.ts; prettier sem achado); review regravado em 3646202 (commit: 46ea941), aprovado. DECISÃO TÉCNICA (Jarvis): E1.6 com o QA regravando o parecer em 46ea941; depois E1.7, o merge do PR 215.
- 2026-11-04 15:46: E1.6 cumprida pelo qa-engineer: parecer regravado em e697ce7 (commit: 46ea941), aprovado; prettier limpo; metricas 1258 com cobertura 100%. DECISÃO TÉCNICA (Jarvis): E1.7 com o tech-lead, merge do PR 215.
- 2026-11-04 16:17: E1.7 cumprida pelo tech-lead: PR 215 mesclado na develop por squash com 17 checks verdes (head aae493d depois do update-branch, sem conflito; forge-check pr limpo antes e depois). Pedido 067 entregue na develop; vai à main na próxima release; falta a retrospectiva.
- 2026-11-04 20:48: DECISÃO TÉCNICA (Jarvis): E1.8 com o agile-coach, retrospectiva do 067 com commit na branch do Jarvis (docs/jarvis-2026-10-23), sem push.
