---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o25-aviso-vazio
commit: f509357af95b3a8b5aea2ac28a0d405e15592a35
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-o25-aviso-vazio (K-399, E7.465)

Objetivo: O25 em estado vazio (base.n = 0) mostra o aviso de preenchimento (cards com motivo de descarte fora da taxa). Diff lido: `origin/fix/105-vazio-nota-exclusao...f509357a` (3 arquivos). Sem cálculo novo: o texto virou o helper `notaPreenchimentoO25(n)` (null com n <= 0), usado no corpo e em `complementoVazio`; mesmo texto e testid.

## Achados


## Critério → teste → resultado
Correção sem especificação de UX nova; a obrigação é o objetivo do brief.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Vazio com itens de fora mostra o aviso, texto e testid iguais aos do corpo | vazio-nota-exclusao.test.tsx, "O25: vazio com itens de fora mostra a nota" | vazio (n = 0) com contagem 2 | passou |
| Vazio sem itens de fora não mostra o aviso | "O25: vazio sem itens de fora..." | contagem 0 (n <= 0) | passou |
| Corpo com dados mantém o aviso (refatorado para o helper) | suíte existente do O25 (CI do PR) | n/a | não rodei; vale o PQ do autor |

## Cenários e resultado real
- Local, head f509357a: `vitest run vazio-nota-exclusao.test.tsx` 18 de 18 passam.
- Vermelho antes do verde (à mão; o `forge-testes` é Python e não mapeia `web/`): `operacionais.tsx` do K-373 (`origin/fix/105-vazio-nota-exclusao`) com o teste novo: 1 falha, 17 passam. Falhou "O25: vazio com itens de fora mostra a nota"; o caso "sem itens de fora" passa, como esperado. Arquivo restaurado ao head depois (árvore limpa).
- Sem navegador: o teste renderiza o cartão em jsdom (`data-estado="vazio"`) e confere texto e testid.
- Mutação: sem ferramenta gratuita configurada; o par com/sem cobre a guarda `n <= 0`.
- Suíte inteira: fica para o CI do PR (não afirmo CI verde); cito o `pronto` rc=0 do autor.
