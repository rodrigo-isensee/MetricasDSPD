---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o26-motivo-data
commit: 97d972c2fc1bc993844b91488a014e093c4ff62f
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: O26 sem dado real com motivo próprio e a data (E7.55)

## O que foi conferido
- Diff `ffc59d8a...97d972c2`: 1 commit (`97d972c2`), 4 arquivos, 36 linhas de código e teste (dentro da orientação de 150, M14), um comportamento só.
- **Decisão 2 do dono de 16/11** ("A, mostra a partir de qual data ele vai ter dado real e o motivo"): o O26 segue `sem-dado` e ganha `MOTIVO_O26_HISTORICO_RESPONSAVEIS` em `MOTIVO_ORIGEM_MOCK` (`packages/contratos/src/origem.ts:145`); a frase diz o motivo (histórico de troca de responsável desde 09/11/2026, métrica precisa de 12 semanas) e a data (01/02/2027).
- **Constantes nomeadas com a origem.** `O26_INICIO_HISTORICO_RESPONSAVEIS` (`origem.ts:130`) e `O26_DATA_DADO_REAL` (`origem.ts:132`), cada uma com comentário do pedido, da etapa e da data ISO; a frase é montada delas, sem literal repetido. 2026-11-09 + 84 dias = 2027-02-01: a conta do comentário confere.
- **Nada calculado.** As duas datas são literais de exibição; nenhum cálculo do O26 muda, nada passa a ser publicado e a regra de 12 semanas e a dos 20 itens seguem na biblioteca. Sem pessoa, sem mistura de fontes.
- **Frase completa.** Começa com maiúscula e termina em ponto, como o comentário de contrato diz e o componente exibe como está; o texto é do UX (E7.58, revisão própria).
- **Testes.** `origem.test.ts` afirma origem `sem-dado`, o motivo pela constante, a frase inteira literal (protege contra mudança silenciosa da data) e o `corpoSemDadoReal`; o teste antigo "O26 ... sem motivo próprio" foi relido e o O26 saiu da lista de ausência, que segue com T1, E1 e VISAO_GERAL. `web/.../origem.test.tsx` confere `origemDoCartao('O26','api')` com o motivo. Rodado: `vitest run src/origem.test.ts` em `packages/contratos`, 26 passaram. Mutante: tirei `O26: MOTIVO_O26_HISTORICO_RESPONSAVEIS` de `MOTIVO_ORIGEM_MOCK`; o teste do O26 falhou (1 de 26, morto); fonte restaurada, árvore limpa. Os outros usos de "fonte real ainda não definida" nos testes do web não falam do O26.
- **CHANGELOG fora do topo.** A linha entra no fim de `### Adicionado` de `[Não publicado]` (`CHANGELOG.md:95`), sem mexer no topo; comentários de `MOTIVO_ORIGEM_MOCK` e `MOTIVO_FONTE_REAL_NAO_DEFINIDA` atualizados (O26 saiu da lista do genérico).
- Suíte: CI verde em `97d972c2`, run `43830333247` (push) e `43830480047` (PR 480); citado, não rerrodado.
- Commit: Conventional Commits em português, escopo e pedido no assunto.

## Achados
Nenhum.

## Riscos e pendências fora do review
- A data é fixa: em 01/02/2027 o motivo passa a dizer uma data já vencida enquanto o O26 não entrar no mapa real. Ligar o O26 ao dado real nessa data é trabalho novo (pedido próprio), não deste PR.
