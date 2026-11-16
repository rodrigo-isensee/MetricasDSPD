---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: 27453898059c1d28bd99a6ff31088e1cbd46dfde
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-o12-responsabilidade (O12 pela Responsabilidade do Atraso, campo 51, E7.214)

Sem especificação de UX nem contrato de API novos: as obrigações vêm do brief (E7.214). Sem PR: a suíte inteira fica para o CI do PR. Cito o CI do push do head `27453898` (run 43896506195, check-runs do sha): testes, banco, seguranca, openapi, rapida, build, imagem e filtro verdes; e2e e perf pulados no push. Isto não é o check `bateria` do PR.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| O-1: campo 51 no domínio com 137 Interno, 138 Solicitante, 139 Terceiro; o 42 (pessoa) fica fora | dominio-businessmap.test.ts "E7.214: o campo 51..." | máximo (3 opções), proibido (42 ausente) | passou |
| O-2: casamento pelo value_id; id fora do catálogo vira desconhecido | allow-list.test.ts "E7.214: campo 51..." (137, "139" texto, 999) | fora do limite, tipo número/texto | passou |
| O-3: teste pg do domínio com 3 campos | dominio-businessmap.pg.test.ts (3 campos, 402 linhas) | n/a | passou no CI (job banco verde; sem PostgreSQL local) |
| O-4: RESPONSABILIDADE_ATRASO_COM_FONTE = true e motivo com "a contagem começa em 16/11/2026", minúsculas, sem ponto | origem.test.ts "E7.214: o interruptor está ligado..." | formato do motivo | passou |
| O-5: sem nenhum vencido classificado não publica "0 internos": responsabilidade e causa interna nulas, motivo, `sem-referencia` | fixtures.cobertura.test.ts "C5-o12-zero-falso" | vazio (0 classificados) | passou |
| O-6: com classificação parcial publica; vencido sem campo vira `naoClassificado`; meta avaliada | fixtures.cobertura.test.ts "com o campo 51 vindo em parte..." (Interno 0, Terceiro 1, naoClassificado 1, `dentro`) | mínimo (1 classificado), parte não classificada | passou |
| O-7: causa interna > 0 aciona meta `fora` | fixtures.cobertura.test.ts "vencido de causa interna aciona a meta" | limite 0 x 1 | passou |
| O-8: versão de critério O12 e VISAO_GERAL | fixtures.cobertura.test.ts "T2.6, E7.214" | n/a | passou |
| O-9: tela mostra número e faixa com link "Ver O12" (OP-17, B3-002) | e2e b12-fluxo OP-17 e B3-002 | dado real da base fictícia | passou |

## Cenários e resultado real
Ambiente: worktree desanexada em `27453898`, Node 24, vitest 5.1, Playwright chromium.
- metricas fixtures.cobertura: 35 de 35. contratos origem.test: 26 de 26. server (dominio-businessmap, allow-list, metricas.mapa): 3 arquivos, 131 testes, todos passaram.
- E2E tocados: `b12-fluxo.spec.ts -g "OP-17|B3-002"`: 2 passaram. `sustentacao-no-operacional.spec.ts` (traz O12 nos números-chave): 40 de 40 passaram.

Vermelho antes do verde (o12.ts, origem.ts e criterios.ts trazidos da base `4cc170b4`, testes do head): 3 falharam. Caíram: "C5-o12-zero-falso" e "T2.6, E7.214" (metricas) e "E7.214: o interruptor está ligado" (contratos). Os testes de domínio e allow-list guardam dados do arquivo e já nascem com ele. Cópia manual na worktree, restaurada com `git checkout HEAD`, árvore limpa ao fim; `forge-testes` não se aplica (projeto).

Mutação no diff (a mão, cada um restaurado em seguida):
| Mutante | Resultado | Quem matou |
|---|---|---|
| M1: `publica` sempre verdadeiro (remove a guarda "algum classificado") | morto | C5-o12-zero-falso |
| M2: `tot.Interno === 1 ? 'dentro'` (meta invertida) | morto | "com o campo 51 vindo em parte" e "vencido de causa interna aciona a meta" |
Dois de dois mortos, nenhum sobrevivente.

Bordas lidas no código: com só Solicitante ou Terceiro classificados e Interno 0, publica e a meta fica `dentro` (decisão coerente com o brief: o dado existe). Valor `desconhecido` do campo não soma em Interno, Solicitante nem Terceiro, então não conta como classificado.

## Bugs
Nenhum.

## Melhoria vista
nenhuma
