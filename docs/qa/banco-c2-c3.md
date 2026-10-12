# Parecer de QA: banco C2 (backup, restauração verificada, trava do down) e C3 (timeouts)

Data: 2026-10-12 · Branch `fix/banco-backup-noturno` (e264326) · Referência: `docs/reviews/banco-c2-c3.md` (com a rodada 2). Ambiente: Postgres 17 do Compose (`metricasdspd-postgres-1`), senhas padrão de dev.

## Parecer: APROVADO, sem bug aberto (0 críticos, 0 altos, 0 médios; 3 observações)

## Resultados

| Verificação | Resultado |
|---|---|
| `test:pg` completo, num banco temporário `metricas_qa_pg` | 11 arquivos, 54/54 testes passam (inclui `timeouts.pg.test.ts` e `migracoes.pg.test.ts`). Banco removido. |
| `pnpm --filter ./server run pronto` | typecheck e lint ok; 279 testes passam (54 de Postgres pulados no projeto `unit`, por desenho); cobertura 100% em statements, branches, funções e linhas. |
| Backup real (uma vez) | rc 0; dump 200 KB, inventário, `roles-*.sql` e `ultimo-backup-ok` (2026-10-12, data de Brasília) criados. |
| Restauração verificada real (uma vez, com `DSPD_COMPARAR_COM_VIVO=1`) | rc 0; `migrate up` aplicou 0 migrações; 50 tabelas e 563 colunas iguais ao inventário e ao banco vivo; banco `metricas_restauracao_*` removido. |

## Mutações (cada uma derrubou pelo menos um teste; código restaurado com `git checkout`, árvore limpa)

| Mutação | Teste que falhou |
|---|---|
| Trava sem checar `DSPD_PERMITIR_DOWN` | `trava-down.test.ts` "sem prefixo e sem DSPD_PERMITIR_DOWN=1, recusa" |
| Trava sem checar o backup do dia | `trava-down.test.ts` "permitido, mas sem backup de hoje confirmado, recusa" |
| Trava liberando sempre (prefixo) | os dois acima |
| `release(false)` em `emTransacao` | `plataforma.test.ts` "destrói a conexão quando o ROLLBACK falha..." |
| `lock_timeout: 0` no pool | `plataforma.test.ts` (timeouts de C3) e 2 de `timeouts.pg.test.ts` (sessão nasce com timeouts; 55P03 não ocorre) |
| `lock_timeout=0` no `migrar` | `migrar.test.ts` (up) e `timeouts.pg.test.ts` "tabela de controle presa falha em ~5s" |
| SIGPIPE de volta (`pg_restore --list | grep -q`) | `backup-script.test.ts` "lista do pg_restore passa de 64 KB" |

## Execução real: backup e restauração

Banco de origem: cópia temporária `metricas_qa_copia` (dump do `metricas` de dev + `migrate up`, que aplicou a 0012). O `metricas` não foi alterado. Destino do backup fora do repositório (diretório temporário), removido ao final, junto dos dois bancos temporários; ao final restam só `postgres`, `metricas` e `metricas_test`. Modo contêiner (`DSPD_PG_CONTAINER`).

- Permissões: dump, inventário, roles e `ultimo-backup-ok` com modo 0600 (ext4, `umask 077`).
- Rotação: com 8 conjuntos falsos pré-criados e a retenção padrão (7), sobraram 7 (os 2 mais antigos, por nome, foram removidos; o novo ficou).
- Senhas: amostragem de `ps` (a cada 50-100 ms, durante backup e restauração) mostrou só `docker exec -e PGPASSWORD ...` sem valor, e nenhuma ocorrência da senha ou de URL com credencial; nenhuma senha nos logs nem no `roles-*.sql` (`--no-role-passwords`).

## Observações (sem bug aberto)

1. A cópia do banco de dev praticamente não tem dados (só `dspd_core.pgmigrations`, 12 linhas, com contagem > 0). A igualdade de contagens e colunas foi provada, mas a fidelidade de linhas com volume real fica para o primeiro backup em produção/homologação.
2. O diretório de destino foi criado por mim (0755); a criação pelo próprio script (`mkdir -p` sob `umask 077`, esperado 0700) não foi exercitada neste ambiente. Em NTFS (`/mnt/d`) o modo não é honrado (já documentado no guia).
3. Permanecem pendentes, já registrados no review: o workflow `restauracao.yml` nunca foi executado (só roda no GitHub; fazer um `workflow_dispatch` antes de depender dele) e a frequência mensal na CI aguarda confirmação do usuário. Não verifiquei o agendamento do usuário (03:30 BRT / domingo 04:30), que é externo ao projeto.
