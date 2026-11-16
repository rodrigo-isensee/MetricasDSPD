---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: 1561e1b4010956b35837823b33bc9baccc588a70
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-o12-responsabilidade (O12 pela Responsabilidade do Atraso, campo 51, E7.214)

Sem especificação de UX nem contrato de API novos: as obrigações vêm do brief (E7.214). Sem PR: a suíte inteira fica para o CI do PR. Isto não é o check `bateria` do PR. CI do push do head anterior `27453898` (run 43896506195): testes, banco, seguranca, openapi, rapida, build, imagem e filtro verdes; e2e e perf pulados no push. CI do push do head `1561e1b4`: run 43915576101 terminou `cancelled` (substituído pelo push seguinte da segurança): banco, build, imagem, seguranca, openapi, rapida e filtro verdes; `testes` cancelado no passo cobertura, sem veredito. Não afirmo CI verde do head; o run do push seguinte (43917198173, mesmo código, só doc) é o que decide.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| O-1: campo 51 no domínio com 137 Interno, 138 Solicitante, 139 Terceiro; o 42 (pessoa) fica fora | dominio-businessmap.test.ts "E7.214: o campo 51..." | máximo (3 opções), proibido (42 ausente) | passou (rerrodado no head) |
| O-2: casamento pelo value_id; id fora do catálogo vira desconhecido | allow-list.test.ts "E7.214: campo 51..." (137, "139" texto, 999) | fora do limite, tipo número/texto | passou (rerrodado no head) |
| O-3: teste pg do domínio com 3 campos | dominio-businessmap.pg.test.ts (3 campos, 402 linhas) | n/a | passou no CI (job banco; sem PostgreSQL local) |
| O-4: RESPONSABILIDADE_ATRASO_COM_FONTE = true e motivo com "a contagem começa em 16/11/2026", minúsculas, sem ponto | origem.test.ts "E7.214: o interruptor está ligado..." | formato do motivo | passou (rerrodado no head) |
| O-5: sem nenhum vencido classificado não publica "0 internos": responsabilidade e causa interna nulas, motivo, `sem-referencia` | fixtures.cobertura.test.ts "C5-o12-zero-falso" | vazio (0 classificados) | passou |
| O-5b (volta 1): interruptor desligado com campo 51 preenchido: responsabilidade nula com o motivo, nunca 0, meta `sem-referencia`, acordos e vencidos seguem; ligado, o mesmo dado publica causa interna 1 | fixtures.cobertura.test.ts "O12 (E7.214, interruptor desligado)" | interruptor (liga/desliga), nulo x 0 | passou |
| O-6: com classificação parcial publica; vencido sem campo vira `naoClassificado`; meta avaliada | fixtures.cobertura.test.ts "com o campo 51 vindo em parte..." | mínimo (1 classificado), parte não classificada | passou |
| O-7: causa interna > 0 aciona meta `fora` | fixtures.cobertura.test.ts "vencido de causa interna aciona a meta" | limite 0 x 1 | passou |
| O-8: versão de critério O12 e VISAO_GERAL; O8, O14, O17 mantidas | fixtures.cobertura.test.ts "T2.6, E7.214"; `criterios.ts` sem mudança no delta | n/a | passou |
| O-9: tela mostra número e faixa com link "Ver O12" (OP-17, B3-002) | e2e b12-fluxo OP-17 e B3-002 | dado real da base fictícia | passou na rodada anterior; não rerrodado local no head, vale pelo CI do head |

## Cenários e resultado real
Ambiente: worktree desanexada, Node 24, vitest 5.1.
Rodada anterior (`27453898`): e2e `b12-fluxo.spec.ts -g "OP-17|B3-002"` 2 passaram; `sustentacao-no-operacional.spec.ts` 40 de 40.

Vermelho antes do verde (o12.ts, origem.ts e criterios.ts trazidos da base `4cc170b4`, testes do head): 3 falharam. Caíram: "C5-o12-zero-falso" e "T2.6, E7.214" (metricas) e "E7.214: o interruptor está ligado" (contratos). Os testes de domínio e allow-list guardam dados do arquivo e já nascem com ele. Cópia manual na worktree, restaurada, árvore limpa ao fim; `forge-testes` não se aplica (projeto). O teste novo do interruptor desligado exercita o parâmetro `false` da guarda já provada pelo mutante M1.

Mutação no diff (a mão, cada um restaurado em seguida):
| Mutante | Resultado | Quem matou |
|---|---|---|
| M1: `publica` sempre verdadeiro (remove a guarda "algum classificado") | morto | C5-o12-zero-falso |
| M2: `tot.Interno === 1 ? 'dentro'` (meta invertida) | morto | "com o campo 51 vindo em parte" e "vencido de causa interna aciona a meta" |
Dois de dois mortos, nenhum sobrevivente.

Bordas lidas no código: com só Solicitante ou Terceiro classificados e Interno 0, publica e a meta fica `dentro` (decisão coerente com o brief: o dado existe). Valor `desconhecido` do campo não soma em Interno, Solicitante nem Terceiro, então não conta como classificado.

## Revalidação (volta 1, head 1561e1b4)
`forge-check parecer delta`: intervalo `27453898..1561e1b4`, 13 arquivos no domínio (o resto veio da develop). Do O12: o teste "interruptor desligado" e o campo 51 (domínio, allow-list, testes pg e unitário). `criterios.ts` não mudou no delta: as versões do O8, O14 e O17 vindas da develop seguem como estavam e a do O12 permanece.
Rodado local no head: metricas fixtures.cobertura 36 de 36 (eram 35; entrou o teste do interruptor); metricas e7, complementares e t9: 46 de 46; contratos origem.test: 26 de 26; server dominio-businessmap, allow-list e metricas.mapa: 138 de 138. Teste pg do domínio (465) e e2e OP-17 e B3-002 não rerrodados local (sem PostgreSQL, e2e pesado); valem pelo CI do head.
Sem PR: a suíte inteira fica para o CI do PR.

## Bugs
Nenhum.

## Melhoria vista
nenhuma
