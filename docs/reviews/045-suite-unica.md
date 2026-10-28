---
tipo: review
contrato: 1
pedido: 045-suite-unica-com-trava
branch: feature/045-suite-unica
commit: b03159ce0f7795da5686c29ce6f72403c8fb17fd
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review: trava de suíte única (flock)

Diff `d7c74b4..b03159c`: 4 arquivos, 91 linhas inseridas e 4 removidas (código e teste: cerca de 94 linhas, abaixo do teto M14 de 400). Escopo E1 e E2 do pedido; nada além.

## Contra o pedido
- Serializa entre worktrees: o arquivo da trava é `/tmp/metricas-dspd-suite.lock`, fora do repositório (`scripts/suite-unica.sh:18`), comum a todas. `flock -n` avisa e depois `flock 9` espera, sem falhar (`:23-26`).
- Não aninha: a marca `METRICAS_DSPD_SUITE_SEGURA` é exportada após a aquisição (`:28`) e, vista, o script faz `exec` direto (`:12-14`). O `pronto` separa `pronto` e `pronto:interno` para o teste do script não esperar por si mesmo.
- Repassa o rc: sem `exec` para o fd 9 ficar vivo, e `exit "$?"` (`:30-31`); coberto por teste (rc 7).
- Scripts na trava (`package.json`): `pronto`, `test`, `test:e2e`, `e2e` (via `test:e2e`) e `test:pg`. Cumpre. A CI chama os pacotes direto e fica intacta, como o pedido manda.
- Documentação (`docs/engineering/praticas.md:62`): diz onde fica a trava, como ver quem a segura (`fuser`/`lsof`), que não precisa de `pgrep` e que rodar o pacote direto contorna a trava. Cumpre E2.
- `bash scripts/suite-unica.test.sh`: 5 verificações ok (rc=0 das duas, série `inicio fim inicio fim`, aviso de espera, aninhada, rc 7); "tudo certo". Teste sem banco nem navegador, com trava própria e `timeout` contra deadlock.
- Segurança (link simbólico recusado, `flock` ausente falha explícita): o parecer é do `security-engineer` (`docs/security/`); não refeito aqui.
- Regras de ferramenta do `praticas.md`: o `pronto` completo roda no E1.5, antes do commit final (decisão do dono 2026-10-21); sem saída a citar neste parecer.

## Achados
- A1 (recomendado) scripts/suite-unica.sh:29 · o fd 9 é herdado por todo filho; um órfão (servidor de fundo do e2e) pode segurar a trava e bloquear as próximas suítes. Não devolve.
- A2 (recomendado) scripts/suite-unica.sh:25 · a espera não tem teto nem mostra quem segura. Aceitável pela regra do dono. Não devolve.

## Parecer
Aprovado. Nenhum bloqueante.

Detalhe do A1: destino o QA (E1.4), que confere que depois de `test:e2e` o `fuser` da trava fica vazio; se aparecer órfão, cartão para `exec 9>&-` no lançamento dos servidores ou `flock` por `-o`. O QA confirmou: término normal solta a trava.

Detalhe do A2: anotar na retro se uma espera longa confundir.

Autoria: revisão feita pelo `forge:tech-lead`, instância que não implementou o cartão (a implementação foi do `forge:node-backend`, E1.1).
