## Objetivo
Parecer de segurança do comando único de consultas só de leitura dos pedidos 098 e 099, que o dono vai rodar na demo dele contra o PostgreSQL da demo e o MySQL do Acelerato. Branch `chore/consultas-leitura-098-099`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, código em aa8b6f20588c354d83e3eb559f9b554615afc2c7, base develop c7c3e09289f130c159a0d3584278be427e648b17.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff c7c3e09289f130c159a0d3584278be427e648b17 aa8b6f20588c354d83e3eb559f9b554615afc2c7`.
- Os pontos do autor para a segurança: o `dspd_coletor` tem escrita e a leitura só vale pela sessão (`default_transaction_read_only`) e pela transação `READ ONLY`; o cliente `mysql` não fixa o certificado pela impressão como o driver Node e o script confere o arquivo do certificado e usa `--ssl-ca` com `--ssl-verify-server-cert`; a guarda de colunas não pega nome de pessoa dentro de um valor de domínio (equipe, tag, etapa).

## Entregar
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." (E3.2)
- (E4) (E3.2) Revisão estática, sem rodar nada contra base real nem abrir `.env*`: nada do `.env` impresso nem no argv; senha só por ambiente ou arquivo 0600 apagado; só leitura garantida nos dois bancos (avaliar se o `dspd_coletor` com sessão e transação read only basta ou se deve ser outro papel, e recomendar); a recusa de SQL de escrita ou DDL antes de rodar; a guarda de colunas (pessoa, e-mail, `usuarioKey`, título, descrição nunca no arquivo) e o limite dela; a verificação do certificado do MySQL; o arquivo de saída fora do repositório. Rodar só o teste do script. Parecer `docs/security/099-consultas-leitura.md` (novo) pela ferramenta Write, com `pedido: 099-nenhuma-metrica-simulada`, `branch: chore/consultas-leitura-098-099`, `commit: aa8b6f20588c354d83e3eb559f9b554615afc2c7` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/security/099-consultas-leitura.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/chore/consultas-leitura-098-099:docs/security/099-consultas-leitura.md` · espera: contém 'branch: chore/consultas-leitura-098-099'
