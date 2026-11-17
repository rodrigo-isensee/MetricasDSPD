---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-fora-da-conta
commit: 22ebb624a5af28e6b3561fd3ee45c09f2e9a42f1
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-fora-da-conta (K-404, E7.489, revalidação E7.495)

Objetivo (decisão A do dono): no cartão vazio a nota de exclusão abre com "Fora da conta:" (O19, O25, E6, S1, S5, S6, S7, S8, S11, T9); com dado nada muda. Sem cálculo novo: o diff só mexe em texto e na prop `vazio`/`complementoVazio`.

## Achados
- A1 (recomendado) web/src/features/complementares/vazio-nota-exclusao.test.tsx:132 · resolvido na volta 1: S1 agora ancorado em `^Fora da conta:`; com a ordem antiga o caso cai.

## Critério → teste → resultado
Sem especificação de UX nova; a obrigação é o brief.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Vazio: nota começa com "Fora da conta:" e sem repetir "fora" (O19, O25, E6, S5, S6, S7, S8, S11) | vazio-nota-exclusao.test.tsx, casos "vazio com itens de fora" | vazio n=0, contagem 2 | passou; vermelho na base (8 de 8) |
| T9 vazio | tatico/ramos.test.tsx "todos os projetos sem início" | vazio | passou; vermelho na base |
| S1 vazio: nota antes da escala | caso S1 | vazio | passou; cai com a ordem antiga (volta 1) |
| Sem itens de fora, sem nota | casos "sem itens de fora" | contagem 0 | passou |
| Com dado nada muda | suítes existentes (sustentacao.test.tsx, complementares) | corpo com dado | passou: `vazio` tem padrão false e só o `complementoVazio` passa true |

## Provas locais (head 6e7dfe71, 1ª passada)
- Vermelho: revertido à base ca6a1281 só o código de produção dos cartões, mantidos os testes: 9 falham (E6, O19, O25, S11, S5, S6, S7, S8 e T9); S1 não caía (A1).
- `forge-testes --vermelho` não se aplica (stack web, sem mapa). Mutação: sem ferramenta gratuita configurada.

## Revalidação (volta 1, head 22ebb624, escopo incremental)
Delta (`forge-check parecer delta`): cartões E6, O25, S5-S7/S11 (NotaForaDoFluxo) e T9 encurtados só no vazio, sem repetir "fora"; testes S1 e E6 ancorados em `^Fora da conta:`. Com dado nada muda (os ramos com `vazio` falso mantêm o texto antigo).
- `npx vitest run src/features/complementares src/features/tatico src/features/sustentacao` (web/): 18 arquivos, 465 testes passam.
- Vermelho do S1: invertida a ordem em CartaoS1.tsx:143 (escala antes de "Fora da conta:"): `× S1: vazio com itens de fora mostra a nota`, 1 falhou, 21 passaram. Arquivo restaurado, árvore limpa.
- Autor: `pronto` rc=0 (citado); suíte inteira e CI ficam para o PR, sem afirmar CI verde.
