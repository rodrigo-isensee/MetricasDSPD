---
tipo: apoio-plano-tecnico
pedido: 059-aba-apontamento
etapa: E2.10 (trilha G2 do §7.2)
estado: proposta (aguarda conferência do dono, PE-5, 02/11 12:00)
plano: docs/architecture/features/059-aba-apontamento.md (§3.4 e §3.6)
---

# Dicionário de classificação do apontamento (subgrupo e subtarefa)

Fonte: seção 4 da especificação do dono (regra de subgrupo). Este arquivo só reescreve a regra na forma que o `ref:sync` carrega (`ref_apontamento_subgrupo`, `ref_apontamento_termo`, `ref_apontamento_regra_tipo`, §3.3 do plano). Nenhum termo foi acrescentado nem removido; o que é inferência do arquiteto está marcado em "Para o dono conferir".

## 1. Normalização (vale para comentário e para termo)
1. Minúsculas.
2. Sem acento (NFD, remover diacríticos): `análise` vira `analise`, `mudança` vira `mudanca`, `configuração` vira `configuracao`, `correção` vira `correcao`, `criação` vira `criacao`, `diagnóstic` vira `diagnostic`.
3. Espaços colapsados em um.
4. Casamento por **início de palavra** (C-6): o termo casa se aparece no começo de uma palavra do comentário (limite de palavra antes do termo, nada exigido depois). `reuni` casa `reunião` e `reuniões`; não casa `coreuni`.
5. Termos guardados já normalizados; a tabela nunca guarda acento.
6. A função é pura; o comentário é descartado depois da classificação (ADR 0020).

## 2. Ordem de avaliação (prioridade; a primeira regra que casa vence)
`prioridade` é o número da linha; menor número avalia primeiro. Regras por tipo (R) e por termo (T) convivem na mesma lista.

| Prio | Código do subgrupo | Rótulo | Natureza | Condição / termos normalizados (início de palavra) |
|---:|---|---|---|---|
| 1 | `gestao-backlog-rituais` | Gestão de backlog/rituais ágeis | R | tipo do card = Kaizen (qualquer comentário, inclusive vazio) |
| 2 | `testes` | Testes (unitários/integrados) | T | `teste`, `homolog` |
| 3 | `reunioes-comunicacao` | Reuniões/Comunicação com áreas | T | `reuni`, `call`, `meet`, `alinhament` |
| 4 | `analise-diagnostico` | Análise e diagnóstico | T | `analise`, `diagnostic` |
| 5 | `gestao-mudanca` | Gestão de mudança (RDM/GMUD) | T | `rdm`, `gmud`, `mudanca` |
| 6 | `documentacao` | Documentação | T | `document` |
| 7 | `configuracao-infra` | Configuração/Infraestrutura | T | `configuracao`, `infraestrutura`, `ambiente` |
| 8 | `apoio-areas` | Apoio pontual a áreas de negócio | T | `apoio` |
| 9 | `desenvolvimento-correcao` | Desenvolvimento/Correção | T | `desenvolv`, `ajuste`, `correcao`, `debug`, `implement`, `criacao`, `rotina`, `fonte`, `script` |
| 10 | `incidente-sem-detalhe` | Correção de incidente (sem detalhe) | R | tipo do card = Incidente de Produção **e** comentário vazio |
| 11 | `execucao-tecnica` | Execução técnica (sem detalhamento no apontamento) | R | há comentário e nenhuma regra anterior casou |
| 12 | `nao-classificado` | Não classificado | R | sem comentário (e nenhuma regra por tipo casou) |

"Sem comentário" = comentário vazio ou só espaços, depois da normalização.

## 3. Forma para o `ref:sync` (o node-backend leva como arquivo versionado)
Arquivo sugerido: `server/ref/apontamento-dicionario.json` (padrão das exceções de coluna do 052; caminho final do node-backend). Cada carga cria uma `ref_versao_criterio` com data (T2.6).

```json
{
  "versao": "2026-11-02-v1",
  "subgrupos": [
    { "codigo": "gestao-backlog-rituais", "rotulo": "Gestão de backlog/rituais ágeis", "prioridade": 1 },
    { "codigo": "testes", "rotulo": "Testes (unitários/integrados)", "prioridade": 2 },
    { "codigo": "reunioes-comunicacao", "rotulo": "Reuniões/Comunicação com áreas", "prioridade": 3 },
    { "codigo": "analise-diagnostico", "rotulo": "Análise e diagnóstico", "prioridade": 4 },
    { "codigo": "gestao-mudanca", "rotulo": "Gestão de mudança (RDM/GMUD)", "prioridade": 5 },
    { "codigo": "documentacao", "rotulo": "Documentação", "prioridade": 6 },
    { "codigo": "configuracao-infra", "rotulo": "Configuração/Infraestrutura", "prioridade": 7 },
    { "codigo": "apoio-areas", "rotulo": "Apoio pontual a áreas de negócio", "prioridade": 8 },
    { "codigo": "desenvolvimento-correcao", "rotulo": "Desenvolvimento/Correção", "prioridade": 9 },
    { "codigo": "incidente-sem-detalhe", "rotulo": "Correção de incidente (sem detalhe)", "prioridade": 10 },
    { "codigo": "execucao-tecnica", "rotulo": "Execução técnica (sem detalhamento no apontamento)", "prioridade": 11 },
    { "codigo": "nao-classificado", "rotulo": "Não classificado", "prioridade": 12 }
  ],
  "termos": [
    { "subgrupo": "testes", "termos": ["teste", "homolog"] },
    { "subgrupo": "reunioes-comunicacao", "termos": ["reuni", "call", "meet", "alinhament"] },
    { "subgrupo": "analise-diagnostico", "termos": ["analise", "diagnostic"] },
    { "subgrupo": "gestao-mudanca", "termos": ["rdm", "gmud", "mudanca"] },
    { "subgrupo": "documentacao", "termos": ["document"] },
    { "subgrupo": "configuracao-infra", "termos": ["configuracao", "infraestrutura", "ambiente"] },
    { "subgrupo": "apoio-areas", "termos": ["apoio"] },
    { "subgrupo": "desenvolvimento-correcao", "termos": ["desenvolv", "ajuste", "correcao", "debug", "implement", "criacao", "rotina", "fonte", "script"] }
  ],
  "regrasPorTipo": [
    { "tipoRotulo": "Kaizen", "condicao": "sempre", "subgrupo": "gestao-backlog-rituais" },
    { "tipoRotulo": "Incidente de Produção", "condicao": "sem-comentario", "subgrupo": "incidente-sem-detalhe" }
  ],
  "subtarefa": [
    { "codigo": "direto-no-card", "rotulo": "Direto no card (sem subtarefa)" },
    { "codigo": "em-subtarefa", "rotulo": "Em subtarefa" }
  ]
}
```

