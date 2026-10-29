---
tipo: review
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: docs/047-dependabot
commit: 6983dd8c167f7c24e4761b2dbbbf67e069298561
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review: K-169, política do Dependabot no praticas.md

Diff de `be0a8d7` a `6983dd8`: 2 linhas a mais e 1 a menos em `docs/engineering/praticas.md` (só texto `.md`, fora do teto M14). Review por leitura; sem suíte.

## Conferência com a decisão do dono (K-169, opção A)
- Um por vez, só com todos os checks verdes, mesclado pelo `tech-lead`, check vermelho para e avisa o Jarvis: o texto da linha 116 reproduz os quatro pontos, sem acrescentar nem omitir nenhum.
- Coerência com a 10.1: o item "Versões das actions" (linha 142) agora aponta para a política da seção 9 e mantém a regra dos SHAs com comentário da versão; sem conflito com o resto da lista.
- Seção 9 coerente com "Quem mescla" (linha 115): o `tech-lead` mescla em `develop`, e o Dependabot entra por essa mesma regra.

## Frase "A revisão semanal do CI (10.1) só confere os pendentes."
Não contradiz a decisão: ela não diz quem mescla nem quando, e o item da 10.1 já falava em "PRs pendentes". Estende o texto da decisão em um ponto: separa a revisão semanal (confere) da mesclagem (um por vez, com checks verdes). É coerente com a 10.1 e com a opção A; fica como recomendado, para o dono saber que a frase é do tech-lead e não dele.

## Achados
- A1 (recomendado) docs/engineering/praticas.md:116 · A frase "A revisão semanal do CI (10.1) só confere os pendentes." estende a decisão K-169 (o dono não a pediu); não contradiz e é coerente com a 10.1. Manter ou cortar, sem devolver a entrega.

## Parecer
Aprovado. Pipeline, container e IaC: sem alteração; segurança: sem achado.
