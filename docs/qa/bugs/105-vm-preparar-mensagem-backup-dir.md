# 105-vm-preparar-mensagem-backup-dir - recusa sugere DSPD_BACKUP_DIR, que não vale no Compose
- Severidade: baixa
- Responsável sugerido: node-backend
- Ambiente: fix/105-vm-criterios-ac, e0b84358; Postgres 17 descartável

## Passos para reproduzir
1. Base com 38 migrações aplicadas e a 0039 pendente, sem confirmação de backup.
2. Rodar o `vm:preparar` (CLI ou imagem do serviço `migrate`).
3. Com `DSPD_BACKUP_CONFIRMADO=` (vazia, como o Compose passa quando a variável não foi definida) e `DSPD_BACKUP_DIR=<pasta com ultimo-backup-ok de hoje>`, rodar de novo.

## Resultado esperado
A mensagem de recusa só sugere o que funciona no caminho em que ela aparece, ou a variável vazia não mascara o `DSPD_BACKUP_DIR`.

## Resultado obtido
A mensagem diz "(ou DSPD_BACKUP_DIR com o ultimo-backup-ok de hoje)". No Compose o serviço `migrate` não recebe `DSPD_BACKUP_DIR` nem monta a pasta, então a sugestão não funciona na VM. Na CLI, a variável vazia (`??` não cai para o fallback) mascara o `DSPD_BACKUP_DIR`: recusa mesmo com o arquivo de hoje. Falha fechada (recusa), sem perda de dados.

## Evidência
Casos E e F do parecer docs/qa/105-vm-preparar.md.