Notas de carga:
- `regrasPorTipo` guarda o **rótulo** do tipo; a tabela `ref_apontamento_regra_tipo` guarda `type_id`. O `ref:sync` resolve rótulo para `type_id` contra `dim_tipo_card` (ou equivalente do 052) e **falha a carga** se o rótulo não existir (sem adivinhar). Os ids reais só se conhecem na máquina do dono (PE-6).
- Prioridade 11 e 12 não têm termos: são as regras residuais, avaliadas pelo código (`execucao-tecnica` = comentário presente sem casamento; `nao-classificado` = sem comentário).
- Qualidade (`sem_vinculo`) depende dos códigos `execucao-tecnica` e `nao-classificado`; o código a referencia por esses dois literais.
- Termos em início de palavra sem acento; o teste do `ref:sync` rejeita termo com maiúscula, acento ou espaço duplicado.

## 4. Dicionário fechado de subtarefa
A especificação (seção 3) usa `subtask_title` como texto livre ("Não detalhada" se vazio) e **não traz dicionário de subtarefa**. Título de subtarefa é texto livre e pode conter nome de pessoa; por C-2 do plano e pela ADR 0020 ele não entra no repositório, na base nem na resposta da API.

Dicionário fechado proposto (o que o plano já adota, C-2): dois códigos, derivados só de `subtask_id`.

| Código | Rótulo | Regra |
|---|---|---|
| `direto-no-card` | Direto no card (sem subtarefa) | `subtask_id` ausente no apontamento |
| `em-subtarefa` | Em subtarefa | `subtask_id` presente |

Esses dois valem já, sem decisão nova. Qualquer código adicional (ex.: classificar o título da subtarefa pelos mesmos termos do §2) é regra de negócio nova que não está na especificação; **não foi inventada aqui**.

## 5. Para o dono conferir (PE-5)
1. Os 12 subgrupos, seus termos e a ordem do §2: igual à sua seção 4? (única alteração mecânica: sem acento e início de palavra, C-6.)
2. Efeitos da ordem que o dono pode querer rever (a especificação manda a ordem; não alterei):
   - Um comentário com `teste` e `desenvolv` vai para Testes (prio 2 antes de 9).
   - `reuni` ganha de `analise` (reunião de análise vai para Reuniões).
   - `ambiente` (prio 7) ganha de `desenvolv` (prio 9): "ajuste de ambiente" vai para Configuração/Infraestrutura.
   - Kaizen (prio 1) classifica mesmo com comentário que casaria outro termo.
3. Termos curtos casam como início de palavra e podem pegar palavras inesperadas: `call` (callback), `meet`, `fonte` (fontes), `rdm`, `apoio`, `teste` (testemunho). Manter, exigir palavra inteira para esses, ou trocar?
4. Prioridade 10 só vale com comentário vazio: Incidente de Produção com comentário sem termo cai em `execucao-tecnica` (prio 11), como na especificação. Confirmar.
5. Qual é o rótulo exato do tipo "Kaizen" e do "Incidente de Produção" no BusinessMap (a carga falha se não achar).
6. Subtarefa: basta `direto-no-card` e `em-subtarefa`, ou o dono quer um dicionário de classes de subtarefa? Se quiser, precisa fornecer a lista (regra de negócio, `R-DECISAO`).
7. Se o dono preferir a categoria de tempo nativa como primeira fonte (M-1, Q-A3), este dicionário passa a valer só para apontamento sem categoria; nada neste arquivo muda.

## 6. Testes que a carga deve ter (para o node-backend)
- Cada linha do §2 tem um caso sintético (comentário inventado, sem nome de pessoa) que cai nela e um que não cai.
- Acento e caixa: `Análise`, `ANALISE` e `analise` dão o mesmo subgrupo.
- Início de palavra: `reunioes` casa `reuni`; `coreuniao` não.
- Ordem: comentário com termos de duas regras vai para a de menor prioridade numérica.
- Kaizen com comentário vazio vai para `gestao-backlog-rituais`; Incidente com comentário vazio vai para `incidente-sem-detalhe`; outro tipo com comentário vazio vai para `nao-classificado`.
- `ref:sync` rejeita termo com acento, maiúscula ou duplicado entre subgrupos, e rótulo de tipo inexistente.
