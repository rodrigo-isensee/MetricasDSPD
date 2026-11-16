---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: f01fabf6cfdabd7463e86105d2a6e7775b0cd049
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-o12-responsabilidade (O12 pela Responsabilidade do Atraso, campo 51, E7.214)

Sem especificação de UX nem contrato de API novos: as obrigações vêm do brief (E7.214). Há PR (499). Heads anteriores (`27453898`, `1561e1b4`) foram superados; o CI que vale é o do head `f01fabf6` (volta 2, abaixo).

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| O-1: campo 51 no domínio com 137 Interno, 138 Solicitante, 139 Terceiro; o 42 (pessoa) fica fora | dominio-businessmap.test.ts "E7.214: o campo 51..." | máximo (3 opções), proibido (42 ausente) | passou (rerrodado no head f01fabf6) |
| O-2: casamento pelo value_id; id fora do catálogo vira desconhecido | allow-list.test.ts "E7.214: campo 51..." (137, "139" texto, 999) | fora do limite, tipo número/texto | passou (rerrodado no head f01fabf6) |
| O-3: teste pg do domínio com os campos 48, 49 e 51 | dominio-businessmap.pg.test.ts (476) | n/a | passou no CI (job banco do head; sem PostgreSQL local) |
| O-4: RESPONSABILIDADE_ATRASO_COM_FONTE = true e motivo com "a contagem começa em 16/11/2026", minúsculas, sem ponto | origem.test.ts "E7.214: o interruptor está ligado..." | formato do motivo | passou (rerrodado no head f01fabf6) |
| O-5: sem nenhum vencido classificado não publica "0 internos": responsabilidade e causa interna nulas, motivo, `sem-referencia` | fixtures.cobertura.test.ts "C5-o12-zero-falso" | vazio (0 classificados) | passou (rerrodado) |
| O-5b: interruptor desligado com campo 51 preenchido: responsabilidade nula com o motivo, nunca 0, meta `sem-referencia`, acordos e vencidos seguem; ligado, o mesmo dado publica causa interna 1 | fixtures.cobertura.test.ts "O12 (E7.214, interruptor desligado)" | interruptor (liga/desliga), nulo x 0 | passou (rerrodado) |
| O-6: com classificação parcial publica; vencido sem campo vira `naoClassificado`; meta avaliada | fixtures.cobertura.test.ts "com o campo 51 vindo em parte..." | mínimo (1 classificado), parte não classificada | passou (rerrodado) |
| O-7: causa interna > 0 aciona meta `fora` | fixtures.cobertura.test.ts "vencido de causa interna aciona a meta" | limite 0 x 1 | passou (rerrodado) |
| O-8: versão de critério O12 e VISAO_GERAL; O8, O14, O17 e a dos motivos de bloqueio mantidas depois da junção | fixtures.cobertura.test.ts "T2.6, E7.214"; `criterios.ts` conferido | n/a | passou |
| O-9: tela mostra número e faixa com link "Ver O12" (OP-17, B3-002) | e2e b12-fluxo OP-17 e B3-002 | dado real da base fictícia | passou no CI do head (e2e-parte 1/2 e 2/2 verdes); não rerrodado local |

## Cenários e resultado real
Ambiente: worktree desanexada, Node 24, vitest 5.1.

Vermelho antes do verde (volta anterior; o12.ts, origem.ts e criterios.ts trazidos da base `4cc170b4`, testes do head): 3 falharam. Caíram: "C5-o12-zero-falso" e "T2.6, E7.214" (metricas) e "E7.214: o interruptor está ligado" (contratos). Os testes de domínio e allow-list guardam dados do arquivo e já nascem com ele. `forge-testes` não se aplica (projeto). O teste do interruptor desligado exercita o parâmetro `false` da guarda já provada pelo mutante M1. O delta da volta 2 não traz teste novo do O12.

Mutação no diff (a mão):
| Mutante | Resultado | Quem matou |
|---|---|---|
| M1: `publica` sempre verdadeiro (remove a guarda "algum classificado") | morto | C5-o12-zero-falso |
| M2: `tot.Interno === 1 ? 'dentro'` (meta invertida) | morto | "com o campo 51 vindo em parte" e "vencido de causa interna aciona a meta" |
Dois de dois mortos, nenhum sobrevivente. `o12.ts` não mudou na volta 2.

Bordas lidas no código: com só Solicitante ou Terceiro classificados e Interno 0, publica e a meta fica `dentro` (decisão coerente com o brief: o dado existe). Valor `desconhecido` do campo não soma em Interno, Solicitante nem Terceiro, então não conta como classificado.

## Revalidação (volta 1, head 1561e1b4)
Intervalo `27453898..1561e1b4`: o teste "interruptor desligado" e o campo 51 (domínio, allow-list, testes pg e unitário). Local: metricas fixtures.cobertura 36 de 36; contratos origem.test 26 de 26; server dominio-businessmap, allow-list e metricas.mapa 138 de 138.

## Revalidação (volta 2, head f01fabf6, merge da develop)
`forge-check parecer delta`: intervalo `1561e1b4..f01fabf6`; no domínio: CHANGELOG, `businessmap-dominio.json`, `fixtures.cobertura.test.ts`, `criterios.ts`, `dominio-businessmap.test.ts` e `dominio-businessmap.pg.test.ts`. O resto veio da develop (campos 48 e 49, régua, 11 motivos de bloqueio, K-382). Conferido depois da junção: o campo 51 segue no JSON de domínio (`responsabilidade_atraso`, value_id 137, 138 e 139; o 42 ausente) e as versões de critério do O12, O8, O14 e O17 seguem em `criterios.ts`, junto com a dos motivos de bloqueio.
Rodado local no head: metricas `fixtures.cobertura` e `core`, 130 de 130 (8 arquivos); contratos `origem.test`, 26 de 26; server `dominio-businessmap`, `allow-list` e `metricas.mapa`, 138 de 138.
CI do head `f01fabf6`: run do PR 43924359355 `success` (testes, banco, seguranca, openapi, rapida, build, imagem, filtro, e2e-parte 1/2 e 2/2, e2e) e run do push 43924342956 `success`. O teste pg (476) e o e2e OP-17 e B3-002 valem por esse CI.

## Bugs
Nenhum.

## Melhoria vista
nenhuma
