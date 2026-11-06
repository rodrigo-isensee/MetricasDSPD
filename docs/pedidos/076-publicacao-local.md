# Pedido 076: publicação no ambiente local até a VM

- **Modo:** implementar
- **Objetivo:** pôr no ambiente local desta máquina o que estava marcado para a VM (K-200, K-216): migrações pendentes, calendário, coleta do apontamento e a conferência Q20, até o dono migrar para a VM na semana que vem
- **Clareza:** 2 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Depende de:** 074 (decisão do dono de 2026-11-06 10:29 e recibo confirmado)

## Escopo
- E1. Roteiro local: de que checkout rodar (código da main), a ordem dos comandos (migrações pendentes, ref:sync-calendario, coleta do apontamento, Q20) e o resultado esperado de cada um · `confirmado`
- E2. Conferência do resultado depois que o dono rodar (saídas e Q20) · `confirmado`

## Etapas
- E1.1 (devops-engineer): roteiro em docs/devops/076-publicacao-local.md, só leitura e sem commit; cada comando numa linha que o dono roda, porque os comandos leem o .env, que o sandbox do time não lê.
- E1.2 (dono): rodar o roteiro e colar as saídas.
- E2.1 (devops-engineer): conferir as saídas coladas e dizer o que ficou pronto.

## Fora do escopo
- Editar o .env (senha do dspd_api_apontamento, PG_APONTAMENTO_URL): do dono · `confirmado`
- Agendar a coleta diária na máquina e qualquer passo na VM · `confirmado`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-06 10:33: pedido aberto (Jarvis) pela decisão do dono no 074 ("faca tudo por aqui"; recibo confirmado com "isso"). DECISÃO TÉCNICA (Jarvis): os comandos (db:migrate, ref:sync-calendario, bm:apontamento) carregam o .env, que o sandbox do time não lê (o .env aparece vazio para os agentes); o devops-engineer prepara o roteiro e o dono roda, como no comando de apoio do L9-c; o time confere as saídas.
- 2026-11-06 10:36: NAO-ENTENDI: (Jarvis) o recibo confirmado dizia que o devops-engineer faria os passos locais; a decisão técnica das 10:33 passou a execução ao dono (o .env não é lido no sandbox) sem perguntar. Achado pelo conferente no brief devops-engineer-1. PERGUNTA (P-076-1, ao dono): A) o devops-engineer escreve o roteiro e o dono roda os comandos e cola as saídas; B) o devops-engineer roda os comandos fora do sandbox, cada um passando pela aprovação do dono na tela, sem ler o .env (os scripts o carregam). Recomendação: B (é o que o recibo disse; o controle continua na aprovação de cada comando).
