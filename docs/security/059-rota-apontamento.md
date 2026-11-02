---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-rota-apontamento
commit: 1bf3338d43124f711d98a1bc15ac42ffb2123da4
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: rota da aba Apontamento (pedido 059, E2.24 e E2.75, K-193), rodada 3 por delta

**Rodada 3 (revalidação por delta, E2.75).** Intervalo pedido: `0b4519c..1bf3338`, o merge da develop (squashes dos PRs 194 e 195, ponta `32ebf3a`) na branch do PR 196. Lido com `forge-check delta --parecer docs/security/059-rota-apontamento.md` (que parte de `e38c519`, a ponta aprovada na rodada 2), `git show --cc --stat 1bf3338`, `git diff origin/develop..origin/feature/059-rota-apontamento -- packages` e a saída do `forge-check pr`, que acusava este parecer desatualizado por `packages/metricas/src/businessmap/index.ts`. A ponta lida foi `cbff473`, que sobre `1bf3338` só acrescenta o parecer do code review. Revisão estática: o `.env` não foi lido, nada foi executado contra banco nem contra o BusinessMap, nenhum nome de pessoa neste documento.

**Veredito: aprovado em 1bf3338.** O merge não traz código: o `diff --stat` de `0b4519c..1bf3338` só mostra quatro pareceres de outras branches e papéis (`docs/qa/059-beta.md`, `docs/qa/059-excecao-apontamento.md`, `docs/reviews/059-beta.md`, `docs/security/059-beta.md`). Em `packages`, `server`, `web`, `e2e` e `.github`, `git diff e38c519 origin/feature/059-rota-apontamento` sai vazio: o código é o mesmo aprovado na rodada 2. Nenhum achado novo; o recomendado A3 segue aberto como estava.

## Gatilhos
Os mesmos da rodada 2 (dado pessoal numa rota sem autenticação, GRANT por coluna do papel da aba, view com o privilégio do dono, exceções nomeadas nos guardas, regra de lint do pool). R-SEGURANCA. O intervalo não toca workflow, compose, nginx, hook nem controle do Forge.

## Achados
- A3 (recomendado) server/migrations/0033_bm_apt_pessoa_time.ts:24 · nenhum teste .pg prova que, depois da eliminação a pedido, a view de quem é do time deixa de devolver o pessoa_ref antigo; a garantia hoje é só estrutural (JOIN com dim_responsavel, cuja linha a eliminação apaga).

## O que o delta muda (rodada 3)
- **Por que o `forge-check pr` acusou.** A única diferença da branch para a develop em `packages` é a linha `ordenarPorPessoa` no re-export de `packages/metricas/src/businessmap/index.ts:67`. A função já existe na develop (`businessmap/apontamento/comum.ts:72`, re-exportada em `apontamento/index.ts:27`, sem diferença para a branch) e foi revisada no 059-alfa; o re-export é do `0f582f2` e já estava na ponta aprovada na rodada 2. O que mudou depois do parecer foi a develop, não a branch.
- **O que o export expõe.** `ordenarPorPessoa` só ordena itens já montados pela rota (ordem neutra alfabética ou por total, com `Outra área` no fim, `apontamento.test.ts:181-199`); não lê banco, não acrescenta campo nem rótulo. O único chamador fora da biblioteca é `server/src/modulos/apontamento/servico.ts:122`, sobre rótulos que já passaram pelo interruptor e pelo `superRefine` do contrato. O `web/` não o importa. Sem caminho novo para pessoa.
- **Os 8 arquivos do conflito.** Pela decisão técnica do conflito da rota, ficam na versão da branch (ponta da coleta mais a 0033, a view e o export); `git show --cc` do merge não lista nenhum deles, logo cada trecho veio de um dos pais, sem resolução nova. A view, os GRANTs, as exceções nomeadas em `catalogo.pg.test.ts`, `migracoes.estatico.test.ts` e `lgpd.ts` e o snapshot do esquema estão como na rodada 2.
- **Pareceres 059-beta da coleta.** Ficam na versão da develop, que é o parecer de segurança da coleta da rodada 3 (aprovado em `29c64aa`). A nota dele para esta rota (view de quem é do time sem `pessoa_ref` de pessoa eliminada) já foi conferida na rodada 2 e segue valendo; o teste que a prova de ponta a ponta continua sendo o A3.
- **Fora do intervalo, desde `e38c519`.** O merge anterior (`0b4519c`) trouxe da develop o registro da exceção no `CLAUDE.md:14` e no briefing §7.1 (PR 193) e o `.forge/versao`. O texto da exceção pede o que a rota já faz (rota única, papel dedicado, ordem neutra, piso de 20, aba fora da exportação) e não afrouxa controle.

## Resolução dos achados anteriores
- A1 e A2 (recomendados, rodada 1): resolvidos na rodada 2, sem mudança.
- A3 (recomendado, rodada 2): aberto. `server/tests/apontamento-rota.pg.test.ts:102` cobre o fato com `pessoa_ref` nulo no agregado do time, mas nenhum teste elimina uma pessoa responsável por card do escopo e consulta `apt_pessoa_time` depois.

## Plano em cartões
- A3: node-backend ou qa-engineer, junto do QA da rota; não devolve.

## Riscos aceitos
Nenhum novo. Os da rodada 1 seguem: com o nome real ligado e `APONTAMENTO_REDE_LOCAL`, qualquer máquina da rede local lê a aba sem autenticação (decisões "C" e P-1 do dono, 2026-11-01, até o login pelo AD); `HOST=0.0.0.0` com `APONTAMENTO_PUBLICACAO_LOOPBACK=1` fora do contêiner é declaração do dono que a guarda não confere.

## Ferramentas e lacunas
Leitura estática, `forge-check delta`, `forge-check pr`, `git show --cc`, `git diff` e `git grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação e não foram rodados; as varreduras ficam no CI do `devops-engineer`. O intervalo não traz dependência nova nem credencial. Suítes não foram rodadas por este papel (o tech-lead relatou pronto verde e checks verdes em `1bf3338`). Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
