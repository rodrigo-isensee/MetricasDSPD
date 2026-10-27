---
tipo: revisao-seguranca
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-estabilidade
commit: 3d5a5a8fefbd959d487f1ba6be849011157a03c7
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-27
---
# Review de segurança: estabilidade dos testes (pedido 041, E5.2)

Propósito: parecer de segurança sobre os scripts de `package.json` e `e2e/package.json`, a configuração do Playwright e a pasta de evidências (gatilho: scripts de pacote, `R-SEGURANCA`). Público: tech-lead, qa-engineer.

**Veredito: aprovado**, sem bloqueante. Revisão estática do diff `e342a2c..3d5a5a8`; nada foi executado, nenhuma varredura foi rodada (gitleaks e osv-scanner não foram invocados: o diff não toca dependência nem lockfile).

## O que foi verificado
- **Scripts (`package.json`, `e2e/package.json`):** `test:e2e`, `test:evidencias-qa` (`E2E_EVIDENCIAS=qa playwright test`) e `pronto` (`pnpm run typecheck`) só chamam `playwright`, `tsc` e `pnpm run`. Sem segredo, sem leitura do `.env`, sem `curl`/`wget`, sem escrita fora do repositório, sem hook de instalação (`preinstall`, `postinstall`) novo, sem dependência nova.
- **Configuração do Playwright:** `E2E_WORKERS` (`playwright.config.ts:16`) é número lido do ambiente local; só limita paralelismo, na CI vale `undefined`. Sem efeito de confidencialidade ou integridade.
- **Evidências:** `e2e/fixtures/evidencias.ts:10-13` grava por padrão em `e2e/evidencias-local/` (ignorada em `.gitignore:31-32`); só `E2E_EVIDENCIAS=qa` grava em `docs/qa/evidencias`. O caminho versionado deixa de ser sujo por execução comum. Os dados da E2E vêm do mock; a regra de pessoa (allow-list, ADR 0020) não é afetada.

## Achados
- A1 (recomendado) e2e/playwright.config.ts:16 · `Number(process.env.E2E_WORKERS ?? 2)` vira `NaN` se a variável for inválida; o Playwright pode falhar de forma obscura. Só disponibilidade local, sem caminho de ataque. Validar e cair em 2.
- A2 (recomendado) e2e/fixtures/evidencias.ts:11 · evidência com `E2E_EVIDENCIAS=qa` é versionada; antes de commitar, o QA confere que não há dado real de pessoa em PNG/PDF (a E2E usa mock, mas o spec `integracao-real-evidencias` roda contra API real). Registrar no parecer de QA.

## Plano em cartões
Nenhum obrigatório. A1 e A2 são opcionais, a critério do dono do artefato.

## Riscos aceitos
Nenhum. O parecer é `aprovado`, sem depender de aceite do usuário.
