---
tipo: revisao-seguranca
contrato: 1
pedido: 060-triagem-dependabot
branch: docs/060-triagem-dependabot
commit: e32ee542d56b4767cebda581dc20f4283e04a56c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Triagem de segurança: alertas abertos do Dependabot (pedido 060, E1.1, K-194)

Propósito: classificar os 15 alertas abertos do Dependabot e recomendar, por alerta, corrigir já, corrigir depois ou aceitar o risco. Público: dono (escolha da E1.2), tech-lead, Jarvis.

**Veredito: aprovado, sem achado bloqueante.** Nenhum alerta tem caminho de ataque realista no código do projeto: as partes vulneráveis não são alcançadas por entrada de usuário. Quatro alertas são só de desenvolvimento (CI e ferramentas locais), oito são de produção mas em código que só processa esquemas definidos no próprio servidor, e três (dompurify) já estão corrigidos na develop e fecham na próxima release para a `main`.

Nada foi alterado: nenhuma dependência, nenhum lockfile, nenhum alerta dispensado (DECISÃO DO DONO de 2026-11-02). Leitura: `gh api .../dependabot/alerts` (estado aberto, 15 itens, só GET), `pnpm-lock.yaml` e `package.json` da develop em `e32ee54`, e o lockfile da `main` para comparação.

## Gatilho
Cadeia de suprimentos (alertas de dependência).

