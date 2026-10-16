---
tipo: review
contrato: 1
pedido: "013"
branch: docs/retomada-2026-10-17
commit: 2b7e784
parecer: aprovado
revisor: tech-lead
data: 2026-10-16
---

# Code review: docs da retomada de 2026-10-17 (K-105)

Branch `docs/retomada-2026-10-17`, saída da `develop` em `b73bad3`. Intervalo revisado: `b73bad3..2b7e784` (três commits). O PR para a `develop` é do pedido 017.

## Escopo do diff
- `62d66c1` docs(kanban): `KANBAN.md`, `docs/kanban/historico.md`, `docs/kanban/melhorias.md`, `docs/pedidos/011` (atualizado) e `012` a `018` (novos), `docs/briefs/` (6 briefs).
- `5f857cb` docs(devops): seção "Release #96" de `docs/devops/homolog-2026-10-16.md` (autor: `devops-engineer`).
- `2b7e784` docs(arquitetura): `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` e `docs/architecture/features/metricas-tambem-disponiveis.md` (K-104, autor: `software-architect`).

## Regras de ferramenta (saída citada, não refeita)
- Só Markdown: `git diff --name-only b73bad3..2b7e784 | grep -v '\.md$'` sem saída (20 arquivos, todos `.md`). O portão de homolog classifica a mudança como documentação pura e roda só o `docs:check` (`fluxo-homologacao.md`, H-2).
- `pnpm run docs:check`: `docs:check: ok (467 páginas Markdown, 63 métricas, 2 eventos).`
- `forge-check docs`: sai com código 1 por 10 apontamentos `frontmatter: sem frontmatter no topo (ADR-0004)`, todos em arquivos que já estavam na `develop` (por exemplo `docs/qa/front-via-api.md`, `docs/architecture/features/front-via-api.md`); nenhum é arquivo deste diff nem este parecer. Fica como pendência de fábrica, fora deste PR.

## Leitura
1. **Escopo:** faz o que o pedido 013 (E2) pede; nada de código, nada fora da lista.
2. **Segredos e dados de pessoa:** varredura das linhas adicionadas por e-mail, `apikey`/`token`/`senha`/`password`, `Bearer`, tokens do GitHub, chave privada, URL de Postgres com senha e `usuarioKey`: nenhuma ocorrência. Não há nome de pessoa da operação; as únicas ocorrências de nome são caminhos locais das worktrees (`/home/<usuário da estação>/...`) nos briefs e pedidos, o mesmo padrão dos documentos já mesclados.
3. **Regras invioláveis:** a ADR 0020 registra a R-1 = B (E8 só com contagens, sem nome de sistema; T14 oculta "outros times" abaixo de 2 pessoas) e a R-2 = B como decisões do usuário de 2026-10-16, sem mudar a decisão de arquitetura e sem cálculo fora da biblioteca única. A leitura adotada para "pessoas" na T14 fica marcada como `pendente-usuario` (Q-T14-10), não decidida por inferência. Mantém o critério de reversão e o "Por que o existente não basta".
4. **Parecer de devops:** a seção do release #96 registra os reruns e as causas sem mudar workflow nem código; os riscos que levanta (montecarlo.test instável, C6 do PR perto do limite, corrida do `homolog-aprovada`) já viraram os pedidos 015 e 016.
5. **Commits:** Conventional Commits em português, um por autor e assunto, com cartão e atribuição; `git add` por caminho.

## Pendências (não bloqueiam este PR)
- A ADR 0020 diz que qualquer alteração dela pede nova leitura do `security-engineer`: o item 9 novo e o risco residual entram no review de segurança do E2 (E2.3 do pedido 011), antes do E8 e da T14 no back. Este parecer não substitui essa leitura (`R-SEGURANCA`).

## Parecer
**Aprovado.**
