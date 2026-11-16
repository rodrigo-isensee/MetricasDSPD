---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t3-tela-sem-zero
commit: 6d5137f9fadd79e9fe5a5451fb04941bcc9fa33f
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: tela do T3 e do T7 sem zero (105, E7.98; review E7.141)

**Veredito: aprovado.** Os dois achados do review do PR 481 estão resolvidos. O T3 sem acordado não mostra mais "desvio 0 p.p.", e a leitura deixa de dizer "menos de 20 itens" quando a amostra está ok. O T7 sem limite mostra "Limite não definido". Ficam três recomendados, nenhum bloqueante.

Escopo: diff `2c56d33b...6d5137f9`, 6 arquivos, 45 linhas a mais e 17 a menos (dentro do teto M14). Um comportamento só: nulo de referência na tela do T3 e do T7.

## Conferência pedida no brief
- **Nenhum nulo vira 0 na tela.** O `?? 0` do desvio saiu (`CartaoT3.tsx:118`). Desvio nulo omite o trecho, e acordado nulo também, tanto no ramo `ok` quanto no de amostra insuficiente. A leitura só cita naturezas com acordado, desvio e percentual publicados, e o filtro (`:31`) garante os `as number` da linha 42. `quantidade` não é nula no contrato (`packages/contratos/src/schemas.ts:416`). No T7, a única mudança é o texto do status.
- **Testes de ausência.** Reli os alvos. `/desvio [+\d-]/` casa a forma antiga `desvio 0 p.p.`. `/acordado/` casa o trecho `· acordado …` do `<span>` (um nó de texto só), e `/menos de 20 itens entregues/` é o texto exato da leitura que sai. Os testes não se apoiam só na ausência: cada um afirma também o que aparece (`realizado 51`, `realizado 10`, `10 itens` ×3, `como a capacidade foi dividida`, `Limite não definido`).
- **CartaoMetrica (compartilhado).** Não muda. O T7 usa a prop `textoStatus`, que já existia (`CartaoMetrica.tsx:81` e `:449`) e só substitui o texto do `StatusMeta`. É o único chamador com essa prop (grep em `web/src`), então os outros cartões não são afetados.
- **Escopo.** Faz o que o E7.98 pede. Remover a série Acordado do gráfico quando nenhuma natureza tem acordado vai além do pedido, mas segue a D-T3b ("T3 nao precisa comparar com o combinado"). Aceito, com o A1.
- **Teste do servidor.** Só o nome mudou ("= nulo"). A asserção já esperava `limite_frentes: null`.
- **Regras invioláveis.** Nenhuma afetada. A mudança é de apresentação, sem cálculo nem mistura de fontes.

## Ferramentas e mutantes
- Rodei na worktree, em 6d5137f9: `vitest run src/features/tatico/tatico.test.tsx src/features/tatico/ramos.test.tsx` deu 2 arquivos e 32 testes passando.
- M1, `...(semAcordado` trocado por `...(false` (série Acordado sempre presente): **sobrevive** (32 passaram). Ver A1.
- M2, leitura `ok` volta a "menos de 20 itens", com M3, linha do `textoStatus` do T7 removida: **morrem** (3 falhas: ramos T3, tatico T3 E7.62 e tatico T7 E7.62).
- M4, desvio volta a `fmtNumero(m.desvioPP ?? 0, 1)`: **morre** (2 falhas: ramos T3 e tatico T3 E7.62).
- Suíte inteira: fica para o CI do PR 488 (seção CI abaixo).

## Achados
- A1 (recomendado) web/src/features/tatico/components/CartaoT3.tsx:94 · A remoção da série Acordado quando nenhuma natureza tem acordado não tem teste: o M1 sobrevive, porque `/acordado/` é sensível a maiúsculas e não alcança a legenda "Acordado". Sugestão: afirmar no teste E7.62 que a legenda e a descrição do gráfico não citam acordado (`/acordado/i`).
- A2 (recomendado) web/src/features/tatico/components/CartaoT3.tsx:46 · No caso misto (alguma natureza com acordado, mas nenhuma com desvio publicado), a leitura diz "sem comparar com o combinado" enquanto o gráfico mostra a série Acordado. Hoje o caso não ocorre com dado real. Sugestão: tratar junto com o lote do T3 real (D-T3b), que tira a comparação de vez.
- A3 (recomendado) web/src/features/tatico/notas.ts:25 · A nota "contra o acordo", a meta "Desvio máximo de 10 p.p." (`notas.ts:29`, `catalogo-metricas.ts:166`) e o `aria-label="Desvio por natureza"` (`CartaoT3.tsx:110`) ficam no cartão sem acordado. Isso vai para o lote do T3 real (D-T3b).

## Sem teste
Nada além do A1.

## CI
- Run de push 43850842038 (CI, 6d5137f9): `completed:success`.
- Run do PR 488 (43851320577): ainda `queued` quando este parecer foi gravado. O merge depende dele (`R-FLUXO`).
