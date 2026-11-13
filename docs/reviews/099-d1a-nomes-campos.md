---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1a-nomes-campos
commit: 75c59c1b17f4ed766478e225d42c92f1aa9a9d76
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: D1a, nomes exatos dos campos de etapa do Acelerato (E3.63)

## Achados
- A1 (recomendado) docs/architecture/fontes/acelerato-listas.md:37 · o dicionário de onde veio o erro (docs/analises/099-saidas-consultas.md §5 item 2) segue com os nomes sem dois-pontos (linhas 37, 42 e 45) e com "Qual suporte foi acionado?" como "domínio fechado, se lista" (linha 38). Para alinhar: os três nomes com dois-pontos e a linha 38 como fora da lista (texto livre, B6-a). Não muda o comportamento do código; não bloqueia.
- A2 (recomendado) server/tests/acelerato-campos-etapa.test.ts:321 · o título diz que Q6 e Q7 recebem só os nomes com dois-pontos, mas a origem do caso não traz "Qual suporte foi acionado?" e o caso não lê os parâmetros das consultas; o oráculo D1a-nome-exato (§7) pede o campo TEXT na fixture. A sonda S1 mostra que o comportamento está certo; para o teste provar o que o título diz, ponha o campo TEXT com marcador na `etapa([...])` e afirme que o marcador não chega ao `banco.estado`. Não bloqueia.

## Sondas
- S1 · cópia temporária do teste com a origem trazendo `Motivo da Escalação:` (lista, "Hardware") e `Qual suporte foi acionado?` (texto, "MARCADOR-SONDA"), coleta incremental · espera: coleta ok, `motivo_escalacao` = "Hardware", marcador ausente de todo o estado do banco · obtido: passou (arquivo removido; árvore limpa)

## O que foi lido
Diff `develop(4c4a7a33)..75c59c1b`, 2 commits, 7 arquivos, +75 -46 (121 linhas, dentro dos 150), um comportamento só.
- **Pedido:** os três nomes passam à forma exata da fonte (B5-b) com dois-pontos e "Qual suporte foi acionado?" sai de `CAMPOS_ETAPA_F3` (listas-fechadas.ts:40-49), como o §5 itens 2 e 3 de docs/analises/099-saidas-consultas.md. Saiu da lista (não virou `preenchido`), a opção mais fechada das duas que o desenho admite.
- **Sem resto da chave removida:** `grep -rn suporte_acionado` na worktree só acha os dois testes que afirmam a ausência; nada em `ddl.ts`, `seed.ts`, projetor, normalizador, `metricas/` nem `web/`. Payload antigo no staging com `suporte_acionado: null` não é lido por ninguém.
- **Fronteira (ADR 0023 item 4):** Q6 e Q7 filtram por `NOMES_ETAPA_LISTA`/`NOMES_ETAPA_PREENCHIDO` (coletor.ts:119-120) e o zod de `allow-list.ts:174` e `:178` faz `z.enum` sobre as mesmas constantes; nome fora da lista falha fechado com `dados-invalidos`, sem o valor (teste novo da linha 313). O texto livre não chega ao staging (S1).
- **Teste-oráculo escrito à mão:** `NOMES_ESPERADOS_LISTA` e `NOMES_ESPERADOS_PREENCHIDO` (acelerato-campos-etapa.test.ts:19-23) não derivam da constante (B-1 da ADR 0020): voltar um nome sem dois-pontos ou reincluir o campo TEXT reprova o caso "constante de nomes (A1)".
- **Critério de coleta:** `campos_sha256` inclui `nome|tratamento` (controle.ts:58), então a mudança troca o hash e a próxima coleta para com `parametros-mudaram` até o dono rodar `pnpm run coleta ac --reconhecer-mudanca`. É o esperado (mudança de critério registrada); vai no corpo do PR como passo do dono.
- **Guardas:** nenhuma linha de guarda mudou (só dados da constante e testes); classe N, sem mutante a declarar.
- **Ferramentas:** `npx vitest run` nos quatro arquivos tocados que rodam sem banco (acelerato-campos-etapa, acelerato-allow-list, acelerato-l9c, apoio-l9c) → 4 arquivos, 105 testes, todos passaram. `acelerato-l9c.pg.test.ts` precisa do banco de teste e fica para o CI, como o brief registra.
- **Fora do diff, para registro:** `scripts/sql/consultas-098-099/07-B6-a.sql:13` ainda usa os nomes sem dois-pontos; é consulta de análise já executada, não leitura da coleta.
- **Commits:** `fix(acelerato)` e `test(acelerato)`, Conventional Commits em português, cada um coerente.
- Segurança e QA correm em paralelo no mesmo head; não refeitos aqui.

## Parecer
Aprovado sobre 75c59c1b (base develop 4c4a7a33). Os nomes batem com a fonte, o campo de texto livre saiu da lista fechada sem deixar resto, a fronteira segue falhando fechado e os testes da constante são escritos à mão. A1 e A2 são recomendados e não mudam o resultado.
