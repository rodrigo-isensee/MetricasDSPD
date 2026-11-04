---
tipo: review
contrato: 1
pedido: 060-triagem-dependabot
branch: docs/060-claude-md-acelerato
commit: 51078b115b20f3c979dbed1572473ef693ec7220
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 060-triagem-dependabot, texto do CLAUDE.md sobre a leitura do Acelerato (E4.2, K-199)

**Rodada 1, por instância diferente da que escreveu (E4.1). Veredito: aprovado em `51078b1`.** Dois achados, os dois recomendados; nenhum devolve.

## O que foi lido
- `git diff origin/develop...origin/docs/060-claude-md-acelerato` (base `d05bbfc`): um commit (`51078b1`), um arquivo (`CLAUDE.md`), uma linha trocada (a regra de credenciais e leitura do Acelerato, linha 24).
- `docs/architecture/adr/0023-acelerato-pela-tabela-mysql.md` por inteiro (texto igual na develop).

## Conferência
- **Só a leitura e as credenciais do Acelerato mudaram.** Saem "e-mail e token da API do Acelerato" e "API pública, só com GET"; entram "usuário e senha do MySQL do Acelerato" e "tabela MySQL do time de ciência de dados, em transação só de leitura (ADR 0023)". A frase "nada é escrito no Acelerato" segue. O sujeito "Essa API devolve" vira "Essa tabela traz". O resto do arquivo não muda.
- **Bate com a ADR 0023:** fonte = tabela do time de ciência de dados (Contexto e §1 item 1); só leitura em transação `READ ONLY` com `ROLLBACK` (§1 item 3); usuário e senha no `.env` (§1 item 1). A tabela traz pessoa e texto livre (Contexto: 11 colunas barradas e cinco colunas `json`), o que sustenta a troca do sujeito da frase.
- **Seguem iguais, palavra por palavra:** a allow-list na fronteira; a lista de dados que nunca chegam ao staging (nome, e-mail, `usuarioKey`, descrição e título); o papel `dspd_api` sem colunas de pessoa (GRANT por coluna). Atende à decisão do dono de 2026-11-02 ("A", texto do CLAUDE.md sobre o Acelerato).
- O texto não cita o TLS fixado nem o filtro na origem. A ADR 0023 (Consequências) deixa essa promoção com o security-engineer; não é achado deste review.

## Ferramentas e outros pareceres
- O autor relata `docs:check` verde na E4.1. Não refiz.
- Teto da decisão M14: não se aplica, porque o diff não tem código nem teste.
- Segurança e QA: fora deste brief.

## Achados
- A1 (recomendado) docs/architecture/adr/0023-acelerato-pela-tabela-mysql.md:3 · O CLAUDE.md passa a citar como regra uma ADR com "Estado: proposta", já implementada (PR 175). Sugestão: o arquiteto a marca como aceita em PR próprio.
- A2 (recomendado) CLAUDE.md:24 · `usuarioKey` é o nome do campo na API; na tabela, os ids de pessoa são outras colunas (`agente_key` e os `json`). A proibição segue certa por decisão do dono; nomear as colunas da tabela fica para pedido próprio.
