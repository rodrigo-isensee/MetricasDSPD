---
tipo: revisao-seguranca
contrato: 1
pedido: 083-pre-push-lint-alterados
branch: feature/083-pre-push-lint
commit: e19c23b3674a660cad88150b218c7897a6d77d5a
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-09
---
# Review de segurança: 083-pre-push-lint-alterados

## Parecer
Aprovado. O pre-push passa a rodar o linter só nos `.ts`/`.tsx` alterados contra `origin/develop`, com cache, e pula quando não há nenhum. É controle local de conveniência: a CI segue com o lint inteiro e barra o merge. Sem segredo, sem rede, sem escrita fora do repositório. Dois achados recomendados, nenhum bloqueante. Revisão estática do diff `54f02c42...e19c23b3`; rodei só a leitura, sem a suíte (D-5).

## Gatilhos
Controle do Forge/guarda local (hook de pre-push) e script de shell que recebe nomes de arquivo do git. Sem dado pessoal, credencial nem rede.

## Achados
- A1 (recomendado) scripts/lint-alterados.sh:25 · nome de arquivo começando com `-` seria lido como opção pelo linter; passar `--` antes da lista fecha a porta. Falha fechada (erro, push barrado), sem execução.
- A2 (recomendado) scripts/lint-alterados.sh:17 · sem `-z`, caminho que o git escapa (aspas, não ASCII) chega ao linter como arquivo inexistente e o pre-push falha em vez de checar; falha fechada, irreal em `.ts`/`.tsx` do projeto.

## Sondas

## Detalhe dos achados
**Cobertura pela CI (o que o controle deixa de pegar).** Localmente deixam de ser checados: arquivos não alterados que o linter pegaria por mudança de configuração ou de regra, e `.ts`/`.tsx` fora do diff contra `origin/develop`. A CI roda o lint inteiro em `.github/workflows/ci.yml:34` e em `.github/workflows/homolog.yml:75`, sem alteração neste diff. Não há degrau local que a CI não repita, então nada passa à `develop` sem o lint inteiro. Residual: o dev descobre mais tarde, na CI, um erro cruzado. Aceitável e é a decisão do dono (opção A).

**A1.** Evidência `scripts/lint-alterados.sh:25`, `exec ... --no-warn-ignored "${arquivos[@]}"`. A lista vem de `git diff --name-only` (linha 17), caminhos relativos à raiz; um arquivo `-x.ts` na raiz virá como opção. Quem controla o nome é o próprio autor do commit, que já executa o hook na própria máquina: não há ganho de privilégio. Severidade informativa/baixa. Correção mínima: inserir `--` antes de `"${arquivos[@]}"`. Esforço P. Dono: devops-engineer.

**A2.** Já levantado pelo tech-lead. A leitura em loop por linha (`while read`) com `git diff` sem `-z` quebra com caminho entre aspas (o git o devolve escapado). Efeito: erro do linter, hook falha; com árvore suja o hook só avisa (comportamento anterior, `.githooks/pre-push:13-17`). Nunca vira execução de comando: o array é expandido entre aspas e passa por `exec` sem `eval` nem shell intermediário. Correção mínima: `git diff -z` com `read -r -d ''`. Esforço P. Dono: devops-engineer.

**Injeção por nome de arquivo.** Não há `eval`, `sh -c` nem concatenação de string: os nomes entram num array e são expandidos entre aspas. Espaço, `$`, crase, `;` e `*` no nome não são interpretados pelo shell. O filtro por pathspec `'*.ts' '*.tsx'` e `--diff-filter=d` evitam arquivo removido. `set -uo pipefail` e `cd` para a raiz do script estão corretos.

**Cache.** `node_modules/.cache/eslint` está ignorado pelo git (`git check-ignore` confirma), dentro do repositório, só guarda o resultado de lint (hash e mensagens) e é invalidado pelo linter quando a configuração muda. Sem segredo nem dado pessoal. Envenenamento exigiria escrita local na máquina do próprio dev.

**Fallback sem `origin/develop`.** Linhas 9-13: sem a ref, roda o lint inteiro (mais conservador, não menos). Direção segura. Observação: a base é a ref local `origin/develop`, que pode estar defasada se não houve `fetch`; isso reduz ou aumenta o conjunto checado, nunca contorna a CI.

**Rede, segredos e escrita.** O script só chama `git rev-parse`, `git diff`, o linter e o gerenciador de pacotes locais; nenhuma chamada de rede, nenhuma leitura de `.env`, nenhuma escrita além do cache no repositório. O teste (`scripts/lint-alterados.test.sh`) usa repositório descartável, conforme o parecer de devops.

## Riscos aceitos e ferramentas
Sem riscos aceitos formais. Lacuna: não rodei `shellcheck` (não consta como instalado/necessário para esta revisão); a leitura manual cobre o script de 25 linhas. Nenhuma ferramenta instalada por mim.
