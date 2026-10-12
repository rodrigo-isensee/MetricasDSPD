# Mapa de domínio: os 5 contextos

Propósito: reunir a entrada de cada contexto delimitado. Público: desenvolvedores, agentes de IA e arquiteto. Revisão: 2026-10-11.

Cada contexto tem um `_context.md` (descrição e responsabilidade) e os arquivos de seus agregados na mesma pasta. Planejamento dos diagramas: [`architecture/ddd/00-plano.md`](../../architecture/ddd/00-plano.md).

### Contextos de domínio do MetricasDSPD
| Contexto | Entrada | Responsabilidade |
|---|---|---|
| `flow` | [`flow/_context.md`](flow/_context.md) | Fluxo de projeto do BusinessMap (schema `dspd_bm`): cards, quadros, colunas, transições, bloqueios |
| `support` | [`support/_context.md`](support/_context.md) | Sustentação do Acelerato; nunca se mistura com o `flow` |
| `collection` | [`collection/_context.md`](collection/_context.md) | Coleta incremental das duas fontes |
| `metrics` | [`metrics/_context.md`](metrics/_context.md) | Cálculo e publicação das métricas |
| `reference` | [`reference/_context.md`](reference/_context.md) | Dados de referência compartilhados |

Legenda: cada linha é um contexto; a coluna Entrada é o documento a abrir primeiro.

<details open>
<summary>Alternativa em lista</summary>

- `collection` -> `flow` e `support`: grava cada fonte na sua base, sem misturar.
- `metrics` -> `flow` e `support`: lê cada um separadamente; nenhum cálculo cruza as fontes.
- `reference` -> demais contextos: fornece dados de apoio.

(Relações indicativas; a fonte é cada `_context.md`.)
</details>
