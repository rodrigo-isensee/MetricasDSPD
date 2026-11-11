---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: chore/consultas-leitura-098-099
commit: dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-11
---
# QA: comando único das consultas só de leitura dos pedidos 098 e 099 (K-275, E3.4)

Classe N pelo gatilho do `package.json` (script novo `consultas:098-099` e teste no `test:trava`). Passada única sobre `c7c3e092..dcfa78f3`, no mesmo head do review (2b5590e7) e da segurança (83bf09d6). Nada rodou contra base real e nenhum `.env*` foi aberto: tudo com bancos falsos (`docker` e `mysql` falsos no PATH) e `.env` de brinquedo em pasta descartável. Parecer escrito sem alterar código nem teste; as mutações rodaram em cópia em `$TMPDIR`, e a worktree ficou limpa.

## Achados
- A1 (recomendado) scripts/consultas-leitura-098-099.sh:61 · um .env malformado faz o bash imprimir a primeira palavra da linha ("<palavra>: command not found"): o .env deixa de ser nunca impresso. Provado com linha "SEGREDO LINHA ruim". Silenciar o stderr do source e dar falhar categoria env.
- A2 (recomendado) scripts/consultas-leitura-098-099.test.sh:145 · o caso S4 só é recusado pela palavra INTO; o guarda de barra invertida (sh:93) pode sair e o teste passa (mutante M4). Acrescentar o caso SELECT 'DEL'||'ETE FROM t' \gexec, que só a barra pega.
- A3 (recomendado) scripts/consultas-leitura-098-099.test.sh:150 · nenhum caso prova o limite de um único ponto e vírgula entre dois SELECT (mutante M3 de "-le 1" para "-le 9" sobrevive). Acrescentar a sonda SELECT 1; SELECT 2; com recusa, rc 1 e banco não chamado.

## Critério → teste → resultado
O brief não traz `CA-n`: a obrigação são os pontos de "Entregar" do brief, o parecer de segurança (A1 a A4) e o review (A1 a A3). Cada um com o teste que o guarda.

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Recusa de SQL fora da lista do permitido, sondas S1 a S7 | `.test.sh` casos S1 a S7, "SELECT seguido de SET", "SELECT INTO OUTFILE", ".sql com DELETE" (banco não chamado, rc 1) | primeiro token, um `;`, barra invertida, palavras fora da lista | passou (ver A2 e A3 sobre o isolamento) |
| Os 31 `.sql` legítimos passam na lista | caminho feliz "31 consultas, todas ok" e "os 31 .sql ... cumprem a lista" | corpus legítimo (guarda: afirma 31) | passou |
| Guarda de colunas: nada de pessoa no arquivo | cabeçalho diferente, valor com texto, e-mail em domínio, coluna `solicitante` declarada, "valor recusado nunca chega ao arquivo" | cabeçalho exato, tipo do valor, `@`, lista de pessoa | passou |
| "0 linhas" no MySQL vazio; PostgreSQL vazio continua recusado | "MySQL sem linha", "PostgreSQL sem saida" e minha sonda (11 consultas, 11 ok, 11 "0 linhas") | saída vazia | passou |
| Saída fora do repositório, também por link | "dentro do repositorio", "link para dentro do repositorio", `.gitignore`; minhas sondas por `INIT_CWD` e por link | caminho físico (`pwd -P`) | passou |
| `.env` nunca impresso, senha fora do argv | "variavel ausente: nenhum valor", "senha so por ambiente", "senha so no arquivo 0600", "nenhuma senha na tela nem no arquivo" | argv, tela, arquivo de saída | passou; exceção no A1 (linha malformada) |
| rc certo em cada caso | .env ausente 1, variável ausente 1, argumento inválido 2, recusa 1, falha de driver 1 (código 7, sem texto), impressão do certificado 1 com MySQL não chamado, nenhum `.sql` 1 (minha sonda), tudo ok 0 | rc | passou |
| TLS fixado e leitura só | "ssl-fp", "--defaults-file e --sandbox", "verificacao nunca desligada", "BEGIN READ ONLY ... ROLLBACK", "READ ONLY, teto e ROLLBACK" | certificado, sessão só leitura | passou |
| Documentação de como rodar | leitura de `docs/engineering/demo-dado-real.md` (três formas de rodar, onde cai a saída, o que a guarda não pega) | n/a | passou |

