# K317-001 - lint-alterados.sh erra com nome de arquivo não ASCII
- Severidade: baixa
- Responsável sugerido: devops-engineer (scripts de pre-push)
- Ambiente: branch fix/k317-k309-prepush, commit 23a8d56e, bash, git com a opção de citação de caminhos no padrão

## Passos para reproduzir
1. Num repositório com `origin/develop`, crie `server/src/ação x.ts` e `velho x.ts` (alterados contra a base).
2. Rode `bash scripts/lint-alterados.sh`.

## Resultado esperado
`server/src/ação x.ts` vai ao eslint do pacote server (caminho relativo `src/ação x.ts`) e o outro, ao da raiz.

## Resultado obtido
O git imprime o nome entre aspas com octais (`"server/src/a\303\247\303\243o x.ts"`), o `case server/*` não casa e o eslint recebe o nome literal com aspas: "No files matching the pattern", rc=1. Falso vermelho (recusa o envio), nunca falso verde. Contorno: renomear o arquivo.

## Evidência
Sonda em repositório descartável (node_modules/.cache/qa, removido depois). O repositório hoje não tem nenhum `.ts`/`.tsx` com nome não ASCII (`git ls-files`), então é latente. Já existia antes do K-317 (o script anterior lia os nomes do mesmo jeito). Correção: `git -c core.quotepath=false` (ou `-z`) nas chamadas de `git diff` e `git ls-files`, em `lint-alterados.sh` e em `typecheck-alterados.sh`.
