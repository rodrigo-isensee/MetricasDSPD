# Pedido 002 — Arquitetura completa do sistema

Solicitante: Rodrigo Isensee · Data: 2026-10-09 · Responsável: `software-architect`

## Objetivo
Desenhar **a melhor arquitetura possível** para o sistema de métricas do DSPD como produto final — não só o dashboard mock do pedido 001. Stack obrigatória: **TypeScript de ponta a ponta, Node.js no back-end e React no front-end**.

A especificação funcional é o `docs/briefing-execucao-metricas.md`; as regras invioláveis estão no `CLAUDE.md`.

## Relação com o pedido 001
O dashboard mock em andamento deve nascer **dentro** desta arquitetura, não ao lado dela: mesma estrutura de repositório, mesma biblioteca de cálculo, mesmos contratos de dados. Trocar o mock pela API real precisa ser uma troca de fonte de dados, sem reescrever painéis nem cálculos. Se o ADR de front já escrito para o pedido 001 conflitar com esta arquitetura, ajuste-o e avise o Jarvis.

## O que a arquitetura precisa cobrir
1. **Ingestão do BusinessMap** — coletor incremental agendado (API REST v2: cards, revisions, children, customFields, columns, bloqueios) e recepção de webhook de mudança de coluna, com reconciliação entre os dois (T2.2, T2.3). Carga append-only: nunca sobrescrever histórico; preservar arquivados e excluídos.
2. **Leitura do Acelerato** — acesso somente leitura ao MySQL `acelerato_dev_corporativo`, com o recorte DSPD-SSSC da seção 3.2 e a view de etapas (T5.1).
3. **Base analítica** — `dim_card`, `fato_transicao`, `fato_bloqueio` (seção 4.5) e o equivalente para chamados; derivação dos marcos temporais (T2.4); separação física ou lógica clara entre os domínios BusinessMap e Acelerato.
4. **Biblioteca de cálculo compartilhada** — horas úteis com calendário e feriados, percentis com janela de 12 semanas e mínimo de 20 itens, Monte Carlo (T2.5). Um pacote TypeScript único, usado pelo back-end e pelo mock, com testes.
5. **Versionamento de critérios** — registro de mudanças de regra com data e marcação nos gráficos (T2.6).
6. **API** — contratos tipados entre back e front (schemas compartilhados), paginação, cache das métricas pesadas, recorte por filtros (equipe, tipo, sistema, período).
7. **Front-end** — painéis FL1, FL2, FL3, sustentação e EI.
8. **Automações externas do Acelerato** (T4.3) — onde rodam e como registram no chamado sem tocar no relógio de SLA.
9. **Requisitos não funcionais** — segurança (credenciais, somente leitura, autenticação corporativa), observabilidade (logs das coletas com contagem e falhas, alertas), confiabilidade (retentativas, idempotência), performance dos painéis, LGPD (dados de pessoas presentes nos cards e chamados), e a regra de que **nenhuma visão individual** é exposta — inclusive na API.
10. **Implantação e CI** — ambientes, pipeline no GitHub Actions, migrações de banco.

## Banco de dados: MySQL (decisão do solicitante)
A base analítica será em **MySQL** (8.x). Não reabrir essa escolha; registrar em ADR com as consequências.

A modelagem deve ser feita já pensando nas integrações reais que virão depois com o **BusinessMap** e o **Acelerato**:
- **Camadas separadas:** dados brutos como chegam de cada origem (staging, append-only, com payload original e data de coleta), camada analítica normalizada (`dim_card`, `fato_transicao`, `fato_bloqueio` e o equivalente para chamados do Acelerato) e, se necessário, agregados para os painéis.
- **Rastreabilidade de origem:** toda linha guarda o sistema de origem, o identificador natural na origem e a data/hora da coleta, para reconciliação contra a ferramenta (critérios de pronto da T2.2, T2.3 e T5.1).
- **Idempotência:** chaves naturais e restrições únicas que permitam reprocessar uma coleta ou um webhook sem duplicar registros.
- **Domínios separados:** BusinessMap e Acelerato em schemas ou prefixos distintos; nenhuma tabela mistura as duas origens.
- **Histórico:** nada é sobrescrito. Mudanças de atributo de card ou chamado viram nova versão ou evento (avaliar SCD tipo 2 onde fizer sentido); cards arquivados e excluídos permanecem.
- **Domínios fechados** da seção 4.4 e os campos da seção 3.4 como tabelas de referência, com controle de vigência (as listas mudam em revisões trimestrais).
- **Calendário de expediente e feriados** em tabela, usado pela biblioteca de horas úteis.
- **Versionamento de critérios** (T2.6) em tabela própria.
- **Controle de execução das coletas:** tabela de log com início, fim, contagem por entidade, falhas e marca d'água para a carga incremental.
- **Dados pessoais:** identificar colunas com dados de pessoas (responsáveis, solicitantes, atendentes) e definir como são protegidos e como a regra de "nenhuma visão individual" é garantida no próprio modelo.
- **Fuso e tipos:** datas em UTC com tipo adequado, `utf8mb4`, motor InnoDB.

O **mock do pedido 001 deve gerar dados com a mesma forma da camada analítica**, para que a troca do mock pelo banco real não mude os contratos.

Entregar também os **scripts de migração** iniciais do esquema (ferramenta de migração a definir em ADR) e um **seed** com os dados mockados carregáveis no MySQL.

## Entregáveis
- `docs/architecture/overview.md` — contexto e containers (C4 níveis 1 e 2, Mermaid) e o fluxo de dados ponta a ponta.
- `docs/architecture/data-model.md` — modelo analítico completo (ER em Mermaid), chaves, índices, estratégia append-only.
- `docs/architecture/adr/` — uma ADR por decisão relevante. No mínimo: estrutura do monorepo; banco da base analítica; agendamento das coletas; pacote de cálculo compartilhado; contratos e validação entre front e back; framework da API; biblioteca de gráficos; autenticação; implantação.
- `docs/architecture/roadmap.md` — ordem de implementação alinhada às frentes WS2, WS3, WS5 e T4.3, respeitando a ordem obrigatória do briefing, com o que cada agente faz.
- Estrutura inicial do monorepo (pastas, `package.json` dos workspaces, `tsconfig` base) para o pedido 001 já usar.

## Decisões em aberto
O que depender de informação da infraestrutura da Unifique (onde hospedar, banco disponível, SSO corporativo, acesso de rede ao MySQL do Acelerato e ao BusinessMap) deve ser listado como pergunta ao usuário, com a recomendação do arquiteto e a alternativa — não bloquear o restante do desenho por isso.
