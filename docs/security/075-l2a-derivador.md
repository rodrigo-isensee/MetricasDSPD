---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l2a-derivador
commit: 2c19b9895c67c803c9beeb5b8ddee660b0630ec2
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-06
---
# Review de segurança: lote 2a do pedido 075 (derivador puro de bloqueio)

Propósito: conferir o que vai do `stg_card` ao evento de bloqueio no lote 2a (K-204). Público: tech-lead, node-backend, qa-engineer. Revisão estática do diff `d1f22008...2c19b989` (ADR 0029 em proposta, `bloqueios.ts`, `bloqueios.test.ts`); rodado só `server/tests/bloqueios.test.ts` (15 testes, verdes). Nenhum código alterado. Ferramentas de varredura: não rodadas aqui (a CI do push fechou verde); nenhuma lacuna de ferramenta registrada.

## Gatilhos
Decide o que vai do `stg_card` ao evento de bloqueio (controles 1, 2 e 5 do modelo de ameaças `docs/security/075-modelo-ameacas.md`; SEG-A6 do plano).

## Resultado por controle
- **Fronteira inalterada.** O diff não toca `allow-list.ts`, `coleta.ts` nem `packages/contratos` (conferido por `git diff --stat` nesses três caminhos: vazio). Nenhum campo novo da fonte, nenhuma migração, nenhum GRANT.
- **Controle 1 (só o necessário sai):** o tipo de entrada `VersaoBloqueio` (`bloqueios.ts:6-8`) só declara `cardId`, `coletadoEm`, `isBlocked`, `blockReasonId`, `columnId`; o evento (`bloqueios.ts:43,46`) é montado campo a campo, sem espalhar o objeto de entrada. O teste CA-075-1 (`bloqueios.test.ts:37-41`) passa `label`, `comment` e `user_id` marcadores e prova que não aparecem na saída serializada, notas incluídas.
- **Controle 2 (motivo só como código validado):** `motivoDe` (`bloqueios.ts:19-22`) só aceita inteiro ou string `^\d{1,10}$`; o resto vira `null` com a nota de código fixo `motivo_codigo_invalido`, sem o valor lido (`bloqueios.ts:42`). CA-075-2 coberto em 8 entradas (`bloqueios.test.ts:30-35`), inclusive objeto, 11 dígitos, decimal, nulo e ausente. Rótulo e texto livre não têm caminho até `motivoCodigo`.
- **Controle 5 (id_origem determinístico):** sha256 de `cardId|coletadoEm` (`bloqueios.ts:24-26`), nunca de texto livre; o `fim` reusa o `id_origem` do início; reexecução da mesma entrada dá a mesma saída (`bloqueios.test.ts:28`). Reabertura gera outro `id_origem` (`bloqueios.test.ts:15`).
- **Pureza:** sem banco, sem relógio, sem rede, sem `eval`; só `node:crypto`. Notas são códigos fixos, sem valor de entrada.
- **ADR 0029:** coerente com o código e com as decisões do dono (P-075-1 a P-075-3b, P-075-10); declara que a via A não usa `stg_bloqueio` nem campo novo.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/bloqueios.ts:38 · `colunaId` repassa qualquer string da fonte sem validar (o teste fixa 'abc', bloqueios.test.ts:45); o id de coluna deveria seguir `^\d{1,10}$` como o motivo, ou virar null.
- A2 (recomendado) server/src/modulos/businessmap/bloqueios.ts:19 · `motivoDe` preserva zeros à esquerda ('0034' fica '0034', 34 fica '34'); a chave do mapa do lote 4b pode errar a tradução; normalizar para inteiro decimal sem zeros.

## Plano em cartões
Nenhum bloqueante; A1 e A2 podem entrar no lote 2b ou 4b, a critério do tech-lead, sem devolver o 2a.

## Riscos aceitos
Nenhum.

## Veredito
**Aprovado** sobre o commit `2c19b9895c67c803c9beeb5b8ddee660b0630ec2`. Sem caminho de ataque realista nos dois achados (o id de coluna vem da API do BusinessMap, sem texto de pessoa), por isso recomendações. Para o lote 2b: a fonte do fornecedor e dos marcos tem de passar por esta mesma validação por padrão (controles 5 e 9), e o `colunasDeLista` do normalizador deve ser exportado, não copiado.
