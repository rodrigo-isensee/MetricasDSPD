---
tipo: revisao-seguranca
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-carga-inicial
commit: bf5cfd5dc779e6f6d1403bfabdcef72a33175598
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-31
---
# Revisão de segurança: carga inicial do ref_dominio do Acelerato (056, E4.30 e E4.35)

Escopo original (E4.30): diff `0783caa...521dd1f` (comando `ac:ref-sync`, módulo `dominio-acelerato`, `PG_REF_URL`, arquivo `acelerato-dominio.json`, §12 de `acelerato-listas.md`). Renovação por delta (E4.35): `33aa255..bf5cfd5` (volta E4.33, 9 arquivos, +165 -16), com `forge-check delta` sobre o parecer anterior. Revisão estática; nada foi conectado ao MySQL nem ao banco, e o `.env` não foi aberto. Lacuna de ferramentas: `gitleaks`, `osv-scanner`, `semgrep` e `zizmor` não estão no PATH desta máquina (varredura fica no CI). Não há dependência nova.

## Gatilhos
Banco (escrita em `ref_dominio` por papel dedicado), segredo (variável de conexão nova) e conteúdo de domínio vindo de texto livre da fonte (R-SEGURANCA).

## Achados
- A1 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:38 · RESOLVIDO em 6e3b062: a classe agora é `[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}@]`; os testes cobrem U+2028, U+2029, U+200B e U+202E (dominio-acelerato.test.ts:63-76).
- A2 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:50 · RESOLVIDO em 6e3b062: `descricao`, `motivo`, `referencia` e `regra` passam por `textoSeguro` (300, 500, 300, 2000).

## Verificações do delta (sem achado novo)
- Texto seguro: rodei o novo validador contra o `acelerato-dominio.json` atual (135 categorias, 19 descrições, `versao_criterio` e `regra`): 0 recusas. O arquivo não mudou no delta, então a carga não quebra.
- Data retroativa (dominio-acelerato.ts:126-129 e 162-164): a consulta das últimas vigências é parametrizada (`$1`), só lê `ref_dominio` do `dspd_ac`; a recusa vale só quando o campo muda e lança `ErroDominio` com datas, sem URL, senha nem texto do banco. A transação desfaz tudo. Fecha o caminho de histórico sobreposto e versão T2.6 com data passada, sem tocar nos privilégios (`dspd_ref` segue com `SELECT, INSERT` e `UPDATE (vigente_ate)`; nada de DELETE).
- Data inexistente (ref-sync-ac.ts:12, `dataCivilValida`): o argumento continua só data civil validada, sem caminho de arquivo; saída de uso com código 2.
- Chave de categoria (dominio-acelerato.ts:19-20): `categoria` entra na checagem numérica, o que restringe mais o conteúdo aceito; sem afrouxamento.
- Documentação nova (server.md:5 e 181-184; acelerato-listas.md:6): cita só o nome da variável `PG_REF_URL`, o caminho do arquivo e o formato do hash; nenhuma credencial, endereço de servidor, linha de dado, pessoa nem organização cliente.
- Regras invioláveis: nada é escrito no Acelerato, nenhuma coluna de pessoa chega à base, BusinessMap e Acelerato seguem separados (schema `dspd_ac` fixo). Histórico só cresce.
- Pendência já registrada: as listas do recorte (§4 a §6) entram no arquivo na E4.32; ao preenchê-las, renovar por delta com a mesma checagem de pessoa e cliente.

## Riscos aceitos
Nenhum.
