---
tipo: review
contrato: 1
pedido: 105-recs-web-testes
branch: fix/105-recs-web-testes
commit: 9592ebe2ef9f9bbe86c1019ec7190abe3856dd84
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: testes recomendados da tela (E3.61)

Escopo: head 9592ebe2, três arquivos: `web/src/features/tatico/ramos.test.tsx` (+32), `web/src/features/sustentacao/notas.test.ts` (+33, novo) e uma linha no `CHANGELOG.md`. Nada de produção mudou.

**Ferramentas (citadas):** CI do head (run 43767575514) concluído com sucesso. Rodei os dois arquivos de teste novos: 2 arquivos, 18 testes passaram.

## Leitura

- `ramos.test.tsx`: a fronteira n=20 (sem SLE publicado, já não é amostra insuficiente) e n=19 (insuficiente, "19 de 20 itens mínimos") cobre os dois lados do limite; troca de `>=` por `>` faz o caso n=20 falhar. O teste percorre os itens com `getAllByTestId(/^t2-/)` e confere cada um, sem fixar a página inteira.
- `notas.test.ts`: os prazos corridos e úteis saem de `acelerato.ALVOS_PADRAO` e são comparados com o texto do S1. Fixa só duas frases do texto (as que carregam a regra), não o texto inteiro; se a unidade de um prazo mudar, o teste falha e obriga a revisar o texto. Nota de leitura: o `toHaveLength(ALVOS_PADRAO.length * 2 - 3)` depende de a lista dos corridos ter 3 itens, que o teste anterior já afirma; coerente.
- Fragmento do CHANGELOG presente e descritivo.

## Achados

- A1 (recomendado) web/src/features/tatico/ramos.test.tsx:49 · o `for` sobre os itens passa em silêncio se `getAllByTestId` voltar um item só; aceitável (a consulta já falha com zero itens), sem ação.

## Delta

Primeira revisão, sem delta anterior.
