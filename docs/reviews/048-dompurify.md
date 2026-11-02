---
tipo: review
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: feature/048-dompurify
commit: 85e41636a63548a0f251a14f6d373b083497a27d
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-29
---
# Code review: dompurify 3.4.17 por override (K-178, alerta Dependabot #12)

Propósito: revisar a subida do dompurify antes do QA (`R-REVIEW`, E5.1 do pedido 048, E6). Público: QA, dono.

**Parecer: aprovado.** Nenhum ajuste necessário.

## Escopo conferido
- Intervalo `7c94348..6c1dc67`: dois commits, `a48aacb` (autor node-backend: `pnpm-lock.yaml` +11/-10 e `pnpm-workspace.yaml` +2) e `6c1dc67` (parecer de segurança). Nada de código, teste ou pipeline. Teto da M14 longe (23 linhas).
- Override (`pnpm-workspace.yaml:15-16`): versão exata `"3.4.17"`, no mesmo padrão dos overrides vizinhos (`playwright-core`, `katex`), com comentário que cita o alerta #12 e o motivo (bypass do `SAFE_FOR_TEMPLATES`). Versão mínima que corrige, como pediu o dono.
- Lockfile: o override aparece no bloco `overrides` (`pnpm-lock.yaml:13`); uma só versão do dompurify, `3.4.17`, com integridade sha512 (`pnpm-lock.yaml:2993-2994`, `8143`); os três consumidores (`@zenuml/core` em `7394`, `jspdf` em `9092`, `mermaid` em `9371`) apontam para ela; nenhuma `3.4.16` restou.
- `legacy-javascript` 0.0.3 para 0.0.4 (`pnpm-lock.yaml:3790`, `6063`, `9122`): reresolução por faixa, transitiva de `@paulirish/trace_engine` (lighthouse, ferramenta de medição, fora do build de produção). Efeito colateral do `pnpm install`, não do override; pequeno e aceitável numa mudança de cadeia de suprimentos. Fica registrado na mensagem do commit, o que é o certo.
- Commit `a48aacb`: Conventional Commits em português, escopo `engenharia`, `Cartão: K-178` e atribuição no corpo, conforme `docs/engineering/praticas.md` §9.
- Regras invioláveis, `R-NEUTRO` e `R-CUSTO`: não tocadas. Sem dependência nova (só versão de transitiva).
- `praticas.md`: nenhuma regra "decidida por" alcança `pnpm-lock.yaml` ou `pnpm-workspace.yaml`. O `pnpm run pronto` foi rodado pelo autor no E6.1 (não refeito aqui).
- Segurança: parecer `docs/security/048-dompurify.md` (aprovado, sem achados) citado e não refeito. Impacto baixo no projeto: dompurify só transitivo, sem `SAFE_FOR_TEMPLATES` no código, e o jsPDF não usa `.html()`.

## Recomendação do parecer de segurança
Remover o override quando jspdf e mermaid exigirem a faixa corrigida. **Vira cartão**, com dono tech-lead: "Remover override do dompurify (K-178) quando jspdf e mermaid exigirem >= 3.4.17", conferido na revisão semanal do CI (`praticas.md` §10.1, Dependabot). O Jarvis cria o cartão no quadro; sem ele o override ficaria fixo para sempre e bloquearia correções futuras do dompurify.

## Critério de reversão
Remover as duas linhas do override em `pnpm-workspace.yaml` e rodar `pnpm install` (volta o lockfile da `develop`).

## Revalidação por delta (2026-10-30)
Intervalo lido: `forge-check delta`, `6c1dc67..85e4163` (HEAD revisado). Entrou só a `develop` por `gh pr update-branch` (merges `bc63128` e `85e4163`, com os PRs #162 a #170 da `develop`) e os pareceres de QA deste pedido, que não alteram código.
- Lido: `.forge/versao` (0.30.3 para 0.30.5, K-179) e `package.json:4` (versão 0.1.0 para 0.2.0, release 050); ambos vêm da `develop` e não tocam o dompurify.
- Conferido: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, código (ts, tsx, mjs, js) e `.github` sem mudança no intervalo; contra `origin/develop` seguem `pnpm-lock.yaml` +11/-10 e `pnpm-workspace.yaml` +2, o que o parecer aprovou.
- Já lido (não relido): CHANGELOG, ADRs 0016, 0020 e 0022, `data-model.md`, features 052 e `integracao-real`, contrato O23 e README de métricas, `businessmap-api-configuracao.md` e UX da integração real: texto `.md` da `develop`, fora do escopo do dompurify.
- Teto da M14: sem mudança (23 linhas de lockfile e workspace, fora do teto).

Veredito mantido: aprovado.

## Achados
