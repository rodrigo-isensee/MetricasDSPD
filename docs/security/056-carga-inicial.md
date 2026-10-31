---
tipo: revisao-seguranca
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-carga-inicial
commit: 521dd1fa2e5a535f83c3e6e42b3e08256cf2f025
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-31
---
# Revisão de segurança: carga inicial do ref_dominio do Acelerato (056, E4.30)

Escopo: diff `0783caa...521dd1f` (10 arquivos, +662 -6): comando `ac:ref-sync`, módulo `dominio-acelerato`, `PG_REF_URL`, arquivo `acelerato-dominio.json`, §12 de `acelerato-listas.md`. Revisão estática; nada foi conectado ao MySQL nem ao banco, e o `.env` não foi aberto. Lacuna de ferramentas: `gitleaks`, `osv-scanner`, `semgrep` e `zizmor` não estão no PATH desta máquina (varredura fica no CI). Não há dependência nova (só um script em `server/package.json`).

## Gatilhos
Banco (escrita em `ref_dominio` por papel dedicado), segredo (variável de conexão nova) e conteúdo de domínio vindo de texto livre da fonte (R-SEGURANCA).

## Achados
- A1 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:38 · O validador barra `@` e `\p{Cc}`, mas não separador de linha ou parágrafo (U+2028, U+2029) nem formato invisível (bidi, U+200B). Trocar a classe por `[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}@]`; o arquivo atual não tem nenhum.
- A2 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:52 · `descricao`, `motivo` e `referencia` de `versao_criterio` (e `regra`) são texto livre sem o filtro de `textoSeguro` e vão para `ref_versao_criterio`, legível pela API. Aplicar `textoSeguro(300)` e `textoSeguro(500)`; hoje o conteúdo é revisado em PR.

## Verificações (todas sem achado bloqueante)
- Privilégios do `dspd_ref` (server/src/plataforma/db/grants.ts:79-89): nas tabelas `ref_` só `SELECT, INSERT` e `UPDATE (vigente_ate)`; nenhum DELETE nem TRUNCATE. O teste `.pg` (dominio-acelerato.pg.test.ts:105-114) prova que outro UPDATE e DELETE dão 42501.
- `dspd_coletor` (grants.ts:73): só `SELECT` em `ref_`; o teste confirma que não escreve. A API não ganha escrita.
- Credencial: o `PG_REF_URL` é lido por `carregarConfigRef` e só o comando usa. A saída do comando (ref-sync-ac.ts:21,25) imprime contagens e hash; o erro mostra só a mensagem de `ErroDominio` ou texto fixo, nunca URL, senha nem texto do banco. O log do pool recebe só a mensagem do erro de conexão (pool.ts:41,66), sem URL.
- `.env.example:16` traz só o placeholder de desenvolvimento local (`ref_dev`, 127.0.0.1), igual ao padrão das outras linhas; sem valor real.
- Consulta SQL: toda parametrizada (`$1`..`$5`); só o prefixo do schema vem de constante. O arquivo é lido de caminho fixo, sem argumento de caminho (só a data, validada por regex).
- Histórico: só INSERT de vigência nova e fechamento de `vigente_ate`; transação única; versão de critério T2.6 por hash, uma vez.
- Conteúdo de `acelerato-dominio.json`: 135 categorias e 19 descrições de workflow, sem `@`, sem caractere de controle, sem TESTADEV444; conferi a lista inteira à mão e só há nomes de sistema, tipo de chamado e filas internas, sem pessoa nem organização cliente. As listas do recorte (§4 a §6) ainda não estão no arquivo (E4.32); ao preenchê-las, rever pela mesma checagem.
- Regras invioláveis: nada é escrito no Acelerato (o comando só toca o PostgreSQL), nenhuma coluna de pessoa chega à base, BusinessMap e Acelerato seguem separados (schema `dspd_ac` fixo no arquivo e no esquema).

## Riscos aceitos
Nenhum.
