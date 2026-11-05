Agente destino: forge:node-backend
Pedido: 062-corrige-fast-uri
Tipo: codigo
Branch: feature/062-fast-uri   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E1.1

## Objetivo
Corrigir os alertas #18 a #25 do Dependabot (fast-uri, que chega à produção pela cadeia do fastify) com override de patch (pedido 062, E1.1, K-198). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch nova `feature/062-fast-uri`.

## Ler
- Na branch `docs/060-triagem-dependabot` do remoto: `docs/security/060-triagem-dependabot.md`, linhas dos alertas #18 a #25 (versão instalada e corrigida, cadeia).
- `package.json` da raiz (bloco `pnpm.overrides`, se existir) e `pnpm-lock.yaml`.

## Entregar
- "E1.1 (node-backend): override e lockfile, pronto verde." (E1.1)
- (E1) `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch --no-track -c feature/062-fast-uri origin/develop`.
- (E1) Override do fast-uri para a menor versão corrigida indicada no parecer, na mesma linha maior; `pnpm install` atualiza o lockfile; `pnpm why fast-uri` mostra só a versão corrigida.
- (E1) `pnpm run pronto` verde na raiz da worktree.
- (E1) Commit pela seção de commits do `docs/engineering/praticas.md` com `Cartão: K-198`, `git add` de `package.json` e `pnpm-lock.yaml` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/062-fast-uri`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "A" na E1.2 do pedido 060 (alertas): corrigir já os 11 recomendados; os 3 de desenvolvimento depois; #16 risco aceito.
- DECISÃO DO DONO (2026-11-02): "É isso" (recibo do 062): o node-backend troca a versão do fast-uri pela corrigida (#18 a #25) e atualiza o lockfile, com review, segurança, QA e PR para a develop; não mexe em #12, #14, #15, nos 3 do lhci nem no #16, e não dispensa alerta.
- 2026-11-02 20:02: recibo confirmado pelo dono: "É isso". Cartão K-198. DECISÃO TÉCNICA (Jarvis): E1.1 na worktree 052h (branch mesclada feature/059-aba-front, limpa), branch nova feature/062-fast-uri a partir da develop, --no-track e push sem -u por causa do .git/config.lock parado; a suíte espera a trava da suíte única se o P1 do 060 estiver rodando.
- O agente nunca abre nem lê o `.env`.
- O `.git/config.lock` do repositório principal está parado: crie a branch com `--no-track` e envie sem `-u`; recusa de hook ou do sandbox: pare e relate a mensagem literal.
- R-VERIFY: nunca `--no-verify` nem `--force`. Uma suíte de teste por vez na máquina: o `pronto` usa a trava da suíte única; se estiver ocupada, espere.
- O registro de pacotes pode precisar de `registry.npmjs.org` em `allowed_domains`.
- NÃO tocar: dompurify, lhci, zod, outras dependências, código, o `.env`, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (dependência)." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052h ls-remote origin refs/heads/feature/062-fast-uri` · espera: linhas=1
- PQ-2 (cmd): `pnpm -C /home/rodrigoisensee/MetricasDSPD-052h run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).