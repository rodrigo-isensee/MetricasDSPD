Agente destino: forge:node-backend
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E1.3 do pedido 048 (cartões K-112 e K-130): implementar em mock o cadastro de membros por time e a API da T14 sem o agregado dedutível, num lote, a partir do desenho (E1.1) e do modelo de ameaças (E1.2). Hoje um projeto com "outros times" oculto ainda deixa calcular n − k pela resposta. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`, head 7ca71ce1e145eca87d265c81aefff378a6746fc2, já no origin (o lote E1+E2 sai num PR só, depois de review, segurança e QA).

## Ler
- `docs/architecture/features/048-t14-mock.md`, seções 1, 2, 3 (linha E1.3), 4 e "Perguntas ao dono".
- `docs/security/048-t14-ameacas.md`, seções "Controles obrigatórios do E1.3", "Controles obrigatórios do contrato e da API (K-130)", "Casos de abuso" e "Achados".
- `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`, itens 2, 3, 6, 8 e 9.
- `docs/api/metricas.md`, só o bloco T14.
- Código: `packages/mock/src/businessmap/extensaoTambemFase2.ts` (perto da linha 336-356), `packages/metricas/src/businessmap/t14.ts`, `packages/contratos/src/tambem.ts` e `packages/contratos/src/comum.ts:299-305`.

## Entregar
- (E1.3, E1) `packages/mock/src/businessmap/membrosSimulados.ts` com os membros simulados `{ membroRef, equipe }` no padrão `^sim-\d{3}$`, a distribuição da seção 1 do desenho (3 a 8 por equipe, uma equipe com 1 membro e uma com 0) e o novo cálculo de `outrosPublicavel` no gerador (passos 1 a 5 da seção 1), sem o sorteio; teste do padrão e de que nenhum campo do cadastro tem nome nem e-mail (C3), e de que o cadastro não chega ao worker nem ao armazenamento do navegador como pessoa (C4).
- (E1.3, E2) `t14.ts`: linha oculta só com `meuTime.k`; `total` do bloco, `base.n` e `base.complemento.n` só com os visíveis; ordem com os visíveis por `total` decrescente e código e os ocultos depois, por código; sem "Sem time informado" no oculto (seção 2 do desenho; D1, D2, D3, D5).
- (E1.3, E2) `resultadoT14` em `packages/contratos/src/tambem.ts` como união discriminada por `oculto` (forma da seção 2), `outrosTimes` não anulável, contrato `strict`, com exemplos e testes (D4).
- (E1.3, E1) `REGRAS_METRICA.T14`: as pendências decididas saem (a da ordem, Q-T14-12 = B); as abertas continuam `pendente-usuario`, com a suposição do desenho.
- (E1.3, E1, E2) Os testes de propriedade (1) a (5) da seção 2 do desenho e os de D1, D2, D3 e D5 do parecer; os casos de abuso CA-1 a CA-4, CA-8 e CA-9 como teste. Os CA-5 a CA-7 e o C1, C5 e C6 dependem da tabela do cadastro, que é da fase 3 (o desenho tira a tabela do mock): registre isso no relatório, sem criar tabela nem migração.
- (E1.3) Commits pequenos no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-112` ou `Cartão: K-130` e `git add` explícito por caminho; `pnpm run pronto` completo uma vez antes do commit final; push com `git push origin docs/048-t14-desenho`, sem `--force` e sem PR.
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido (inclui as âncoras do `extensaoTambemFase2.test.ts`, que o desenho dá ao QA)
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- A tela (`web/`), tabela e migração do cadastro (fase 3), a função `publicarOutros` do coletor (fase 3), o desenho, a ADR e o parecer; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --name-only 7ca71ce1e145eca87d265c81aefff378a6746fc2 HEAD -- packages/mock/src/businessmap/membrosSimulados.ts` · espera: igual 'packages/mock/src/businessmap/membrosSimulados.ts'
- PQ-2 (cmd): `grep -c 'oculto' /home/rodrigoisensee/MetricasDSPD-048a/packages/contratos/src/tambem.ts` · espera: rc=0
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-048a run pronto` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: os commits, o que mudou no contrato da T14 (mudança de contrato), as suposições `pendente-usuario` implementadas, as âncoras do mock que ficaram para o QA e os controles que dependem da fase 3; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
