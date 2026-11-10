---
tipo: revisao-seguranca
contrato: 1
pedido: fix-forge0442-001
branch: fix/forge0442-001
commit: e81545f7190e4241a909f711a51a0c3e4603b139
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança: falhas preexistentes do pronto (fix-forge0442-001)

Propósito: atender o gatilho de dependência (manifesto `package.json` alterado) e revisar a nova variável `METRICAS_DSPD_SUITE_DIR`. Público: tech-lead, devops-engineer. Veredito: **aprovado**, sem achado bloqueante.

## Escopo e método
- `git diff origin/develop...fix/forge0442-001 --name-only`: `package.json`, `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`, `server/tests/spike-erro-permissao.test.ts` e documentos (CLAUDE.md, docs/qa, docs/reviews, cartão). Só leitura estática.

## Gatilhos
Dependência: travas ou manifesto (`package.json`).

## Conferências
1. **Manifesto sem mudança de cadeia de suprimentos.** `package.json:12` é a única linha tocada: `lint` passou de `eslint .` para `node --max-old-space-size=4096 node_modules/eslint/bin/eslint.js .`. Nenhuma dependência nova, nenhuma versão alterada, nenhum script de instalação (`preinstall`, `install`, `postinstall`, `prepare`) e nenhum lockfile no diff (`pnpm-lock.yaml` intacto). O binário é o mesmo `eslint` já instalado, com caminho fixo no `node_modules` da raiz; a flag só eleva o limite de memória do V8.
2. **`METRICAS_DSPD_SUITE_DIR` não abre caminho novo.** `scripts/suite-unica.sh:24` troca só o diretório da trava (padrão `/tmp/claude-<uid>` mantido). Quem define a variável já controla o ambiente do próprio processo, com os mesmos privilégios do script; não há fronteira de confiança cruzada (não vem de rede nem de arquivo do repositório). O caminho segue pelas defesas existentes: recusa de link simbólico no diretório (linha 25) e no arquivo da trava (linha 31), `mkdir -p -m 700` (linha 26), valor sempre entre aspas, sem `eval`. O pior caso é a trava apontar para outro diretório do próprio usuário, o que afeta só a exclusão mútua da suíte local, sem escalada.
3. **Teste com diretório temporário.** `scripts/suite-unica.test.sh` usa `$TMP/claude-trava` e confere por `grep` que o literal do padrão continua no script; não enfraquece a trava real.
4. **Teste do server** (`server/tests/spike-erro-permissao.test.ts`): arquivo de teste, sem código de produção, segredo ou rede.

## Achados
- A1 (recomendado) scripts/suite-unica.sh:25 · Diretório já existente não tem dono nem modo conferidos (limitação preexistente: o `-m 700` só vale na criação); sem caminho de ataque realista em estação de um usuário, só registro.

## Riscos aceitos
Nenhum.
