---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: chore/consultas-leitura-098-099
commit: 7bf135762d25c6d7e95089128e9f69c20ca1b8cd
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: comando único das consultas só de leitura dos pedidos 098 e 099 (K-275, E3.4), revalidação da volta 3

Classe N pelo gatilho do `package.json`. Revalidação incremental de `dcfa78f3..7bf13576` (só o script e o teste), no mesmo head do review (dcb7d5a9) e da segurança (c27687f2). Nada rodou contra base real e nenhum `.env*` foi aberto: o teste usa bancos falsos e `.env` de brinquedo; as mutações rodaram em cópia em `$TMPDIR`, e a worktree ficou limpa.

## Achados

## Critério → teste → resultado
Obrigações: os achados A1 a A3 do parecer anterior e as recusas novas da volta 3.

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1 (`.env` malformado não imprime nada, rc 1, categoria env, banco não chamado) | `.test.sh` ".env com linha ruim: nenhuma palavra dele na tela" e ".env com erro de sintaxe: rc 1, categoria env, nada impresso e banco nao chamado" | linha ruim e aspas abertas no `.env` | corrigido |
| A2 (guarda da barra invertida isolado) | caso "A2 gexec sem INTO" | `\gexec` sem palavra da lista | corrigido (teste presente; mutação própria não repetida) |
| A3 (limite de um único ponto e vírgula) | caso "A3 SELECT 1; SELECT 2;" | dois SELECT | corrigido (mutante `-le 9` morre) |
| Recusa de `set_config`, `pg_read_file`, `pg_read_binary_file`, `lo_import`, `dblink` | cinco casos `sonda` (recusada, rc 1, banco não chamado) | função de sessão ou de arquivo do servidor | passou |
| Sondas anteriores S1 a S7 e demais 43 casos | mesmo arquivo de teste | n/a | passou, sem regressão |

## Cenários e resultado real
- `bash scripts/consultas-leitura-098-099.test.sh` em 7bf13576: "todos os casos passaram", rc 0. `shellcheck` no script e no teste: sem saída, rc 0.
- Suíte inteira: só no CI do PR; não há PR desta branch (prova de `bateria` fica para o PR do tech-lead, E3.3).
- Vermelho antes do verde: os casos novos são de arquivo já mostrado como novo na base; a prova está nas mutações abaixo (cada uma cai no caso novo correspondente).

## Mutação no código alterado
Cópias em `$TMPDIR`, teste inteiro do script em cada uma. A falha "gitignore cobre ..." aparece em todas as cópias porque a cópia não leva o `.gitignore`; não vem da mutação e não existe na worktree.

| Mutante | Resultado |
|---|---|
| tirar o `2>/dev/null` do `source` do `.env` (a mutação do A1) | morto: "FALHOU - .env com linha ruim: nenhuma palavra dele na tela" |
| tirar `lo_import` da lista | morto: "FALHOU - lo_import: recusada, rc 1 e banco nao chamado" |
| tirar `set_config` da lista | morto: "FALHOU - set_config: recusada, rc 1 e banco nao chamado" |
| tirar `pg_read_file` da lista | morto: "FALHOU - pg_read_file: recusada, rc 1 e banco nao chamado" |
| `-le 1` para `-le 9` nos pontos e vírgula | morto: "FALHOU - A3 SELECT 1; SELECT 2; (limite de um ponto e virgula)" |

Todos restaurados na cópia; a worktree nunca foi tocada.

## Bugs
Nenhum bug aberto. O A1 (baixo) do parecer anterior está corrigido.

## Veredito
**Aprovado** em 7bf135762d25c6d7e95089128e9f69c20ca1b8cd: A1, A2 e A3 do parecer anterior resolvidos, sondas anteriores ainda verdes, `shellcheck` limpo, cinco mutantes mortos pelos testes novos.
