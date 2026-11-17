---
tipo: revisao-ux
pedido: 105-melhorias-15-11
etapa: E7.108
branch: feature/105-s11-conversao
commit: 3b9ead50
parecer: aprovado com ressalvas
revisor: ux-designer
data: 2026-11-16
---

# Revisão de UX: S11 com conversão pela decisão registrada (E7.108)

Arquivos: `web/src/features/complementares/sustentacao.tsx` (`CartaoS11`, linhas 259-316), `notas.ts` (S11, linhas 176-184), `estados.test.tsx:159-215`, e o cálculo em `packages/metricas/src/acelerato/s11.ts` para saber o que cada número significa. Tudo `lido` (código e testes); nada `medido` (sem shell nesta revisão).

## Parecer
**Aprovado com ressalvas.** Sem achado crítico nem alto. A regra do dono está respeitada: só Acelerato, sem pessoa, ranking ou meta, e a conversão nunca vira percentual abaixo de 20 avaliações. O caso real de hoje (13 avaliações, todas "Não aplicável") sai como "0 de 13", e esse é o ponto que merece atenção: três médios, todos de texto e de leitura, e três baixos.

## Conformidade
| Ponto do brief | Resultado | Evidência (`lido`) |
|---|---|---|
| Nota "conversão pela decisão registrada no chamado, não pelo vínculo" | Confere no cartão, com ressalva (Médio 2) | `sustentacao.tsx:305`; `notas.ts:180` |
| Contagem dos fora da conversão (`foraDaConversao`) | Confere, com ressalva (Baixo 1) | `sustentacao.tsx:307-308`; `s11.ts:70` |
| Estado insuficiente (menos de 20) sem percentual | Confere, com ressalva (Médio 1) | `celula` mostra "k de n" quando `status` não é `ok` (`sustentacao.tsx:263-264`) |
| Campo novo opcional não quebra o cartão | Confere | `(r.foraDaConversao ?? 0)` (`:307`) |
| Sem pessoa, ranking, meta, comparação entre times | Confere | meta `SEM_ALVO` (`notas.ts:182`) |
| Só Acelerato, sem mistura | Confere | nada de BusinessMap no cartão |
| Informação sem depender de cor (WCAG 1.4.1) | Confere | tudo é texto |

## Achados

**Médio 1. O estado insuficiente da conversão aparece como "0 de 13", sob o cabeçalho errado.**
Onde: `sustentacao.tsx:279-295`. A linha da conversão entra na mesma tabela das taxas de avaliação, cuja coluna se chama "Com avaliação". Para "Avaliações que viraram Registro de Problema", o "0 de 13" lê-se como "zero com avaliação", o que contradiz a linha acima. Além disso, a célula não diz "insuficiente": quem não é técnico lê um zero. Por quê: correspondência com o mundo real e prevenção de erro (Nielsen); é exatamente o caso de hoje (13 avaliações, todas "Não aplicável"). O mesmo risco de "zero" que o painel evita com `CelulaInsuficiente` e `AmostraInsuficiente`. Correção: quando `conversao.status` for `insuficiente`, mostrar na célula "Amostra insuficiente (13 avaliações)" (ou `CelulaInsuficiente`) e, no `Leia` logo abaixo, a explicação no texto simples da seção "Microcopy sugerido". Trocar o cabeçalho da coluna por "Resultado" ou separar a conversão da tabela em um bloco próprio, já que ela não é "com avaliação".

**Médio 2. A nota da conversão está correta, mas é técnica e fixa.**
Onde: `sustentacao.tsx:304-309` e `notas.ts:180`. "Só os fluxos do PROC", "fluxos antigos" e "vínculo" são jargão para quem não é técnico; "Aberto" e "Não aplicável" aparecem em `notas.ts` sem dizer de onde vêm (o campo "Avaliação de Problema" do chamado). A frase "abaixo de 20 avaliações não é publicada" aparece mesmo quando a taxa é publicada, o que confunde, e não diz quantas avaliações há agora. Por quê: reconhecer em vez de lembrar e linguagem do usuário (Nielsen). Correção: duas notas condicionais, texto abaixo. A de insuficiência só com `status` insuficiente e com o n real; a metodológica sempre, mais curta.

**Médio 3. A frase de `comoSeCalcula` do S11 virou um bloco único de cerca de 90 palavras.**
Onde: `notas.ts:180`. Mistura três regras (o que conta como avaliação, o que é contorno, o que é conversão). Por quê: carga cognitiva; a conversão é a parte nova e some no meio. Correção: separar em dois parágrafos curtos (avaliação; conversão), com o texto da conversão como no microcopy sugerido. Se a estrutura do `notas.ts` aceitar só uma string, usar `\n\n` ou dois campos, a critério do front-end.

**Baixo 1. Concordância e clareza da contagem dos fora da conversão.**
Onde: `sustentacao.tsx:307-308`. "1 avaliações de fluxos antigos" (sem singular) e "fluxos antigos" sem dizer por quê. Correção: singular e plural, e a razão ("não têm decisão registrada no campo, então não entram na conta"). Também: a frase vive dentro do `Leia` da conversão, separada da nota `semFluxo` logo abaixo; são dois grupos diferentes (avaliados por etapa x sem fluxo), então manter as duas notas, mas com verbos distintos para não parecerem repetição.

**Baixo 2. Falta teste do estado insuficiente e do `foraDaConversao`.**
Onde: `estados.test.tsx:159-215`. Só há conversão nula e conversão `ok`. Faltam: conversão com `status: 'insuficiente'` (k 0, n 13: a célula não pode mostrar só "0 de 13" nem percentual) e `foraDaConversao` de 0, 1 e 3. Correção: três casos.

**Baixo 3. O ramo `conversao === null` com `motivoConversao` é código morto para o cálculo atual.**
Onde: `sustentacao.tsx:293, 300-302`. `s11.ts:65-69` sempre devolve uma taxa e `motivoConversao: null`. Manter por compatibilidade com o mock é aceitável; só não o considerar o caminho do dado real.

## Microcopy sugerido (texto simples, Português do Brasil)
- Célula, quando insuficiente: "Amostra insuficiente (13 avaliações)".
- Nota de insuficiência (só quando insuficiente): "A conversão ainda não é mostrada: há 13 avaliações registradas e são precisas pelo menos 20. Isto não significa zero."
- Nota do critério (sempre): "Mostra quantas avaliações de Problema terminaram em Registro de Problema aberto. Vale a decisão registrada no chamado, não a ligação entre chamado e Registro. Conta só os chamados dos cinco fluxos do PROC; \"Não aplicável\" entra no total, mas não conta como aberto."
- Fora da conversão: "{n} avaliação(ões) de fluxos antigos ficaram fora da conversão: esses chamados não têm decisão registrada no campo."
- Cuidar de não repetir "PROC" sem definição; o restante do painel já o usa, então manter se o `Leia` do cartão vizinho o explica.

## Pendente para o usuário
Nenhuma validação de interface nova; as decisões do dono (16/11) estão aplicadas. Sugestão: ele confirmar o texto de "Amostra insuficiente" acima, por ser a primeira tela em que a conversão aparece sem número.

## Parecer final
parecer: aprovado com ressalvas. Médios 1 a 3 são de texto e leitura e não bloqueiam a mescla; o Médio 1 vale corrigir antes de o dono ver o cartão com os 13 reais, para não ler "0 de 13" como conversão zero. Revalidação do delta quando o front-end corrigir.
