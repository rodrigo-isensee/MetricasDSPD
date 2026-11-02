---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-limpa-seed
commit: d90b1fec622363e594e1d6a57923791aa4914511
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: sustentação com dado real do Acelerato, renovação por delta na limpeza do seed (pedido 052, E2.144, K-182)

Propósito: renovar o parecer da sustentação real, que veio da develop (squash `b1c2865`) para a `feature/052-limpa-seed` no merge `d90b1fe`, para o PR 190 sair. O parecer anterior era sobre `671e8d7` (E2.119), na `feature/052-sust-real`; o `forge-check pr` o acusa sem registro de autoria do papel e desatualizado por `docs/architecture/server.md`. Gatilhos: dado de pessoa e fonte externa (R-SEGURANCA). Público: tech-lead, node-backend, qa-engineer, Jarvis.

**Veredito: aprovado** em `d90b1fe`. Nenhum achado. O `forge-check delta` não serve aqui (`671e8d7` não é ancestral de `d90b1fe`, porque a develop recebeu a sustentação por squash); fiz o delta à mão com `git diff 671e8d7 b1c2865` e li tudo. Revisão estática: o `.env` não foi aberto, nada foi chamado nos sistemas externos, nenhuma suíte foi executada por mim. Lacuna de ferramenta: `gitleaks`, Semgrep e `osv-scanner` não estão no PATH.

## Gatilhos
- Dado de pessoa: a API serve chamados reais do Acelerato. O delta não toca `repositorio.ts`, `grants.ts` nem `lgpd.ts`; o GRANT por coluna do `dspd_api` vale como no parecer anterior.
- BusinessMap e Acelerato nunca se misturam: o delta não altera o roteamento por base (`servico.ts`) revisado antes.

## O que foi verificado
- **Código de produção da sustentação igual ao revisado.** Entre `671e8d7` e a develop, o código de produção mudou só em `packages/contratos/src/origem.ts`: reformatação das três constantes de motivo (quebra de linha do Prettier), sem mudança de texto nem de mapa de origem (S2, S3, S4, S8 e S10 reais; o resto mock). `servico.ts`, `origem.ts` do servidor e `OrigemDosCartoes.tsx` não mudaram.
- **Testes novos sem pessoa e sem segredo.** `server/tests/qa-sust-real.pg.test.ts` usa a base sintética do mock e esquemas de teste que ele mesmo remove; a busca por nome, e-mail, `password`, `apikey` e `token` no delta não achou nada. `e2e/tests/intensivo-filtros.spec.ts` só ganhou um tipo na lista de filtros.
- **Cadeia de suprimentos.** `pnpm-workspace.yaml` fixa `vite` em `8.3.4` por override (a `8.3.5` quebra o `test:pg`, com o motivo comentado) e o lockfile troca a resolução para essa versão, com integridade registrada. É versão exata já publicada, só de ferramenta de build e teste; não achei no delta dependência nova, script de instalação nem mudança de workflow. Sem `osv-scanner` no PATH, a consulta de avisos para `8.3.4` fica para a auditoria do CI do projeto.
- **`docs/architecture/server.md`.** A mudança que o `forge-check pr` acusa é a seção da limpeza do seed (E2.96), já coberta pelo parecer `docs/security/052-limpa-seed.md` (aprovado); não é da sustentação e não altera o que foi aprovado aqui.
- **Sem métrica individual nem comparação, sem pessoa em saída ou log.** Nada no delta cria quebra por pessoa ou por time nem adiciona log.

## Achados

## Plano em cartões
Nenhum cartão: sem achado.

## Riscos aceitos
Nenhum.
