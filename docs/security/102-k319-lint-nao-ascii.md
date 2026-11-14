---
tipo: revisao-seguranca
contrato: 1
pedido: 102-forge-0460
branch: fix/k319-lint-nao-ascii
commit: c316e6900edbf93765f49c4b594493613813d2d9
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-13
---
# Review de segurança: K-319, lint e typecheck dos alterados com nome não ASCII e branch órfã (E1.18)

## Parecer
Aprovado, sem achado bloqueante. Li o diff `acf421e8...c316e690`: 4 arquivos, `scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh` e os testes deles. O head `32e40a7a` só acrescenta os pareceres de devops e de review em `docs/`, e o código é o mesmo do `c316e690`. Os dois scripts formam um controle local de conveniência do pre-push (`.githooks/pre-push:13`). A CI roda o lint e o typecheck inteiros, e é ela que barra o merge. A mudança, `git -c core.quotePath=false`, só tira a citação octal de bytes acima de 0x7F. Nada passa a ser interpretado pelo shell. Ficam três recomendados: dois já existiam e foram herdados do parecer 083 (A1 e A2 de `docs/security/083-pre-push-lint-alterados.md`, ainda sem correção) e o terceiro é dos testes. Nenhum deles tem um caminho de ataque com ganho para quem controla o nome do arquivo.

## Gatilhos
Controle de qualidade do envio (pre-push), classe C. São scripts de shell que recebem nomes de arquivo do git e os repassam ao eslint e ao pnpm. Não há dado pessoal, credencial nem rede.

