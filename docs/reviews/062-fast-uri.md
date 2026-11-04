---
tipo: review
contrato: 1
pedido: 062-corrige-fast-uri
branch: feature/062-fast-uri
commit: 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09
parecer: aprovado
revisor: tech-lead
data: 2026-11-03
---

# Code review: override do fast-uri (pedido 062, E1.2, K-198)

**Veredito: aprovado.** Escopo lido: `git diff origin/develop...5c85b0e`, 2 arquivos (`pnpm-workspace.yaml`, `pnpm-lock.yaml`), 25 linhas alteradas, abaixo do teto da decisão M14 e sem código nem teste. Um comportamento só. Não rodei `pronto` nem testes: o autor registra `pronto` rc=0 e a CI do PR roda a suíte.

## O que conferi

- **Só patch, mesma linha maior.** `fast-uri@3` sobe de 3.1.8 para 3.1.9 e `fast-uri@4` de 4.2.2 para 4.2.3, as versões corrigidas da triagem 060 (alertas #18 a #25, GHSA-333x, wjr9, xhq7 e w74x).
- **Lockfile resolve as duas linhas corrigidas.** O bloco `overrides` do lock traz os dois seletores, as entradas `packages` e `snapshots` vão para 3.1.9 e 4.2.3, e os 4 consumidores diretos (`@fastify/ajv-compiler`, `ajv@8.20.0`, `fast-json-stringify`, `json-schema-resolver`) apontam para a versão nova da própria linha.
- **Nenhuma outra dependência muda.** O diff do lock tem 12 adições e 10 remoções, todas de `fast-uri`; hashes `integrity` trocados só nas duas entradas. Não há mudança em `package.json` nem em `vite`, `katex` ou `dompurify`.
- **Escopo do dono.** Não toca #12, #14, #15, #16 nem os 3 do lhci; não dispensa alerta.
- **Seletores.** `"fast-uri@3"` e `"fast-uri@4"` entre aspas em `pnpm-workspace.yaml`, junto dos demais overrides, com comentário que cita os alertas e o pedido.

## Ferramentas

Nenhuma regra de ferramenta alcança estes arquivos além do `pronto` do autor (rc=0, informado no brief). Sem comando pendente.

## Segurança

Parecer próprio do `security-engineer` (E1.3), na mesma branch (commit 77c463c); não refeito aqui.

## Achados

- A1 (recomendado) pnpm-workspace.yaml:23 · o override fixa a versão exata e ficará parado se sair novo patch; remover os dois seletores quando fastify, swagger e type-provider já exigirem a faixa corrigida. Sem devolução.

## Histórico

- 2026-11-03: regravado para registro de autoria (mesmo conteúdo, mesmo veredito, mesmo `commit:`).
