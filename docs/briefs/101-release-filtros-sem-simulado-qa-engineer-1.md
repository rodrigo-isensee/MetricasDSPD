Agente destino: forge:qa-engineer
Pedido: 101-release-filtros-sem-simulado
Tipo: codigo
Branch: fix/101-specs-e2e-api   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: codigo   Cobre: E1.9

## Objetivo
O QA da release 101 reprovou a develop em ea826a9c por 6 testes do e2e `chromium-api` com spec velho (nenhum defeito de produto): eles não acompanharam a 097 L4 e L6 e a 099. Corrigir os specs para a release seguir.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/101-release.md` (A1 a A4).

## Entregar
- "E1.9 (qa-engineer): specs velhos do e2e chromium-api que reprovaram o QA da release (A1 a A3 do parecer de QA da release; o A4 investigado), branch fix/101-specs-e2e-api a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E1.9)
- (E1) (E1.9) A worktree `/home/rodrigoisensee/MetricasDSPD-052g` está na branch do D3 (já enviada): conferir status vazio, `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop` e `git -C /home/rodrigoisensee/MetricasDSPD-052g switch --no-track -c fix/101-specs-e2e-api origin/develop` (se o config.lock antigo deixar a troca pela metade, `git -C /home/rodrigoisensee/MetricasDSPD-052g diff --cached --quiet fix/101-specs-e2e-api` sai 0 e então `git -C /home/rodrigoisensee/MetricasDSPD-052g switch fix/101-specs-e2e-api`; sem remover o lock, stash ou reset). A1: `api.spec.ts` FA5-04 e FA5-16 usam um tipo que existe nas opções reais (sem "Incidente"). A2: `tatico-011-lote2.spec.ts` TT-02 sem `selo-ficticio` (ADR 0030: Sem dado real). A3: `tendencias.spec.ts` CT-58 com a `equipe` opcional da 097 L4 (o 400 só para valor inválido). A4: dizer se o CT-59 cai também na homolog; se é a regex PESSOA casando `descricao`, ajustar a regex sem afrouxar a guarda de pessoa (só nomes de campo de pessoa). Rodar o `chromium-api` inteiro (69 testes) e registrar o resultado. Commit com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito) e push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push -u origin HEAD:refs/heads/fix/101-specs-e2e-api` (`github.com` em allowed_domains). Sem PR, sem merge.
- arquivos: e2e/tests-api/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log --oneline -1 origin/fix/101-specs-e2e-api` · espera: contém 'e2e'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
