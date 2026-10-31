---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f2-referencia
commit: 75ee95308d6aad2227ddf1605bac7d69d932796a
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-31
---
# Review de segurança: F2 do coletor do BusinessMap, referência real do quadro (pedido 052, E2.33 e E2.38, K-182)

Propósito: parecer de segurança da E2.32 (carga da referência real com vigência, função única de papel por folha, exceções de trabalho no arquivo de conferência e identidade por id em `mapa.ts`) e, por delta, da volta 1 (E2.37). Gatilhos: integração externa, dados de pessoa e histórico (R-SEGURANCA). Público: node-backend (dono do código), tech-lead (E2.34, E2.39), qa-engineer (E2.35), Jarvis.

**Veredito: aprovado** em `75ee953` (rodada 1 aprovada em `5a75265`). Não há achado bloqueante. Fica um recomendado aberto (A2, para o comando da F3); o A1 foi resolvido. Revisão estática. Nada foi chamado no BusinessMap e o `.env` não foi lido. As execuções foram `server/tests/referencia-businessmap.test.ts` e `server/tests/conferencia.test.ts`, contra o servidor falso e o banco simulado (32 testes na revalidação, todos passaram).

## Revalidação (E2.38, volta 1 da F2, delta `0db2de1..75ee953`)
Delta de 2 arquivos: `referencia.ts` (+15 -5) e `referencia-businessmap.test.ts` (+66 -2). Sem migração, sem GRANT novo, sem caminho novo na lista fechada.

- **A1 (resolvido).** O teste `A1 da segurança` (`server/tests/referencia-businessmap.test.ts:441-472`) injeta marcadores de pessoa (owner, e-mail, nome, usuário) na raiz, nas colunas e nos workflows de `currentStructure`, em `workflows` e em `cardTypes`. Confere que nenhuma escrita (texto e valores) contém `MARCA-` nem `@x.test`, e o mesmo para a mensagem de `ErroReferencia` numa mudança sem motivo (`msg` não vazio, então o erro de fato ocorre). Trava a regressão: uma linha que passasse a copiar campo de pessoa para uma coluna gravada falharia. Ressalva informativa: o INSERT usa só as colunas fixas de `ESP` (`referencia.ts:322-326`), então um espalhamento do objeto sozinho já não chegaria ao banco. O teste cobre a regressão que importa, a de mapear campo de pessoa para uma coluna permitida.
- **A2 (aberto, recomendado).** Fora do escopo da volta: segue para o comando da F3, pela decisão técnica do Jarvis.
- **Contagens novas no Resultado.** `ausentes` e `folhasSemPapel` (`referencia.ts:189-194`, `:216-225`, `:272`, `:336`) são inteiros calculados sobre chaves e papel. Não levam id, nome nem valor de pessoa. `ausentes` só conta e não fecha vigência (o teste confere que nenhum UPDATE toca a chave ausente), então o histórico segue intacto.
- **Compromisso por card.** `folhasDoMarco` (`referencia.ts:388`) é função pura sobre linhas já em memória, sem escrita nem SQL novos.
- **Banco.** As escritas continuam só INSERT de vigência e UPDATE de `vigente_ate`. Nenhum GRANT novo (`git diff` de `server/migrations` e `server/src/plataforma` vazio no intervalo).
- **Varreduras.** `gitleaks`, `osv-scanner` e `semgrep` seguem fora do PATH (lacuna registrada). Sem dependência nova.

