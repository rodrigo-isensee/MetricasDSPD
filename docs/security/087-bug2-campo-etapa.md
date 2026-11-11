---
tipo: revisao-seguranca
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-bug2-campo-etapa
commit: 6dd8b6824536132fd82b64888d28b293f311a75f
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança: 087-bug2-campo-etapa (K-258, E4.9)

Revisão estática do diff 6b43d980..6dd8b682: `server/src/modulos/acelerato/allow-list.ts` (função `nomeCanonico`, usada nas linhas da Q6 e da Q7 de `camposEtapa`) e `server/tests/acelerato-allow-list.test.ts`. Nada foi lido de `.env` nem executado contra base real. `server/tests/acelerato-allow-list.test.ts` rodado: 32 testes passam.

## Gatilhos
Coletor do Acelerato com allow-list na fronteira (dado de pessoa e texto livre na fonte; R-SEGURANCA).

## Achados

Nenhum.

## Sondas

## Detalhe
- **A allow-list não se abre.** `CANONICO_POR_FORMA` é montado só de `CAMPOS_ETAPA_F3` (9 nomes, cujas formas normalizadas são distintas entre si, sem colisão). Nome que não casa devolve a linha como veio e o esquema `z.enum(NOMES_ETAPA_LISTA/PREENCHIDO)` continua barrando. A linha devolvida é `{...linha, nome: canônico}`: as demais chaves ficam, e o `z.strictObject` ainda recusa coluna extra (nome, e-mail, descrição, título).
- **Troca de lista.** O nome canônico de um campo de `lista` não entra no enum de `preenchido` e vice-versa; uma grafia de um não vira o outro.
- **Sem vazamento.** Nome desconhecido falha em `falhar(...)`, que reduz o erro do zod ao nome da coluna (`nome`), nunca ao valor; o teste prova que o texto desconhecido não aparece no erro serializado nem na mensagem. A contagem `nome_variante_<chave>` usa só a chave fixa da lista, nunca o texto recebido.
- **Entrada não objeto, sem `nome` ou `nome` não texto** segue direto ao esquema e falha fechado (teste cobre).
- **Q6 e Q7 inalteradas.** O diff não toca `sql.ts`; a normalização só roda depois da leitura, em memória (NFD, `\p{M}`, minúscula, `trim`: tempo linear, sem regex com retrocesso).
- Observação sem ação: a forma comparável também aceita espaço no início do nome, além do fim; segue dentro da lista fechada e com contagem, sem risco.
