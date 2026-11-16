---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-tamanho-regua
commit: 62254d39142a86cb56d89ec38615643fd8d623eb
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: O8 por tamanho pela régua do time (105, E7.133; revalidação E7.159)

Escopo original: `2c56d33b..0ccb21ef` (E7.102, E7.116, E7.128). Revalidação (E7.159): delta `0ccb21ef..62254d39` (volta E7.147), lido por `forge-check parecer delta`; o commit seguinte da branch (`113a0073`) só toca `docs/qa/`. Sem dependência nova, sem migração, sem workflow.

## Gatilhos
`R-SEGURANCA`: mexe na allow-list da coleta do BusinessMap e no domínio versionado que alimenta `ref_dominio`; regra inviolável de não comparar times (nada por time na API).

## Achados
- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:68 · resolvido em 62254d39: o relatório do bm:projetar traz reguaLinhasDescartadas (só a contagem de linhas da régua com time fora de ref_time; nunca o time nem o valor), projetor.ts:95-106 e :372.

## Sondas

## Detalhe dos achados
**Revalidação (E7.159), delta `0ccb21ef..62254d39`:**
1. **A1 resolvido, e no bm:projetar basta.** O objetivo era o dono ver régua digitada errado; o descarte acontece em `carregarReferencia` (`server/src/modulos/businessmap/projetor.ts:94-106`), na projeção, e é lá que a contagem é exata. Contar no `bm:ref-sync` exigiria cruzar a régua com os times na carga, e o guarda de não comparar times segue intacto com a contagem global. O campo `reguaLinhasDescartadas` é um número (diferença de tamanho entre a régua lida e a filtrada), sai no JSON da entrada `server/src/entradas/projetor-businessmap.ts:30`, que já só traz contagens e códigos; não leva `time_id`, código nem rótulo. O caminho `bm:coleta --projetar` devolve o mesmo resultado (`coleta-comando.ts:113`). Teste: `server/tests/projetor-businessmap.test.ts:174-188` (duas linhas de times inexistentes dão 2; régua vazia dá 0).
2. **`size` 0 como sem valor** (`server/src/modulos/businessmap/normalizador.ts:226`): `numero === 0` cai em `size_sem_valor` antes de olhar o time; cobre `0`, `-0`, `"0"` e `"0.0"`. Sem efeito de segurança: só reduz o que vira faixa, nunca M por omissão.
3. **Tela** (`web/src/features/complementares/fluxo.tsx:177-179,250,260-261,272`): esconde a série "Sem tamanho" quando vazia e muda textos fixos. Nada novo vem da API; nenhum dado por time aparece.
4. **Documentação no domínio** (`data-model.md`, `01-linguagem-ubiqua.md`, `metricas-complementares.md`): descreve a régua e as notas; sem segredo, sem dado de pessoa, coerente com o código.

**Achado original A1 (baixa, informativa):** integridade por erro de digitação (linha da régua para time inexistente sumia sem aviso). Dono: `node-backend`. Resolvido como acima.

**Verificações da primeira rodada (seguem válidas; o delta não toca allow-list, esquema da régua, contrato nem biblioteca):** nada de pessoa entra (`allow-list.ts:18,70`); a régua é só configuração com esquema estrito (`dominio-businessmap.ts:44,77,102,106-109,340-355`); a API do O8 só traz faixa, `n` e mediana (`packages/contratos/src/schemas.ts:885,951-953`); mínimo de 20 pela biblioteca (`packages/metricas/src/businessmap/o8.ts:93`).

**Suíte:** rodei no head `62254d39` `server/tests/projetor-businessmap.test.ts` e `server/tests/normalizador-businessmap.test.ts`: 107 de 107 passaram. CI verde no run 43855203408 (push, head 113a0073, cujo código é igual a 62254d39): openapi, testes, rapida, build, filtro, imagem, seguranca e banco com sucesso; e2e e perf pulados pelo filtro.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas de varredura de segredos, SAST e auditoria de dependências ausentes no ambiente (lacuna; sem dependência nova no diff, a varredura fica para o CI). Revisão manual do delta e testes locais.
