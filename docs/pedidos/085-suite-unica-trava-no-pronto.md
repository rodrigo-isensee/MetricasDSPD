# Pedido 085: teste 4 de suite-unica.test.sh trava sob pnpm run pronto

- **Modo:** implementar
- **Objetivo:** o `pnpm run pronto` deixa de pendurar no teste 4 de `scripts/suite-unica.test.sh`: o teste espera a trava padrão da estação, que o próprio `pronto` segura (o `pronto` roda dentro de `scripts/suite-unica.sh`). Visto nos QAs do Forge 0.44.2 (PR 275) e 0.45.2 (pedido 084).
- **Clareza:** 0 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Depende de:** nenhum (cartão K-256, melhoria técnica do projeto, entrada direta)

## Escopo
- E1. O teste 4 de `scripts/suite-unica.test.sh` não pendura quando roda dentro de uma suíte que já segura a trava padrão (por exemplo, sob `pnpm run pronto`), sem perder a prova de que, fora disso, a segunda chamada espera a primeira no caminho padrão · `técnico`

## Etapas
- E1.1 (devops-engineer): correção em `scripts/suite-unica.test.sh` (e, se preciso, em `scripts/suite-unica.sh`), com o próprio teste provando os dois casos, e parecer de devops em docs/devops/.
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA (`bash scripts/suite-unica.test.sh` sozinho e `pnpm run pronto` inteiro sem pendurar).
- E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono.
- E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada.
- E1.6 (security-engineer): parecer de segurança (o forge-check pr classifica o diff como classe C, arquivo sensível da catraca).

## Fora do escopo
- Mudar o que o `pronto` roda ou a CI · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-10 11:45: Pedido aberto (Jarvis) pela MELHORIA do QA do 084 (cartão K-256), entrada direta: melhoria técnica do projeto, sem custo, sem afrouxar controle. Causa lida pelo Jarvis: o `pronto` é `bash scripts/suite-unica.sh pnpm run pronto:interno`; o teste 4 roda `scripts/suite-unica.sh` sem `METRICAS_DSPD_SUITE_LOCK` e sem `METRICAS_DSPD_SUITE_SEGURA`, a primeira chamada (sem timeout) espera a trava padrão que o `pronto` de fora segura. DECISÃO TÉCNICA (Jarvis): devops-engineer na worktree 056d (livre), branch nova feature/085-suite-unica-pronto a partir da develop atual, criada a partir do sha.
- 2026-11-10 11:48: brief selado docs/briefs/085-suite-unica-trava-no-pronto-devops-engineer-1.md b9deadfdabbbef54c6a03f0b26b4b9dcad9380c93462d69374748d01153fa2ea
- 2026-11-10 11:50: entrega conferida bd71848448453830357a0b91207914a1237bfaa6
- 2026-11-10 11:50: Entrega E1.1 (devops-engineer-1) conferida: PQ-1 pelo conferente; PQ-2 não verificável pelo conferente (comando fora da lista dele) e rodado pelo Jarvis na 056d: "suite-unica.test: tudo certo", rc=0, com o caso 4 pulado e o motivo impresso. Observação do conferente para o review: o caso pulado é só impresso, sem asserção; o ramo da sonda flock -n não foi exercitado. Próximo: review (tech-lead).
- 2026-11-10 11:51: brief selado docs/briefs/085-suite-unica-trava-no-pronto-tech-lead-1.md a85f78b21c40a5661285eecfa7008856070215cccd1c6acff8b2a003114516ea
- 2026-11-10 11:53: entrega conferida 39c901d96e477a74fca7e1ebfc13c9355999941f
- 2026-11-10 11:53: Review (tech-lead-1) aprovado, A1 e A2 recomendados (a sonda flock -n sem teste; o pulo só impresso), conferido. Próximo: QA (qa-engineer-1, pnpm run pronto inteiro).
- 2026-11-10 11:53: brief selado docs/briefs/085-suite-unica-trava-no-pronto-qa-engineer-1.md 6895f0996b73817fd996cf42303d8b3bb2c8d6978b3f266b89fd94bc5bb18283
- 2026-11-10 12:04: QA (qa-engineer-1) aprovado, 0 bugs, parecer bf81b471: pnpm run pronto inteiro com rc 0 em 8m58s, teste 4 pulado sem pendurar. O forge-check pr diz "classe C (sensível da catraca: scripts/suite-unica.test.sh)" e "revisao-seguranca: sem parecer" (R-SEGURANCA). DECISÃO TÉCNICA (Jarvis): nova etapa E1.6 (security-engineer), parecer de segurança antes do PR.
- 2026-11-10 12:05: entrega conferida bf81b471abb2cae1ec3eaa930cf51af84c8fd87d
- 2026-11-10 12:06: brief selado docs/briefs/085-suite-unica-trava-no-pronto-security-engineer-1.md e3b2df28a1a81111ff562cb243dae8e552b60eead139d19fd9f025147c54877f
- 2026-11-10 12:07: Segurança (security-engineer-1) aprovada, A1 e A2 recomendados; parecer gravado sem commit na 056d. O brief gerar do PR recusa sem o parecer de segurança na branch. DECISÃO TÉCNICA (Jarvis): o security-engineer (que tem Bash nesta versão do Forge) commita e envia o próprio parecer (security-engineer-2), sem mudar o conteúdo; depois o PR (tech-lead-2).
- 2026-11-10 12:08: brief selado docs/briefs/085-suite-unica-trava-no-pronto-security-engineer-2.md fb38435b6653fa64d50762c598185482c7840ce88e4f246eddcd45ac299577be
- 2026-11-10 12:10: entrega conferida 89cfd6a4e877b569c8e5712407919ab8c30a234b
- 2026-11-10 12:10: Parecer de segurança (security-engineer-2) commitado e conferido; forge-check pr aprovado no head 89cfd6a (exigidos review, qa, revisao-seguranca). Próximo: PR (tech-lead-2).
- 2026-11-10 12:11: brief selado docs/briefs/085-suite-unica-trava-no-pronto-tech-lead-2.md 2ade8102b38cdaf3f102b6659ac85f86fee3ad1a24267d839c0a76aede320e05
- 2026-11-10 12:36: PR 280 (085) aberto (tech-lead-2), ato conferido como não verificável só porque o dono trouxe a develop para a branch (0a403c34, update-branch) durante a conferência; forge-check pr aprovado no head 0a403c3 (exigidos review, qa, revisao-seguranca). AÇÃO DO DONO: mesclar o PR 280.
- 2026-11-10 14:12: brief selado docs/briefs/085-suite-unica-trava-no-pronto-agile-coach-1.md b5ed14a9cf4cb3d3cb59490c97454659fb6612bd9a27f6867d1e46984089072b
- 2026-11-10 14:13: E1.5: retrospectiva escrita pelo agile-coach na worktree 052c, branch docs/retros-2026-11-10 (docs/retrospectivas/2026-11-10-085-suite-unica-trava-no-pronto.md, sem commit; o envio vai junto com a do 084, em delegação ao tech-lead depois dos merges do dia). 8 briefs (1 reprovado por escopo), 5 entregas cumpriram, 0 bugs; 3 linhas MELHORIA (2 vão ao Forge).
