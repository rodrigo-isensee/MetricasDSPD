# Documentação técnica: discovery de achabilidade

Propósito: tornar contratos e diagramas de domínio (DDD) achados em até 2 cliques. Público: time, arquiteto, UX. Revisão: 2026-10-11. Status: proposta, aguarda validação do usuário. Premissas sobre os leitores são hipóteses até o usuário confirmar.

## 1. Quem lê e o que precisa achar (até 2 cliques de `docs/README.md`)

| Leitor | Precisa achar |
|---|---|
| Desenvolvedor novo | Setup e scripts; mapa do monorepo; "como adicionar uma métrica"; contexto C4 |
| Agente de IA | Regras invioláveis; contrato de uma rota/DTO; agregado e invariantes de um contexto; onde está o código de cada coisa |
| Arquiteto | ADRs vigentes (e as substituídas); modelo de dados; diagramas de contexto e de domínio |
| QA | Plano e gate; critérios de aceite por spec; relatórios e bugs |
| Gerente / DPO | Quais métricas existem; o que nunca é medido (individual); quais dados pessoais são lidos e onde |

## 2. Falhas de achabilidade hoje

1. Não existe `docs/README.md`. O índice está em `docs/tecnica/README.md`, pasta que só guarda 4 documentos do front e da biblioteca.
2. O índice não linka `docs/especificacao/domain/**` (cerca de 90 arquivos por contexto: `collection`, `flow`, `metrics`, `reference`, `support`). Os `_context.md` são a entrada de cada contexto e não há mapa que os reúna.
3. O índice não linka `docs/api/openapi.json`, `docs/api/metricas.md` nem `docs/api/fontes.md`. Contrato é o que o desenvolvedor mais procura e hoje está fora do mapa.
4. Fonte da verdade dividida sem mapa único: `docs/briefing-execucao-metricas.md`, `docs/architecture/` e `docs/tecnica/`. A seção 3 do índice mistura ADRs, modelo e planos, sem separar "vigente" de "substituída".
5. Os cabeçalhos variam: o `overview.md` traz data e revisão, o guia traz "Versão 1". Não há padrão de propósito e público.
6. Nomes mistos: `especificacao` (domínio, em inglês nos arquivos) contra `tecnica`, `architecture`, `engineering` (português e inglês). Em `docs/architecture/propostas/serverless-outra-sessao/` há ADR e overview duplicados com os oficiais.
7. Diagramas Mermaid (`overview.md`) sem título, legenda nem alternativa textual. O C4 nível 2 tem cerca de 20 nós, e só a cor e a forma indicam tipo.

## 3. Proposta de arquitetura de informação

`docs/README.md`, ponto de entrada único, em 3 blocos curtos:
- **Como ler** (5 linhas): fonte da verdade (o briefing vence); o que é decisão (ADR), contrato, domínio, guia e registro; onde o código mora.
- **Por pergunta** (tabela "Quero... / Vá para"): ex. "chamar a API" leva a `api/openapi.json`; "entender um agregado" leva a `especificacao/domain/<contexto>/_context.md`; "por que Postgres" leva à ADR 0014.
- **Por papel**, com ordem de leitura. Desenvolvedor novo: README, briefing seções 00 a 04, `architecture/overview.md`, guia do desenvolvedor, `_context.md` do contexto da tarefa. Agente de IA: CLAUDE.md, regras do briefing, `regras-metricas.md`, spec do domínio. Arquiteto: overview, ADRs, data-model. QA: `tecnica/qualidade-e-testes.md`, `qa/`. Gerente/DPO: catálogo de métricas, regras proibidas, fontes.

