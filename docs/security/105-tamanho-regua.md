---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-tamanho-regua
commit: 7ce5875431ca1912b89516bb300045eaa51f8ed9
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: O8 por tamanho pela régua do time (105, E7.133; revalidações E7.159 e E7.182)

Escopo original: `2c56d33b..0ccb21ef` (E7.102, E7.116, E7.128). Revalidação E7.159: delta `0ccb21ef..62254d39`. Revalidação E7.182: merge da develop `62254d39..7ce58754` (base `0c989148`), lido por `forge-check parecer delta`, com foco nos seis conflitos entre o campo 48 (E7.86) e a régua. Sem dependência nova, sem migração, sem workflow.

## Gatilhos
`R-SEGURANCA`: mexe na allow-list da coleta do BusinessMap e no domínio versionado que alimenta `ref_dominio`; regra inviolável de não comparar times (nada por time na API).

## Achados
- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:68 · resolvido em 62254d39: o relatório do bm:projetar traz reguaLinhasDescartadas (só a contagem de linhas da régua com time fora de ref_time; nunca o time nem o valor), projetor.ts:95-106 e :372.

## Sondas

## Detalhe dos achados
**Revalidação E7.182 (merge da develop, `7ce58754`):**
1. **Lista fechada de colunas resolvida certo** (`server/src/modulos/businessmap/allow-list.ts:70-73`): `COLUNAS_LISTA` = `sistema`, `area_solicitante`, `fornecedor`, `objetivo_estrategico`, `responsabilidade_atraso`, `origem_demanda`, `severidade`, `causa_raiz`. Ficou a união correta das duas mudanças: `causa_raiz` entra (E7.86, da develop) e `tamanho_declarado` continua fora (E7.102, a régua é a única fonte); `classe_servico` e `fase_deteccao` seguem fora. Nenhuma coluna de pessoa ou texto livre. Diferença contra a develop só nessa linha e no comentário.
2. **Campos customizados proibidos intactos**: `CAMPOS_CUSTOMIZADOS_FORA` = `36`, `42` (`allow-list.ts:62`); `CAMPOS_CARD`, `CAMPOS_REVISAO`, `CAMPOS_TRANSICAO`, `CAMPOS_WEBHOOK` e `CAMPOS_APONTAMENTO` iguais à develop e ao head anterior. `reduzirCamposCustomizados` (`allow-list.ts:98-111`) é o da develop: só o código do domínio fechado sai; texto da opção e descrição de "Outros" não são lidos para a saída.
3. **Arquivo de domínio** (`docs/architecture/fontes/businessmap-dominio.json`): mantém o campo 48 (`dropdown`, coluna `causa_raiz`, 12 opções) e a régua (`tamanho_regua`); a `regra` descreve as duas. O esquema estrito valida ambos (`dominio-businessmap.ts:62` usa `z.enum(COLUNAS_LISTA)`, logo um campo customizado não consegue mais apontar para `tamanho_declarado`; `TIPOS_SELECAO_UNICA = ['dropdown']` preservado; `valorTamanhoRegua` estrito). A `versao_criterio` passa a ser a da régua (`afeta: ['O8']`), com o motivo citando que o campo 48 já estava na develop sem métrica afetada: coerente com T2.6, a versão de critério da causa raiz já foi gravada pela develop.
4. **Projeção** (`normalizador.ts:339-358`): `colunasDeLista` produz `causa_raiz` e as demais; `tamanho_declarado` vem só de `tamanhoPelaRegua`, sem sobreposição de fonte. `projetor.ts:289` lista `tamanho_declarado` uma vez mais `COLUNAS_LISTA`, sem duplicata.
5. **O resto do merge** (T9, T11, S11, T3, OpenAPI e contratos) veio da develop com os próprios pareceres; nada novo de pessoa nem por time na API (`projetosSemInicio` e `foraDaConversao` são contagens).

**Revalidação E7.159, delta `0ccb21ef..62254d39`:** A1 resolvido no bm:projetar (`projetor.ts:94-106`, saída só com a contagem `reguaLinhasDescartadas`, `server/src/entradas/projetor-businessmap.ts:30`; teste `server/tests/projetor-businessmap.test.ts:174-188`); `size` 0 vira `size_sem_valor` (`normalizador.ts:226`), sem efeito de segurança; tela e documentação sem dado novo.

**Achado original A1 (baixa, informativa):** integridade por erro de digitação (linha da régua para time inexistente sumia sem aviso). Dono: `node-backend`. Resolvido como acima.

**Verificações da primeira rodada (seguem válidas):** nada de pessoa entra (`allow-list.ts:18,70`); a régua é só configuração com esquema estrito; a API do O8 só traz faixa, `n` e mediana (`packages/contratos/src/schemas.ts`); mínimo de 20 pela biblioteca (`packages/metricas/src/businessmap/o8.ts:93`).

**Suíte:** rodei no head `7ce58754` `server/tests/dominio-businessmap.test.ts`, `normalizador-businessmap.test.ts`, `projetor-businessmap.test.ts` e os testes da allow-list: 293 passaram, 8 pulados (os de PostgreSQL, cobertos pelo job `banco`). CI verde no run 43864207823 (push, head `7ce58754`): imagem, seguranca, testes, filtro, rapida, build, openapi e banco (PostgreSQL, inclui `dominio-businessmap.pg.test.ts`) com sucesso; e2e e perf pulados pelo filtro.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas de varredura de segredos, SAST e auditoria de dependências ausentes no ambiente (lacuna; sem dependência nova no diff, a varredura fica para o CI). Revisão manual do delta e testes locais.
