---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l10a-setor-dicionario
commit: 977d1484196e59f0a587269b027f2862ef9cd036
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: L10a, dicionário de setores e opcoes.setores (097, E3.3)

Diff `origin/develop...86a3808f` (base 84001e7a), 12 arquivos, conferido contra o plano `docs/analises/097-plano-e5-e7.md` (§1 e §7): escopo igual ao plano (arquivo de domínio, guarda, leitura, opção, contrato, docs/api). O HEAD da branch tem um commit a mais (95e6499e, parecer de segurança), que só toca `docs/`. O `git fetch` falhou na sandbox (github.com fora da lista); o commit 86a3808f já estava no repositório local.

## Veredito
Aprovado. Os 12 casos de abuso do arquivo recusam a carga inteira sem eco do valor, `opcoes.setores` tem a forma pedida e o contrato segue compatível. Nenhum bug. A suíte inteira e o `.pg` ficam com o check-run `bateria` do CI no mesmo sha.

## Execução (`VITEST_MAX_WORKERS=2`, nada contra a base real nem `.env*`)
- `server/tests/dominio-businessmap.test.ts` e `server/tests/opcoes-setores.test.ts`: 2 arquivos, 63 testes passaram, 0 falhas.
- `packages/contratos/src/referencia.test.ts`: 3 passaram.
- Vermelho antes do verde (feito à mão, `bin/forge-testes` não existe neste projeto): código de `server/src` e o JSON de domínio voltados à base 84001e7a, testes do head mantidos: 8 falharam, 55 passaram (as recusas de abuso passam na base por acaso: o esquema `strict` já recusa a chave `setores`; o que prova a guarda é a mutação M1 abaixo). Head restaurado e árvore limpa.

## Critério → teste → resultado
| Conferência | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| 12 casos de abuso: sobrenome em caixa alta, com espaço no fim, e-mail, rótulo vazio, caractere de controle, código não numérico, com sinal, vazio, repetido, repetido com zeros à esquerda, rótulo repetido, campo extra (nome do quadro) | `dominio-businessmap.test.ts`, `it.each` de 12 | rótulo e código fora da forma; sem valor na mensagem (`SILVA`, `empresa`) | passou, 12 de 12 |
| Mais de 50 setores | `dominio-businessmap.test.ts` | máximo 50 | passou |
| Lista vazia hoje (P-097-9) e ausente no arquivo = vazia | `dominio-businessmap.test.ts`, `opcoes-setores.test.ts` | vazio | passou |
| Forma de `opcoes.setores`: slug, ordem alfabética pt-BR, sem repetidos | `opcoes-setores.test.ts` | nomes iguais em 2 quadros | passou |
| Leitura do banco com a mesma desconfiança (código, sobrenome, arroba, branco) | `opcoes-setores.test.ts` | linha ruim no banco | passou |
| Consulta parametrizada; resposta sem código de quadro | `opcoes-setores.test.ts` | injeção, vazamento do id do quadro | passou |
| Sustentação sem `setores` | `opcoes-setores.test.ts`, `referencia.test.ts` | BusinessMap e Acelerato separados | passou |
| Contrato compatível: resposta sem `setores` válida; campo extra e id vazio recusados | `referencia.test.ts` | compatibilidade, `strict` | passou |

## Mutação na guarda (cada uma restaurada por `git checkout` do arquivo; árvore limpa depois)
| Mutante | Resultado |
|---|---|
| M1 `setor.ts`: remove o teste de sobrenome em caixa alta | morto, 3 testes caem (2 de abuso e a leitura do banco) |
| M2 `setor.ts`: remove a recusa de arroba | morto, 1 teste cai |
| M3 `servico.ts`: remove o `sort` alfabético | morto, 1 teste cai |
| M5 `repositorio.ts`: remove o filtro de código numérico na leitura | morto, 1 teste cai |
| M4 `servico.ts`: remove `!porId.has(slug(nome))` (último vale em vez do primeiro) | sobrevive, equivalente para nomes iguais (o caso pedido: o `Map` já une por slug); só difere se dois nomes distintos têm o mesmo slug (ex.: "Ciência" e "Ciencia"), caso que o esquema do arquivo não barra e a lista de 7 setores não tem |

## Observações (não bloqueiam)
- A guarda de sobrenome só pega ` - ` mais 2 ou mais maiúsculas ao fim. Sobrenome em caixa mista ("Plataformas - Silva") passa. É o desenho declarado no plano (R3) e a segurança já pediu a lista fechada dos 7 setores no lote que preencher a lista; o PR que preencher o dicionário deve levar a revisão humana dos nomes.
- A etapa de conferir a contagem de cards por setor com o dono na tela do BusinessMap (R4 do plano) pertence ao L10b, não a este lote.

## Revalidação da volta 1 (delta 86a3808f..977d1484)
O delta toca `docs/api/openapi.json` (bloco `setores` em `opcoes`, sem campo obrigatório novo, compatível) e `server/tests/opcoes-setores.test.ts` (1 teste novo).
- `pnpm run openapi:verificar` (server): "openapi.json em dia", rc 0.
- `VITEST_MAX_WORKERS=2`, `dominio-businessmap.test.ts` e `opcoes-setores.test.ts`: 2 arquivos, 64 testes passaram.
- Mutação da guarda de slug vazio (`servico.ts:49`, remove a condição de slug vazio): o teste novo "nome cujo slug é vazio..." cai (1 falha, 5 passam); arquivo restaurado por `git checkout`, árvore limpa. Vermelho provado.
- Veredito mantido: aprovado, 0 bugs. A suíte inteira fica com o check-run `bateria` do mesmo sha.

## Achados
