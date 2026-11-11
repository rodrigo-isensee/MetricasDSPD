---
tipo: qa
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-bug2-campo-etapa
commit: 6dd8b6824536132fd82b64888d28b293f311a75f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---

# QA: BUG-087-2, nome do campo de etapa do Acelerato (E4.8)

Links: pedido `docs/pedidos/087-paineis-dado-real-e-demo.md` (E4.6), regra do CLAUDE.md (allow-list fechada, falha fechada, sem texto de fonte na saída).

## Escopo
Diff `6b43d980...6dd8b682`: `server/src/modulos/acelerato/allow-list.ts` (`nomeCanonico`, aplicado às linhas da Q6 e da Q7 antes do esquema exato) e `server/tests/acelerato-allow-list.test.ts` (9 testes novos). Sem UX nem contrato de API novos. Sem base real, sem `.env`. Fora: a coleta contra o Acelerato real (só o dono roda).

## Obrigações, testes e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Q6: variante de acento, maiúscula e espaço no fim volta ao nome canônico, o valor segue e soma `nome_variante_<chave>` | `lista: variante de acento/maiúscula/espaço no fim ...` (3) | grafia diferente na fronteira da fonte | passou |
| Q7: as mesmas três variantes seguem e somam o contador | `preenchido: variante de ... ` (3) | idem | passou |
| Nome exato não soma contador | `nome exato não soma contador` | contador só em variante | passou |
| Linha que não é objeto, sem `nome` ou com `nome` não textual segue falhando fechado | `linha que não é objeto...` (null, texto, sem nome, nome numérico, nas duas listas) | tipo inválido | passou |
| Nome desconhecido falha fechado (`dados-invalidos`, `campo_etapa`, `nome`), sem o valor na exceção nem na mensagem | `nome desconhecido segue falhando fechado, sem o valor` | nome fora da lista fechada; sem vazamento | passou |

## Execução
- `server/tests/acelerato-allow-list.test.ts` com `--maxWorkers=2`: 32 de 32 passaram.
- Testes do coletor do Acelerato sem Postgres tocados ou vizinhos (`allow-list`, `campos-etapa`, `coletor`, `etapas-sinteticas`, `estatico`, `normalizador`), `--maxWorkers=2`: 6 arquivos, 184 de 184 passaram. Os `.pg.test.ts` não rodaram (exigem banco; sem base real).
- Mutação 1 (tirar a canonização: `safeParse(nomeCanonico(linha, c))` volta a `safeParse(linha)` nas duas listas): `Tests 6 failed | 26 passed (32)`, caem as 6 variantes (3 da Q6, 3 da Q7). Morta.
- Mutação 2 (contador desligado: `if (false) c.somar(...)`): `Tests 6 failed | 26 passed (32)`. Morta.
- Mutação 3 (sem `.trim()` na forma comparável): `Tests 2 failed | 30 passed (32)`, caem as duas variantes de espaço no fim. Morta.
- Todas restauradas por cópia do original antes do parecer; árvore limpa de código (só o parecer entra no commit).
- Conferido na leitura: as 9 formas da lista `CAMPOS_ETAPA_F3` são distintas, então o mapa forma-para-canônico não tem colisão. Nome desconhecido não é reescrito e o erro do esquema não carrega o valor.
- A suíte inteira roda no CI do PR (check-run `bateria` do mesmo sha, a citar pelo tech-lead no PR).

## Observações (sem bloqueio)
- A forma comparável também aceita espaço no início e acento em qualquer posição; é mais larga que o trio pedido (acento, maiúscula, espaço no fim) mas segue dentro da lista fechada e soma contador, então é visível.
- Espaço interno duplo ("Motivo  da Escalação") não é normalizado e falha fechado; decisão correta para o pedido, só registrada.

## Achados
Nenhum.
