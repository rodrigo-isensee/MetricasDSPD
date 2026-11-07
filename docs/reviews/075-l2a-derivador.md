---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l2a-derivador
commit: 2c19b9895c67c803c9beeb5b8ddee660b0630ec2
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 075 L2a, derivador puro de bloqueio por comparação de versões (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 2a" de `docs/analises/075-plano.md` pede, nem mais nem menos: função pura `derivarBloqueios` que, das versões de um card em ordem de `stg_sk`, deriva `inicio` e `fim` só pela mudança de `is_blocked`, sem banco, sem relógio e sem tradução de motivo. Os dois achados são recomendados e não devolvem.

## O que foi lido (diff `d1f22008...2c19b989`, 2 commits)

- `server/src/modulos/businessmap/bloqueios.ts`:
  - Abre: falso para verdadeiro, ou primeira versão já bloqueada (`aberto === null` no início do laço), no `coletado_em` da versão (P-075-2, desenho R5).
  - Fecha: verdadeiro para falso no `coletado_em` da versão (P-075-2).
  - Troca de `block_reason_id` com o card bloqueado não entra em nenhum ramo, então não gera evento (P-075-3b), e o `motivo_codigo` do `inicio` é o da versão que abriu (P-075-10).
- `motivo_codigo` (TL-A3, SEG-A2): inteiro vira texto, e só passa texto que case `^\d{1,10}$`; nulo, ausente, não numérico, fracionário, objeto e 11 dígitos viram `null` com a nota `motivo_codigo_invalido`, nunca o valor lido.
- `id_origem`: sha256 de `card_id|coletado_em` da versão que abriu, truncado em 32 hexadecimais; o `fim` reusa o mesmo, e a reabertura tem outro.
- P-075-9 (fim antes do início vira duração 0) é do Lote 2b (plano, §3 e Lote 2b), que traz os marcos; aqui o fim vem sempre de uma versão posterior, na ordem de entrada. Nada a cobrar neste lote.
- `server/tests/bloqueios.test.ts`, 15 casos, cobre a lista "Testes" do plano:
  - abre e fecha;
  - reabre com dois `id_origem`;
  - troca de motivo sem evento e com o código do início;
  - primeira versão bloqueada;
  - versões repetidas e derivação determinística;
  - CA-075-2: `reason_id` numérico, `'0034'`, nulo, ausente, `'abc'`, 11 dígitos, `1.5` e objeto;
  - CA-075-1: marcadores em `label`, `comment` e `user_id`, e o marcador também no `reason_id`, que não aparecem na saída;
  - coluna do evento como texto, número, ausente e objeto.
- ADR 0029 (proposta): coerente com o código nos itens 1 a 7, sem contradição. Traz critério de reversão (via B escolhida pelo dono, ou prova do 6b com evento perdido). Não é mecanismo novo de fábrica. O número 0029 está livre na develop (última é a 0028).
- Fora do diff: `allow-list.ts` e `coleta.ts` sem mudança, conferido pelo parecer de segurança (`docs/security/075-l2a-derivador.md`, aprovado), que não refaço.
- Regras invioláveis: só BusinessMap, nada individual, nenhum dado de pessoa na saída.

## Ferramentas

- CI do push na ponta `2c19b989`: run 42269882748, `completed`/`success`, `headSha` igual ao revisado. A falha de cobertura do `0251b62e` foi corrigida pelo commit de teste.
- Teste do arquivo tocado (D-5): `vitest run tests/bloqueios.test.ts --maxWorkers=2` em `server`: 1 arquivo, 15 testes, todos verdes.
- Teto M14: código e teste somam 100 linhas (`bloqueios.ts` 50, teste 50); a ADR `.md` fica fora. Abaixo de 150, um comportamento só.

## Achados

- A1 (recomendado) server/src/modulos/businessmap/bloqueios.ts:29 · `_marcos` e `_mapaCampos` com `void` são parâmetros sem uso até o 2b; aceitos porque seguem a assinatura do plano; o 2b os usa ou remove.
- A2 (recomendado) server/src/modulos/businessmap/bloqueios.ts:17 · `is_blocked` ausente ou fora de true/1 conta como desbloqueado e fecha o bloqueio aberto, sem nota; no 2b, decidir entre ignorar a versão e anotar por código, com teste.
