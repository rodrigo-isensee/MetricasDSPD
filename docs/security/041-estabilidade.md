---
tipo: revisao-seguranca
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-estabilidade
commit: 4b249bca8ee8b653878b6cb96d100f965203bfc9
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-27
---
# Review de segurança: estabilidade dos testes (pedido 041, E5.2)

Propósito: parecer de segurança sobre os scripts de `package.json` e `e2e/package.json`, a configuração do Playwright, a pasta de evidências e o script `e2e/scripts/evidencias-fase-a.mjs` (gatilho: scripts de pacote, `R-SEGURANCA`). Público: tech-lead, qa-engineer.

**Veredito: aprovado**, sem bloqueante (o script `evidencias-fase-a.mjs`, lido na volta da E5.2, e o delta do E6.1 não mudam o veredito). Revisão estática do diff `e342a2c..3d5a5a8`, mais o delta `4a72c20..4b249bca` (abaixo); nada foi executado, nenhuma varredura foi rodada (gitleaks e osv-scanner não foram invocados: os diffs não tocam dependência nem lockfile).

## O que foi verificado
- **Scripts (`package.json`, `e2e/package.json`):** `test:e2e`, `test:evidencias-qa` (`E2E_EVIDENCIAS=qa playwright test`) e `pronto` (`pnpm run typecheck`) só chamam `playwright`, `tsc` e `pnpm run`. Sem segredo, sem leitura do `.env`, sem `curl`/`wget`, sem escrita fora do repositório, sem hook de instalação (`preinstall`, `postinstall`) novo, sem dependência nova.
- **Configuração do Playwright:** `E2E_WORKERS` (`playwright.config.ts:16`) é número lido do ambiente local; só limita paralelismo, na CI vale `undefined`. Sem efeito de confidencialidade ou integridade.
- **Evidências:** `e2e/fixtures/evidencias.ts:10-13` grava por padrão em `e2e/evidencias-local/` (ignorada em `.gitignore:31-32`); só `E2E_EVIDENCIAS=qa` grava na pasta versionada de evidências do QA. O caminho versionado deixa de ser sujo por execução comum. Os dados da E2E vêm do mock; a regra de pessoa (allow-list, ADR 0020) não é afetada.

## Script `e2e/scripts/evidencias-fase-a.mjs` (volta da E5.2)
- **O que grava:** 22 PNG (12 `operacional-<largura>-<tema>`, 6 larguras × 2 temas, e 10 `estado-<nome>-<tema>`, 5 estados × 2 temas; `fullPage`) direto em `docs/qa/evidencias/fase-a/` (linha 9), pasta versionada, fora da regra de `E2E_EVIDENCIAS`. O script não mudou nesta branch; é manual (`node scripts/evidencias-fase-a.mjs`), fora de `pronto`, da CI e do `package.json`.
- **Fonte de dados:** o `vite preview` em `BASE_URL` (padrão `localhost:4173`, linha 8). O front usa o mock por padrão; `VITE_FONTE=api` só vale se definida na build (`composicao.test.tsx:25`). Os estados usam `?mock=...` e filtros de equipe e tipo (linha 24).
- **Pessoa ou segredo:** com o mock, não há. A tela de métricas agregadas não traz nome, e-mail nem `usuarioKey` (allow-list, ADR 0020), e o script não lê `.env`, cookie nem cabeçalho de autenticação, só abre páginas e fotografa.
- **Risco residual:** se o preview for buildado com `VITE_FONTE=api`, ou `BASE_URL` apontar para ambiente real, o PNG leva dado real a um artefato versionado, sem barreira no script. Não há caminho de ataque externo; é higiene (A3).

## Delta 4a72c20..4b249bca (E6.1 e leitura do F4)
- **E6.1 (`web/`):** `FrescorFonte.tsx` ganha uma linha invisível (`aria-hidden`, classe `invisible`) com texto constante embutido (`TEXTO_FALHA_RESERVA`, datas `00/00/0000`), só para reservar altura; sem entrada externa, sem HTML injetado, sem dado de pessoa nem chamada nova. `MaisMetricas.tsx` só acrescenta a classe `scroll-mt-72`. Os dois testes acrescentados só afirmam presença e classe.
- **Docs:** ADR 0003 (uma linha, leitura de 2026-10-27, sem mudar limite) e `arquitetura-front.md` (uma linha); sem efeito de segurança.
- Nenhum gatilho novo de `R-SEGURANCA` (sem dependência, workflow, script de pacote, credencial ou superfície de API). Veredito do delta: aprovado; A1 a A3 seguem recomendados.

## Achados
- A1 (recomendado) e2e/playwright.config.ts:16 · `Number(process.env.E2E_WORKERS ?? 2)` vira `NaN` se a variável for inválida; o Playwright pode falhar de forma obscura. Só disponibilidade local, sem caminho de ataque. Validar e cair em 2.
- A2 (recomendado) e2e/fixtures/evidencias.ts:11 · evidência com `E2E_EVIDENCIAS=qa` é versionada; antes de commitar, o QA confere que não há dado real de pessoa em PNG/PDF (a E2E usa mock, mas o spec `integracao-real-evidencias` roda contra API real). Registrar no parecer de QA.
- A3 (recomendado) e2e/scripts/evidencias-fase-a.mjs:8 · grava PNG em pasta versionada sem a barreira de `E2E_EVIDENCIAS`; com `BASE_URL` real ou preview buildado com `VITE_FONTE=api`, dado real vai a artefato versionado. Aceitar só localhost e documentar que o preview é do mock.

## Plano em cartões
Nenhum obrigatório. A1, A2 e A3 são opcionais, a critério do dono do artefato.

## Riscos aceitos
Nenhum. O parecer é `aprovado`, sem depender de aceite do usuário.
