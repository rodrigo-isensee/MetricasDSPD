# Como carregar a pesquisa trimestral de percepção (PV1)?

Propósito: passo a passo para a coordenação e para quem opera o banco carregar o agregado da pesquisa e conferir o painel. Público: coordenação do DSPD e operação. Revisão: 2026-10-12.

A pesquisa roda fora do app. O app recebe só contagens por trimestre, área, pergunta e faixa; não existe rota de escrita na API (plano em [`architecture/features/lacuna-de-valor.md`](../architecture/features/lacuna-de-valor.md), §5). Tabelas: [`architecture/data-model.md`](../architecture/data-model.md), §5 e §8.

## Antes da primeira carga (uma vez)

1. O papel `dspd_pesquisa` existe no servidor. No volume novo o init do Compose o cria; num volume antigo, rode como administrador: `CREATE ROLE dspd_pesquisa LOGIN PASSWORD '...'` e `GRANT CONNECT ON DATABASE metricas TO dspd_pesquisa`, e depois `pnpm run db:migrate` (a migração 0013 e os GRANT). A senha vai só no `.env` (`DSPD_PWD_PESQUISA`).
2. A lista fechada de áreas (`ref_pesq_area`) e o questionário vigente (uma linha em `ref_versao_criterio` com `dominio = 'pesquisa'`, `afeta` = PV1, e as perguntas em `ref_pesq_pergunta`) são cadastrados pelo papel `dspd_ref`. Área é unidade organizacional, nunca nome de pessoa. Trocar o texto de uma pergunta ou a escala exige uma versão nova (mudança de critério T2.6, marcada nos gráficos).

## Carregar um trimestre

1. Exporte da ferramenta corporativa só o agregado, com este cabeçalho exato (nada além dele):

   `trimestre,area,pergunta,f1,f2,f3,f4,f5,convidados`

   Uma linha por área e pergunta; `f1` a `f5` são as contagens da escala (de "Discordo totalmente" a "Concordo totalmente"); `convidados` é o mesmo número em todas as linhas da área. Sem aspas, sem comentário, sem e-mail ou nome.
2. Se quiser publicar o "O que mudou por causa da pesquisa", escreva um texto de até 500 caracteres num arquivo `.txt`, sem e-mail nem endereço de site.
3. Defina `PG_PESQUISA_URL` (conexão do papel `dspd_pesquisa`, no `.env`) e confira o arquivo sem gravar nada:

   `pnpm --filter @metricas-dspd/pesquisa carregar --trimestre 2026-T3 --arquivo percepcao.csv --o-que-mudou texto.txt`

   O comando valida tudo, mostra o resumo e devolve o texto "O que mudou" para conferência.
4. Se estiver certo, repita com `--confirmar` para gravar.
5. Abra o painel Sustentação, seção "Percepção de valor", e confira o trimestre, o "k de n" e o texto.

## Reenvio e repetição

- Mesmo arquivo já vigente no trimestre: nada é gravado e o comando avisa (é seguro repetir).
- Arquivo diferente para um trimestre já carregado: o comando para com "Substituir a pesquisa de 3T/2026? A versão anterior fica guardada." Repita com `--substituir 2026-T3 --confirmar`. A carga anterior continua na base (nunca há `UPDATE` nem `DELETE`); vale a de maior número.
- O questionário usado é o vigente no último dia do trimestre. As áreas aceitas são as vigentes nessa mesma data.

## O que faz o comando recusar o arquivo (nada é gravado)

| Situação | Mensagem (regra) |
|---|---|
| Cabeçalho diferente, coluna a mais (como `email`, `nome`, `comentario`) ou a menos | `coluna-extra`, `coluna-ausente`, `cabecalho-diferente` |
| Aspas no arquivo | `aspas-nao-suportadas` |
| Área fora da lista fechada | `area-fora-da-lista` |
| Pergunta fora do questionário vigente, ou pergunta faltando numa área | `pergunta-fora-do-questionario`, `pergunta-ausente-na-area` |
| Trimestre da linha diferente do argumento | `trimestre-diferente-do-argumento` |
| Soma das faixas diferente entre as perguntas da área, ou `convidados` diferente na área | `soma-das-faixas-diverge-na-area`, `convidados-diverge-na-area` |
| Número inválido, célula com `@`, respondentes acima dos convidados | `numero-invalido`, `schema:custom` |

A saída mostra só linha, coluna e regra, nunca o conteúdo das células. O arquivo bruto não é guardado; fica o `sha256` dele na carga.

## Execução em produção

O RDS é privado ([ADR 0013](../architecture/adr/0013-arquitetura-modular-serverless.md)): o caminho onde o comando roda com acesso ao banco será definido junto com o ambiente AWS (P11). Até lá, o comando roda contra o PostgreSQL local e o de homologação.
