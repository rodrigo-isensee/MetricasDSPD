# Segurança da pesquisa de percepção de valor (PV1, K-036)

Propósito: registrar o que a pesquisa trimestral de percepção muda na superfície de segurança e de privacidade: dados, papéis, carga, anonimato e riscos aceitos. Público: arquitetura, engenharia e operação. Revisão: 2026-10-12 (rodada 2 do code review; planos 9 R3 e R5 em [`lacuna-de-valor`](../architecture/features/lacuna-de-valor.md)).

## 1. Dados guardados (só agregados)

- Tabelas `pesq_carga`, `pesq_resultado`, `pesq_participacao` (dados) e `ref_pesq_area`, `ref_pesq_pergunta` (referência), no schema `dspd_core`. Só contagens por trimestre, área, pergunta e faixa da escala, mais convidados e respondentes por área.
- Nenhuma coluna de pessoa, de respondente ou de comentário. O teste de banco confere isso por nome de coluna (`server/tests/pesquisa.pg.test.ts`). A área vem de lista fechada (`ref_pesq_area`): nome de pessoa não entra pela coluna `area`.
- Resposta individual e comentário livre nunca chegam ao app (decisão 25). O cabeçalho do CSV é fixo; coluna a mais, aspas ou `@` recusam o arquivo inteiro.
- O único texto livre é o "O que mudou", escrito pela coordenação (decisão 28): até 500 caracteres, com CHECK de e-mail e URL no banco. Risco aceito R3: não há como detectar nome de pessoa por máquina. Mitigações: autoria restrita, limite de tamanho, recusa de e-mail e URL, confirmação no script e exibição como texto puro.
- Todas as tabelas `pesq_*` são append-only (gatilho; `UPDATE`, `DELETE` e `TRUNCATE` recusados até para o dono). Reenvio cria carga nova e guarda a anterior.

## 2. Papéis e privilégios

| Papel | Privilégio | Observação |
|---|---|---|
| `dspd_pesquisa` | `USAGE` em `dspd_core`; `SELECT, INSERT` em `pesq_*`; `SELECT` em `ref_pesq_*` e `ref_versao_criterio*` | Só a carga usa. O `SELECT` em `pesq_*` serve à idempotência e ao `RETURNING`. Sem acesso a `dspd_bm` nem `dspd_ac`. |
| `dspd_api` | `SELECT` em `pesq_*` e `vw_pesq_*` | Só leitura. Nenhuma rota de escrita existe. |
| `dspd_coletor` | nenhum em `pesq_*` | O coletor não lê nem escreve a pesquisa. |
| `dspd_ref` | cadastra áreas e questionário | Como nas demais tabelas `ref_`. |

- Senha de `dspd_pesquisa` só em `.env` (`DSPD_PWD_PESQUISA`). Em homologação é obrigatória, sem valor padrão (code review B-1): o init do Postgres não tem `:-`, o compose usa `${DSPD_PWD_PESQUISA:?...}`, `validarEnv` recusa ausente, curta ou `*_dev`, e a CI gera o valor. Os testes de `tools/homolog` falham se alguma `DSPD_PWD_*` do init faltar nesses pontos.
- Volume antigo sem o papel: a migração falha cedo com mensagem que aponta `docker/postgres/reparar-papeis.sh` (idempotente, roda como administrador). O migrador não cria papel nem concede `CONNECT`.

## 3. Carga

- Script externo (`tools/pesquisa`), sem rota de escrita na API (a API não tem autenticação, S M-1). Valida tudo (cabeçalho, somas por pergunta, `respondentes <= convidados`, área na lista fechada, texto sem e-mail nem URL) antes de qualquer escrita, em modo de conferência por padrão; só grava com `--confirmar`.
- Uma transação por carga, com `pg_advisory_xact_lock` por trimestre. SQL parametrizado e identificador de schema validado. Erros mostram só linha, coluna e regra, nunca o conteúdo.
- Idempotência por `sha256` do arquivo contra a carga vigente. Pendência m-6 do review: o "O que mudou" não entra no hash (reenviar o mesmo arquivo com outro texto devolve "já carregada").
- Execução em produção (P11, R4): o RDS é privado (ADR 0013); o caminho operacional é definido com o ambiente AWS. Até lá, só PG local e de homologação.

## 4. Anonimato (A10) e reenvio (I-2)

- Mínimos 5 (consolidado) e 3 (por área), e abaixo de 20 respostas só contagens "k de n", sem percentual (decisão 24). Valem no schema do resultado: o payload não consegue carregar número proibido.
- A10: supressão complementar em "Outras áreas". O consolidado menos qualquer subconjunto de áreas publicadas nunca resulta em 1 ou 2 respondentes (propriedade P7, 300 bases aleatórias).
- I-2, decisão do time de 2026-10-12 (padrão restritivo, reversível; adendo em [`decisoes-delegadas-ao-time`](../alinhamentos/2026-10-11-decisoes-delegadas-ao-time.md)): a PV1 publica **sempre só a última carga vigente de cada trimestre**. A `dataReferencia` só decide se o trimestre já existia. Antes, a data permitia ver a carga substituída e a que a substituiu; um reenvio que acrescentasse 1 ou 2 respondentes expunha as respostas deles por subtração, no consolidado e na área. Agora nenhuma data obtém a carga substituída (testes: P7b e o caso do mock). A substituída fica só na base, para auditoria. Custo aceito: não é possível "ver o painel como estava" antes de um reenvio. Pendente do usuário: confirmar (a), ou escolher (b) publicar a substituída só se a diferença por grupo for 0 ou 3 ou mais.
- Risco residual R2: combinar a pesquisa com conhecimento externo (quem foi convidado). Mitigado pelo mínimo, pelo 1º ciclo só consolidado e pela A10; o mínimo é parâmetro e só sobe.

## 5. Fora do escopo e regras invioláveis

- Nada individual: sem ranking de área, nota única, média, meta ou semáforo; áreas em ordem alfabética fixa (decisões 26 e 27).
- A PV1 tem fonte própria (`pesquisa`): não mistura com BusinessMap nem Acelerato, não entra em calibração, Visão geral nem exportação.
