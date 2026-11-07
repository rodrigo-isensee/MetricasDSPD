---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l3-motivo-dominio
commit: 86f6dbb7c63ee3968482dc69092c68bce5c3c5b8
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 075 lote 3, domínio motivo_bloqueio no bm:ref-sync (K-204, E1.6)

Diff lido: `c5a4728e...86f6dbb7` (6 arquivos, 107 adições e 5 remoções), contra a seção `## Lote 3` de `docs/analises/075-plano.md`.

## Parecer
**Aprovado.** Faz o que o lote pede, nem mais nem menos.

- **Aderência ao plano:** campo `motivo_bloqueio` no esquema de `dominio-businessmap.ts` com `codigo` por `ID_CAMPO` (`^\d{1,10}$`) e `rotulo` por `z.enum(MOTIVOS_BLOQUEIO)` vindo do contrato (fonte única de tipo); "não classificado" fica fora do enum (é ausência de mapa) e há teste disso. `businessmap-dominio.json` com a lista vazia e a `regra` dizendo que o mapa é das pessoas (P-075-3). Leitura do mapa (`motivosDeLinhas`) no mesmo módulo. Sem migração, sem contrato novo, sem versão de critério agora, como o plano manda.
- **Vários `reason_id` para o mesmo motivo, `reason_id` repetido recusado:** escolha correta. O mapa é função `reason_id` -> motivo; repetir o `reason_id` tornaria o motivo ambíguo, e a recusa compara o valor normalizado (`String(Number(...))`, pega `5` e `05`). Na leitura do banco, `reason_id` ligado a dois motivos é ignorado, mesma desconfiança de `colunasDosCampos` (padrão do módulo, sem regra nova).
- **`motivosDeLinhas` no `index.ts`:** exportada sem tradução própria; o mapa só vem do `ref_dominio`, nenhum motivo escrito no código.
- **Sem colisão com as colunas:** `motivo_bloqueio` não está em `COLUNAS_LISTA`, então `dominiosDeLinhas` e a coleta (`coleta.ts:47`, `campo = ANY` das colunas) não o leem, e nenhum `coluna` de campo customizado pode sobrescrever a lista.
- **Testes:** CA-075-3 coberto (rótulo `MARCADOR-PESSOA-075`, com `@`, fora dos 7, "não classificado", código não numérico, longo, negativo, com espaço, chave extra, todos recusando a carga inteira e sem o valor na mensagem); arquivo real vazio carrega zero linhas; `.pg` grava o mapa e fecha a vigência quando ele sai. Os 7 motivos estão escritos no teste, não importados (o teste pega troca no contrato).
- **As duas asserções ajustadas em `dominio-businessmap.test.ts`:** não perdem cobertura. A primeira passa a exigir também `motivo_bloqueio: []` (mais estrita); a segunda acrescenta `motivo_bloqueio` ao `campo = ANY` do fechamento, o que prova que o mapa vazio fecha o que saiu (histórico por vigência, nada sobrescrito).
- **`mapa.ts`:** nenhum criado nem alterado (é do lote 1b).
- **Segurança:** parecer do security-engineer em `docs/security/075-l3-motivo-dominio.md`, aprovado em `86f6dbb`; não refeito aqui.

## Ferramentas
- CI do push no head `86f6dbb7`: `CI`, `completed`, `success` (`gh run list --commit 86f6dbb7...`).
- Testes dos arquivos tocados, 2 workers: `dominio-motivo-bloqueio.test.ts` e `dominio-businessmap.test.ts`, 57 verdes; `dominio-businessmap.pg.test.ts` pulado sem banco local (7 casos; roda na CI e no QA).

## Teto M14
112 linhas (107 adições e 5 remoções, contando o `.json` de referência), dentro de 150. Um comportamento só.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:115 · O comentário de listasDoArquivo cita só campo_customizado e as colunas; agora a função também devolve motivo_bloqueio. Atualizar o texto no próximo lote que tocar o arquivo (4b).
