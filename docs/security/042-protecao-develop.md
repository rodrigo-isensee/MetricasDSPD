---
tipo: revisao-seguranca
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: feature/042-protecao-develop
commit: 90e8dcc704bc96e4f76e1ccc119e11abcef40d44
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-27
---
# Review de segurança: checks obrigatórios na `develop` (pedido 042, K-148)

Propósito: parecer de segurança sobre a proposta de proteção da `develop` (controle de merge, gatilho de `R-SEGURANCA`). Público: tech-lead, devops-engineer, dono do repositório.

**Veredito: aprovado**, sem achado bloqueante e com duas recomendações (A1, A2). Revisão estática de `docs/engineering/fluxo-homologacao.md` (seção 15), `docs/devops/042-protecao-develop.md` e `.github/workflows/ci.yml`; leitura (GET) da proteção atual da `develop`. Nada foi alterado no GitHub (`R-CONFORMIDADE`).

## Gatilhos
CI/CD e controle de merge (proteção de branch).

## Conferências pedidas

1. **A lista fecha a brecha do merge com CI vermelha ou em curso: sim.** Hoje a proteção não tem `required_status_checks` (GET: ausente). Com os nove contextos, o GitHub bloqueia o merge de PR com qualquer um vermelho ou pendente. Todos têm `name:` igual ao id do job (`ci.yml:22,39,80,104,147,163,173,191,280`), então os contextos casam. O evento relevante é `pull_request`, que roda todos eles.
2. **"Skipped" não abre caminho para código sem teste: correto.** O único job pulado por filtro de caminho é `banco` (`ci.yml:108`), e o filtro cobre `server/**` (inclui `server/migrations`), `packages/**`, `scripts/**`, `docker/**`, `pnpm-lock.yaml` e o próprio `ci.yml` (`ci.yml:94-101`). Mudança só em `web/`, `e2e/` ou `docs/` não toca banco; `testes`, `build` e `e2e` rodam sempre em PR (`if` só exclui `schedule`, e `e2e` só roda em PR/dispatch, `ci.yml:192`). `filtro` está na lista: se ele falhar, `banco` fica "skipped" por `needs`, mas o `filtro` vermelho barra o merge, então o skip por falha não passa. Não há `paths`/`paths-ignore` no gatilho do workflow (`ci.yml:3-8`), logo nenhum PR deixa de produzir os checks (o que deixaria o merge pendente para sempre).
3. **O PUT repete as regras atuais sem afrouxar: sim.** Comparado ao GET: `enforce_admins`, `required_linear_history`, `required_conversation_resolution`, `lock_branch`, `block_creations`, `allow_fork_syncing` desligados; `allow_force_pushes` e `allow_deletions` desligados (bloqueados); sem revisão obrigatória nem restrição de quem mescla. O corpo reproduz exatamente isso e acrescenta só os checks. `required_signatures` não é tocado por esse endpoint. Force push e deleção seguem bloqueados.
4. **`strict` desligado é aceitável.** O check roda sobre o head do PR, não sobre o resultado do merge; um conflito semântico entre dois PRs verdes pode entrar. Mitigação: `develop` → `homolog` roda o portão completo (suíte, E2E, perf, migração) antes da `main`, e o dono é o último gate. Risco baixo, aceito pelo desenho.
5. **`perf` fora é aceitável.** Não é produzido em PR para a `develop` (`ci.yml:233-235`); exigi-lo travaria tudo. Continua obrigatório em `homolog` (seção 14).
6. **Rollback seguro.** `DELETE .../protection/required_status_checks` remove só os checks e devolve o estado atual, sem tocar force push, deleção ou o resto. É reversível e não deixa a branch mais aberta do que está hoje.

## Achados

- A1 (recomendado) .github/workflows/ci.yml:280 · O check `seguranca` tem `continue-on-error: true` (linha 285) e os passos engolem a falha (`|| echo '::warning::'`, gitleaks e audit): ele fica verde mesmo com segredo ou vulnerabilidade. Exigi-lo não barra nada e dá falsa sensação de portão. Caminho de ataque: quem abre PR com segredo ou dependência vulnerável passa pelo "check obrigatório". Correção mínima: manter na lista só se o texto da seção 15 declarar que é informativo (ou retirá-lo da lista); tornar o gitleaks bloqueante é decisão à parte (dono: devops-engineer, com aval do dono). Não devolve a entrega.
- A2 (recomendado) docs/engineering/fluxo-homologacao.md:235 · `enforce_admins: false` e ausência de restrição de merge: quem for administrador (o dono) ou tiver bypass pode mesclar ignorando os checks, e o token do tech-lead, se for de admin, também. Hoje já é assim e a decisão do dono manteve; registrar como risco conhecido. Correção mínima: confirmar que o token do agente não é admin (dono). Sem caminho de ataque externo realista.

## Riscos residuais (informativos)
- Contextos por nome (`contexts`) aceitam um status de mesmo nome vindo de qualquer app ou token com escrita; amarrar ao app do GitHub Actions (`checks` com `app_id`) é endurecimento opcional, não exigido pela proporcionalidade.
- Renomear job no `ci.yml` sem atualizar a lista trava os PRs (já registrado pelo devops); falha segura.

## Lacunas de ferramenta
`actionlint` e `zizmor` não rodados: nenhum workflow foi alterado nesta entrega.

## Plano em cartões
Nenhum bloqueante. A1: devops-engineer (texto da seção 15, no PR em curso ou depois). A2: dono, ao aplicar.