Convenções:
- **Pastas por tipo de documento.** `especificacao/` é o domínio, `api/` os contratos, `architecture/` as decisões, `tecnica/` o como funciona, `engineering/` as práticas. Cada pasta tem um `README.md` curto que lista seu conteúdo. O `tecnica/README.md` deixa de ser o índice geral.
- **Nomes de arquivo.** kebab-case, sem datas (salvo `alinhamentos` e `retrospectivas`), ADR com numeração `NNNN-assunto.md`. Mover documentos para o padrão só com redirecionamento nos links.
- **Estado explícito.** Cada ADR e proposta traz `Estado: vigente | substituída por NNNN | proposta`. Propostas ficam fora do caminho principal do índice.
- **Contratos em um lugar.** Uma página `api/README.md` aponta o `openapi.json`, os schemas Zod de `packages/contratos` e as necessidades de dados por tela, sem duplicar conteúdo.
- **Domínio em um lugar.** Uma página `especificacao/domain/README.md` traz o mapa de contextos (um diagrama) e um link por `_context.md`.

### Diagramas Mermaid
- Título em `###` imediatamente acima, e uma legenda logo abaixo do bloco. Exemplo de título: "Containers do MetricasDSPD (C4 nível 2)".
- Máximo de 15 nós por diagrama. Acima disso, dividir por contexto ou por nível C4.
- Forma e cor nunca carregam sozinhas o significado. Cada tipo ganha sufixo no rótulo, como "(banco)" ou "(externo)", e a legenda lista forma, cor e texto. Contraste 4.5:1 entre texto e fundo, e paleta de no máximo 4 cores.
- Alternativa textual em lista, logo após a legenda, dentro de `<details>` aberto por padrão: "Quem conversa com quem", uma linha por relação (`origem -> destino: o que trafega`).
- Cada diagrama de domínio cita o `_context.md` ou a ADR de origem. Quando a decisão já está em ADR, o diagrama aponta para ela em vez de repetir.

## 4. Regras de legibilidade
- Toda página começa com uma linha de **propósito**, **público** e **data de revisão** (formato `AAAA-MM-DD`).
- Um assunto por página, e títulos que respondem a uma pergunta ("Como adicionar uma métrica").
- Tabelas para comparar, listas para passos. Parágrafos de até 5 linhas e links com texto descritivo (nunca "aqui").
- Termo de domínio no idioma da spec, sempre o mesmo, com glossário no `README.md` de domínio.
- Termos proibidos e regras invioláveis (avaliação individual, mistura BusinessMap/Acelerato) ficam em um bloco único e linkado, nunca copiados.

## 5. Critérios de aceite verificáveis
1. `docs/README.md` existe, e de dentro dele cada leitor da seção 1 chega ao seu item em no máximo 2 cliques (verificado por roteiro de 5 tarefas, uma por leitor, com sucesso em todas).
2. Link-check sem links quebrados em `docs/**/*.md`, incluindo âncoras. Roda no `pnpm run pronto` e no CI.
3. Todo arquivo de `docs/` (exceto `reviews`, `qa/bugs`, `alinhamentos` e `kanban`) é alcançável a partir de `docs/README.md` e dos índices de pasta (verificação de órfãos).
4. Toda página não excluída acima tem propósito, público e data de revisão nas 5 primeiras linhas (script de verificação).
5. Todo bloco ` ```mermaid ` tem título, legenda e lista de alternativa textual, no máximo 15 nós, e nenhum contexto de domínio fica sem `_context.md` linkado do mapa.
6. Todo ADR e proposta tem a linha de estado, e o índice lista só as vigentes no caminho principal.
7. `openapi.json` e `docs/api/README.md` linkados a partir do `docs/README.md` em um clique.
8. Validação do usuário: roteiro de achabilidade com 3 pessoas (ou 3 agentes), com meta de achar contrato e diagrama de domínio em até 60 s.

## 6. Perguntas abertas ao usuário
- Mover pastas ou só criar índice e convenção? (recomendação: índice agora, mover depois)
- Ok marcar `propostas/serverless-outra-sessao` como arquivada?
- O link-check entra como bloqueio no CI ou só aviso?
