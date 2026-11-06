---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l5a-tela
commit: 6d4a392cf75ecf6c9f3c9c5589fc5ac878335991
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 075 L5a, motivo "não classificado" em BLOQUEADOS, O2 e O19 (K-204), segunda volta

## Parecer

Aprovado em `6d4a392c`. A segunda volta resolve o A1 deste review e os achados médio 1 e baixos 3 e 4 da revisão de interface (`docs/ux/075-revisao-l5a.md`). A exceção do médio 2 fica aceita (motivo abaixo). A especificação e a revisão de UX entraram na branch (`c65970ca`), o que fecha o A2 anterior. O parecer cobre também o O19 da E4 (P-075-8).

## O que foi lido (delta `0779d528...6d4a392c`, 3 commits)

Os arquivos fora do delta ficaram como já lidos no parecer anterior, em `7724d087`.

- `CartaoO2.tsx:71`: `naoClass = !semBloqueio && ...`. Com a nota `bloqueio-sem-dado-real`, o apoio não aparece mais sob "Sem dado real". A1 resolvido.
- `operacionais.tsx`, `leituraO19`:
  - A leitura cita o maior motivo classificado.
  - Quando o "não classificado" passa dele, a leitura acrescenta "Bloqueio sem motivo classificado somou N dias úteis em M bloqueios" (médio 1, CA-2).
  - Quando só existe "não classificado", lê "Bloqueio sem motivo classificado somou N dias" (baixo 3, CA-1).
  - Com `totalDiasUteis` 0, não há leitura.
  - Só usa valores publicados (`diasUteis`, `bloqueios` e `pctDoTotal` do `ResultadoO19`). A tela compara dois valores do DTO para decidir se cita a lacuna, sem soma, razão nem percentual calculado (T2.5).
- `motivo-nao-classificado.test.tsx`:
  - Afirma o `aria-describedby` do O2 e do O19, a série hachurada (`fill` com `url(#`) e a leitura com a lacuna (baixo 4).
  - Casos de borda novos: período sem dias bloqueados (o texto procurado existe no componente, checklist 11) e só "não classificado".
- `docs/ux/075-bloqueios-reais.md` e `docs/ux/075-revisao-l5a.md`: só texto, commitados pelo autor da volta.
- `server/` e `packages/`: sem diff no lote inteiro (`da61dbc2...6d4a392c`).

## Exceção do médio 2 da UX (rótulo do eixo do O19 sem itálico nem ícone)

Aceita. A CA-4 pede que o "não classificado" não dependa só de cor, e no O19 pede hachura ou contorno nas barras. A barra já se distingue pelo texto "não classificado" no rótulo, pela hachura e pela legenda própria, e a linha da tabela do mesmo cartão traz itálico e ícone. Para pôr itálico e ícone no eixo, seria preciso um tick próprio no `Barras` compartilhado, o que muda um componente usado por outros cartões e é outro comportamento, fora deste lote. Fica como recomendação (A3).

## Ferramentas

- CI do push no head `6d4a392c` (run 42273825887): workflow CI, evento `push`, `completed`/`success`.
- Testes dos arquivos tocados (D-5), com `vitest run --maxWorkers=2` em `web` (`motivo-nao-classificado`, `operacionais` e `bloqueio-sem-dado`): 3 arquivos e 58 testes, todos verdes.
- Teto M14: 317 linhas no web (298 adições e 19 remoções; código 155, teste 162). A exceção fica aceita:
  - O lote tem um comportamento só, a marca do 8º motivo nos três cartões que o mostram.
  - As 42 linhas a mais desde a primeira aprovação vêm das correções pedidas pelo review e pela UX.
  - Mais da metade do lote é teste dos CA.
  - Dividir separaria o componente compartilhado dos seus usos ou o teste do código que ele cobre.

O corpo do PR leva esta linha:

teto: excedido, 317 linhas, um comportamento (marca do motivo não classificado em BLOQUEADOS, O2 e O19), mais da metade é teste dos CA e o acréscimo veio das correções de review e UX

## Achados

- A3 (recomendado) web/src/features/complementares/operacionais.tsx:156 · Rótulo do eixo do O19 sem itálico nem ícone (médio 2 da UX), aceito como exceção: hachura, texto e legenda distinguem. Se o Barras ganhar tick customizável, igualar à tabela num cartão próprio.
- A4 (recomendado) web/src/features/operacional/components/CartaoO2.tsx:71 · O apoio do motivo depende de haver "não classificado" entre os 10 itens listados (baixo 5 da UX); o QA do 5a confere o comportamento com a ordenação por "Sem mover há".
