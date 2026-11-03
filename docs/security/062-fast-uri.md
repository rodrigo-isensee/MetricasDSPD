---
tipo: revisao-seguranca
contrato: 1
pedido: 062-corrige-fast-uri
branch: feature/062-fast-uri
commit: 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-03
---
# Parecer de segurança: override do fast-uri (pedido 062, E1.3, K-198)

Propósito: conferir que o override do fast-uri fecha os alertas #18 a #25 do Dependabot sem trazer pacote nem fonte nova. Público: tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado, sem achado bloqueante.** A mudança é de dependência (gatilho de cadeia de suprimentos), só em `pnpm-workspace.yaml` e `pnpm-lock.yaml`.

## Resumo
- **Versões fecham os alertas.** A triagem do pedido 060 (`docs/060-triagem-dependabot`, commit ffa0aea) fixa as versões corrigidas: 3.1.9 para a linha 3 (#18, #20, #22, #24) e 4.2.3 para a linha 4 (#19, #21, #23, #25). O lockfile da branch traz exatamente essas duas e nenhuma outra: `pnpm-lock.yaml:3236,3239` (pacotes) e `:8551,8553` (snapshots). Não resta `fast-uri@3.1.8` nem `@4.2.2` (busca por texto no lockfile).
- **Os cinco pontos de uso foram trocados.** `:5731`, `:8535` (4.2.3) e `:7458`, `:9095` (3.1.9): as cadeias `@fastify/ajv-compiler`, `fast-json-stringify`, `ajv@8.20.0` e `json-schema-resolver`.
- **Nenhum pacote novo nem fonte nova.** O diff contra a develop tem 2 arquivos; no lockfile só mudam as entradas do fast-uri (versão e integridade) e as duas linhas de `overrides`. Nenhum `tarball`, URL de git, registry diferente, script de instalação ou dependência nova. O fast-uri continua sem dependências próprias (`{}` nos snapshots).
- **Override restrito e proporcional.** `fast-uri@3` e `fast-uri@4` (`pnpm-workspace.yaml:22-23`) travam patch dentro da mesma linha maior, sem cruzar para outra maior. Não toca #12, #14, #15, os três do lhci nem o #16, conforme a decisão do dono.
- **Alertas.** Não foram fechados nem dispensados à mão. Devem fechar sozinhos quando o Dependabot reanalisar a develop depois do merge deste PR; registrar a confirmação lá (alertas #18 a #25 em estado fechado). Se algum seguir aberto, abrir cartão em vez de dispensar.

## Achados
- A1 (recomendado) pnpm-lock.yaml:3237 · hashes de integridade do fast-uri 3.1.9 e 4.2.3 não conferidos contra o registry (sem rede, `pnpm audit` e `osv-scanner` fora do PATH); a instalação congelada da CI valida o lockfile. Dono: tech-lead.

## Evidências
- `git diff origin/develop...5c85b0e --stat`: `pnpm-lock.yaml` (22 linhas) e `pnpm-workspace.yaml` (3 linhas), nada mais.
- `git diff` dos dois arquivos lido por inteiro; `grep fast-uri pnpm-lock.yaml` lista só 3.1.9 e 4.2.3.
- Código do projeto não importa fast-uri (triagem do 060), logo não há mudança de comportamento própria a revisar; a compatibilidade de patch fica com a suíte da CI e o QA (E1.4).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura do diff e do lockfile e busca por texto; `osv-scanner`, `gitleaks` e `semgrep` não estão no PATH, e `pnpm audit` não rodou (sem rede para o registry): lacuna registrada em A1. O `git fetch` do GitHub foi feito com `github.com` liberado.
