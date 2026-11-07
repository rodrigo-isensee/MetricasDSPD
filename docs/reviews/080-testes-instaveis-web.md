---
tipo: review
contrato: 1
pedido: 080-testes-instaveis-web
branch: feature/080-testes-instaveis-web
commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---

# Code review: testes instáveis da web (K-173 e K-192)

**Veredito: aprovado.** Sem achado bloqueante.

Diff de 852b9406 a 6b7b3f5: um arquivo, `web/src/features/complementares/LeiaJunto.tsx`, 2 linhas a mais e 2 a menos (4 de 150 do teto M14), só classes de estilo (`gap-y-1`). Um comportamento só. `server/`, `packages/` e `.github` sem diff. Nenhuma regra do axe, timeout ou retry foi mexido (escopo, "Fora do escopo").

## K-173
O teste do O20 em `operacionais.test.tsx` (linhas 170 a 178) já espera a renderização com `waitFor` antes de ler a marca de critério. A evidência (nada a mudar, 20 rodadas sem falha) basta para fechar o cartão sem código, como o item E1 prevê.

## K-192
Sem reprodução (72 de 72 execuções, alvos de 24 e 44 px já conformes). O `gap-y-1` só separa linhas quando a lista quebra (4 px) e não afrouxa a regra; é endurecimento aceitável como está. A revisão de interface (E1.4) cobre a mudança visual e corre em paralelo.

## Ferramentas e testes
- Rodei `leiajunto.test.tsx` (arquivo tocado): passou. Cobertura medida só com esse arquivo: 83% de linhas em `LeiaJunto.tsx` (o limite de 100% é da suíte inteira, que é do QA); o diff não altera ramos, e a CI do push passou (run 42365672784).
- Guardas mudadas: nenhuma (só classes CSS), então sem mutante declarado.
- Segurança, dados pessoais e regras invioláveis do projeto: não alcançadas pelo diff.

## Achados
- A1 (recomendado) web/src/features/complementares/LeiaJunto.tsx:38 · sem teste que prove o `gap-y-1`; é classe de estilo e a prova fica com o E2E L3-01 e a revisão de UX, então não devolve.
