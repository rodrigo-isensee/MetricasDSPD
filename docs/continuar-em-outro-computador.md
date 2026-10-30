# Continuar o trabalho em outro computador

Escrito pelo Jarvis em 2026-10-30 (pedido 054). Estado de referência: develop em 9aa6b29 (Forge 0.30.7).

## 1. Antes de desligar o computador antigo

1. Esperar o Jarvis avisar que tudo foi enviado ao GitHub.
2. Gerar o arquivo do banco (no terminal do WSL, na pasta do projeto):

   ```bash
   cd ~/MetricasDSPD
   mkdir -p ~/backups-metricas
   DSPD_BACKUP_DIR=~/backups-metricas DSPD_PG_CONTAINER=metricasdspd-postgres-1 bash scripts/db-backup.sh
   ```

   O script lê o `.env`, gera `metricas-AAAAMMDD-HHMMSS.dump`, `.inventario.txt` e `roles-*.sql` e confere o arquivo. Detalhes: `docs/engineering/operacao-banco.md`.
3. Levar para o computador novo, num pendrive ou disco cifrado (nunca no GitHub nem em nuvem sem cifra, porque o dump pode ter dado de pessoa):
   - a pasta `~/backups-metricas`;
   - o arquivo `.env` da raiz do projeto (no Windows: `\\wsl.localhost\Ubuntu\home\rodrigoisensee\MetricasDSPD\.env`). Ele tem a apikey do BusinessMap e as senhas do banco; não mande por chat nem e-mail.

## 2. Instalar no computador novo

1. WSL2 com Ubuntu, Docker (Docker Desktop com integração WSL ou Docker no WSL; `docs/architecture/server.md`) e o seu usuário no grupo `docker` antes de abrir o Claude Code.
2. Node 24 pelo nvm (`nvm install 24 && nvm use 24`) e pnpm (`corepack enable`).
3. `gh auth login` (GitHub) e `git config` com seu nome e e-mail.
4. Claude Code e o plugin do Forge: `claude plugin marketplace add rodrigo-isensee/Forge` e `claude plugin install forge@forge` (a versão do projeto é a do `.forge/versao`, 0.30.7).
5. Clonar e preparar:

   ```bash
   gh repo clone rodrigo-isensee/MetricasDSPD ~/MetricasDSPD
   cd ~/MetricasDSPD
   git fetch --all
   pnpm install
   ```

   Copie o `.env` trazido para `~/MetricasDSPD/.env`.
6. Chromium dos testes E2E: `pnpm --filter ./e2e exec playwright install chromium` (e `playwright install-deps`, que pede sudo).

## 3. Banco no computador novo

Opção simples (o banco hoje só tem dados de teste; a coleta real do BusinessMap ainda não começou):

```bash
pnpm run db:up && pnpm run db:migrate && pnpm run db:seed
```

Para trazer o banco exatamente como estava: siga "Recuperação de desastre" em `docs/engineering/operacao-banco.md` (aplicar `roles-*.sql`, senhas dos papéis a partir do `.env`, `pg_restore -d metricas` com o dump). Para só conferir o dump: `DSPD_BACKUP_DIR=~/backups-metricas bash scripts/db-restaurar-verificada.sh`.

## 4. Retomar com o Jarvis

Abra o Claude Code em `~/MetricasDSPD` e diga: "Jarvis, retome pelo `docs/continuar-em-outro-computador.md`". A conversa antiga não vem junto; tudo o que importa está nos arquivos abaixo.

- Quadro: `KANBAN.md`; histórico: `docs/kanban/historico.md`.
- Pedidos e decisões do dono: `docs/pedidos/` (cada um com `## Histórico`).
- Briefs aprovados: `docs/briefs/`; pareceres: `docs/reviews/`, `docs/qa/`, `docs/security/`.
- Os documentos do Jarvis estão na branch `docs/jarvis-2026-10-23` (ainda sem PR): faça `git checkout docs/jarvis-2026-10-23` para retomar com eles.
- As worktrees (`~/MetricasDSPD-0xx`) não vêm junto: o time recria a que precisar com `git worktree add ../MetricasDSPD-<x> <branch>`; todas as branches estão no GitHub.

## 5. Onde parou cada pedido

| Pedido | Estado | Próximo passo |
|---|---|---|
| 052 integração BusinessMap (K-185) | Script de diagnóstico da estrutura (só leitura) pronto e enviado: `feature/052-ws1-estrutura` em 27d32b2 (pronto verde, 28 testes, cobertura 100%) | Conferência da entrega do node-backend (E1.15), depois segurança e code review em paralelo (E1.16, E1.17), QA (E1.18), PR (E1.19); depois você roda `pnpm run bm:diagnostico` e cola a saída (E1.20) e explica a hierarquia do quadro |
| 048 o que falta em mock | 048d (`feature/048-ajustes-front`) com review e QA em dia; 048b, 048c e 048f com branches no GitHub | Três perguntas suas, uma por vez: (1) CA-B do bug 048-03 (recomendação B1; parecer em `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md` na `feature/048-usabilidade`); (2) "Ano" da T11 no K-129 (recomendação A); (3) destravar o PR da 048d (defeito do `cmd_pr` do Forge) |
| 050 release | PR de release v0.2.0 (homolog → main) aberto, check `homolog-aprovada` verde | Seu merge na main e a tag final; fechar o 050 (tabela pedido × entregue e tokens) |
| 053 Forge 0.30.7 | PR #172 mesclado | Retrospectiva (junto com a do 048) |
| 054 troca de computador | Tudo enviado ao GitHub; este documento | Conferência das entregas E1.2 (afb51c7, parecer do CA-B na `feature/048-usabilidade`) e E1.3 (27d32b2), retrospectiva e fechar |
| K-164 (Forge) | Branch `melhoria/MetricasDSPD-k164-mesma-base` no repositório do Forge (a779854) | Conferência da entrega e PR para a develop do Forge |

## 6. Pendências suas (não bloqueiam a retomada)

- Apagar branches e worktrees já mescladas (lista no `KANBAN.md`, cartões com "limpeza do dono").
- Alertas do Dependabot.
- Trocar a chave do BusinessMap por um usuário só leitor antes da coleta agendada.
