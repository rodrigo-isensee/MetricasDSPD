Agente destino: forge:node-backend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Volta da etapa E1.3 do pedido 048 (cartões K-112 e K-130): a conferência de entrega dos seus commits (0b8ee6c a 0ea4c01416d0c2c16708c79148b785b08ad8dcea) deu "não cumpriu" (escopo) porque o commit 0ea4c01416d0c2c16708c79148b785b08ad8dcea (docs(api)) altera `docs/api/metricas.md`, que não estava no Entregar do brief anterior. É a documentação afetada pela mudança de contrato e devia estar no Entregar: esta volta a inclui. O código, os testes e o contrato já entregues continuam como estão. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`, head atual c6a2f6071f16814fccbaa5c6ab2e005bc31974a2, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-048a show 0ea4c01416d0c2c16708c79148b785b08ad8dcea`.
- `packages/contratos/src/tambem.ts`, só o `resultadoT14`.

## Entregar
Os itens marcados "já entregue" estão nos commits 0b8ee6c a 0ea4c01416d0c2c16708c79148b785b08ad8dcea: nesta volta não os refaça nem os altere.
- (E1.3, E1) `packages/mock/src/businessmap/membrosSimulados.ts` com os membros simulados `{ membroRef, equipe }` no padrão `^sim-\d{3}$`, a distribuição da seção 1 do desenho (3 a 8 por equipe, uma equipe com 1 membro e uma com 0) e o novo cálculo de `outrosPublicavel` no gerador (passos 1 a 5 da seção 1), sem o sorteio; teste do padrão e de que nenhum campo do cadastro tem nome nem e-mail (C3), e de que o cadastro não chega ao worker nem ao armazenamento do navegador como pessoa (C4). · já entregue
- (E1.3, E2) `t14.ts`: linha oculta só com `meuTime.k`; `total` do bloco, `base.n` e `base.complemento.n` só com os visíveis; ordem com os visíveis por `total` decrescente e código e os ocultos depois, por código; sem "Sem time informado" no oculto (seção 2 do desenho; D1, D2, D3, D5). · já entregue
- (E1.3, E2) `resultadoT14` em `packages/contratos/src/tambem.ts` como união discriminada por `oculto` (forma da seção 2), `outrosTimes` não anulável, contrato `strict`, com exemplos e testes (D4). · já entregue
- (E1.3, E1) `REGRAS_METRICA.T14`: as pendências decididas saem (a da ordem, Q-T14-12 = B); as abertas continuam `pendente-usuario`, com a suposição do desenho. · já entregue
- (E1.3, E1, E2) Os testes de propriedade (1) a (5) da seção 2 do desenho e os de D1, D2, D3 e D5 do parecer; os casos de abuso CA-1 a CA-4, CA-8 e CA-9 como teste. Os CA-5 a CA-7 e o C1, C5 e C6 dependem da tabela do cadastro, que é da fase 3 (o desenho tira a tabela do mock): registre isso no relatório, sem criar tabela nem migração. · já entregue
- (E1.3, E2) Documentação afetada: o bloco T14 de `docs/api/metricas.md` (tabela de formas, notas do contrato novo e "Mudanças de contrato para o front") descrevendo o `resultadoT14` implementado; já alterado no commit 0ea4c01416d0c2c16708c79148b785b08ad8dcea. Confira que ele bate com o `resultadoT14` de `packages/contratos/src/tambem.ts`; se bate, nenhum commit novo; se algo diverge, corrija só esse bloco e faça um commit só desse arquivo, com `Cartão: K-130`, `git add docs/api/metricas.md` e push com `git push origin docs/048-t14-desenho`, sem `--force` e sem PR.
- (E1.3) Os commits do código (já entregues) seguiram o padrão de commits do `docs/engineering/praticas.md`; nesta volta não rode a suíte nem o `pronto` (o `pronto` completo roda uma vez no commit final do QA, E5.2).
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (3539222)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (4 arquivos na worktree 048b, commitados pelo E4.1)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; continua no pedido (outra instância, worktree 048b)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Qualquer arquivo além de `docs/api/metricas.md`; a suíte e o `pronto`; a tela (`web/`), tabela e migração do cadastro (fase 3), a função `publicarOutros` do coletor (fase 3), o desenho, a ADR e o parecer; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Mude a seguencia, coloque a integração com dados reais por último": a integração com dados reais (BusinessMap e Acelerato, K-087, K-086, K-088, K-089) entra depois de todo o resto da lista do que falta, feito em mock.
- DECISÃO DO DONO (2026-10-28): recibo do 048 aceito ("Isso tudo entra menos os dados reais"): E1 a E4 entram (inclusive K-074 e K-075, com UX e protótipo); integração real fica fora, por último.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-1 = B** (usuário): a fonte é o campo customizado do card, nome provisório "Time responsável"; nome exato e cardinalidade (único ou múltiplo) ficam para confirmar na integração com o BusinessMap. Até lá vale a Q-T14-9 = A (se múltiplo, conta quando o meu time estiver entre os marcados), que funciona nos dois casos.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-5 = D** (usuário): na T14 aparecem os projetos ligados a um sistema do meu time (`ConfigBM.equipes[].sistemas`, inclusive com 0% de atuação) e também qualquer projeto com pelo menos 1 card do meu time.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-6 = A** (usuário): "outros times" é publicado mesmo quando o projeto tem um único outro time, sempre sem nome, sem tempo, sem vazão e sem ranking.
- DECISÃO DO DONO (2026-10-17, pedido 011): **Q-T14-10 = B, confirmada** ("2-2", depois "2 e o B"): na regra "menos de 2 pessoas" da T14, conta como pessoa quem está num cadastro de membros por time, mantido na configuração (WS1). O cadastro é dado de pessoa: há gatilho de segurança, e ele fica fora do alcance do `dspd_api`.
- DECISÃO DO DONO (2026-10-17, pedido 011): **T14-M1 = B** (usuário, resposta "D1 - B"): quando "outros times" estiver oculto (R-1 = B), a T14 mostra só a fatia do meu time, sem o total exato do projeto. Assim não dá para calcular n − k.
- DECISÃO DO DONO (2026-10-28): Q-T14-12, opção B ("B"): na T14, os projetos com "outros times" oculto vêm depois dos visíveis, ordenados por código do projeto (fecha a dedução do total pela ordem, K-130).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0020 (citada no pedido): a contagem sobre identidade fica só na fronteira, com saída inteira; o booleano `outrosPublicavel` vem de fora da biblioteca (item 9); R-1 = B. A biblioteca não vê membro; o mock nunca recebe id real.
- ADR 0021 (citada no pedido): cálculo do mock em Web Worker; o worker e o servidor usam o mesmo `calcularT14`, sem cópia da regra no front (D6).
- Regras de negócio ainda abertas (Q-T14-11, membro em mais de um time, Q-T14-2, 3, 4, 7, 8, 9, P1 e P2) não se decidem no código: implemente a suposição do desenho, a do lado que oculta mais, e deixe-a `pendente-usuario` (seção "Perguntas ao dono" do desenho; suposição do pedido). No mock, cada membro simulado fica num time só.
- O padrão dos ids simulados é o do desenho (`sim-NNN`); o exemplo `membro-001` do C3 do parecer é só ilustrativo.
- Nenhuma métrica individual; nenhum número de pessoas na resposta; abaixo de 20 itens não se publica estatística; BusinessMap e Acelerato nunca se misturam (CLAUDE.md).
- Os hashes do mock mudam: não reescreva as âncoras do `extensaoTambemFase2.test.ts` além do necessário para compilar; o que falhar por âncora fica listado no relatório para o QA (E5.2).
- A worktree pode estar sem `pnpm` no PATH: `source ~/.nvm/nvm.sh` antes do `pnpm`. Uma suíte por vez: não rode duas ao mesmo tempo.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas. R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c 'união por oculto' /home/rodrigoisensee/MetricasDSPD-048a/docs/api/metricas.md` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --name-only c6a2f6071f16814fccbaa5c6ab2e005bc31974a2 HEAD -- packages server web e2e` · espera: linhas=0
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: se o bloco T14 de `docs/api/metricas.md` bate com o `resultadoT14` (e o sha do commit, se houve); depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
