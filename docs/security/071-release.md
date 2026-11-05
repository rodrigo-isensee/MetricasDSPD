---
tipo: revisao-seguranca
contrato: 1
pedido: 071-release-069-070
branch: docs/071-release
commit: 555a002cc7bb5f898f31256c3b7245ca24647071
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-05
---
# Review de segurança: release 071 (develop 39b761d contra homolog 3f71950) (K-222)

Propósito: parecer de segurança da release (`R-SEGURANCA`), com o lote L7-a (grava na referência), o L7-b (só leitura), o simulado por cartão do 070 e o Forge 0.32.0. Público: tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado.** O único PR com gatilho (222, manifesto e escrita no banco) tem parecer aprovado e o código na ponta não mudou depois dele; os demais não tocam dependência, banco, CI nem dado de pessoa.

Revisão estática de `git diff 3f71950...555a002` (120 arquivos, +4732 -155) e de `git log` dos 8 commits. Rodados os testes dos arquivos de segurança tocados (`calendario-referencia`, `ref-sync-calendario-entrada`, `calendario-metricas-codigo`): 38 passaram. Nada foi executado contra banco nem API.

## Gatilhos por PR
- **222 (L7-a):** manifesto e escrita na referência pelo `dspd_ref`. Pareceres aprovados: `docs/security/069-z6-l7a.md` e `docs/security/069-z8-l7a.md`.
- **232 (L7-b):** só leitura da referência; sem gatilho próprio, avaliado abaixo.
- **223 (Forge 0.32.0):** só `.forge/versao`; sem dependência do produto.
- **230, 231, 233, 234 (070):** web, E2E e documentação; sem manifesto, banco, CI nem dado de pessoa. Sem parecer de segurança próprio e sem necessidade dele.
- **Manifesto:** no diff, `server/package.json` ganha só `ref:sync-calendario` (linha 22); `pnpm-lock.yaml` e `.github/` fora do diff; sem script de ciclo de vida.

## Avaliação
- **L7-a, escrita:** `server/src/modulos/referencia/calendario.ts:180-271` faz só `SELECT`, `INSERT` e `UPDATE ... SET vigente_ate`, nas tabelas `ref_calendario`, `ref_calendario_aplicacao`, `ref_feriado` e `ref_versao_criterio` (mais `ref_versao_criterio_metrica`), todas `ref_` do core. É o que `server/src/plataforma/db/grants.ts:124-125` já concedia ao `dspd_ref`; `grants.ts` e `server/migrations/` fora do diff: nenhum GRANT novo. Valores por parâmetro, transação única, entrada com data validada e erro sem URL nem texto do driver (`server/src/entradas/ref-sync-calendario.ts:12-26`).
- **L7-a, arquivo:** `docs/architecture/fontes/calendario.json` com esquema `.strict()`, limites de tamanho e `textoSeguro`; só data, escopo e descrição de feriado, sem pessoa. Um calendário e uma versão por domínio; calendário de outro domínio é recusado (`calendario.ts:83`).
- **L7-b, leitura:** `lerCalendarioVigente` (`server/src/modulos/referencia/repositorio.ts:62-73`) só faz `SELECT`, com `dominio` e `classe` por parâmetro; `servico.ts` pede `businessmap`/`fluxo` para o fluxo e `acelerato`/`sustentacao` para a sustentação, então os domínios não se misturam. A API segue sem ler `ref_feriado.descricao` (`grants.ts:28`). Sem linha na referência, cai no `CALENDARIO_PADRAO`.
- **Allow-list e GRANT por coluna:** nenhum arquivo de coleta, de allow-list do Acelerato, de staging, de migração ou de `grants.ts` está no diff: seguem fechados como nos pareceres `k084` e `k085`. Nada de pessoa entra no staging por esta release.
- **070, simulado:** só no navegador (`web/src/data/simulado.ts`); a API devolve apenas o aviso `sem-dado-real` com `simulavel` booleano, falha fechada se ausente (`packages/contratos/src/origem.ts:101`). O contrato não ganha campo de pessoa; `VISAO_GERAL`, as duas tendências e `EI_SUST` ficam sem simulado (`origem.ts:126`), então não há mistura de BusinessMap com Acelerato. O selo e a fonte não usam `dangerouslySetInnerHTML`, armazenamento local nem chamada de rede nova. `web/vite.config.ts` só ganha um chunk nomeado.
- **E2E:** `e2e/fixtures/referencia-completa.ts` só completa a resposta do stub local; sem credencial.
- **Segredos:** nenhum arquivo `.env*` nem valor sensível no diff (busca por nome de arquivo e leitura dos arquivos de código novos).
- **Ferramentas:** `gitleaks`, `osv-scanner` e `semgrep` não estão no PATH desta estação (lacuna); a evidência de varredura é a da CI dos PRs 222 a 234 e do portão da homolog.

## Achados
- A1 (recomendado) server/package.json:22 · Lacuna de ferramenta local: sem gitleaks, osv-scanner nem semgrep no PATH; conferir as varreduras verdes na CI do PR de release. Dono: tech-lead.

## Riscos aceitos
Nenhum.
