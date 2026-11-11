# Pedido 099: nenhuma métrica simulada

- **Modo:** discovery (varredura) e depois implementar
- **Objetivo:** pedido do dono, repassado pela sessão "WSL ativação" (literal do dono): "quero que nao tenha nenhuma metrica simulada". Na demo local (origin/main c9354a82, sem DSPD_MODO_MOCK), nenhuma métrica da web pode mostrar dado simulado, fictício, de mock ou valor inventado fora do modo homologação; o que não tiver dado real mostra o estado "sem dado real" ou sai da tela; uma guarda impede a volta.
- **Clareza:** 1 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Origem:** dono, 2026-11-11 (pela sessão "WSL ativação").

## Escopo
- E1. Varredura completa da web (abas, cartões, textos, números fixos, uso do pacote mock, dado de exemplo, simulador do cartão) e da API, com a lista do que é simulado e de onde vem · `técnico`
- E2. Cada item simulado passa a dado real, estado "sem dado real" ou sai da tela; o que pedir escolha entre esconder e mostrar "sem dado" vira pergunta ao dono · `confirmado`
- E3. Teste ou guarda que impede métrica simulada fora do modo homologação · `técnico`

## Etapas
- E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real.

## Fora do escopo
- O modo homologação (seed mock em `docker-compose.homolog.yml`), que continua com dado de teste · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 13:54: pedido aberto pelo Jarvis (K-275). Base: ADR 0026 (métricas só com dado real) e pedido 060, que já cobrem a API.
- 2026-11-11 13:54: complemento do dono pela sessão "WSL ativação" (literal): "no operacional". A varredura começa pela aba Operacional e manda ao dono a lista com o que entra no lugar de cada item; o resto da web vem depois.
- 2026-11-11 13:54: brief selado docs/briefs/099-nenhuma-metrica-simulada-software-architect-1.md c01c2df6a66f0e8d2aa61fd37e4586a04ae1e1bd944ae59f74d30098b70f31a3
- 2026-11-11 13:55: DECISÃO DO DONO (literal): "nao quero nenhuma simulada no operacional". Prioridade: a aba Operacional fica sem nenhuma métrica simulada; a varredura do arquiteto começa por ela.
- 2026-11-11 13:55: DECISÃO DO DONO (literal): "faca tudo que for preciso para tornar elas com dados reais". O caminho padrão de cada métrica simulada do Operacional é passar a dado real (coleta, projeção, cálculo pela biblioteca T2.5, tela), e não esconder nem mostrar "sem dado"; só vira pergunta ao dono o que depender de dado que nenhuma fonte tem ou de regra de negócio sem definição (não se resolve por inferência).
