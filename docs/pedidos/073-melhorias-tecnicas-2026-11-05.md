# Pedido 073: melhorias técnicas vistas em 2026-11-05

- **Modo:** implementar
- **Objetivo:** fechar as lacunas técnicas que os reviews, a CI e as retrospectivas de 2026-11-05 mostraram, cada uma por PR próprio para a develop
- **Clareza:** 0 confirmado; 7 técnico; 0 suposição; 0 perguntas (melhoria técnica do projeto, com autonomia dada pelo dono ao time)
- **Depende de:** 069-lacunas-alta (origem dos achados)

## Escopo
- E1. K-228: refazer a triagem dos alertas abertos do Dependabot (a triagem da docs/060-triagem-dependabot envelheceu) · `técnico`
- E2. K-227: alinhar o estado da ADR 0023 (marcada como proposta, já tratada como vigente no CLAUDE.md) · `técnico`
- E3. K-224: mudança de lista em ref_dominio passa a pedir reconhecimento da coleta (CA-8), como a das constantes do código · `técnico`
- E4. K-225: regra de fronteira do eslint do server cobre toda pasta de src/ fora de modulos/ · `técnico`
- E5. K-226: o format:check da raiz cobre o server/ · `técnico`
- E6. K-229: seção [Não publicado] do CHANGELOG sem os itens da release 068 · `técnico`
- E7. K-230: os pareceres que faltam na develop (feature/069-l7-calendario e feature/011-metricas-tambem-back) chegam por PR · `técnico`

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

## Histórico
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
