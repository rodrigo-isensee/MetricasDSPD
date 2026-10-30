# Pedido 056: conexão com o Acelerato pela tabela MySQL

- **Modo:** analisar (sobe para planejar ou implementar só com o dono)
- **Objetivo:** "do acelerato eu tenho uma tabela no mysql, quero fazer a conexao tambem" (dono, 2026-10-30)
- **Clareza:** 3 confirmados; 0 suposições; 0 perguntas
- **Depende de:** nenhum (o pedido 052, BusinessMap, segue em paralelo)

## Escopo
- E1. Leitura do Acelerato pela tabela MySQL do dono, só leitura · `confirmado` (dono, "B", 2026-10-30)
- E2. Mudança da regra inviolável do `CLAUDE.md` do projeto que hoje manda ler o Acelerato só pela API pública · `confirmado` (consequência direta da "B")
- E3. Discovery da fonte (o que é a tabela, colunas, dado de pessoa, credencial, usuário só leitor) antes de qualquer código · `técnico` (R-DISCOVERY, R-SEGURANCA)

## Etapas
- (a definir depois das perguntas 2 e 3)

## Fora do escopo
- Escrever no MySQL ou no Acelerato · `confirmado` (dono, "B": só leitura)
- Misturar Acelerato e BusinessMap em qualquer cálculo · `confirmado` (regra inviolável do CLAUDE.md)

DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).

## Suposições
- nenhuma

## Histórico
- 2026-10-30: pedido aberto; PERGUNTA 1 (fonte do Acelerato: API, MySQL ou as duas) respondida com "B". Fila: pergunta 2 (o que é a tabela) e pergunta 3 (prioridade em relação ao 052).
- 2026-10-30 13:17: PERGUNTA 2 respondida: tabela mantida pelo time de ciência de dados (opção B). Fila: pergunta 3 (prioridade).
- 2026-10-30 13:21: PERGUNTA 3 respondida com "A". Recibo enviado ao dono.
