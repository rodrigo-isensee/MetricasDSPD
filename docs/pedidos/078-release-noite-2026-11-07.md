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
- 2026-11-10 12:42: DECISÃO DO DONO (literal): "a decisado P-078 e a A" (P-078-1: release agora com tudo o que está na develop, mesmo com 073, 075 e 077 parciais; o dono vai migrar para a VM oficial hoje). ESCOPO+ (dono): o E1 passa a ser a develop atual (5ba5b2a3d697ead96fd231d6662ee79f0e5d368d, PRs 238 a 279) inteira para a homolog e o PR de release homolog -> main; o PR 280 (085) e o do Forge 0.45.2 entram se mesclados antes da promoção. DECISÃO TÉCNICA (Jarvis): a release retoma pelas etapas E1.1 a E1.7 na branch docs/078-release a partir da develop atual, na worktree 052d (livre: o 8b já está na develop), em série (tech-lead, QA; o security-engineer em paralelo, sem commit, e o tech-lead leva o parecer); o merge na main é do dono (CLAUDE.md, "A main é do usuário"; a autorização da noite de 07/11 não vale mais).
- 2026-11-10 12:44: brief selado docs/briefs/078-release-noite-2026-11-07-tech-lead-9.md a3dba628ee79370efdf4aa3bb01670f5a5c6ba8e3d34674764acdde9b203876a
- 2026-11-10 12:45: PR 280 (085) mesclado pelo dono antes da promoção: pela decisão de 12:42 ele entra na release; a develop da release passa a 4388083c63ea04993f2b1fbb7c94d45e518008ce (PRs 238 a 280). A regra da noite de 07/11 (merge até a main pelo time) não vale mais: o merge na main é do dono.
- 2026-11-10 12:46: brief selado docs/briefs/078-release-noite-2026-11-07-security-engineer-2.md 21765610023abb7657902c75a7eb1d0b7db91d8f9c1d2e8a0be093ba58cc1e2f
- 2026-11-10 12:48: entrega conferida 3c4cffa73edea68ea7e157e31361670f3ffe9f91
- 2026-11-10 12:48: Review da release (tech-lead-9) aprovado e conferido; A1 (ordem da 0035 no roteiro da VM) e A2 (6 alertas abertos na develop) recomendados. Segurança da release (security-engineer-2) aprovada, A1 e A2 recomendados, parecer gravado sem commit na 052d. O forge-check pr diz que o parecer de review commitado não tem registro de autoria (o agente o corrigiu com sed depois do Write). DECISÃO TÉCNICA (Jarvis): volta ao tech-lead (tech-lead-10) para regravar o parecer de review idêntico pela ferramenta Write e commitar e enviar o parecer de segurança da release; depois o QA (E1.2).
- 2026-11-10 12:49: Correção (Jarvis) da DECISÃO TÉCNICA de 12:48: o forge-check barra o tech-lead de gravar em docs/security/; o parecer de segurança da release é commitado e enviado pelo próprio security-engineer (security-engineer-3), e o tech-lead-10 só regrava o parecer de review para registrar a autoria, sem commit.
- 2026-11-10 12:49: brief selado docs/briefs/078-release-noite-2026-11-07-tech-lead-10.md 575fa373aa325ceaa6b5f003fe86493ec88b65a6d0e5256c5e7143af487dca61
- 2026-11-10 12:50: brief selado docs/briefs/078-release-noite-2026-11-07-security-engineer-3.md 8e92b3faf483dd7682402096a0f04af63d0b840d2d1dec31ff4aafa888213c6a
- 2026-11-10 12:52: entrega conferida 21eac2c47150b3134af04aef422fc2ff44199860
- 2026-11-10 12:54: brief selado docs/briefs/078-release-noite-2026-11-07-qa-engineer-2.md 2d60654738fd72dcc63c1b33851d763215cc1a866e7277b249986774eacef856
- 2026-11-10 13:05: entrega conferida 0c03702c06afd781d593cdce8b4765f5ba1069b7
- 2026-11-10 13:07: QA da release (E1.2) conferido (cumpriu): parecer 0c03702c na branch docs/078-release; entrega conferida gravada pela ferramenta. Brief da E1.4 (tech-lead-11, PR para a develop) gerado e no conferente; E1.5 e E1.6 em briefs próprios, em série.
- 2026-11-10 13:07: brief selado docs/briefs/078-release-noite-2026-11-07-tech-lead-11.md 9d5e985d1199476cf0875cb676f551dc73553271df16a0e9f404d4a66626dcb9
- 2026-11-10 13:30: E1.4 (tech-lead-11): PR 282 (docs/078-release -> develop) aberto, CI verde; o merge foi recusado 3 vezes pelo hook R-REVIEW por prazo ("o hook não decidiu em 3 s a chamada com ação crítica"), com o git rápido na worktree (forge-check pr do 078 leva cerca de 2 s; K-250). Não contornado. PERGUNTA ao dono: rodar ele mesmo o merge no terminal dele (comando no aviso) ou esperar a correção do hook no Forge; recomendação: o dono roda, para a release sair hoje.
- 2026-11-10 14:02: ERRO-JARVIS: mandei fechar os PRs 282 e 283 pelo forge-fechar, que só roda no repositório do Forge (R-CONTRIB); o script recusou sem efeito. Todos os merges do projeto (282 release, 283 K-244, 284 demo) estão parados pelo prazo de 3 s do hook R-REVIEW (K-250); a PERGUNTA ao dono (merge pelo terminal dele) vale para os três.
- 2026-11-10 14:57: PRs 282 (release, E1.4), 283 (K-244), 284 (demo) e 285 (Lote 7) mesclados pelo dono na develop (ponta 31d98e278a016d88f458b963fcb22d9734e0e722). DECISÃO TÉCNICA (Jarvis): a promoção E1.5 leva a develop inteira em 31d98e27, com os PRs 283, 284 e 285, cada um com review e QA próprios (e segurança no 284); é o que o dono pediu ("com isso na main suba uma demo com dados reais", pedido 087). Próximo: E1.5 (tech-lead-12), PR develop -> homolog com o portão verde.
- 2026-11-10 14:58: E1.5 barrada pela ferramenta (sem contorno): o forge-check pr sobre origin/develop 31d98e27 dá os pareceres de review e QA da release como desatualizados (o .forge/versao mudou depois deles, com o PR 281, e entraram os PRs 283, 284 e 285) e pede conferência de entrega desse head. DECISÃO TÉCNICA (Jarvis): volta da release sobre a develop atual, na branch nova docs/078-release-b (worktree 052d, a partir de 31d98e278a016d88f458b963fcb22d9734e0e722): E1.1 (tech-lead: CHANGELOG dos PRs 281, 283, 284 e 285 e review da develop contra a homolog), E1.3 (security-engineer) e E1.2 (qa-engineer) no mesmo head, em paralelo, commits nessa ordem; depois PR para a develop (merge do dono), E1.5 e E1.6.
- 2026-11-10 15:00: brief selado docs/briefs/078-release-noite-2026-11-07-tech-lead-12.md 67cc1013ad3db60a0aa23e9fece6b1bce75ace7d94c2defcc4029dd6e35b782d
- 2026-11-10 15:05: brief selado docs/briefs/078-release-noite-2026-11-07-security-engineer-5.md 515c421d15527be30b18713bd4de4249f81140fbefcbb047efe34d50abb7c685
- 2026-11-10 15:06: brief selado docs/briefs/078-release-noite-2026-11-07-qa-engineer-4.md e952ad584fe1fd392ccda23449a5e5a717ef7d417946ffcb79373e151c79e6ef
- 2026-11-10 15:16: Volta da release na docs/078-release-b: CHANGELOG ace67959 e review 82c176db (tech-lead-12), segurança 9314a17c (security-engineer-5) e QA 5aed2fbe (qa-engineer-4, pronto rc=0, 5397 testes), todos aprovados sobre ace67959. Bloqueio da ferramenta (sem contorno): o forge-check entrega --pedido confere um brief por vez e conta os pareceres das outras duas entregas como fora do declarado (os três arquivos já existiam na develop); a forma antiga com --brief (união dos três) dá o escopo limpo, mas não grava a entrega conferida; sem ela, o forge-check pr recusa o PR e o hook barra o gh pr create (K-259). PERGUNTA ao dono: A) ele abre e mescla pelo terminal o PR docs/078-release-b -> develop (só documentação: CHANGELOG e três pareceres aprovados); B) esperar a correção no Forge. Recomendação: A.
- 2026-11-10 15:23: Alertas do Dependabot avisados no push (6: 2 altas, 4 médias) conferidos pelo Jarvis contra docs/security/073-dependabot-triagem.md e 073-aceite-alertas-16-27.md: abertos 13, 16, 17, 26, 27 e 29, todos já triados no 073 (16 e 27 com risco aceito pelo dono em 2026-11-05, revisão em 2026-12-05; 13, 17, 26 e 29 só desenvolvimento). Nenhum barra a release.
