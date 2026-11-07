# Pedido 078: release da noite de 2026-11-07 (075, 077, 073 e 069 L9-c)

- **Modo:** implementar
- **Objetivo:** levar à main o que está na develop e não está na homolog (PRs 238 a 257: 069 L9-c; 073 E2, E4, E7, E8, CA-8 e E10 L1; 075 lotes 1a, 1b, 2a, 2b, 3 e 5a; 077 L1a, L1b e L2; Forge 0.33.0), mais o E10 L2 do 073 se mesclado antes do início, pelo fluxo develop, homolog, main
- **Clareza:** 1 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Depende de:** 073-melhorias-tecnicas-2026-11-05 (E10 L2 em QA); 075-bloqueios-reais (lotes na develop); 077-tendencias-dado-real (lotes na develop)

## Escopo
- E1. A develop vai à homolog por PR com o portão verde e o PR de release homolog para main fica aberto, com review, QA e segurança da release antes · `confirmado`

## Etapas
- E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/078-release.
- E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/078-release.
- E1.3 (security-engineer): parecer de segurança da release (coletor do Acelerato, ref-sync e derivador de bloqueio), na branch docs/078-release.
- E1.4 (tech-lead): PR da docs/078-release para a develop, squash com a CI verde, antes da E1.5.
- E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde, --match-head-commit, sem --admin.
- E1.6 (tech-lead): PR de release da homolog para a main; o merge segue a regra da noite do dono e o CLAUDE.md (ver Histórico).
- E1.7 (agile-coach): retrospectiva do pedido 078.

## Fora do escopo
- Lotes ainda não mesclados na develop (075 5b, que espera o aceite do dono aos bugs; 075 4a, 4b, 4c e 6a; 077 3a e 6a; 073 E10 L3) · `técnico`
- PRs do dependabot 255 e 256 · `técnico`

DECISÃO DO DONO (2026-11-07, regras da noite, pelo assistente do app): "3) o dono AUTORIZA mesclar ATE A MAIN esta noite pelo fluxo normal (develop para homolog por merge commit e homolog para main, portao verde, forge-check pr aprovado, --match-head-commit, SEM --admin; se a protecao da main exigir review que voce nao pode dar, registre e avise de manha)".

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-07 05:47: pedido aberto (Jarvis) pela regra 3 da noite do dono (DECISÃO DO DONO acima), que vale como confirmação do escopo E1; sem recibo à parte porque o dono não está na conversa e a regra já nomeia o fluxo. DECISÃO TÉCNICA (Jarvis): a release começa quando o PR do E10 L2 do 073 estiver na develop (ou, se ele travar, com a develop em 718d46be); daí até a promoção a develop fica parada. Ordem do 071: CHANGELOG antes do review. Sobre a E1.6: o CLAUDE.md do projeto (regra inviolável "A main é do usuário": nenhum agente faz merge na main) está acima da ordem da noite; o tech-lead abre o PR de release e deixa verde; o merge na main fica com o dono e vai no aviso da manhã.
- 2026-11-07 05:49: Release suspensa antes de qualquer delegação: conflita com a DECISÃO DO DONO do 073 (2026-11-05 20:27, "A", próxima release): "uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop". A develop já tem lotes do 075 e do 077 (PRs 245 a 257) e o 073 ainda tem E10 L2 a L5 e outros itens abertos; a regra 3 da noite autoriza os merges pelo fluxo, mas não diz qual conteúdo vai, e a regra 5 deixa a decisão com o dono. PERGUNTA: P-078-1, release agora com tudo o que está na develop (073 parcial, 075 e 077 parciais) ou esperar o 073 inteiro, como decidido em 2026-11-05 (recomendação: esperar o fim do E10 do 073 e levar tudo junto; preferência do time em prioridade: menos releases e o 073 completo).
