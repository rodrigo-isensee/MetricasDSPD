Agente destino: forge:security-engineer
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/promocao-2026-10-29   Base: develop   Base-sha: 311691bace0582d80ea06ffc12f20096f1248b87
Etapa: codigo   Cobre: E1.7

## Objetivo
Etapa E1.7 do pedido 050: volta curta do parecer para a candidata `6aa0ac38c35e8298f50511077527368b53ca08f7` (o commit da versão 0.2.0), para o `forge-check pr` aceitar o PR da promoção (E1.1). Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch `docs/promocao-2026-10-29`. O `forge-check pr` também exige que quem emitiu o parecer de segurança o commite.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-050 diff 311691bace0582d80ea06ffc12f20096f1248b87 6aa0ac38c35e8298f50511077527368b53ca08f7 -- CHANGELOG.md package.json` (os dois arquivos do commit da versão).
- `/home/rodrigoisensee/MetricasDSPD-050/docs/security/050-release-develop.md` (o parecer que você gravou no E1.4, ainda sem commit).

## Entregar
- "E1.7 (security-engineer): volta do parecer de segurança: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; o próprio security-engineer commita e envia o parecer (o `forge-check pr` exige que quem emitiu o parecer o commite, R-SEGURANCA)." (E1.7), com:
  - (E1) No parecer `docs/security/050-release-develop.md`: `commit:` passa a `6aa0ac38c35e8298f50511077527368b53ca08f7` e uma linha dizendo que o commit da versão só acrescenta `CHANGELOG.md` e muda o `version` do `package.json`, sem dependência nem código; grave a versão nova do arquivo com Write (o registro de autoria do papel de segurança vem dessa gravação). O resto fica como está.
  - (E1.7) Um commit só, `git -C /home/rodrigoisensee/MetricasDSPD-050 add docs/security/050-release-develop.md`, padrão de commits do `docs/engineering/praticas.md`; antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-050 branch --show-current` deve dar `docs/promocao-2026-10-29`; push com `git -C /home/rodrigoisensee/MetricasDSPD-050 push origin HEAD:refs/heads/docs/promocao-2026-10-29`. Sem PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (tag na etapa E2.1; o PR para a `main` é a etapa E3.1).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; já entregue (89227a2 e 6aa0ac3, entrega conferida 6aa0ac3)
- "E1.1 (tech-lead): depois de E1.5 a E1.7, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; já entregue (3a20716)
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; já entregue (2e322ff)
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; já entregue (parecer gravado na worktree, sem commit)
- "E1.5 (tech-lead): volta do parecer de review: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (inclui `CHANGELOG.md` e `package.json`), com a leitura desses dois arquivos no parecer; commit e push." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): volta do parecer de QA: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` e a contagem da abertura corrigida (13 PRs com parecer, 7 isentos); commit e push." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Os outros pareceres; código; tag, PR e merge; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- Motivo da volta: `forge-check pr 050-release-develop` acusa o parecer desatualizado ("CHANGELOG.md mudou depois do parecer; peça novo parecer"): a candidata passa a ser o commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (a `develop` em `311691bace0582d80ea06ffc12f20096f1248b87` mais `CHANGELOG.md` e `package.json` do E1.0). Nada além disso muda no veredito.
- As voltas de review, QA e segurança correm em paralelo na mesma worktree e branch, cada uma no seu arquivo; se o git acusar `index.lock`, espere alguns segundos e repita o comando uma vez; se o push for recusado por estar atrás, `git -C /home/rodrigoisensee/MetricasDSPD-050 pull --rebase origin docs/promocao-2026-10-29` e push de novo.
- Sem reler código já revisado (regra 5 da economia de tokens); dúvida de regra de negócio vira pergunta ao dono no relatório, nunca decisão.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha; commit em chamada própria do Bash.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 6aa0ac38c35e8298f50511077527368b53ca08f7' /home/rodrigoisensee/MetricasDSPD-050/docs/security/050-release-develop.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 log --oneline 3a20716b38396a203cb5176b78cf746225aeb0e2..HEAD -- docs/security/050-release-develop.md` · espera: linhas=1
- PQ-3 (push): `git ls-remote origin refs/heads/docs/promocao-2026-10-29` igual ao head local

## Relatório
Até 8 linhas, resultado real: veredito, o que mudou no parecer e sha do commit; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
