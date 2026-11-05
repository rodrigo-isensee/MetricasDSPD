# Pedido 073: melhorias técnicas vistas em 2026-11-05

- **Modo:** implementar
- **Objetivo:** fechar as lacunas técnicas que os reviews, a CI e as retrospectivas de 2026-11-05 mostraram, cada uma por PR próprio para a develop
- **Clareza:** 0 confirmado; 7 técnico; 0 suposição; 0 perguntas (melhoria técnica do projeto, com autonomia dada pelo dono ao time)
- **Depende de:** nenhum (os achados vieram dos reviews e retrospectivas dos pedidos 069, 070, 071 e 072, mas nenhum item depende de entrega aberta deles)

## Escopo
- E1. K-228: refazer a triagem dos alertas abertos do Dependabot (a triagem da docs/060-triagem-dependabot envelheceu) · `técnico`
- E2. K-227: alinhar o estado da ADR 0023 (marcada como proposta, já tratada como vigente no CLAUDE.md) · `técnico`
- E3. K-224: mudança de lista em ref_dominio passa a pedir reconhecimento da coleta (CA-8), como a das constantes do código · `técnico`
- E4. K-225: regra de fronteira do eslint do server cobre toda pasta de src/ fora de modulos/ · `técnico`
- E5. K-226: o format:check da raiz cobre o server/ · `técnico`
- E6. K-229: seção [Não publicado] do CHANGELOG sem os itens da release 068 · `técnico`
- E7. K-230: os pareceres que faltam na develop (feature/069-l7-calendario e feature/011-metricas-tambem-back) chegam por PR · `técnico`
- E8. K-232: atualizar por patch body-parser 1.20.9, qs 6.16.1 e ip-address 10.7.4 no pnpm-lock.yaml (alertas 17, 26 e 13 da triagem), com parecer de segurança da dependência · `técnico`

## Etapas
- E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/.
- E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit.
- E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho.
- E3.2 (tech-lead): review e PR por item.
- E3.3 (qa-engineer): QA por item.
- E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review.
- E8.1 (security-engineer): parecer de segurança da dependência do E8 (pnpm-lock.yaml), antes do PR.
- E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5.

## Fora do escopo
- Mudar regra de negócio ou métrica · `técnico`
- Corrigir dependência sem a triagem pronta · `técnico`

## Suposições

## Perguntas na fila
- PERGUNTA (2026-11-05): aceitar o risco dos alertas 16 (zod 3.25 via lighthouse, só ferramenta de teste) e 27 (glob via node-pg-migrate, só o comando de migração) até os pacotes pai corrigirem, ou trocar as ferramentas? Recomendação do security-engineer: aceitar com prazo de revisão.

