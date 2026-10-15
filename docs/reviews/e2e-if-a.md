---
tipo: review
contrato: 1
pedido: e2e-if-a
branch: fix/e2e-if-a
commit: 757d7326b23a51fa42a527bb92651e1740d04404
parecer: aprovado
revisor: tech-lead
data: 2026-10-14
---

# Code review: E2E IF-A estoura o timeout na CI (K-083)

Diff: uma linha, `test.setTimeout(120_000)` no IF-A de `e2e/tests/intensivo-filtros.spec.ts`, mais comentário. Asserção intacta.

## Decisão: aumentar o timeout é a correção certa (não dividir)

- **O diagnóstico fecha.** O teste faz um `page.goto` + `esperarPronto` por cartão "Não afetado por"; o tempo é soma de esperas, não uma espera travada. Local: 27,5 a 29,9 s; CI: 31,7 s e 30,9 s. O padrão de 30 s vale para o teste inteiro e ficava sem folga. Não há quebra de produto.
- **Dividir por rota/cadência já está feito**: o laço `ROTAS_APLIC` gera um teste por rota, e a semanal já é teste próprio. A divisão seguinte seria por cartão, o que muda a estrutura do teste (a lista de cartões só se conhece depois de abrir a página) e multiplica as cargas iniciais; custo alto para o mesmo cenário.
- **Risco de mascarar lentidão real: baixo.** Lentidão do painel é guardada pelo orçamento de performance (ADR 0003, projeto `perf` e testes de tempo, práticas seção 4), que têm limite próprio e explícito. O IF-A verifica a veracidade do texto "Não afetado por"; o timeout dele mede só a duração da varredura. O teto de 120 s (4x) cobre o crescimento do número de cartões sem esconder travamento: espera individual segue limitada pelos timeouts de `esperarPronto`/`expect`.
- Gates não afrouxados (cobertura, lint, tipos, e2e inalterados; práticas, seção de CI).

## Checklist (leitura)
1. Faz o que o cartão pede, nem mais nem menos: sim.
7. Teste: asserção e anotação `verificados` preservadas; determinismo não muda.
9. Commit: `fix(e2e)` em português, uma mudança coerente. Detalhe menor: a mensagem diz "/tatico ~26 s" e o comentário "25 s"; sem ação.

## Recomendado (não bloqueia)
- Cartão futuro: o tempo do IF-A cresce linearmente com o número de cartões complementares. Se passar de ~60 s, paralelizar as navegações (páginas em paralelo no mesmo contexto) em vez de subir o teto de novo.

Segurança, pipeline e IaC: sem alcance neste diff. O QA roda a suíte E2E antes do push.
