---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l2b-marcos
commit: 54d49872f824aee266062ded66c358c97e84d295
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: lote 2b do pedido 075 (marcos de saída e fornecedor no derivador de bloqueios)

Propósito: conferir o diff `e89ae3f3...54d49872` (3 arquivos, +78 -19) contra os controles 5 e 9 do modelo de ameaças e o SEG-A6 do plano. Público: tech-lead, node-backend, qa-engineer. Revisão estática; nada foi alterado em código.

## Gatilhos
Fronteira de dado: o fornecedor do bloqueio e o código do motivo vêm de dado da fonte (`R-SEGURANCA`, controles 5 e 9).

## Resultado por controle
- **Controle 9 e CA-075-12 (fornecedor só do `bm`, só de `custom_fields`): conforme.** `bloqueios.ts:58` monta `{ custom_fields: v.customFields }` e chama a `colunasDeLista` exportada (`normalizador.ts:115`, só ganhou `export`; corpo intacto). Só `.fornecedor` é lido; campo avulso (`fornecedor`, `label` no objeto da versão) e field_id fora do mapa não entram (teste `bloqueios.test.ts`, "CA-075-12"). O módulo não importa banco nem cliente: não há caminho para `dspd_ac`. O valor segue a regra existente (texto não vazio, sem `desconhecido`, corte em 80); a nota `campo_fora_do_dominio` é contagem, sem o valor.
- **Fornecedor do início (P-075-4): conforme.** Lido só no ramo que abre (`bloqueios.ts:55-60`); versão seguinte com outro valor não o troca (teste "presente, ausente e trocado depois").
- **`colunaId` só `^\d{1,10}$`: conforme.** `codigoDe` (`bloqueios.ts:24-27`) valida pelo `PADRAO_MOTIVO` e normaliza zeros (`'0034'` vira `'34'`); coluna `'abc'` ou objeto vira `null` (o 2a aceitava `'abc'`; fechou). `colunaId` entra nos eventos de início e fim já validado.
- **Código de motivo sem texto de pessoa: conforme.** O motivo do início passa pelo mesmo `codigoDe`; fora do padrão vira `null` com a nota `motivo_codigo_invalido`. O evento de fim grava `motivoCodigo: null`. O tipo `VersaoBloqueio` não tem campo de comentário, rótulo nem usuário.
- **Nenhuma coluna de pessoa no evento: conforme.** `EventoBloqueio` tem 6 campos (tipo, `idOrigem`, `ocorridoEm`, `motivoCodigo`, `colunaId`, `fornecedorCodigo`), todos código, enum ou data.
- **Controle 5 (determinismo, append-only): conforme.** `idOrigem` é sha256 de `cardId|coletadoEm` (nunca de texto); o fim reaproveita o `idOrigem` do início; a reabertura depois de marco (TL-A5) tem `idOrigem` próprio, distinto (teste); card em marco que segue bloqueado não abre nada (TL-A9, teste). Nada apaga ou reescreve evento: a função só devolve lista.
- **Entrada inválida: conforme.** `is_blocked` fora de booleano e 0/1 não abre nem fecha e deixa a nota `is_blocked_invalido` (sem valor). `archivedAt` não parseável é ignorado.
- **Sem diff** em `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos` (diff vazio). Sem GRANT, sem dado novo da fonte, sem `EXPAND_COLETA`.
- **Testes:** `server/tests/bloqueios.test.ts`, 26 passados (vitest, 2 workers). Suíte inteira é do QA.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não foram rodados aqui; as varreduras do diff pequeno e sem dependência nova ficam com o CI. Nenhuma dependência nova no diff.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/bloqueios.ts:49 · `archivedAt` futuro vindo da fonte vira `fim` depois da coleta; sem caminho de ataque, só integridade: no lote 4a limitar o marco a `coletadoEm` (min) e testar.

## Plano em cartões
Nenhum bloqueante. A1 vai ao node-backend junto do lote 4a, se o tech-lead concordar.

## Riscos aceitos
Nenhum.
