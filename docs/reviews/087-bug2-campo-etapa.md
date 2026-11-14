---
tipo: review
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-bug2-campo-etapa
commit: 6dd8b6824536132fd82b64888d28b293f311a75f
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---

# Code review: BUG-087-2, nome do campo de etapa volta ao canônico (E4.7)

Diff lido: `6b43d980..6dd8b682` (2 arquivos, 67 linhas alteradas, um comportamento só, dentro da orientação de 150). Testes do arquivo tocado (`server/tests/acelerato-allow-list.test.ts`): 32 passando.

## Falha fechada
- `nomeCanonico` só devolve nome da lista fechada `CAMPOS_ETAPA_F3`: o mapa `CANONICO_POR_FORMA` é montado só dela, e nome que não casa a forma sai da função intacto e cai no `z.enum` do esquema (`coluna: nome`, sem o valor). Nada fora da lista passa.
- A lista separa Q6 e Q7: nome canônico da outra consulta (ex.: "Previsão de retorno" na Q6) é reescrito para o canônico, mas o `z.enum` de `NOMES_ETAPA_LISTA`/`NOMES_ETAPA_PREENCHIDO` o recusa; a canonização não abre caminho entre as duas.
- Linha que não é objeto, sem `nome` ou com `nome` não textual volta sem alteração e falha no esquema (teste cobre os quatro casos). O objeto reescrito é cópia (`{ ...linha, nome }`); o esquema `strict` segue barrando coluna extra.
- Os nove nomes têm formas distintas entre si, sem colisão no mapa. Nenhum dado de pessoa nem texto livre entra no contador: a chave é `nome_variante_<chave>`, com chave interna da lista.

## E4.6: espaço no fim x apara das duas pontas
Aceitável. O pedido cita "espaço no fim" como exemplo de variante; `trim()` das duas pontas é a mesma classe (espaço em volta), só leva ao nome canônico da lista fechada e a contagem `nome_variante_*` deixa a variante visível. O espaço no início não é caso real da collation do MySQL (que ignora só o do fim), mas a tolerância não abre nada fora da lista. Nenhuma regra do pedido é violada.

## Demais pontos
- Contador somado só quando a grafia difere do canônico; nome exato não soma (teste).
- Testes por variante (acento, maiúscula, espaço no fim) nas duas consultas, mais o caso de nome desconhecido sem vazar o valor no erro nem na mensagem.
- Sem dependência nova, sem migração, sem mudança de contrato.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/allow-list.ts:181 · `trim()` do JS também remove espaço não separável e outros espaços Unicode, mais largo que a collation; só chega ao canônico, então é inofensivo, mas vale um comentário curto se alguém estranhar a diferença.
