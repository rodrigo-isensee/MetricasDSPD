---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t7-sem-limite
commit: 41c275ef2936f483cdfa0ca2f9a07f64e76e53c0
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: T7 sem limite de frentes (105, E7.498, review E7.505, revalidação E7.512)

Passada única de `6fb535ed` (Base-sha) até `7626f762`. 5 arquivos, +17/-50, dentro do teto M14.

## Revalidação (E7.512, head 41c275ef)
Delta lido: `forge-check parecer delta docs/reviews/105-t7-sem-limite.md`, intervalo `7626f762..41c275ef`, no domínio só `web/src/features/tatico/components/CartaoT7.tsx` e `web/src/features/tatico/tatico.test.tsx`.
- `CartaoT7.tsx`: saiu o terceiro `NumeroGrande` ("sem limite" / "limite de frentes simultâneas"), que repetia o status do cartão; a grade passa a `sm:grid-cols-2`; o rótulo vira "projetos com frentes em andamento", com o `textoCompleto` coerente. Resolve o A1 (em `4c6e056a`); sem achados novos.
- `tatico.test.tsx`: afirma "Sem limite de frentes", a ausência de "sem limite" e o rótulo novo; o teste acompanha a mudança e guarda contra a volta do indicador repetido.
- Suíte: sem PR, fica para o CI do PR; cito o PQ do autor (`pnpm run pronto` com só um timeout alheio). Não afirmo CI verde. A rodada local do teste do T7 não rodou nesta worktree (o sandbox recusou a escrita do `.vite-temp`).

## Leitura
- **Faz o que a decisão do dono pede (17/11).** `CartaoT7.tsx`: o status do cartão é fixo "Sem limite de frentes" com `statusMeta="sem-meta"`, sem `StatusMeta` de acima/dentro. Nenhuma leitura de `acimaDoLimite` ou `limiteFrentes` sobra no front.
- **Back-end intacto.** O diff não toca `server/` nem `contratos`.
- **Nota.** `notas.ts`: meta passa a "Sem limite de frentes, por decisão do dono."; coerente com o cartão.
- **Testes.** `ramos.test.tsx` cobre `acimaDoLimite = true` na fonte sem comparação nem selo; `tatico.test.tsx` cobre o texto do cartão.
- **Regras invioláveis.** Só texto de tela; sem pessoa, sem mistura de fontes, sem cálculo novo.

## Achados
