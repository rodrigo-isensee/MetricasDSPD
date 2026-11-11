Agente destino: forge:tech-lead
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/099-l1-sem-simulador   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E2.3

## Objetivo
Review do L1 do pedido 099 (desligar o simulador): branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, código em dec8924c79b0ea678d889272f68237c1c3f8dc48 (`web/src/app/App.tsx` usa `HttpFonteMetricas` sem o `FonteComSimulado`; dois testes novos), QA aprovado em 93309e3a, base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff eac38a64b0b580d7c920f4b2b501287f7fb56599 dec8924c79b0ea678d889272f68237c1c3f8dc48`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/099-l1-sem-simulador.md`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/architecture/adr/0030-sem-simulado-na-web.md` (a ADR que revoga a 0028, escrita no repositório principal, sem commit).

## Entregar
- "E2.3 (tech-lead): review do L1." (E2.3)
- (E2) (E2.3) Review: a web de uso diário fica sem número simulado; o modo homologação e a API não mudam; os testes provam a troca; a ADR 0030 está coerente com a mudança e diz quem troca o `Estado:` da 0028. Leve a ADR 0030 para a branch neste mesmo commit do parecer (copiar sem mudar o texto, do repositório principal) e troque só a linha `Estado:` da 0028 para "substituída pela ADR 0030", como a ADR pede. Rodar `web/src/app` com no máximo 2 workers (R-TETO). Parecer `docs/reviews/099-l1-sem-simulador.md` (novo) pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: fix/099-l1-sem-simulador`, `commit: dec8924c79b0ea678d889272f68237c1c3f8dc48` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/099-l1-sem-simulador.md, docs/architecture/adr/0030-sem-simulado-na-web.md, docs/architecture/adr/0028-simulado-por-cartao.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 125ff73356dbd97a31ffa0e5cef650a070a5ba52949550d675466b84b2a4d243 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- aplicáveis a E2.3 (copiadas literalmente):
- - 2026-11-11 14:05: DECISÃO DO DONO (literal): "pode desligaro  simulador". Libera o L1 (tirar o FonteComSimulado do App.tsx; os cartões sem dado real mostram "Sem dado real" até o plano de dado real chegar a cada um). Q-099-3 (remover o código do simulador ou só desligar) segue aberta: a decisão literal é desligar, e a remoção (L2a a L3) espera a resposta. DECISÃO TÉCNICA (Jarvis): o L1 começa já na worktree 041b, branch fix/099-l1-sem-simulador, a partir da develop eac38a64; a ADR 0030 (L0, revoga a 0028, cujo critério de reversão o dono acionou) corre em paralelo pelo arquiteto e entra no mesmo PR.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/fix/099-l1-sem-simulador:docs/reviews/099-l1-sem-simulador.md` · espera: contém 'branch: fix/099-l1-sem-simulador'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
