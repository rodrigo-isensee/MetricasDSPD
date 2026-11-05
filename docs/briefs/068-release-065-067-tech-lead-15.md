Agente destino: forge:tech-lead
Pedido: 068-release-065-067
Tipo: codigo
Branch: homolog   Base: main   Base-sha: 92c58922fe23852a7504b85f1e496f25e7e02f85
Etapa: pedido-de-merge-ao-dono   Cobre: E1.5

## Objetivo
Abrir o PR de release da homolog (3f71950d9d7becc7ea66e67cf41a53e0919ddcbe, com a release 068 e o portão verde) para a main, sem merge: o merge é do dono (pedido 068, E1.5, K-219). Sem worktree: tudo pelo `gh` a partir de `/home/rodrigoisensee/Metricas/MetricasDSPD`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline origin/main..origin/homolog` (o que a release leva), o `CHANGELOG.md` da homolog e `docs/engineering/fluxo-homologacao.md` (o check homolog-aprovada e o PR de release).

## Entregar
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." (E1.5)
- (E1) (E1.5) `forge-check pr 068-release-065-067 --ref origin/homolog --base origin/main` e relatar a saída; conferir que o check `homolog-aprovada` aparece verde para a ponta 3f71950; abrir o PR `homolog` → `main` com o corpo pelo `--body-file` num arquivo escrito pela ferramenta Write: o que a versão traz (os PRs 212, 214 a 221, 224 e 225, uma linha cada, e as notas do CHANGELOG), os pareceres da release, o portão da homologação verde (run 41979536245) e, em "o que o dono faz depois do merge", o A2 do review: registrar o critério 069:L9-b-campos-etapa e rodar a coleta do Acelerato com `--reconhecer-mudanca`, e rodar o `bm:ref-sync` antes da coleta do BusinessMap; esperar os checks do PR por laço com pausa (sem `--watch`), cada chamada abaixo de 2 minutos, e relatar o estado; NÃO mesclar, NÃO aprovar e NÃO usar `--admin`; o merge na main é do dono.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b ou saía sem ele): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do Histórico deste pedido, docs/pedidos/068-release-065-067.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 03:41: E1.4 cumprida: release na homolog: PR 228 da develop (f615704) para a homolog mesclado por merge commit (3f71950), todos os checks verdes, portão da Homologação completed success (run 41979536245), sem --admin. DECISÃO TÉCNICA (Jarvis): E1.5 com o tech-lead, PR de release da homolog para a main sem merge (o merge é do dono), com o A2 do review no corpo (registrar o critério 069:L9-b-campos-etapa e rodar a coleta do Acelerato com --reconhecer-mudanca; bm:ref-sync antes da coleta do BusinessMap); a develop volta a receber merges (L7-a, depois o 070).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O GitHub precisa também de `api.github.com` em `allowed_domains`; `$?` e `$var` em comando com `gh pr` são barrados.
- NÃO tocar: código, testes, dependências, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, as worktrees, a `develop`, a `homolog` e a `main`; o PR fica aberto para o dono.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge por squash com a CI verde (a develop não aceita merge commit; decisão técnica de 20:08 no Histórico)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança da mudança de dependência da feature/068-zod (ws 8.22.0 para 8.22.1 no pnpm-lock.yaml), antes da E1.3." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da release (develop contra homolog), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.9 (security-engineer): parecer de segurança da release, na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): PR da docs/068-release para a develop, squash com a CI verde, antes da E1.4." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --base main --head homolog --state open --json number,url` · espera: contém 'url'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
