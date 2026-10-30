---
tipo: review
contrato: 1
pedido: 056-acelerato-mysql
branch: docs/056-acelerato-discovery
commit: 19275cb004b57361a6bf60ba0e654ebee0828ef5
parecer: aprovado
revisor: tech-lead
data: 2026-10-30
---

# Code review: discovery do Acelerato pela tabela MySQL (E2.2, K-189)

**Veredito: aprovado.** Não há achado bloqueante. Ficam quatro recomendações, que não devolvem a entrega. A A2 precisa de resposta antes do código da fatia F1.

## Escopo lido
- Commit 19275cb (base 11141d7), diff inteiro: `CLAUDE.md` (1 linha trocada) e os quatro documentos novos, que são o plano (`docs/architecture/features/056-acelerato-mysql.md`), o modelo de ameaças (`docs/security/056-acelerato-mysql-ameacas.md`), a doc do dash (`docs/integracao/acelerato-dash-atual.md`) e as respostas do time de ciência de dados (`docs/integracao/acelerato-respostas-ciencia-de-dados.md`). Li tudo, sem amostragem.
- Regras de leitura do `docs/engineering/praticas.md` que alcançam o diff: seção 8 (checklist) e seção 9 (commits e docs).
- Teto M14: `git diff --numstat --no-renames origin/develop...HEAD` dá só arquivos `.md`, ou seja, 0 linhas de código e de teste. Um comportamento só (o registro do discovery mais a regra da fonte).

## Ferramentas (citadas)
- `nice -n 19 pnpm run docs:check` na worktree, em 19275cb: `docs:check: ok (805 páginas Markdown, 69 métricas, 2 eventos)`, EXIT=0.
- `forge-check docs` na worktree: este parecer passou sem erro. No diff da E2.1, o comando acusou um erro, `docs/architecture/features/056-acelerato-mysql.md: estado: use proposta ou vigente (ADR-0004)` (vira a A4). Os outros erros que ele lista são de arquivos antigos, fora do diff.
- O `pronto` não se aplica: o diff não tem código.

## Conferências pedidas
- **Linha de dado:** nenhuma. Os documentos trazem nomes de coluna, tipos, domínios (filas, prioridades, nomes de campo e de etapa) e contagens agregadas. Nenhum valor de chamado aparece. O único `valor` citado é um texto de instrução do formulário (respostas:71).
- **Nome de pessoa:** nenhum. Agente e solicitante aparecem só como nome de coluna. Varri as 856 linhas adicionadas por padrão de e-mail e não achei ocorrência.
- **Endereço ou porta do servidor:** nenhum. O MySQL aparece só como "faixa interna 10.x, porta não padrão" (respostas:65). A varredura por IPv4 e por `:porta` não achou nada. O nome `UNIFIQUE.ACELERATO_CHAMADOS` é o esquema e a tabela, não o endereço. Observação, sem achado: dash:34 traz o host web do Acelerato (link do ticket). É o endereço da aplicação, não do servidor MySQL.
- **Organização cliente:** nenhuma. As únicas organizações com nome são as duas do próprio DSPD (respostas:51; dash:47). Os clientes externos aparecem só como contagem ("dezenas", "36 menores"). Os nomes de equipe (dash:41) são equipes internas.
- **`CLAUDE.md:23` contra a DECISÃO DO DONO "B" (2026-10-30):** bate. A leitura passa a ser da tabela mantida pelo time de ciência de dados, só SELECT, com usuário só leitor e credencial só no `.env`. A credencial da API sai da lista. A allow-list continua na fronteira e as colunas de pessoa seguem barradas, agora com os ids de agente e de solicitante e o `raw` citados de forma explícita. A regra não contradiz as outras regras invioláveis: não mistura as fontes, guarda o histórico e mantém o GRANT por coluna do `dspd_api`.

## Checklist (leitura)
- **Escopo:** é só o discovery, sem código e sem edição da ADR 0013, do `data-model.md` nem do roteiro do Metabase (o plano §5 só propõe o texto, como o pedido manda).
- **Regras invioláveis:** o plano §3.4 recusa as visões individuais do dash (D-1, ADR 0020). As fontes não se misturam. Percentis, janela e mínimo de 20 ficam na biblioteca. A exceção da D-7 vai para `ref_versao_criterio` com marca nos gráficos (T2.6). As dúvidas de regra viram perguntas (§6.1), não decisão.
- **Segurança:** o modelo de ameaças cobre credencial, TLS sem CA, injeção e `LOCAL INFILE`, pessoa dentro de `json` e clientes externos (M1 a M11), com casos de abuso para o QA. Não refaço o parecer do security-engineer, que vem por fatia de código (R-SEGURANCA).
- **Mecanismo novo:** o plano §5.1 traz critério de reversão e alternativas para a ADR 0023 proposta.
- **Commit:** Conventional Commits em português, escopo `arquitetura`, com `Cartão: K-189`, `Pedido:` e as linhas de atribuição. Os documentos de outros autores entraram pelo tech-lead, como manda a E2.1.

## Achados
- A1 (recomendado) CLAUDE.md:23 · A regra nova não cita o TLS verificado nem o filtro da população na origem, que o modelo de ameaças §4 (linha 142) pede para manter. Levar ao security-engineer, que decide se promove a exigência.
- A2 (recomendado) docs/architecture/features/056-acelerato-mysql.md:187 · Diz população igual à do dash por construção, mas o dash (dash:38-42) não filtra organização e o plano filtra as duas do DSPD (:31, :221). Contar SSSC fora delas antes da F1 ou confirmar com o dono.
- A3 (recomendado) docs/security/056-acelerato-mysql-ameacas.md:88 · O `com_agente` aparece derivado em memória aqui (e na linha 90), e no SELECT no plano (:85, :220). Alinhar à forma do plano, que é mais estrita: o id não sai do MySQL.
- A4 (recomendado) docs/architecture/features/056-acelerato-mysql.md:5 · O `forge-check docs` recusa `estado: pronto-para-validacao` e aceita só proposta ou vigente (ADR-0004). Com o plano validado na E1.1, o valor é vigente. É ajuste de uma linha, a fazer antes do PR (E2.4).

## Observações
- O QA da E2.1 (E2.3) é a etapa seguinte. Este parecer não o substitui.
- A A2 vale como pergunta de regra de negócio (R-DECISAO). Não foi resolvida aqui por inferência.
