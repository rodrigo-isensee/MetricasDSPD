Agente destino: forge:software-architect
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E2.1

## Objetivo
Alinhar o estado da ADR 0023 (Acelerato lido pela tabela MySQL), que ainda diz "Estado: proposta" embora o CLAUDE.md da develop já a trate como a regra vigente (pedido 073, E2.1, K-227). Só a proposta de texto, sem commit.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/develop:docs/architecture/adr/0023-acelerato-pela-tabela-mysql.md` (cabeçalho e §8).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/develop:CLAUDE.md` (regra das credenciais e do Acelerato).
- O molde de ADR vigente: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/develop:docs/architecture/adr/0028-simulado-por-cartao.md` (cabeçalho).

## Entregar
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." (E2.1)
- (E2) (E2.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-adr-0023-estado.md` pela ferramenta Write: o cabeçalho novo proposto para a ADR 0023 (estado vigente, data da aceitação com a evidência de quando ela passou a valer: o PR que mudou o CLAUDE.md e a coleta já em produção pela tabela MySQL, com os commits citados), as partes do texto que ainda falam como proposta e o que trocar; se a data ou a decisão de aceitar não estiverem registradas em lugar nenhum, isso vira pergunta no relatório, nunca texto inventado; sem commit.
- (E1, E3, E4, E5, E6, E7) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; vale a DECISÃO TÉCNICA abaixo)
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Decisão nova que nem o dono nem o histórico tomaram vira pergunta no relatório, nunca texto na proposta.
- NÃO tocar: outros arquivos (a própria ADR 0023, a ADR 0013 e o CLAUDE.md inclusive), as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review e PR por item." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- Editar a ADR 0023: depois da proposta, por PR de documentação.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/073-adr-0023-estado.md` existe e contém 'ADR 0023'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
