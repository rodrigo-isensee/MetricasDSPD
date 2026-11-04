---
tipo: review
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-m1-frescor
commit: 01f29bc9a5e63e3f8a795120f6ee4862d9066cb7
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-04
---
# Review: 069-lacunas-alta, lote M1-a (frescor.ultimaTentativa e aviso de coleta parcial)

Ponta revisada 01f29bc contra a develop b86dd9f. Desenho: `docs/analises/069-desenho.md`, seção "Lote M1-a". Cartão K-220. Substitui o parecer de db7a8e1.

## Achados

- A1 (recomendado) web/src/features/apontamento/components/CabecalhoApontamento.tsx:45 · `fimParcial.slice(11, 16)` repete a hora que `fmtDataHoraCurta` já extrai; um helper `fmtHoraCurta` em `lib/formatar` evitaria a duplicação.

## Parecer

Aprovado. Revalidação por delta: li o que mudou desde db7a8e1 (f50f7dd, 0fb20aa, b1bf7d9, 01f29bc); o resto do lote ficou como já lido no parecer anterior (contrato, serviço, docs da API, selo, segurança).

- Delta do server: os A1 e A2 do parecer anterior foram resolvidos (`app.close()` nos dois testes; caso explícito "coleta ok depois de parcial" com `ultimaTentativa` ok e selo vindo da coleta ok).
- Delta da tela: texto final do aviso em acordo com a linha nova de `docs/ux/059-aba-apontamento-textos.md`; constante única `AVISO_PARCIAL_FIM`; teste da fronteira (parcial com fim igual ao da última ok não avisa) e texto esperado atualizado.
- Rodado aqui, 2 workers: server `apontamento-rota.test.ts` 71 passaram; web `apontamento.test.tsx` 58 passaram.
- Ferramentas: `pnpm run docs:check`: "docs:check: ok (932 páginas Markdown, 69 métricas, 2 eventos)."; `prettier --check` em `web/src/features/apontamento` e `packages/contratos/src/apontamento.ts`: "All matched files use Prettier code style!".
- Teto M14: 106 linhas de código e teste (contratos 13, serviço 3, teste do server 28, teste web 43, componente 19), sem `.md` e sem o `openapi.json` gerado; dentro de 150; um comportamento só.
- Segurança: sem gatilho (desenho, tabela de gatilhos); sem pessoa. Parecer de UX do lote em `docs/ux/069-m1-frescor-revisao.md`.
- Critério de reversão presente no desenho. Pendência: suíte completa e E2E de API ficam com o QA desta ponta (E1.5) e o CI do PR.
