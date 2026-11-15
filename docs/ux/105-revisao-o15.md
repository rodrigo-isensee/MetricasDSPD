---
tipo: revisao-ux
pedido: 105-melhorias-15-11
etapa: E7.28
branch: feature/105-o15-fase-deteccao
commit: d7059234
parecer: aprovado com ressalvas
revisor: ux-designer
data: 2026-11-15
---

# Revisão de UX: O15 com fase de detecção por dado real (E7.28)

Contra `docs/ux/105-o15-cartao.md` (CA-1 a CA-11). Arquivos: `CartaoO15.tsx`, `notas.ts`, testes `semanal.test.tsx:316-387`. Toda a análise é `lido` (código e testes); nada `medido`.

## Parecer
**Aprovado com ressalvas.** Os textos, a ordem e os testids seguem a especificação ao pé da letra. Não há achado crítico nem alto. Há um achado médio: bugs fora da conta ficam invisíveis quando nenhum bug tem fase.

## Conformidade

| CA | Resultado | Evidência (`lido`) |
|---|---|---|
| CA-1 | Confere | `o15-fora` com N, M = `base.n + bugsSemFase` e segunda frase, abaixo do texto fixo e antes dos números (`CartaoO15.tsx:62-71`); teste `:338` |
| CA-2 | Confere | `textoFora` singular/plural (`:24-28`); teste `:344` |
| CA-3 | Confere | só com `bugsSemFase > 0` (`:65`); teste `:350` |
| CA-4 | Confere | frase antiga ausente; teste `:359` |
| CA-5 | Confere em texto | `montarLeitura` (`:30-42`); testado só com `base.n` = 12, sem teste de `base.n` = 0 |
| CA-6 | Confere | `:37-38`; teste `:365` |
| CA-7 | Confere | `todasNulas` suprime `Barras` (`:50,94`); testado só com taxas insuficientes, falta o caso base >= 20 com todas nulas |
| CA-8 | Confere | singular/plural e "e" antes da última (`:113-119`); testes `:366,376` |
| CA-9 | Confere | `null` repassado ao `Barras`, nunca 0; teste `:371-372` |
| CA-10 | Confere | sem nula, sem linha nem frase; teste `:380` |
| CA-11 | Confere | números e série mensal intactos (`:73-93,120-141`) |
| Nota metodológica | Confere | `notas.ts:98` traz o acréscimo exato da especificação |

Regras do briefing: sem pessoa, ranking, meta ou comparação entre times; só BusinessMap; nota e linha de fases sem contagem são parágrafos de texto sem depender de cor (WCAG 1.4.1), nada novo é interativo (`lido`).

## Achados

**Médio 1. Bugs fora da conta somem quando `base.n` = 0.**
Onde: `useMetrica.ts:66` e `vazio.ts:12`: `ehVazio` é verdadeiro com `base.n === 0`, e o cartão mostra o estado "vazio" sem desenhar o corpo. Com `base.n` = 0 e `bugsSemFase` > 0, a nota `o15-fora` não aparece, e a pessoa lê "sem itens" quando existem bugs do período que não entraram. O comentário em `textoFora` ("`m` tem sempre 2 ou mais") assume isso, e o caso de borda "1 de 1 bug" da especificação (seção 1) fica inalcançável; a frase de leitura "Nenhum bug com fase de detecção no período." também. Por quê: contradiz o objetivo da nota (dizer quantos ficaram de fora, sem frase falsa). Correção: no estado vazio do O15, exibir a nota de fora quando `bugsSemFase` > 0 (ou tratar o O15 como não vazio nesse caso) e usar "bug" no singular quando M = 1; ou o dono confirmar que o vazio basta e a especificação perde o caso de borda. Decisão de produto: levar ao dono (`R-DECISAO`), com recomendação de mostrar a nota.

**Baixo 1. Lacunas de teste.** Sem teste para `base.n` = 0 (CA-5, segunda frase) nem para taxas `ok` com todas as fases nulas (CA-7). Correção: dois casos em `semanal.test.tsx`.

**Baixo 2. Texto longo e repetido.** A segunda frase da nota (três motivos) é estática e aparece em todo cartão com bug fora; aceitável, mas se o dono quiser a quebra por motivo o contrato precisa trazê-la (já registrado na especificação, perguntas abertas).

## Pendente para o usuário
Nenhuma validação de interface nova além do achado médio 1.