## Cenários e resultado real
- `bash scripts/consultas-leitura-098-099.test.sh`: 43 casos `ok`, "todos os casos passaram", rc 0. `shellcheck` no script e no teste: sem saída, rc 0.
- Suíte inteira: roda só no CI do PR; não há PR desta branch, e a consulta aos check-runs do sha dcfa78f3 não devolveu nada. Prova de `bateria` fica para o PR do tech-lead (E3.3).
- Vermelho antes do verde: script e teste são arquivos novos, ausentes na base c7c3e092; sem eles não há o que rodar (vermelho trivial). A prova de que o teste falha sem a implementação está nas mutações abaixo. `forge-testes --vermelho` é do repositório Forge e não se aplica aqui.
- Sondas minhas, com bancos falsos e `.env` de brinquedo (sem `.env*` real):
  - MySQL vazio: 11 consultas, 11 ok, 11 "0 linhas", rc 0.
  - Chamado por link simbólico para o repositório: arquivo na pasta pessoal e aviso; nada no repositório. Com `INIT_CWD` apontando o repositório: o mesmo.
  - `.env` malformado: stderr traz "SEGREDO: command not found" (A1; nenhum valor de variável, só a primeira palavra da linha).
  - `--` repassado pelo pnpm aceito; pasta sem `.sql`: rc 1 com categoria `nenhuma`.
  - Nenhuma das duas senhas aparece na tela, no arquivo de saída nem em argv.
  - `validar_sql` isolado: `sElEcT 1; DeLeTe`, `/*!50000 DROP*/`, `WITH d AS (DELETE ...)`, `SELECT ... FOR UPDATE`, `;` em linha própria, só comentário e texto vazio: todos recusados; `SELECT 1;`, `WITH ... SELECT` sem `;` e colunas `start_date` e `reset_n`: aceitos. `SELECT 'DEL'||'ETE FROM t' \gexec` e `SELECT 1; SELECT 2;`: recusados pelo código (rc 3), só não há teste que os isole (A2, A3).
  - Observação sem achado: `SELECT set_config('x','y',false);` e `pg_read_file(...)` passam na lista (não estão nela). O PostgreSQL recusa mudar `transaction_read_only` depois de uma consulta na transação, e a segurança leu os 31 `.sql` e aceitou; fica a lembrança de incluir `set_config` na lista se o comando virar rotina. Não verifiquei contra PostgreSQL real.

## Mutação no código alterado
Cópias em `$TMPDIR` (a worktree nunca foi tocada; `git status` limpo). Cada uma rodou o teste inteiro do script.

| Mutante | Resultado |
|---|---|
| Aceitar `SET` na lista do permitido (tirar `set` das palavras e aceitar `set` como primeiro token) | morto: "FALHOU - S3 SET TRANSACTION READ WRITE", 1 caso falhou (a mutação pedida no brief) |
| tirar `into` e `outfile` das palavras | morto: "SELECT INTO OUTFILE" |
| tirar `ssl-fp` do arquivo de opções | morto: "mysql: ssl-fp com a impressao fixada" |
| tirar `--sandbox` do `mysql` | morto: "--defaults-file e --sandbox no argv" |
| `pwd -P` virar `pwd` em `ORIGEM` | morto: "link para dentro do repositorio" |
| tratar MySQL vazio como recusa | morto: "MySQL sem linha" |
| `BEGIN READ ONLY` virar `BEGIN` | morto: "stdin PostgreSQL" |
| tirar o teste de `@` do tipo domínio | morto: "dominio com @ (e-mail)" |
| tirar só `set` das palavras | sobreviveu isolado (o primeiro token já recusa `SET`; defesa em camadas, equivalente na prática) |
| aceitar `set` só como primeiro token | sobreviveu isolado (a palavra `set` recusa; o mesmo motivo) |
| `-le 1` para `-le 9` nos pontos e vírgula | **sobreviveu**: A3 |
| tirar o guarda de barra invertida | **sobreviveu**: A2 |
| tirar `titulo` da lista de pessoa da saída | sobreviveu: o cabeçalho exato já recusa; redundante, sem achado |

Os dois sobreviventes que importam (barra invertida e ponto e vírgula) estão cobertos pelo código hoje, provado nas sondas; só falta o teste que os isole. Por isso A2 e A3 ficam `recomendado`: o comportamento é correto, e a lacuna só vale se alguém mexer nesses guardas. Promover a bloqueante exige `critério mudou:` do tech-lead.

## Bugs
| ID | Severidade | Resumo | Responsável |
|---|---|---|---|
| (A1) | baixa | `.env` malformado imprime a primeira palavra da linha no stderr | devops-engineer |

Sem bug crítico, alto ou médio. Não criei arquivo em `docs/qa/bugs/` porque o brief limita a entrega a este parecer; o cartão do bug baixo fica para o Jarvis (`R-QA`).

## Veredito
**Aprovado** em dcfa78f307c13cbb8c95a8c2ef3c2aebafad8139: 43 casos verdes, `shellcheck` limpo, a mutação pedida morre, recusa de escrita, guarda de colunas, "0 linhas", saída fora do repositório (com link) e rc conferidos com bancos falsos. Um bug baixo e duas lacunas de teste como recomendações.
