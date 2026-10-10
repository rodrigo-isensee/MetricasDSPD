# Decisões do usuário — validação pós-entrega do 001

Data: 2026-10-10 10:04 · Solicitante: Rodrigo Isensee · Registrado pelo Jarvis

## 1. Decisões provisórias do pedido 001 — **todas confirmadas**
Todas as decisões provisórias registradas em `docs/alinhamentos/2026-10-09-decisoes-review-fase-a.md` (Q1–Q6, P1–P2, F1–F4), na ata `2026-10-09-checkpoint-001-kickoff-002.md`, no plano técnico (seção 9) e na spec de UX (perguntas em aberto) passam a ser **definitivas**, inclusive: janela de 12 semanas para todas as granularidades; sustentação em horas úteis (P1 incluído); calendário com feriados nacionais; percentil tipo 7 (PERCENTILE.INC); filtro por agente fora da sustentação; T3 com os percentuais provisórios até haver acordo real.

## 2. Discovery "Integração real" (K-034) — validado com ajustes
| Pergunta | Decisão |
|---|---|
| H1 Painel visível durante a calibração? | **Sim, sempre visível** (com a indicação "dados de calibração, não cobrar") |
| H2 Quem registra a janela de calibração? | **Automática** — o sistema define e registra a janela (sem cadastro manual) |
| H3 Cadência da coleta | **Diária**; a integração real com as ferramentas vem depois |
| H4 Tela `/dados` | **Sim**, quer a tela de dados/coletas |

## 3. Pedido 002
| Tema | Decisão |
|---|---|
| L-1 Pseudonimizar pessoas | **Não** tirar os nomes da base. A regra "nenhuma visão individual" continua garantida na API e nos painéis (nenhuma rota, DTO ou tela agrega ou expõe por pessoa) |
| Infraestrutura do Acelerato e do BusinessMap | **Ainda indefinida** pelo usuário — perguntas seguem abertas, sem bloquear |
| Ambiente de banco | **Docker** (MySQL 8.4 em contêiner para desenvolvimento e testes). Hoje não há Docker instalado nesta máquina |

## 4. Discovery pausado (K-035, K-036)
O usuário delegou ao time a decisão do que é melhor para a entrega.

## 5. Complemento do Jarvis (2026-10-10 10:12) — regra da janela de calibração automática (pergunta 1 da spec `docs/ux/integracao-real/05-especificacao.md`)
**Provisória, a confirmar pelo usuário:** a janela de calibração dura **60 dias corridos** e é aberta automaticamente (a) no início da coleta de cada fonte (BusinessMap e Acelerato, separadamente) e (b) em cada mudança de critério registrada no controle de versões (T2.6), para as métricas afetadas. Duração em constante única. Fundamento: briefing 7.4 ("30 a 60 dias"; adotado o limite conservador).

## 6. Pedido 007 — validação do protótipo de preferências (2026-10-10 14:56)
| # | Pergunta | Decisão do usuário |
|---|---|---|
| 1 | Predefinições por papel | **Sim**: conjunto sugerido por papel (gerente, coordenador, time), ajustável |
| 2 | Alerta de métrica oculta na faixa "Pede atenção" | **Continua aparecendo**, com selo "métrica oculta" e "Mostrar nesta visita" |
| 3 | Visão geral | **Sempre completa**, fora do recorte de preferências |
| 4 | Link compartilhado | **Leva só os filtros**; o destinatário vê as próprias preferências (sem `ocultar` na URL) |
| 5 | Ocultar todas as métricas de um painel | **Permitido**; painel vazio com "Mostrar todas" |
| 6 (D-f) | Espera invisível ocultável | **Sim**, nos painéis; continua na página própria e na Visão geral |
| 7 (D-g) | Primeiro login com preferências no navegador | **Perguntar antes** ("Usar estas preferências" / "Começar do padrão do meu papel") |

## 7. Banco de dados (2026-10-10 14:56)
O usuário decidiu **trocar o banco para PostgreSQL**, seguindo a stack técnica que ele enviou (Fastify 5, `pg` puro sem ORM/query builder, node-pg-migrate, outbox transacional no Postgres por polling sem BullMQ, Zod 4, fastify-type-provider-zod 7 + @fastify/swagger 9, Pino, Vitest sem Testcontainers, Postgres do Docker Compose com um schema por execução de teste, pnpm). Substitui a decisão anterior de MySQL (ADR 0004).

## 8. Confirmações e infraestrutura (2026-10-10 15:14)
| Tema | Decisão do usuário |
|---|---|
| Janela de calibração | **60 dias confirmados** (deixa de ser provisória) |
| Tolerância do "Atrasado" | **0 h confirmada** |
| Nomes de pessoas | **Também nas tabelas analíticas** (como no modelo 4.5 do briefing: `responsaveis`, `usuario`). Garantia de "nenhuma visão individual": o usuário de banco da API não lê essas colunas; nenhuma view, rota, DTO ou tela agrega ou exibe por pessoa |
| Custo | **Nenhum gasto no momento**: tudo roda localmente com Docker Compose (Postgres + API Fastify + web); CI no GitHub Actions (gratuito, repo público). Implantação em nuvem (AWS/ECS/Lambda ou servidor da Unifique) **adiada**, não descartada; a API sai como imagem de contêiner para ser portátil |

## 9. Pedido 007 — P-1 conjuntos por papel (2026-10-10 15:16)
**Todos começam vendo todas as métricas.** Os conjuntos por papel (time = Operacional; coordenador = Operacional + Tático; gerente = Tático + Estratégico) viram **atalho opcional** no perfil ("Aplicar sugestão do meu papel"), não o padrão inicial. Ajusta a decisão 1 do §6.

## 10. Pedido 008 — exportar métricas (2026-10-10 15:22)
| # | Decisão do usuário |
|---|---|
| D-1 | **Somente PDF** (sem imagem/zip) |
| D-2 | **Exporta só o que está visível** na tela (métrica oculta não entra) |
| D-3 | **Visão geral também exporta**, já na primeira versão (BM e AC em blocos separados) |
| D-4 | **Exportação personalizada**, além do botão por painel: o usuário marca, nível a nível (Operacional, Tático, Estratégico, Sustentação, Espera invisível), as métricas visíveis e sai um PDF só; cada métrica com os próprios filtros e fonte; BM e AC em seções separadas |
| D-5 | **Não registrar** as exportações |