## O que foi verificado (rodada 1, `5a75265`)
- **Só GET e lista fechada.** `lerReferenciaReal` (`server/src/modulos/businessmap/referencia.ts:64-72`) chama só `cliente.get` do cliente da F0 em três caminhos: `/boards/{id}/currentStructure`, `/boards/{id}/workflows` e `/cardTypes`. Os três já estão na lista fechada (`server/src/plataforma/http.ts:16`, `:18`). O método continua fixo em GET, o redirect não é seguido e o erro tem texto fixo, sem corpo nem `cause` (controles da F0). O teste confere que todo pedido é GET e que nada vai a `/cards` nem a `/users`.
- **Allow-list na leitura da resposta.** Nenhuma resposta é gravada inteira. As linhas são montadas campo a campo: do workflow saem `workflow_id`, `type` e `name`; do tipo de card, `type_id` e `name`; da coluna, `name`, `section`, `flow_type`, `parent_column_id`, `workflow_id` e `limit`. O quadro é gravado como `Quadro <id>`, não pelo nome da API. Ids passam por `idDe`; a chave de coluna só entra com 1 a 12 dígitos, então não há poluição de protótipo. Os nomes são limpos de quebra de linha, barra vertical e crase e cortados no tamanho da coluna.
- **Nenhum valor de pessoa gravado.** Só entram ids e nomes de coluna, de workflow e de tipo de card (estrutura). A resposta de `currentStructure` não chega a `stg_` nem a tabela fora das quatro `ref_`.
- **Papéis do banco.** A carga escreve só em `ref_quadro`, `ref_workflow`, `ref_coluna`, `ref_tipo_card` e, no core, `ref_versao_criterio` e `ref_versao_criterio_metrica`. O `dspd_ref` tem só SELECT e INSERT nas `ref_` e UPDATE apenas de `vigente_ate` (`server/src/plataforma/db/grants.ts:82-84`, `:90-91`). O `dspd_coletor` só lê as `ref_` (`grants.ts:71`) e grava só o número da folha sem conferência em `ctl_coleta_contagem` (`grants.ts:70`).
- **Histórico nunca sobrescrito.** O único UPDATE é `SET vigente_ate = $1 WHERE vigente_ate IS NULL AND <chave>`. Garantido em três camadas: grant por coluna do `dspd_ref`, gatilho `proibir_alteracao_vigencia` em `ref_workflow` e `ref_tipo_card` (`server/migrations/0018_bm_referencia_workflow_tipo_times.ts:24-33`, `:53-56`) e índice único de vigência aberta. Mudança de significado sem motivo é recusada antes de qualquer escrita.
- **SQL.** Todo valor vai por parâmetro (`$n`). Nomes de tabela e coluna vêm só de constantes e dos esquemas do ambiente.
- **Erro sem dado sensível.** As mensagens de `ErroReferencia` têm texto fixo mais tabela e chave (ids), no máximo cinco.
- **Arquivo de conferência sem nome de pessoa.** `docs/architecture/fontes/businessmap-conferencia.json` traz ids e nomes de coluna e de tipo de card. O esquema `colunaTrabalho` é `strict` (`server/src/modulos/businessmap/conferencia.ts:16-18`, `:36`).
- **Resto do delta da rodada 1.** `papelDaFolha` (`spike-lista.ts:57-66`) é a mesma regra numa função só; o rótulo `nome (id)` em `mapa.ts:29-33` não tem efeito de segurança. Nada mistura BusinessMap e Acelerato.
- **Fora do delta, informativo.** `ref_dominio` e o mapa `field_id` para domínio, citados no plano, passam por review de segurança quando entrarem (o field 42, de pessoa, fica fora).

## Achados
- A1 (recomendado) server/tests/referencia-businessmap.test.ts:441 · Resolvido em 75ee953: o teste injeta owner, e-mail e nome marcados nas três respostas e confere escritas e erro sem marcador. Dono: node-backend.
- A2 (recomendado) server/src/modulos/businessmap/referencia.ts:291 · Transação e papel ficam com o chamador. Na F3: transação com o dspd_ref, dspd_coletor só na contagem, sem log de ReferenciaLida, testes de rollback e de 42501 do coletor em ref_coluna. Dono: node-backend.

### Detalhe do A2
Evidência: o comentário de `sincronizarReferencia` pede uma conexão já em transação, e a função não sabe qual papel a usa. `ReferenciaLida` guarda os corpos inteiros das respostas. Caminho de ataque: não há atacante, os riscos são acidentais. Falha no meio sem transação deixa uma vigência fechada sem a nova. Papel mais amplo tira a proteção do grant em `ref_coluna` e `ref_quadro`. Log de `ReferenciaLida` levaria a resposta crua ao log. Severidade: baixa. Correção mínima, no comando da F3: transação explícita com o `dspd_ref` para `sincronizarReferencia`, conexão do `dspd_coletor` só para `registrarFolhasSemConferencia`, nenhum log de `ReferenciaLida`. Testes .pg: rollback sem linha nova nem fechada quando um INSERT falha, e `dspd_coletor` com INSERT em `ref_coluna` dando `42501`. Esforço P.

## Plano em cartões
- A1: concluído na E2.37.
- A2: node-backend, no comando da F3. O tech-lead confere no plano da F3.

## Riscos aceitos
Nenhum novo. Segue valendo o risco aceito pelo dono em 2026-10-29: a chave do BusinessMap é a dele e pode alterar o quadro. A F2 mantém a mitigação, porque só usa GET.
