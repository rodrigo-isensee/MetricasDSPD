---
tipo: revisao-seguranca
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: develop
commit: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-05
---
# Triagem dos alertas abertos do Dependabot (E1.1)

Propósito: refazer a triagem antiga (branch `docs/060-triagem-dependabot`), envelhecida. Público: Jarvis, tech-lead, devops-engineer. Só leitura: nenhuma dependência mudou.

**Veredito: aprovado (sem bloqueante).** Seis alertas abertos, todos em `pnpm-lock.yaml`, nenhum crítico (1 alto, 5 médios). Nenhum cai em caminho de ataque realista hoje: cinco chegam só por ferramentas de desenvolvimento e teste (e2e: `@lhci/cli`, `@mermaid-js/mermaid-cli`, `typescript-eslint`) que não rodam em produção; o #27 (`glob`) chega por `node-pg-migrate`, dependência direta do `server`, mas só no CLI de migração.

Fontes: `gh api .../dependabot/alerts` (só campos de triagem, sem descrição) e `pnpm-lock.yaml` de `origin/develop` (commit acima), só para achar quem puxa cada pacote. Lacunas: não li o texto dos advisories (a avaliação de caminho de ataque abaixo é por escopo de uso, não por exploração); não rodei `osv-scanner` nem `pnpm audit`; não verifiquei o alcance de versão que cada pai aceita para o pacote corrigido (a coluna "quebra algo" é por salto de versão, não por teste).

Nota de escopo: o Dependabot rotula `runtime` em cinco alertas, mas pelo lock o único com ligação em produção é o #27. Os demais descem de `e2e` (devDependencies). Trate o rótulo do Dependabot como impreciso.

## Tabela

| # | Pacote (versão no lock) | Sev. | Manifesto | Direta/transitiva (de quem) | Uso | Corrigida | Quebra algo conhecido? | Recomendação |
|---|---|---|---|---|---|---|---|---|
| 17 | body-parser 1.20.8 (`pnpm-lock.yaml:2511`) | alta | `pnpm-lock.yaml` | transitiva de `express@4.22.3` ← `@lhci/cli@0.15.1` (e2e) | só desenvolvimento (Lighthouse CI) | 1.20.9 | não: salto de patch na mesma linha 1.20 | atualizar já (renovar o lock; custo mínimo, é o único alto) |
| 26 | qs 6.16.0 (`pnpm-lock.yaml:4470`) | média | `pnpm-lock.yaml` | transitiva de `body-parser` e `express@4.22.3` ← `@lhci/cli` (e2e) | só desenvolvimento | 6.16.1 | não: patch | atualizar já, junto com o #17 (mesma cadeia, mesmo PR) |
| 13 | ip-address 10.7.3 (`pnpm-lock.yaml:3549`) | média | `pnpm-lock.yaml` | transitiva de `socks@2.8.10` ← `socks-proxy-agent@8.0.5` ← `proxy-agent`/`pac-proxy-agent` (cadeia de ferramentas de e2e; não rastreei além de `proxy-agent`) | só desenvolvimento | 10.7.4 | não: patch | atualizar com a próxima release (renovação do lock) |
| 16 | zod < 4.6.6; no lock só a 3.25.76 cai na faixa (`pnpm-lock.yaml:5429`); a 4.6.7 já está corrigida | alta | `pnpm-lock.yaml` | transitiva de `chromium-bidi@14.0.0` ← `puppeteer-core@24.43.1` ← `lighthouse@12.6.1` ← `@lhci/cli` (e2e). As diretas do projeto usam `^4.6.7` | só desenvolvimento | 4.6.6 (não existe correção na linha 3.x) | sim, se forçada: 3.x → 4.x é salto maior | esperar correção do pacote pai (`lighthouse`/`chromium-bidi` passarem a zod 4); entre tanto, aceitar o risco com motivo: só dev, sem entrada externa |
| 29 | minimatch 10.2.6 (`pnpm-lock.yaml:4101`) | média | `pnpm-lock.yaml` | transitiva de `@typescript-eslint/typescript-estree@8.72.1` (via `typescript-eslint`, devDependency de raiz, `server`, `tools/docs-contratos`) e de `glob@13.0.6` | só desenvolvimento (alerta); pela `glob` também no CLI de migração | 11.0.1 | possível: salto maior 10 → 11, fora da faixa que os pais declaram (não verificado) | esperar correção do pacote pai (`typescript-estree`, `glob`) |
| 27 | glob 13.0.6 (`pnpm-lock.yaml:3379`) | média | `pnpm-lock.yaml` | transitiva de `node-pg-migrate@9.0.0`, dependência direta do `server` | também em produção (CLI de migração, que roda no deploy; a API não importa `glob`) | 14.0.2 | possível: salto maior 13 → 14 em transitiva (não verificado) | esperar correção do pacote pai (`node-pg-migrate`); aceitar o risco com motivo: o glob lê só o diretório de migrações do repositório, sem entrada externa (conferir no advisory antes de aceitar) |

Observação: `glob@7.2.3` (via `rimraf@3.0.2` ← `chrome-launcher`) e `minimatch@3.1.5` estão fora das faixas afetadas (>= 9 e >= 7), por isso não geram alerta.

## Achados

- A1 (recomendado) pnpm-lock.yaml:2511 · #17 body-parser (alta) e #26 qs: patch na cadeia `express` ← `@lhci/cli` (só dev). Atualizar já num item próprio de renovação do lock (devops-engineer ou node-backend), sem mudar `package.json`.
- A2 (recomendado) pnpm-lock.yaml:3549 · #13 ip-address 10.7.3 → 10.7.4 (média), via `socks` na cadeia de e2e. Renovar o lock na próxima release; sem quebra esperada.
- A3 (recomendado) pnpm-lock.yaml:5429 · #16 zod 3.25.76 via `chromium-bidi@14` ← `lighthouse` (alta, só dev). Sem correção na linha 3.x; esperar o pai. Risco só aceitável com aceite do usuário (R-DECISAO).
- A4 (recomendado) pnpm-lock.yaml:3379 · #27 glob 13.0.6 (média) via `node-pg-migrate`, a única ligação com produção (CLI de migração). Salto maior; esperar o pai. Ler o advisory antes de aceitar o risco.
- A5 (recomendado) pnpm-lock.yaml:4101 · #29 minimatch 10.2.6 → 11.0.1 (média, dev) via `typescript-estree` e `glob`. Salto maior; esperar o pai.

## Plano em cartões (propostas)
- Cartão 1 (A1, A2): renovar `pnpm-lock.yaml` para body-parser 1.20.9, qs 6.16.1 e ip-address 10.7.4, sem mudar `package.json`; dono node-backend; esforço P; gate normal (review, QA).
- Cartão 2 (A3, A4, A5): acompanhar o Dependabot nos pais (`lighthouse`, `node-pg-migrate`, `typescript-estree`); sem ação agora; dono devops-engineer.

## Riscos aceitos
Nenhum gravado. Aceitar A3 ou A4 exige aceite do usuário com `commit:` igual ao deste parecer, pedido pelo Jarvis (R-DECISAO).
