Agente destino: forge:tech-lead
Pedido: 048-o-que-falta-em-mock
Tipo: review
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: review

## Objetivo
Etapa E5.1 do pedido 048 (cartões K-112 e K-130), só a parte de code review da branch `docs/048-t14-desenho`: o desenho da T14 em mock (E1.1, E1.5), o modelo de ameaças (E1.2), o cadastro de membros simulados e a API da T14 sem o agregado dedutível (E1.3) e a tela da T14 (E1.4) já entregues e conferidos. Review antes do QA (R-REVIEW). Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, head c6a2f6071f16814fccbaa5c6ab2e005bc31974a2, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-048a log --oneline 4137981e5333bee5b69f3c515b26c64d3a0b71c0..c6a2f6071f16814fccbaa5c6ab2e005bc31974a2` e `git -C /home/rodrigoisensee/MetricasDSPD-048a diff 4137981e5333bee5b69f3c515b26c64d3a0b71c0 c6a2f6071f16814fccbaa5c6ab2e005bc31974a2`, por arquivo.
- `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`, só a Decisão (item 9) e as Decisões do usuário.
- `docs/security/048-t14-ameacas.md` (modelo de ameaças do E1.2): os controles pedidos ao E1.3.
- `docs/api/metricas.md`, só o bloco T14.
- `docs/engineering/praticas.md`, só as seções de review e de commits.

## Entregar
- (E5.1, E1, E2) Code review da `docs/048-t14-desenho` de 4137981e5333bee5b69f3c515b26c64d3a0b71c0 a c6a2f6071f16814fccbaa5c6ab2e005bc31974a2 (R-REVIEW): contrato `resultadoT14` contra o `docs/api/metricas.md`, a ordem dos projetos com outros times oculto (Q-T14-12 = B), o total só dos visíveis (T14-M1 = B), nenhum campo de pessoa no contrato nem na tela (ADR 0020), os membros simulados fora do alcance do `dspd_api` (Q-T14-10 = B), testes que cobrem cada regra, e as regras invioláveis do `CLAUDE.md`. Parecer em `docs/reviews/048-t14-desenho.md`, no formato que o `forge-check pr` lê (frontmatter com `pedido: 048-o-que-falta-em-mock`, `commit: c6a2f6071f16814fccbaa5c6ab2e005bc31974a2` e veredito; achados no bloco `## Achados`, com arquivo:linha e até 300 caracteres cada), escrito pela ferramenta Write.
- (E5.1) Commit só do parecer, no padrão de commits do `praticas.md`, com `Cartão: K-112` e `git add docs/reviews/048-t14-desenho.md`; push com `git push origin docs/048-t14-desenho`, sem `--force` e sem PR.
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (0ea4c01416d0c2c16708c79148b785b08ad8dcea)
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
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- O PR e o merge da `docs/048-t14-desenho` (parte de E5.1 depois do QA); o review da `feature/048-usabilidade` (worktree 048b, E4.1, ainda em andamento).
- Corrigir o código, atualizar âncoras de hash do mock, rodar a suíte, a E2E ou o `pronto`; o quadro e o arquivo do pedido; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido), na revisão 2 da branch (`/home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`, linha 51; a cópia da develop ainda traz a leitura antiga), item 9, T14: "outros times" fica **oculto** quando somar **menos de 2 pessoas**; pela Q-T14-10 = B, "pessoas = membros de um cadastro por time, na configuração"; a contagem "sai dele só como booleano por `(projeto, equipe, granularidade)`; a API nunca recebe o número de pessoas. Na fase 2 (mock), a extensão gera o booleano direto (item 8)".
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): a arquitetura do worker não é objeto deste review.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica individual nem comparação entre times; abaixo de 20 itens, não publicar estatística. Pela Q-T14-6 = A (acima), "outros times" sai sempre sem nome, sem tempo, sem vazão e sem ranking.
- DECISÃO TÉCNICA do Jarvis (2026-10-28, Histórico do pedido): o E1.4 entra na mesma branch do E1.3; as âncoras de hash do mock e o spec e2e de API ficam com o QA (E5.2), e o `pnpm run pronto` completo da branch sai uma vez, na entrega do QA.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- Outra instância do react-frontend trabalha na worktree 048b. Neste review não rode a suíte, o `pronto` nem testes: o review é por leitura do diff, e o typecheck, o lint e os testes rodam no QA (E5.2), uma suíte por vez.
- NÃO tocar: o código, os testes, o contrato e a documentação da branch (achado vira linha no parecer, não correção); o `.env`, a `main`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: c6a2f6071f16814fccbaa5c6ab2e005bc31974a2' /home/rodrigoisensee/MetricasDSPD-048a/docs/reviews/048-t14-desenho.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --name-only c6a2f6071f16814fccbaa5c6ab2e005bc31974a2 HEAD` · espera: igual 'docs/reviews/048-t14-desenho.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito, achados bloqueantes (arquivo:linha) e recomendados, e o sha do commit do parecer; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
