---
tipo: revisao-seguranca
contrato: 1
pedido: fix-forge0442-001
branch: fix/forge0442-001
commit: bdb6669e3c7176d78d5a31452df49f5b00e651e2
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-14
---
# Review de segurança: falhas preexistentes do pronto (fix-forge0442-001)

Propósito: atender o gatilho de dependência (manifesto `package.json` alterado) e revisar a variável `METRICAS_DSPD_SUITE_DIR` e o teste 4 da trava. Público: tech-lead, devops-engineer, qa-engineer. Veredito: **aprovado**, sem achado bloqueante. Revalidado em 2026-11-14 sobre `bdb6669e` (merge da develop; `3506ffdb` e `3ab93fda` só tocam `docs/`), por delta desde `e81545f7`.

## Escopo e método
- 1ª passada (2026-11-10, `e81545f7`): `git diff origin/develop...fix/forge0442-001 --name-only`: `package.json`, `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`, `server/tests/spike-erro-permissao.test.ts` e documentos. Só leitura estática.
- Revalidação (2026-11-14): `forge-check parecer delta docs/security/fix-forge0442-001.md` (intervalo `e81545f7..3ab93fda`, no domínio: `package.json` e `scripts/suite-unica.test.sh`) e `git diff 62823ca0 3ab93fda -- package.json scripts/` (o que a branch ainda traz sobre a develop). Rodado localmente `bash scripts/suite-unica.test.sh` (rc=0, 8 de 8 ok; diretório temporário removido no fim). A suíte inteira fica com o CI e o PQ do QA (E1.23).

## Gatilhos
Dependência: travas ou manifesto (`package.json`).

## Conferências
1. **Manifesto sem mudança de cadeia de suprimentos.** Sobre a develop, a única linha própria da branch em `package.json:12` é o prefixo do `lint` da raiz: `node --max-old-space-size=4096 node_modules/eslint/bin/eslint.js .`; o sufixo `&& pnpm --filter @metricas-dspd/server run lint` e as linhas de `test:trava`, `demo:dado-real` e `consultas:098-099` vieram da develop pelo merge (já revisadas lá). Nenhuma dependência nova, nenhuma versão alterada, nenhum script de instalação (`preinstall`, `install`, `postinstall`, `prepare`), `pnpm-lock.yaml` intacto.
2. **Heap sem execução nem leitura de ambiente.** O heap é um argumento literal da linha de comando do `node` (`--max-old-space-size=4096`), não `NODE_OPTIONS`: nada em `package.json`, `scripts/` ou `.githooks/` define ou lê `NODE_OPTIONS`. Não há interpolação de variável, `--require`/`--import`/`--eval` nem caminho vindo de fora; o binário é o `eslint` já instalado, por caminho fixo no `node_modules` da raiz. Um `NODE_OPTIONS` herdado do ambiente do usuário continua valendo como sempre (mesmo privilégio de quem roda o script, sem fronteira cruzada).
3. **`METRICAS_DSPD_SUITE_DIR` não abre caminho novo.** `scripts/suite-unica.sh:24` troca só o diretório da trava (padrão `/tmp/claude-<uid>` mantido). Quem define a variável já controla o próprio processo; não vem de rede nem de arquivo do repositório. Defesas existentes: recusa de link simbólico no diretório (linha 25) e no arquivo da trava, `mkdir -p -m 700` (linha 26), valor sempre entre aspas, sem `eval`. O script não apaga nada no diretório da trava.
4. **Teste 4 com trava própria não escapa nem apaga fora do que criou.** `scripts/suite-unica.test.sh:10-11`: `TMP="$(mktemp -d)"` e `trap 'rm -rf "$TMP"' EXIT`, a única remoção do arquivo, com o caminho entre aspas e vindo do `mktemp`. O teste 4 (linhas 59-68) usa `DIR_PROPRIO="$TMP/claude-trava"`, dentro de `$TMP`, passado só por `env` aos filhos; não toca `/tmp/claude-<uid>/metricas-dspd-suite.lock` (a trava real) e confere por `grep` (linha 57) que o literal do padrão continua no script. Execução local: o diretório criou-se sob o `TMPDIR` do sandbox e não sobrou nenhum `tmp.*` depois.
5. **Teste do server** (`server/tests/spike-erro-permissao.test.ts`, 1ª passada): arquivo de teste, sem código de produção, segredo ou rede.

## Achados
- A1 (recomendado) scripts/suite-unica.sh:25 · Diretório já existente não tem dono nem modo conferidos (limitação preexistente: o `-m 700` só vale na criação); sem caminho de ataque realista em estação de um usuário, só registro.
- A2 (recomendado) scripts/suite-unica.test.sh:8 · `DENTRO_DE_SUITE` ficou sem uso depois do merge (o teste 4 não consulta mais a trava padrão); sem efeito de segurança, é limpeza de estilo para o tech-lead.

## Riscos aceitos
Nenhum.