## Histórico
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
- 2026-11-05 18:11: Ajuste (Jarvis): o Depende de passa a nenhum; os itens só nasceram dos achados de outros pedidos e não dependem de entrega aberta deles.
- 2026-11-05 18:16: DECISÃO TÉCNICA (Jarvis): com o dono fora da máquina depois das 18h e o uso liberado, o E4 (K-225, regra de fronteira do eslint) começa em paralelo à triagem, com o node-backend na worktree 052c (livre depois do merge do PR 238); é configuração e teste, sem relação com dependências.
- 2026-11-05 18:19: Triagem do Dependabot feita: docs/security/073-dependabot-triagem.md em 3478fcfc (commit: 8a789d43), aprovado: 6 alertas abertos, só o 27 (glob via node-pg-migrate, comando de migração) liga a produção; atualizar já por patch o 17 (body-parser, alto), o 26 (qs) e o 13 (ip-address); esperar o pai no 16 (zod 3.x via lighthouse), no 27 (glob) e no 29 (minimatch). ESCOPO+ técnico: E8 (as três atualizações por patch). Aceitar o risco do 16 e do 27 até o pai corrigir é decisão do dono (na fila de perguntas).
- 2026-11-05 18:20: Proposta do estado da ADR 0023 entregue pelo software-architect (docs/analises/073-adr-0023-estado.md, sem commit): cabeçalho vigente no molde da ADR 0028, trechos a trocar e três perguntas. P-0023-1 respondida pelo Jarvis com o gh: o PR 203 (CLAUDE.md lendo o Acelerato pela tabela MySQL) foi mesclado em 2026-11-04T00:58:02Z, commit 4e755edd1a00aa2d934899b4deb7c944435f54f8. P-0023-2 (a ADR vale pelas decisões do dono no 056 e no 060 mais o merge do PR 203) vai à fila de perguntas ao dono. P-0023-3 (data da primeira coleta real, em ctl_coleta) é dado da base real: ação do dono, não bloqueia o texto.
- 2026-11-05 18:24: DECISÃO TÉCNICA (Jarvis): o E8 começa em paralelo ao E4, com outro node-backend na worktree 052f (livre: a docs/071-release já está na develop pelo PR 235), branch feature/073-deps-patch; depende só da triagem, já pronta; pede parecer de segurança da dependência antes do PR.
- 2026-11-05 18:27: E4 (K-225) entregue pelo node-backend em feature/073-fronteira-eslint (5af33d34): regra de fronteira com files src/**/*.ts e ignores de src/modulos/** e das exceções antigas; teste de cobertura server/tests/fronteira-eslint.test.ts (mutação à mão com pasta nova quebrou 4 testes); eslint rc=0; docs/architecture/server.md atualizado. DECISÃO TÉCNICA (Jarvis): review do tech-lead e conferência da entrega em paralelo; QA depois do review; sem gatilho de segurança (configuração de lint e teste).
- 2026-11-05 18:29: entrega conferida 5af33d345bbbc68a7b2d58874437ebc1a43bc48b
- 2026-11-05 18:31: DECISÃO TÉCNICA (Jarvis): o E5 começa pela análise E5.1 do tech-lead, só leitura, sem commit; o prettier --check roda numa cópia destacada da develop na worktree /home/rodrigoisensee/MetricasDSPD-056d (limpa, na feature/069-l9a-sem-zero já mesclada), com `git switch --detach origin/develop` e nada escrito.
- 2026-11-05 18:31: Review do E4 aprovado: docs/reviews/073-fronteira-eslint.md em 5598410a (commit: 5af33d34); exceções antigas mantidas, pasta nova coberta (print-config); 40 testes; A1 (recomendado): o teste só confere o primeiro nível de src/. DECISÃO TÉCNICA (Jarvis): QA do E4 e conferência do review em paralelo.
- 2026-11-05 18:33: entrega conferida 5598410a9a1d6d2aa92e8b85f4b1fdaacd8dbfa4
- 2026-11-05 19:38: E5.1 entregue pelo tech-lead (docs/analises/073-format-server.md, sem commit): a exclusão do server/ do format:check foi omissão (o format:check nasceu em dbbcfb47, antes do server; 6f1ca0f4 pôs o server no lint e no typecheck, não no format); prettier --check server acusa 309 de 312 arquivos (semi: false da raiz contra o ; do server); o e2e também fica fora (46 arquivos). Recomendação (a) em dois PRs: PR 1 só prettier --write server com teto: excedido e .git-blame-ignore-revs; PR 2 inclui server no format e no format:check. DECISÃO TÉCNICA (Jarvis): segue a (a), começando depois do merge dos PRs do E4 e do E8, com a develop sem outra branch aberta do server; o e2e vira o cartão K-233.
- 2026-11-05 19:38: QA do E4 aprovado: docs/qa/073-fronteira-eslint.md em e4b05d52 (commit: 5af33d34), 0 bugs; eslint rc=0; 1811 testes do server; prova manual com pasta temporária; A1 (recomendado) igual ao do review. DECISÃO TÉCNICA (Jarvis): conferência da entrega do QA e brief do PR do E4 em paralelo.
- 2026-11-05 19:40: entrega conferida e4b05d52416e1ab70c775390dbfab4f02664cab8
- 2026-11-05 19:41: O E6 (K-229, CHANGELOG) fica parado: a conferência mostrou que o CHANGELOG da develop não tem seções por release (só [Não publicado] e [0.2.0]), então "tirar os itens da 068 da [Não publicado]" exige primeiro decidir como as releases entram no CHANGELOG (número de versão ou data). DECISÃO TÉCNICA (Jarvis): o tech-lead propõe essa prática junto com a próxima release; o brief tech-lead-5 não segue. O E7 ganha a etapa E7.1 do tech-lead (a cópia dos pareceres é trabalho dele, não implementação de código).
- 2026-11-05 19:42: E8 parado antes do push: commit local b9441f58 só no pnpm-lock.yaml (body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4, nada mais); install frozen ok; pacotes verdes; server 1781 passam e 25 falham, todos nos 4 testes de entrada que lançam tsx em processo filho com env limpo (mkdir /tmp/tsx-1000 negado no sandbox, limitação já conhecida e registrada no brief do QA da 071); eslint e docs:check verdes. DECISÃO TÉCNICA (Jarvis): a falha é do ambiente do time e não da versão; o push segue e a CI do PR (suíte completa fora do sandbox) é a prova desses 4 arquivos antes de qualquer merge; o node-backend só faz o push. MELHORIA (técnica do projeto): os testes de entrada ignoram TMPDIR por usarem env limpo; passar TMPDIR adiante tiraria a dependência de /tmp (cartão).
- 2026-11-05 19:43: DECISÃO TÉCNICA (Jarvis): E7.1 em dois passos: nesta delegação o tech-lead monta a branch docs/073-pareceres-faltantes e envia; o PR vem depois do review dela. Os dois arquivos do 011 já existem na develop em versão anterior (de f9fc3cd3, 2026-10-16); a revalidação de 2026-10-16 os substitui: docs/qa/011-back.md vem de 21fca162 e docs/reviews/011-back.md vem de 4d0539e8; os do 069 (069-zz2-l7a) são arquivos novos.
- 2026-11-05 19:45: E8 enviado: feature/073-deps-patch em b9441f58 (só pnpm-lock.yaml: body-parser 1.20.9, qs 6.16.1, ip-address 10.7.4). DECISÃO TÉCNICA (Jarvis): parecer de segurança da dependência (security-engineer) e review (tech-lead) em paralelo, pareceres 073-deps-patch.md; QA depois do review, com os 4 testes de entrada provados na CI do PR.
- 2026-11-05 19:48: Retomada (Jarvis, antes de compactar): em curso: PR do E4 (tech-lead, feature/073-fronteira-eslint, review 5598410a e QA e4b05d52 conferidos); E8 (feature/073-deps-patch b9441f58) com a entrega não cumprida só porque o brief node-backend-5, aprovado às 18:28, ganhou etapas do pedido depois: reenviar ao conferente com essa explicação; parecer de segurança do E8 (security-engineer-4) rodando; brief do review do E8 tech-lead-13 e brief dos pareceres antigos tech-lead-12 em conferência; E6 parado (prática de versões do CHANGELOG); E5 (formatar o server) depois dos PRs do E4 e do E8. Perguntas ao dono na fila: risco dos alertas 16 e 27; ADR 0023 vigente.