## Achados
- A1 (recomendado) scripts/lint-alterados.sh:42 · um .ts na raiz com nome iniciado por `-` chega ao eslint como opção (S1). Exemplos: `--ignore-pattern=*.ts`, `--config=x.ts`. Pode silenciar o lint local, mas não executa nada além do que o próprio repositório já roda. Correção: `--` antes da lista, aqui e na linha 46.
- A2 (recomendado) scripts/typecheck-alterados.sh:42 · sem `-z`, o git ainda cita entre aspas o nome com quebra de linha, `"` ou `\`. Em server/ o nome citado cai em `*/*` e o typecheck local é pulado com rc=0 (S2, S3, falso verde local). Correção: `-z` com `read -r -d ''`, também em lint-alterados.sh:30.
- A3 (recomendado) scripts/lint-alterados.test.sh:27 · os testes não desarmam GIT_DIR, GIT_INDEX_FILE e GIT_WORK_TREE. Quando o ambiente exporta GIT_DIR, o repositório descartável grava commits, branches e refs/remotes/origin/develop no repositório externo (S4). Correção: `unset` igual ao de pre-push.test.sh:24, também em typecheck-alterados.test.sh:17.

## Sondas
- S1 · repositório descartável com pnpm falso que registra os argumentos; arquivo `--ignore-pattern=*.ts` na raiz e commitado; `bash scripts/lint-alterados.sh` · espera: o nome chega ao eslint como caminho · obtido: `ARG[--ignore-pattern=*.ts]` na posição de opção, antes dos demais caminhos
- S2 · arquivo `server/src/a<LF>b.ts` (com quebra de linha) commitado; `bash scripts/typecheck-alterados.sh` · espera: typecheck do server · obtido: "typecheck pulado", rc=0, nenhuma chamada ao pnpm
- S3 · arquivos `server/src/a"b.ts` e `server/src/c\d.ts` commitados; `bash scripts/typecheck-alterados.sh` · espera: typecheck do server · obtido: "typecheck pulado", rc=0
- S4 · repositório externo falso com 1 commit e `GIT_DIR=<externo>/.git` exportado; `bash scripts/lint-alterados.test.sh` · espera: o externo intacto · obtido: o externo passa de 1 a 11 commits, com as branches feature/x, feature/z, feature/orfa e a ref refs/remotes/origin/develop
- S5 · branch órfã (`git switch --orphan`, sem merge-base com origin/develop) nos dois scripts · espera: fallback inteiro · obtido: `pnpm run lint` e `pnpm run typecheck`, com o aviso "sem merge-base" (o rc do pnpm real chega pelo `exec`)
- S6 · nome com `$(touch PWNED);` seguido de crase, `|` e `"q"`, em `web/src/`; `bash scripts/lint-alterados.sh` · espera: nenhuma execução · obtido: nenhum arquivo PWNED criado e o nome chega como um único argumento

## Detalhe dos achados
**Injeção de comando: não há.** Os nomes vão para arrays (`raiz`, `servidor`) e são expandidos entre aspas em `scripts/lint-alterados.sh:42` e `:46`. Não há `eval`, `sh -c` nem concatenação de string. O typecheck usa o nome só no `case` (`scripts/typecheck-alterados.sh:29-38`) e nunca o repassa como argumento. Espaço, aspas, `$`, crase, `;` e `|` não são interpretados (S6). O `core.quotePath=false` não muda isso. Ele só deixa de citar bytes acima de 0x7F. Bytes de controle, `"` e `\` continuam citados pelo git, e o A2 trata desse resto.

**A1, injeção de argumento.** Evidência: `scripts/lint-alterados.sh:42` e `:46`. Só um arquivo na raiz pode começar com `-`, porque em subpasta o caminho começa pelo nome da pasta. No server o caminho vem sem o prefixo `server/` (`${f#server/}`), então ali vale `server/--x.ts`. Com o eslint 9.39.5 real conferi três coisas. Primeiro, `--ignore-pattern=*.ts` antes de um caminho em subpasta não o ignora, porque o padrão vale só na raiz. Segundo, o eslint aceita `--` e trata o resto como caminho. Terceiro, `pnpm exec eslint ... -- <arquivo>` repassa o `--` ao eslint (rc=1 com erro plantado e rc=2 com arquivo inexistente). O caminho de ataque fica restrito: quem nomeia o arquivo é o autor do commit, ou quem empurra a branch dele. O `eslint.config.js` dessa mesma branch já executa código na máquina, então não há ganho de privilégio. O pior efeito é um verde local que a CI desfaz (lint inteiro em `.github/workflows/ci.yml:34` e `.github/workflows/homolog.yml:75`). Severidade baixa. Correção mínima: `--` antes de `"${raiz[@]}"` (`:42`) e antes de `"${servidor[@]}"` (`:46`). Esforço P. Dono: devops-engineer.

**A2, nome citado no typecheck.** Evidência: `scripts/typecheck-alterados.sh:42-43`, sem `-z`. O nome citado começa com `"` e por isso nunca casa com `server/*`, `web/*` etc. Ele cai em `*/*` (`:37`), que é ignorado, e o typecheck daquele pacote é pulado (S2, S3). No lint o mesmo nome vai ao eslint da raiz como arquivo inexistente e falha fechado (rc=2, push barrado), sem falso verde. Sem caminho de ataque com ganho: o efeito é só local, e o typecheck inteiro da CI pega o arquivo. É a mesma família que o K-319 corrigiu para não ASCII, e a correção completa é a do 083 (A2). Correção mínima: `git -c core.quotePath=false diff -z --name-only ...` e `ls-files -z ...`, somados com `printf '\0'` entre as duas saídas, `sort -zu` e `while IFS= read -r -d '' f`. Nos dois scripts: `scripts/lint-alterados.sh:30-31` e `scripts/typecheck-alterados.sh:42-43`. Esforço P. Dono: devops-engineer.

**A3, repositórios descartáveis dos testes.** Mudar o diretório para `$RAIZ/node_modules/.cache/<nome>.XXXXXX` é seguro por si. O `mktemp -d` cria um nome único, o `trap 'rm -rf "$TMP"' EXIT` só apaga o que o `mktemp` devolveu, `node_modules/` é ignorado pelo git (`.gitignore:1`, conferido com `git check-ignore`) e o repositório aninhado tem `.git` próprio, que a descoberta do git acha primeiro. Rodei os dois testes: todos os casos `ok`, rc=0, e nenhum diretório `*-alterados-test.*` sobrou em `node_modules/.cache`. A fuga acontece quando o ambiente exporta GIT_DIR (ou GIT_INDEX_FILE). Nesse caso o git ignora o diretório corrente e o teste age no repositório indicado (S4). Isso já acontecia com o `mktemp -d` em `/tmp` e não foi introduzido pelo K-319. O gatilho também não existe na fiação atual: o `test:trava` (`package.json:15`) roda pela CI e pelo `pnpm`, não de dentro de um hook do git. O irmão `scripts/pre-push.test.sh:24` já se protege com `unset GIT_DIR GIT_INDEX_FILE GIT_WORK_TREE`. Correção mínima: a mesma linha depois do `export` em `scripts/lint-alterados.test.sh:27` e em `scripts/typecheck-alterados.test.sh:17`. Opcionalmente, `git init ... || exit 1` em `scripts/lint-alterados.test.sh:36` e `scripts/typecheck-alterados.test.sh:26`. Esforço P. Dono: devops-engineer.

**Guarda sem merge-base: sem falso verde.** Em `scripts/lint-alterados.sh:16-18` e `scripts/typecheck-alterados.sh:14-16`, quando o `git merge-base` falha, o script cai em `exec pnpm run lint|typecheck`, o caminho mais conservador. Com o `exec`, o rc do lint ou typecheck inteiro vira o rc do script. Não existe ramo em que `mb` vazio siga para o `git diff`, porque a atribuição só acontece quando o comando dá certo. Os testes novos (3g e 8d) provam o fallback e o aviso, e a S5 confirma isso em repositório separado.

**Rede, segredos e escrita.** Não há rede, leitura de `.env` nem segredo. Fora do repositório descartável, a única escrita é o cache do eslint em `node_modules/.cache/eslint`, já avaliado no parecer 083.

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum. Os três achados são recomendados e não dependem de aceite.

Suíte: a suíte inteira fica com o CI. Nos check-runs do head `32e40a7a` (código igual ao `c316e690`), `build`, `openapi`, `seguranca`, `imagem`, `filtro`, `rapida` e `banco` estavam verdes e `e2e` e `perf` pulados pelo filtro. O `testes` ainda estava em andamento na hora da leitura, e o merge depende dele verde (`R-REVIEW`). Localmente rodei só os testes da entrega, `bash scripts/lint-alterados.test.sh` e `bash scripts/typecheck-alterados.test.sh`, com rc=0, além das sondas S1 a S6 em repositório descartável dentro de `node_modules/.cache`, já removido.

Ferramentas: o `shellcheck` rodou nos 4 arquivos. Só deu SC2319 em `verifica ... $?` depois de `[ ]` ou `!` (`scripts/lint-alterados.test.sh:56`, `:88`, `:95` e `scripts/typecheck-alterados.test.sh:51`). É estilo, de linhas fora deste diff, e fica com o tech-lead. `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH (lacuna registrada). O diff não traz dependência nova. Nenhuma ferramenta foi instalada.
