# Modelo de dados do mock (`@metricas-dspd/mock`)

Base fictícia do pedido 001. Os tipos moram na biblioteca (`packages/metricas/src/businessmap/modelo.ts` e `acelerato/modelo.ts`) e o gerador em `packages/mock/src`; o grafo `metricas <- mock` está no [ADR 0002](../architecture/adr/0002-monorepo-pacotes-compartilhados.md). Os dois domínios são bases separadas, sem chave comum: **BusinessMap e Acelerato nunca se misturam** (o lint impede um gerador de importar o outro; ver [arquitetura-front.md](arquitetura-front.md#2-dependências-entre-pacotes-e-fronteiras-do-lint)).

Convenções: instantes em epoch ms; datas civis em `AAAA-MM-DD`; durações em horas úteis (8 h por dia útil). Cards arquivados e excluídos **permanecem** na base. Pessoas são só pseudônimos `Pessoa NN`, e nenhuma função agrega por pessoa.

## 1. BusinessMap (briefing 4.5 + extensões)

Campos sem marca são os do briefing 4.5. `ext` marca extensão (campos de 4.4 ou necessidade do núcleo de cálculo).

```mermaid
erDiagram
  dim_card ||--o{ fato_transicao : "card_id"
  dim_card ||--o{ fato_bloqueio : "card_id"
  dim_card |o--o{ dim_card : "card_pai (story > frente > projeto)"
  dim_card ||--o| ficha_resultado : "card_id (iniciativa) ext"
  dim_coluna ||--o{ fato_transicao : "quadro_id + coluna_destino ext"
  dim_card {
    string card_id PK
    string tipo
    string classe_servico
    string sistema
    string area_solicitante
    string fornecedor "nulo"
    string objetivo_estrategico "nulo"
    string card_pai FK "nulo"
    number criado_em
    number comprometido_em "nulo"
    number iniciado_em "nulo"
    number concluido_em "nulo"
    number arquivado_em "nulo"
    string motivo_descarte "nulo"
    string_list responsaveis "pseudonimos"
    string tamanho_declarado "P M G nulo"
    string titulo "ext"
    string granularidade "ext story frente projeto"
    string equipe "ext"
    string quadro_id "ext"
    string coluna_atual "ext"
    number excluido_em "ext"
    boolean eh_subtarefa "ext"
    number data_acordada "ext O12"
    string responsabilidade_atraso "ext O12"
    string origem_demanda "ext"
    string fase_deteccao "ext O15 O18"
    string severidade "ext"
    string origem_bug FK "ext card de origem"
    boolean adicionado_apos_inicio_pai "ext T1.7"
  }
  fato_transicao {
    string card_id FK
    string coluna_origem "nulo na primeira"
    string coluna_destino
    string tipo_coluna "fila execucao"
    string usuario "pseudonimo"
    number timestamp
    string direcao "avanco retorno"
  }
  fato_bloqueio {
    string card_id FK
    string motivo
    string coluna_em_que_bloqueou
    string fornecedor "nulo"
    number inicio
    number fim "nulo se ativo"
    number duracao_horas_uteis "nulo se ativo"
  }
  dim_coluna {
    string quadro_id PK "ext"
    string coluna PK "ext"
    string tipo_coluna "fila execucao"
    string papel "backlog compromisso trabalho homologacao entrega"
    number ordem
    number limite_wip "nulo"
  }
  ficha_resultado {
    string card_id FK "ext"
    string resultado_esperado
    boolean declarado_antes_do_inicio
    string unidade
    number ganho_previsto
    number ganho_medido "nulo"
    string data_declaracao
  }
```

Além das tabelas, `BaseBM.config` (extensão) traz o que, no sistema real, vem de configuração (WS1/WS4): `limite_wip_fluxo` por equipe (14), `limite_frentes` (12), SLE por classe (Urgente 4, Prazo fixo 8, Padrão 5 dias úteis, Intangível sem SLE), alocação acordada (30/15/45/10 %), objetivos estratégicos, equipes × sistemas e as mudanças de critério (T2.6).

Regras de integridade (verificadas em `packages/mock/src/mock.test.ts`):
- `card_pai` sempre existe e tem a granularidade imediatamente superior; há stories sem pai.
- Marcos em ordem (`criado ≤ comprometido ≤ iniciado ≤ concluido ≤ hoje`) e coerentes com as transições: a primeira tem `coluna_origem` nula, a última termina em `coluna_atual`.
- Colunas de fila começam por "Aguardando" ou "Pronto para" (4.2). Quadros: time (9 colunas, com WIP), coordenação (4) e gerência (3).
- Marcos derivados das transições pelo papel da coluna: `comprometido_em` na primeira coluna de compromisso; `iniciado_em` na primeira de execução de trabalho/homologação; `concluido_em` só se a última coluna é a de entrega.
- Há retornos (`direcao = retorno`), bloqueios ativos, todos os motivos de bloqueio e todas as fases de detecção.

## 2. Acelerato (briefing 3.2 e 3.4, fora do 4.5)

O 4.5 só modela o BusinessMap; o modelo do Acelerato é próprio e não compartilha tipo com ele.

```mermaid
erDiagram
  chamado ||--o{ etapa_chamado : "chamado_id"
  alvo_prioridade ||--o{ chamado : "prioridade"
  chamado {
    string chamado_id PK "CH-00001"
    string organizacao "DSPD Sustentacao"
    string tipo_fila "DSPD - SSSC"
    string equipe "SSSC TOTVS SENIOR FLUIG"
    string natureza "incidente requisicao"
    string categoria_sistema
    boolean excluido
    string status "Concluido Aberto"
    string impacto
    string urgencia
    string prioridade "P1 a P5, matriz 3.4"
    boolean prioridade_ajustada_manualmente
    string justificativa_ajuste "nulo"
    number aberto_em
    number primeiro_atendimento_em "nulo"
    number restaurado_em "nulo"
    number data_finalizado "nulo"
    string status_sla_r "nulo se aberto"
    string status_sla_pa "nome hipotetico P5"
    string motivo_escalacao "nulo"
    string motivo_pendencia_atual "nulo"
    number previsao_retorno "nulo"
    string motivo_encerramento "nulo"
    string avaliacao_problema "nulo"
    boolean excecao_sla_registro_posterior
    boolean incidente_critico_coordenado
    string nivel_resolucao "N1 N2 N3 Fornecedor"
  }
  etapa_chamado {
    string chamado_id FK
    string etapa "Novo ... Encerrado, Arquivar"
    number entrada
    number saida "nulo na etapa atual"
    string motivo_pendencia "so em Pendente"
  }
  alvo_prioridade {
    string prioridade PK
    number primeiro_atendimento_horas
    number restauracao_horas
  }
```

Integridade: prioridade segue a matriz Impacto × Urgência salvo ajuste manual; `status_sla_r` só em concluídos; abertura em dia útil; etapas em ordem; a soma dos totalizadores é o tempo de vida (aberto → encerrado); todo P1 é incidente crítico coordenado. Etapas `Pendente` e `Aguardando validação` pausam o relógio de SLA. Alvos (h úteis, PA / R): P1 0,25/4, P2 0,5/8, P3 2/16, P4 4/40, P5 8/80.

## 3. Parâmetros do gerador

`gerarBaseMock(parcial)` mescla `parcial` com `CONFIG_PADRAO` e gera os dois domínios de forma independente.

| Parâmetro | Padrão | Efeito |
|---|---|---|
| `semente` | `20261009` | Raiz de todo sorteio (`VITE_MOCK_SEMENTE`) |
| `hoje` | `2026-10-09T18:00:00-03:00` | Data de corte; nada é gerado depois dela (`VITE_MOCK_HOJE`). Os dois contextos têm de concordar |
| `mesesHistorico` | `18` | Início do histórico (12+ meses exigidos) |
| `escala` | `1` | Multiplicador de volume; testes usam `0,1` a `0,2` |

**Aleatoriedade.** PRNG `mulberry32`; cada fluxo usa `derivar(semente, rótulo)` = `mulberry32(semente XOR FNV-1a(rótulo))`, com rótulos `businessmap`, `businessmap/projetos`, `businessmap/orfaos`, `businessmap/bugs`, `businessmap/bloqueios`, `acelerato` e `latencia`. Mudar o volume de um fluxo não altera os outros. `Math.random` e relógio do sistema são proibidos por lint.

**Distribuições** (`distribuicoes.ts`): chegadas Poisson por dia útil; durações lognormais parametrizadas por mediana e sigma; Bernoulli para eventos; escolha ponderada para categorias.

| Domínio | Volume (escala 1) | Principais parâmetros |
|---|---|---|
| BusinessMap, demanda sem projeto | ~1.500 stories em 18 meses | Tipos 32/38/24/6 (Incidente, Requisição, Melhoria, Dívida); 95% na equipe dona do sistema; descarte 6% (12% deles excluídos como "Criado por engano"); "esquecidos" (fila ~2.400 h) em 10% das Melhorias e 30% das Dívidas |
| BusinessMap, projetos | 40 projetos (mín. 4), 11 iniciativas (2 sem ficha) | 3 a 8 frentes originais; 35% dos projetos ganham 1 a 4 frentes após o início; 4% das frentes descartadas; 4 a 20 stories por frente; 3% sem pai |
| BusinessMap, eventos | — | Passos do fluxo com medianas de 2 a 10 h × multiplicador do tipo (0,4 a 2); bloqueios em 20% das concluídas e 12% das abertas (1 a 3, ~8 h); data acordada em 30% (sempre em Prazo fixo); reabertura 3% gera defeito em produção; bugs Poisson (λ 0,04 a 0,12; 1,5 em 15% das stories) |
| Acelerato | ~6.000 chamados em 18 meses | Prioridade P1..P5 com pesos 1/6/30/43/20 (pico em jun/2026: 4/22 e volume ×1,1); ajuste manual 4%; equipes 50/25/25; nível N1 52, N2 30, N3 9, Fornecedor 9; pendência extra 25%; excluídos 1%; medianas de SLA calibradas para aderência de ~80 a 90% |
| Latência | por chamada | 150 a 400 ms sorteados com semente; `latenciaMs: 0` desliga |

Base padrão gerada: **5.788 cards** e **6.062 chamados**, em ~150 ms (limite de 1,5 s, [ADR 0003](../architecture/adr/0003-orcamento-de-performance.md)).

**Mudanças de critério fictícias** (`criterios.ts`, neutro aos dois geradores): `2026-03-02` (marco de entrada; afeta O7, O9, O10, T1, EI_FL1..3) e `2026-06-01` (novas etapas do Acelerato; afeta S1..S7, EI_SUST).

## 4. Classes abaixo de 20 itens (de propósito)

A base garante os dois lados da regra "abaixo de 20 itens, não publicar" para que a UI exiba `AmostraInsuficiente` com dados reais do gerador (spec de UX 9.2, testes em `mock.test.ts`):

| Onde | Insuficiente | Publicado |
|---|---|---|
| O3 e T1 (12 semanas), por tipo/classe | ao menos uma classe com 0 < n < 20 | ao menos uma com `status: ok` |
| T5, por sistema | ao menos um sistema (ex.: "Portal do cliente", peso 4) | outros sistemas |
| S1 (6 meses), restauração | P1 | P3 |

Também são garantidos: itens acima do P95 (O2), backlog acima de 180 dias (O10), bloqueados agora, as quatro responsabilidades de atraso (O12), escopo adicionado (T9) e ao menos duas iniciativas sem ficha (E3).

## 5. Hash da base

`hashJson(base)` = FNV-1a 32 bits sobre `JSON.stringify` da base, em hexadecimal. Fixado em teste: qualquer mudança no gerador que altere dados quebra o teste e exige decisão explícita (os números da UI e das evidências de QA mudam).

| Configuração | Hash |
|---|---|
| Padrão (`semente 20261009`, `escala 1`) | `924448d4` |
| `escala: 0.2` | `b2bfd4c0` |
| Só BusinessMap / só Acelerato (padrão) | `f780e90f` / `0113e077` |

Fonte: `packages/mock/src/mock.test.ts` e [evidência da fase A](../qa/evidencias/hash-base-fase-a.json) (o caminho `web/src/mock` ali é anterior ao monorepo; o hash se manteve).
