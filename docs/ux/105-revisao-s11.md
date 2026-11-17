---
tipo: revisao-ux
pedido: 105-melhorias-15-11
etapa: E6.33, E6.35
branch: feature/105-s11-avaliacao
commit: a793986d
parecer: aprovado
revisor: ux-designer
data: 2026-11-15
---

# Revisão de UX: S11 com avaliação de Problema pela Decisão 18b (E6.33)

Arquivos: `web/src/features/complementares/sustentacao.tsx` (`CartaoS11`, linhas 258-311), `notas.ts` (S11, linhas 176-184), teste `estados.test.tsx:154-180`. Comparado com o padrão do S5 a S7 (`features/sustentacao/components/comuns.tsx`, `NotaForaDoFluxo`). Toda a análise é `lido` (código e testes); nada `medido`.

## Parecer
**Aprovado com ressalvas.** Os textos são simples, a conversão nunca vira 0 (mostra "sem dado real" na tabela e o motivo logo abaixo), e a nota dos fora do fluxo aparece só quando o número é maior que zero. Sem achado crítico nem alto. Há dois médios de consistência com o S5 a S7 e dois baixos.

## Conformidade
| Ponto do brief | Resultado | Evidência (`lido`) |
|---|---|---|
| Conversão nula mostra "sem dado real", nunca 0 | Confere | `sustentacao.tsx:292`; teste `estados.test.tsx:176` |
| Motivo da conversão visível | Confere, com ressalva (Médio 1) | `:299-301`; teste `:177` |
| Nota dos fora do fluxo só com n > 0 | Confere, com ressalva (Médio 2) | `:302-306`; teste `:178` |
| Sem pessoa, ranking, meta ou comparação entre times | Confere | meta "Sem meta numérica" (`notas.ts:182`) |
| Só Acelerato, sem mistura | Confere | nada de BusinessMap no cartão |
| Informação sem depender de cor (WCAG 1.4.1) | Confere | tudo é texto; nada novo interativo |

## Achados

**Médio 1. O motivo da conversão repete o jargão e vem cru do contrato.**
Onde: `sustentacao.tsx:299-301`. A linha "Conversão sem dado real: a base não tem o vínculo avaliação-problema" usa "Conversão", palavra que a tabela não usa (a linha da tabela se chama "Avaliações que viraram Registro de Problema"), e embute o texto do `motivoConversao` sem tratamento. Por quê: quebra a correspondência com o mundo real (Nielsen) e o texto depende do que o back-end escrever. Correção: abrir com o nome da linha, "Avaliações que viraram Registro de Problema: sem dado real. {motivo}." (motivo iniciando por maiúscula, frase curta, sem "vínculo avaliação-problema" se der para dizer "a base ainda não liga a avaliação ao Registro de Problema"). Vale lembrar que "sem dado" não significa zero, como no S12 (`TEXTO_S12_REINCIDENCIA_SEM_FONTE`).

**Médio 2. A nota dos fora do fluxo não segue o padrão do S5 a S7.**
Onde: `sustentacao.tsx:302-306`. O S5 a S7 usam `NotaForaDoFluxo` (ícone "info", `text-texto-2`, singular e plural, testid, e a frase "Ela vale só para os cinco fluxos do PROC"). O S11 usa `Leia` sem ícone, sem singular ("1 chamados ficaram"), sem testid e com a redação "por não ter fluxo definido (ou ter mais de um)", que não diz de onde vem a regra. Por quê: consistência (Nielsen) e teste sem âncora estável. Correção: reaproveitar `NotaForaDoFluxo` com `testid="fora-fluxo-S11"` (ou o nome que o S5 a S7 usam), ajustando só o fecho para a regra da Decisão 18b se for diferente. Se o texto "outro fluxo" não vale no S11 (chamado de outro fluxo entra pela passagem em "Causa Raiz"), tornar o texto compartilhado parametrizável em vez de duplicar. Pergunta P-S11-1 segue aberta ao dono; a nota deve dizer só o que já é regra.

**Baixo 1. Nota metodológica sem o critério da 18b.**
Onde: `notas.ts:179-181`. "Como se calcula" não diz o que conta como avaliação: no fluxo do PROC, o campo "Avaliação de Problema"; nos fluxos antigo e intermediário, a passagem pela etapa "Causa Raiz". Quem lê o cartão não sabe por que um chamado entra. Correção: acrescentar essa frase, em linguagem simples, e o contorno como "Contorno Aplicado".

**Baixo 2. Lacunas de teste.** Só há teste do caso "conversão nula com 7 fora". Faltam: `semFluxo` = 0 (nota some), `semFluxo` = 1 (singular) e conversão com valor (célula "k de n" ou %). Correção: três casos em `estados.test.tsx`.

## Pendente para o usuário
Nenhuma validação de interface nova. Decisão de produto aberta e já registrada: P-S11-1 (chamado sem fluxo fica fora).

## Revalidação (E6.35)
commit: a793986d. Escopo: só o delta (`sustentacao.tsx`, `notas.ts`, `components/comuns.tsx`, `estados.test.tsx`). Tudo `lido`; nada `medido`.

| Achado | Resultado | Evidência (`lido`) |
|---|---|---|
| Médio 1, motivo da conversão | Resolvido, com resíduo (Baixo A) | `sustentacao.tsx:301` abre com "Avaliações que viraram Registro de Problema: sem dado real." |
| Médio 2, nota dos fora do fluxo | Resolvido | `sustentacao.tsx:303` usa `NotaForaDoFluxo` `variante="sem-fluxo"`; `comuns.tsx:29-39` tem ícone "info", `text-texto-2`, singular e plural, e some com n <= 0; o S5 a S7 seguem com a variante `proc` |
| Baixo 1, critério da 18b | Resolvido | `notas.ts:180` diz o campo próprio no PROC, a passagem por Causa Raiz nos fluxos antigos e "encerrado por contorno é o chamado encerrado com o motivo Contorno Aplicado" |
| Baixo 2, testes | Resolvido (4 casos) | `estados.test.tsx:184-211`: plural, singular, zero e conversão com valor |

Resíduo, **Baixo A**: o motivo vem do contrato (`origem.ts:108`, "aguardando o vínculo do chamado com o Registro de Problema"), em minúscula e sem ponto final. Na tela sai "...sem dado real. aguardando o vínculo ..." (minúscula depois de ponto). O teste usa um motivo próprio com ponto e não pega isso. Correção: capitalizar a primeira letra e garantir o ponto final em `sustentacao.tsx:301`, ou escrever a constante já como frase. Não bloqueia.

## Parecer final
parecer: aprovado. Os dois médios e os dois baixos anteriores estão resolvidos no commit a793986d; sobra um baixo de pontuação do motivo (Baixo A), sem bloqueio.
