---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/097-l2-teste-grant
commit: 061143ec29bd60f3907440bb6edbd7b1f1bc7d3b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: correção do teste do GRANT do L2 (develop vermelha no job banco, E3.3)

Base develop 4b1e3122. Diff `4b1e3122..061143ec`: uma linha em `server/tests/apontamento-rota.pg.test.ts:253`, que tira `responsavel_id` da lista de colunas que o papel da aba não pode ler em `dim_card`. Classe T (só testes), sem código de produção nem contrato.

## Veredito
Aprovado. `responsavel_id` não existe em `dim_card` (a leitura dá 42703, não 42501, por isso o teste caía); `responsaveis` e `card_pai` existem e o GRANT do papel da aba não as cobre, então 42501 é a resposta com razão.

## Critério → teste → resultado
| Critério | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Papel da aba não lê coluna de pessoa de `dim_card` (42501) | `apontamento-rota.pg.test.ts:253`, `responsaveis` e `card_pai` | coerente com o catálogo; roda no CI (job banco) | permissão por coluna |
| Papel da aba lê `equipe` | mesmo teste, linha 252 (inalterada) | `equipe` está no GRANT | permissão |

## Conferência das colunas
- `server/migrations/0006_bm_projecoes.ts`: `dim_card` tem `card_pai` e `responsaveis text[]`; não tem `responsavel_id` (esse existe só em `dim_responsavel`, migração 0020, e em tabelas de versão).
- `server/src/plataforma/db/grants.ts:17`: `'bm.dim_card': ['card_id', 'titulo', 'tipo', 'equipe']`, via `GRANT SELECT (colunas)` ao `dspd_api_apontamento` (linhas 137 a 141). `responsaveis` e `card_pai` ficam de fora: 42501.
- Outra coluna de pessoa de `dim_card`: em `lgpd.ts:12` a única é `dspd_bm.dim_card.responsaveis`, que a prova já cobre. `card_pai` não é pessoa (hierarquia), mas segue na prova como a guarda de que o papel não leia mais que o necessário. Nenhuma coluna de pessoa falta.

## Execução
Não rodei o `.pg` (só no CI, nada contra base real). A prova é por leitura do DDL e do GRANT. Vermelho antes do verde: o teste novo não existe, é remoção de asserção errada; a base falhava por 42703 no `responsavel_id`, o que explica a develop vermelha. Prova final: check-run `bateria` e job banco do CI do PR no mesmo sha.

## Achados
