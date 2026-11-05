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
- E8. Atualizar por patch body-parser 1.20.9, qs 6.16.1 e ip-address 10.7.4 no pnpm-lock.yaml (alertas 17, 26 e 13 da triagem), com parecer de segurança da dependência · `técnico`

## Etapas
- E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/.
- E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit.
- E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho.
- E3.2 (tech-lead): review e PR por item.
- E3.3 (qa-engineer): QA por item.

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
