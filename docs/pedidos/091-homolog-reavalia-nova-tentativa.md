# Pedido 091: homolog-aprovada com nova tentativa quando o portão acabou de ficar verde (K-263)

- **Modo:** implementar
- **Objetivo:** a reavaliação automática do check `homolog-aprovada` (workflow `homolog-reavalia`) não falha só porque a consulta ainda não enxerga o portão que acabou de terminar verde; na release 090 a tentativa 2 falhou 12 s depois do portão verde e a 3 passou sem mudança nenhuma.
- **Clareza:** 0 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Origem:** melhoria vista na E1.6 do pedido 090 (cartão K-263); fila de trabalho que não depende do dono ("nao fique parado. Continue a fila de trabalho agora", assistente do app a pedido do dono, 2026-11-11).

## Escopo
- E1. Quando a avaliação do `homolog-aprovada` conclui "portão de homolog sem sucesso" para o candidato e o portão desse candidato terminou há pouco, tentar de novo por um tempo curto (cerca de 60 s) antes de falhar, sem afrouxar a regra (candidato = ponta da homolog, portão verde) · `técnico`
- E2. Teste que prova a nova tentativa (falha transitória vira verde; portão realmente vermelho continua vermelho) · `técnico`

## Etapas
- E1.1 (devops-engineer): implementação em `tools/homolog/src/aprovacao.ts` e, se preciso, `.github/workflows/homolog-reavalia.yml` ou `homolog-aprovada.yml`, com teste em `tools/homolog/src/aprovacao.test.ts` e parecer de devops em docs/devops/, na branch fix/k263-reavalia-espera, worktree /home/rodrigoisensee/MetricasDSPD-056.
- E1.2 (tech-lead): review; cada parecer (review, segurança e QA) commitado e enviado na própria branch por quem o grava.
- E1.3 (security-engineer): parecer de segurança (gatilho CI/CD).
- E1.4 (qa-engineer): QA.
- E1.5 (tech-lead): PR para a develop; o merge é do dono.
- E1.6 (agile-coach): retrospectiva curta.

## Fora do escopo
- Mudar a regra de aprovação da release (candidato, portão, rodada noturna) · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 08:50: pedido aberto pelo Jarvis para o K-263, trabalho da fila que não depende do dono (o PR 298 e as decisões do 073 e do 077 esperam o dono). Worktree 056 na branch fix/k263-reavalia-espera a partir da develop 6e42dfb8.
- 2026-11-11 08:55: brief selado docs/briefs/091-homolog-reavalia-nova-tentativa-devops-engineer-1.md c5047ab560bdcdd0d57518eddcf835d8184760885e4ea3fe6419d66093702064
- 2026-11-11 09:11: E1.1 entregue pelo devops (e40524fd código, d1693a72 parecer de devops aprovado; Cartão: K-263): nova tentativa por cerca de 60 s só no caso "portão sem sucesso", espera injetável, testes de tools/homolog com 100%. PQ-1 (pronto) não cumprido por ambiente: 31 testes de CLI do server falham no sandbox (o filho roda com env só com PATH e o tsx não cria /tmp/tsx-1000); nada do server foi tocado; vira o cartão K-264 e a suíte completa fica com o CI do PR. Próximo: conferência da entrega, review, segurança e QA.
- 2026-11-11 09:11: entrega conferida d1693a72b467afaf6f74fcc97618481efd16565d
- 2026-11-11 09:15: brief selado docs/briefs/091-homolog-reavalia-nova-tentativa-tech-lead-1.md cdb0d8175204e61dde708de753b7a9b0ab7ef9236488c2e40f16feb443d5ad01
- 2026-11-11 09:19: brief selado docs/briefs/091-homolog-reavalia-nova-tentativa-security-engineer-1.md 9ff6b858d267ff8237a4a27425c0ac1a8ffd5ae492d64d45298fc69172b7338b
- 2026-11-11 09:22: brief selado docs/briefs/091-homolog-reavalia-nova-tentativa-qa-engineer-1.md 5074fe2350fcca8663d341b246affea349814d09375dd3d4686700bfdf6f8320
- 2026-11-11 09:24: E1.3 segurança aprovada (2242c6a5; A1: comentários do homolog-aprovada.yml com 'sem espera'). E1.4 QA aprovado (86794f36; 0 bugs; mutações mortas). Review d315dea2 com forma recusada pelo forge-check docs (A2 longo, linha fora do bloco): o tech-lead corrige a forma no passo do PR (E1.5).
- 2026-11-11 09:25: brief selado docs/briefs/091-homolog-reavalia-nova-tentativa-tech-lead-2.md 1409e24c53029782a87c72e297f1bac49c6a74d022fa99ce51b73db8c61ff790
- 2026-11-11 09:48: E1.5: forma do parecer de review corrigida (8a6c2513); PR 304 aberto, CI verde; o merge é do dono, depois da release 093 (develop congelada).
- 2026-11-11 10:30: PR 304 (K-263) mesclado na develop pelo dono (18701297). Falta: retrospectiva (E1.6).
- 2026-11-11 10:55: brief selado docs/briefs/091-homolog-reavalia-nova-tentativa-agile-coach-1.md d5c9ba8a99aa506fa3f82785a64df744f346233cbfa201d69d7a518db8d125ab
- 2026-11-11 10:56: E1.6: retrospectiva escrita pelo agile-coach (052g, branch docs/retros-2026-11-11b, sem commit; o envio vai junto com a do 092). K-263 com lead time 7h06; 2 briefs reprovados; 1 causa nova (rodar forge-check docs antes de enviar o parecer, vai ao Forge). Pedido 091 fecha com a retrospectiva gravada.
