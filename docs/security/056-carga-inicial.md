---
tipo: revisao-seguranca
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-carga-inicial
commit: 180f2464dad1e739357ee3162a27d8aa4d306fab
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Revisão de segurança: carga inicial do ref_dominio do Acelerato (056, E4.30, E4.35 e E4.37)

Escopo original (E4.30): diff `0783caa...521dd1f` (comando `ac:ref-sync`, módulo `dominio-acelerato`, `PG_REF_URL`, arquivo `acelerato-dominio.json`, §12 de `acelerato-listas.md`). Renovação E4.35: `33aa255..bf5cfd5` (volta E4.33). Renovação E4.37: `2f9c4f3..180f246` (E4.32 e testes .qa. de 6e52cff), com `forge-check delta` sobre o parecer anterior. Revisão estática; nada foi conectado ao MySQL nem ao banco, e o `.env` não foi aberto. Lacuna de ferramentas: `gitleaks`, `osv-scanner`, `semgrep` e `zizmor` não estão no PATH desta máquina (varredura fica no CI). A suíte não foi reexecutada por mim (o sandbox do papel recusou o `pnpm`); vale o `test:pg` verde registrado na E4.32 e o parecer de QA. Não há dependência nova.

## Gatilhos
Banco (escrita em `ref_dominio` por papel dedicado), segredo (variável de conexão nova) e conteúdo de domínio vindo de texto livre da fonte (R-SEGURANCA).

## Achados
- A1 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:38 · RESOLVIDO em 6e3b062: a classe recusa controle, formato, separadores de linha e arroba; testes cobrem U+2028, U+2029, U+200B e U+202E.
- A2 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:50 · RESOLVIDO em 6e3b062: `descricao`, `motivo`, `referencia` e `regra` passam por `textoSeguro`.

## Verificações do delta E4.37 (sem achado novo)
- Pendência da E4.35 fechada: as listas do recorte (§4 a §6) entram em `acelerato-dominio.json:14-23`: tipo `23`, organização `3`, equipes `7`, `9` e `332`. Conteúdo: chaves numéricas e nomes de domínio do próprio DSPD (tipo, fila nova, três equipes de sustentação). Sem pessoa, sem e-mail, sem endereço de servidor, sem linha de chamado e sem organização cliente; o arquivo não tem arroba.
- Validador: os três campos novos estão em `CAMPOS_DOMINIO` e `CAMPOS_DE_CHAVE` (dominio-acelerato.ts:17-20), então o código só aceita chave numérica de até 15 dígitos (linhas 67-68) e o rótulo passa por `textoSeguro`. A carga lê esses campos por consulta constante em referencia.ts:25.
- Organizações fora: ESCRITORIO DE PROJETO e INTERNO citadas em acelerato-listas.md só pelo nome do papel de fila e contagem, por decisão do dono; são organizações do próprio DSPD, não cliente externo, e não entram no arquivo. A fila antiga ficou fora (não achada), sem inferência de nome.
- Contagens (5278, 4114, 1052, 94, 6907, 63, 1004): agregados sem identificação de pessoa; não permitem avaliação individual nem comparação entre times (equipes aparecem só como filtro de recorte).
- Testes .qa. (6e52cff): `dominio-acelerato.qa.test.ts` prova que comando e módulo não importam driver MySQL, PG de outra fonte nem BusinessMap, e que o arquivo não traz arroba nem invisível; `dominio-acelerato.qa.pg.test.ts` prova, com BEGIN e ROLLBACK, que `dspd_coletor`, `dspd_ref` e `dspd_api` recebem 42501 em UPDATE, DELETE e INSERT indevidos. Não há segredo nem credencial nos testes; a URL vem do contexto `./pg/ctx.js`.
- Regras invioláveis: nada é escrito no Acelerato, nenhuma coluna de pessoa chega à base, BusinessMap e Acelerato seguem separados (schema `dspd_ac`). Histórico só cresce.

## Riscos aceitos
Nenhum.
