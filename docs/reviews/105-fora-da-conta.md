---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-fora-da-conta
commit: 6e7dfe71a529abfaf0e66a843d2265f63905b527
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: nota do cartão vazio abre com "Fora da conta:" (K-404, E7.488)

## Escopo lido
Diff `ca6a1281...6e7dfe71`: 12 arquivos, 51 adições e 28 remoções (dentro da orientação de 150 linhas), um comportamento só. Arquivos: `estrategicas.tsx` (E6), `operacionais.tsx` (O19, O25), `sustentacao.tsx` (S8, S11), `CartaoS1.tsx`, `CartaoS5.tsx`, `CartaoS6.tsx`, `CartaoS7.tsx`, `comuns.tsx` (`NotaForaDoFluxo` com `vazio`), `CartaoT9.tsx`, os dois testes e o fragmento `changelog.d/fix-105-fora-da-conta.md`.

## Leitura
- Faz o que a decisão A do dono pede: só o `complementoVazio` recebe o prefixo (parâmetro `vazio` com padrão `false`); o corpo com dado chama as mesmas funções sem o parâmetro e não muda. O25 vazio troca "Aviso de preenchimento:" por "Fora da conta:"; S1 vazio põe a nota antes da frase da escala. Os dez cartões citados estão cobertos.
- Sem lógica de cálculo tocada; nenhuma regra inviolável alcançada (só texto de interface). Sem dado de pessoa, sem segredo.
- Testes: rodei `vazio-nota-exclusao.test.tsx` e `tatico/ramos.test.tsx`: 2 arquivos, 45 testes passam. O PQ do autor é `pnpm run pronto` rc=0. Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde.
- `docs/engineering/praticas.md`: nenhuma regra "decidida por: leitura" além do checklist alcança estes arquivos.

## Achados
- A1 (recomendado) web/src/features/complementares/vazio-nota-exclusao.test.tsx:134 · a regex do S1 (`/Fora da conta: 2 de outras escalas/`) não ancora a ordem; um mutante que deixe a nota depois de "Mede só os chamados..." (o texto do ramo com dado) passa. Sugestão: `^Fora da conta:` como nos demais casos.
- A2 (recomendado) web/src/features/complementares/vazio-nota-exclusao.test.tsx:67 · E6 sem `^`, ao contrário dos outros casos; mesma sugestão.
- A3 (recomendado) web/src/features/complementares/estrategicas.tsx:196 · E6 e T9 vazios leem "Fora da conta: 2 projetos ... ficaram fora desta conta", redundante. Texto é decisão do UX; fica para a revisão de interface.

## UX
O parecer `docs/ux/105-revisao-fora-da-conta.md` ainda não existia em /home/rodrigoisensee/MetricasDSPD-065 na hora deste review; não foi commitado aqui.
