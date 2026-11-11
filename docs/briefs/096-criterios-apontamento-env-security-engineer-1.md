Agente destino: forge:security-engineer
Pedido: 096-criterios-apontamento-env
Tipo: codigo
Branch: fix/k270-criterios-env   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.6

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

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 096-criterios-apontamento-env até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/096-criterios-apontamento-env.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 095; o PR continua do tech-lead (E1.4)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k270-criterios-env:docs/security/096-criterios-apontamento-env.md` · espera: contém 'branch: fix/k270-criterios-env'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
