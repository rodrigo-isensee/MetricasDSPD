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