## Observação de método
O Dependabot avalia o ramo padrão (`main`), não a develop. Por isso os alertas do dompurify (#12, #14, #15) seguem abertos: a `main` tem `dompurify@3.4.16` e a develop já tem `3.4.17` pelo override do pedido 048 (`pnpm-workspace.yaml:15-16`). O Dependabot marca todos os alertas como `runtime`, mas isso não é confiável para transitivos: a coluna "Escopo" abaixo vem das cadeias do lockfile da develop.

## Tabela dos alertas

| # | Pacote | Instalada | Corrigida | Gravidade | GHSA | Escopo e cadeia | Código alcança? | Custo da troca | Recomendação |
|---|---|---|---|---|---|---|---|---|---|
| 12 | dompurify | 3.4.16 (main) / 3.4.17 (develop) | 3.4.17 | crítica | GHSA-cg2g-xh64-v4q7 | produção: `web` > `jspdf@4.2.1` (opcional); dev: `e2e` > `@mermaid-js/mermaid-cli` > `mermaid`, `@zenuml/core` | Não: só `new jsPDF` e texto em `web/src/features/exportar/desenhista.ts:32`; sem `.html(`, sem import de dompurify, sem `SAFE_FOR_TEMPLATES` | Zero: já na develop (override) | Corrigir já: levar a develop à `main` na próxima release |
| 14 | dompurify | idem | 3.4.17 | baixa | GHSA-c6gr-qvv4-5v3f | idem | Não: sem `PARSER_MEDIA_TYPE` nem uso direto | Zero | Corrigir já, mesma release |
| 15 | dompurify | idem | 3.4.17 | alta | GHSA-mrv2-3pqr-j5jr | idem | Não: sem `IN_PLACE` nem hooks próprios | Zero | Corrigir já, mesma release |
| 18 | fast-uri | 3.1.8 | 3.1.9 | baixa | GHSA-333x-w4r6-6crp | produção: `server` > `fastify@5.12.7` > `ajv@8.20.0`; `@fastify/swagger@9.9.2` > `json-schema-resolver@3.0.0`; `fastify-type-provider-zod@7.0.0` | Não: só resolve `$id`/`$ref` de esquemas do próprio código; validação e serialização das rotas são do zod (`server/src/app.ts:70-71`); sem import de fast-uri nem `format: uri` | P: override de patch `fast-uri@3` para 3.1.9 | Corrigir já (barato, produção), sem urgência |
| 19 | fast-uri | 4.2.2 | 4.2.3 | baixa | GHSA-333x-w4r6-6crp | produção: `server` > `fastify` > `@fastify/ajv-compiler@4.0.7`, `fast-json-stringify@7.1.0` | Não: idem; o serializador das rotas é o do zod, não o fast-json-stringify | P: override de patch `fast-uri@4` para 4.2.3 | Corrigir já, junto com #18 |
| 20 | fast-uri | 3.1.8 | 3.1.9 | média | GHSA-wjr9-j795-jxcr | como #18 | Não: host de URI vem de esquema estático | P (mesmo override) | Corrigir já, junto com #18 |
| 21 | fast-uri | 4.2.2 | 4.2.3 | média | GHSA-wjr9-j795-jxcr | como #19 | Não | P (mesmo override) | Corrigir já, junto com #18 |
| 22 | fast-uri | 3.1.8 | 3.1.9 | baixa | GHSA-xhq7-xmqj-769h | como #18 | Não | P (mesmo override) | Corrigir já, junto com #18 |
| 23 | fast-uri | 4.2.2 | 4.2.3 | baixa | GHSA-xhq7-xmqj-769h | como #19 | Não | P (mesmo override) | Corrigir já, junto com #18 |
| 24 | fast-uri | 3.1.8 | 3.1.9 | média | GHSA-w74x-v6f9-j3xg | como #18 | Não | P (mesmo override) | Corrigir já, junto com #18 |
| 25 | fast-uri | 4.2.2 | 4.2.3 | média | GHSA-w74x-v6f9-j3xg | como #19 | Não | P (mesmo override) | Corrigir já, junto com #18 |
| 13 | ip-address | 10.7.3 | 10.7.4 | média | GHSA-rxp7-6hxx-x8q5 | só dev: `e2e` > `@lhci/cli@0.15.1` > ... > `socks@2.8.10` | Não: socks só entra com proxy SOCKS configurado; o lighthouse roda em `localhost` (`e2e/lighthouse/lighthouserc.cjs:21-23`) | P: override de patch 10.7.4 | Corrigir depois, no próximo ciclo de dev do Dependabot |
| 17 | body-parser | 1.20.8 | 1.20.9 | alta | GHSA-27r3-jxmh-p828 | só dev: `e2e` > `@lhci/cli@0.15.1` > `express@4.22.3` | Não: o lhci usa `startServerCommand` com `vite preview` e `upload` em arquivo (`e2e/lighthouse/lighthouserc.cjs:23,41`); o express do `lhci server` não sobe | P: override de patch 1.20.9 | Corrigir depois, junto com #13 |
| 26 | qs | 6.16.0 | 6.16.1 | média | GHSA-6pq8-jhm2-2vcw | só dev: `e2e` > `@lhci/cli@0.15.1` > `express@4.22.3`, `body-parser` | Não: falha só em `qs.stringify` com `arrayFormat: comma`; sem uso no projeto e o express do lhci não sobe | P: override de patch 6.16.1 | Corrigir depois, junto com #13 |
| 16 | zod | 3.25.76 | 4.6.6 | alta | GHSA-mrhx-c7xc-m3w5 | só dev: `e2e` > `@lhci/cli@0.15.1` > ... > `chromium-bidi@14.0.0`. O `zod@4.6.7` de produção (`server`, `web`, `packages/contratos`) já está fora da faixa | Não: o zod 3 só valida mensagens do protocolo BiDi do Chromium local da CI | G: não há 3.x corrigido; trocar exige atualizar o lhci ou o puppeteer até um chromium-bidi com zod 4; override para 4 quebra a API | Aceitar o risco (motivo: só dev, entrada do navegador local, sem correção na linha 3) até o lhci trazer a versão nova |

## Resumo por recomendação
- **Corrigir já (11):** #12, #14, #15 por release da develop para a `main` (custo zero, já feito no 048); #18 a #25 (fast-uri, produção) por dois overrides de patch em `pnpm-workspace.yaml` (`fast-uri@3` para 3.1.9 e `fast-uri@4` para 4.2.3), ou atualizando `fastify`, `@fastify/swagger` e `fastify-type-provider-zod` quando uma versão já exigir a faixa corrigida. Esforço P. Sem caminho de ataque conhecido: a prioridade vem de ser produção e barato, não de exploração.
- **Corrigir depois (3):** #13, #17, #26 (só dev, cadeia do `@lhci/cli`), por overrides de patch (`ip-address` 10.7.4, `body-parser` 1.20.9, `qs` 6.16.1) ou por versão nova do `@lhci/cli`, no próximo ciclo do Dependabot de dev.
- **Aceitar o risco (1):** #16 (zod 3 no chromium-bidi do lhci), com o motivo acima; o aceite é decisão do dono (E1.2) e, se aceito, o dispensar do alerta é ato dele.

## Achados
- A1 (recomendado) pnpm-workspace.yaml:9 · fast-uri 3.1.8 e 4.2.2 em produção (alertas 18 a 25), sem caminho de ataque; corrigir com override de patch 3.1.9 e 4.2.3 ou atualização do fastify. Dono: node-backend.
- A2 (recomendado) pnpm-workspace.yaml:15 · alertas 12, 14 e 15 já corrigidos na develop pelo override 3.4.17; fecham com a release para a main. Dono: tech-lead.
- A3 (recomendado) e2e/package.json:28 · ip-address, body-parser e qs vulneráveis só na cadeia dev do @lhci/cli (alertas 13, 17, 26); override de patch ou lhci novo no próximo ciclo. Dono: devops-engineer.
- A4 (recomendado) e2e/package.json:28 · zod 3.25.76 no chromium-bidi do lhci (alerta 16), só dev e sem 3.x corrigido; candidato a risco aceito pelo dono até o lhci trazer zod 4. Dono: dono do produto.

## Evidências
- Cadeias calculadas do `pnpm-lock.yaml` da develop (seção `snapshots`): `fast-uri@3.1.8` e `@4.2.2` (`pnpm-lock.yaml:3234,3237,8549,8551`), `ajv@8.20.0` (`:2317`), `fast-json-stringify@7.1.0` (`:3222`), `json-schema-resolver@3.0.0` (`:3754`), `express@4.22.3` (`:3193`), `body-parser@1.20.8` (`:2509`), `qs@6.16.0` (`:4468`), `socks@2.8.10` (`:4798`), `ip-address@10.7.3` (`:3547`), `chromium-bidi@14.0.0` (`:2590`), `zod@3.25.76` e `@4.6.7` (`:5415,5418`), `jspdf@4.2.1` (`:3772`), `dompurify@3.4.17` (`:3001`).
- Busca no código (sem `node_modules`): nenhum import de `fast-uri`, `ajv`, `dompurify`, `qs`, `body-parser` ou `ip-address` em `server/src`, `web/src`, `packages/` e `e2e/`; nenhuma chamada `.html(` em `web/src`.
- Dependências diretas: `server/package.json:41,45,46,52`, `web/package.json:28,34`, `e2e/package.json:28,29`.

## Riscos aceitos e ferramentas
Nenhum risco aceito neste parecer; o de A4 depende do aceite do dono. Ferramentas: API do GitHub (leitura), leitura do lockfile com script de cadeia reversa e busca por texto. `osv-scanner`, `gitleaks` e `semgrep` não estão no PATH, e `pnpm audit` não rodou (sem rede para o registry): lacuna. Também não verifiquei se há versão nova de `@lhci/cli`, `fastify` ou `@fastify/swagger` que já traga as faixas corrigidas; isso fica para quem implementar a correção.
