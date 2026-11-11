## Objetivo
Parecer de segurança do K-270 (gatilho: `server/package.json` e leitura do `.env`): branch `fix/k270-criterios-env`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, código em 3316cce9582e2c8aeda9180c60fc453aa123f4b0, base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff eac38a64b0b580d7c920f4b2b501287f7fb56599 3316cce9582e2c8aeda9180c60fc453aa123f4b0`.
- `/home/rodrigoisensee/MetricasDSPD-052g/server/src/entradas/ref-sync-apontamento.ts`, linhas 1 a 30 (o carregador que serve de modelo).

## Entregar
- "E1.6 (security-engineer): parecer de segurança (gatilho: server/package.json e leitura do .env)." (E1.6)
- (E1) (E1.6) Conferir que o script novo só aponta para o arquivo de entrada (nenhuma dependência nova), que o `.env` é lido só da raiz do repositório e nada dele é impresso (nem na falha), que a mensagem de erro não vaza a URL nem a senha, e que o teste usa só segredo falso em pasta temporária, sem base real. Parecer `docs/security/096-criterios-apontamento-env.md` (novo) pela ferramenta Write, com `pedido: 096-criterios-apontamento-env`, `branch: fix/k270-criterios-env`, `commit: 3316cce9582e2c8aeda9180c60fc453aa123f4b0` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-270` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k270-criterios-env` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E1.6) Nada no `CHANGELOG.md` além de conferir que o roteiro não traz credencial.
- arquivos: docs/security/096-criterios-apontamento-env.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k270-criterios-env:docs/security/096-criterios-apontamento-env.md` · espera: contém 'branch: fix/k270-criterios-env'
