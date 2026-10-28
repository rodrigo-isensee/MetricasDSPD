Agente destino: forge:security-engineer
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E1.2 do pedido 048 (cartões K-112 e K-130): modelo de ameaças do cadastro de membros por time (dado de pessoa, Q-T14-10 = B) e da API da T14 sem o agregado oculto dedutível, para o node-backend implementar no E1.3 com os controles certos. Corre em paralelo ao desenho do arquiteto (E1.1), na mesma worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`, head 4137981e5333bee5b69f3c515b26c64d3a0b71c0.

## Ler
- `docs/security/025-t14-reidentificacao.md` e `docs/security/025-t14-reidentificacao-incremental.md`: os achados M-1 e M-1a e a seção "Fora do front".
- `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`: Decisão (item 9) e Decisões do usuário.
- `docs/api/metricas.md`: o bloco da T14, linhas 260 a 280.
- Os grants do papel `dspd_api` (procure `GRANT` em `server/` e nas migrações) só para saber o que a API lê hoje.

## Entregar
- (E1.2, E1) Modelo de ameaças do cadastro de membros por time em mock: onde o dado de pessoa pode vazar (API, logs, mock no navegador, aba de rede, export), quem pode ler (o `dspd_api` não lê), e os controles obrigatórios para o E1.3, cada um com o teste que o prova.
- (E1.2, E2) Modelo de ameaças do K-130: como o agregado de "outros times" (n − k) pode ser deduzido pela aba de rede ou pela soma de campos, e os controles que o contrato e a API precisam ter (M-1 e M-1a).
- (E1.2) Parecer no arquivo novo `docs/security/048-t14-ameacas.md`, gravado pela ferramenta Write, com o mesmo frontmatter de `docs/security/025-t14-reidentificacao.md` (`pedido: 048-o-que-falta-em-mock`, `branch: docs/048-t14-desenho`, `commit:` o head que você avaliou) e um bloco `## Achados` só com linhas no formato do `forge-check pr` (`(bloqueante|recomendado)`, um `arquivo:linha` único, até 300 caracteres). Regra de negócio aberta não se decide: vira linha `PERGUNTA:` no relatório.
- (E1.2) Commit só do seu parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-112` e `git add docs/security/048-t14-ameacas.md` (só esse caminho: o arquiteto escreve outros arquivos na mesma worktree, sem commit); push com `git push origin docs/048-t14-desenho`, sem `--force` e sem PR.
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Código, testes e migrações; os arquivos que o arquiteto escreve (ADR 0020, `docs/api/metricas.md`, `docs/architecture/`); os pareceres antigos de segurança; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Mude a seguencia, coloque a integração com dados reais por último": a integração com dados reais (BusinessMap e Acelerato, K-087, K-086, K-088, K-089) entra depois de todo o resto da lista do que falta, feito em mock.
- DECISÃO DO DONO (2026-10-28): recibo do 048 aceito ("Isso tudo entra menos os dados reais"): E1 a E4 entram (inclusive K-074 e K-075, com UX e protótipo); integração real fica fora, por último.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-1 = B** (usuário): a fonte é o campo customizado do card, nome provisório "Time responsável"; nome exato e cardinalidade (único ou múltiplo) ficam para confirmar na integração com o BusinessMap. Até lá vale a Q-T14-9 = A (se múltiplo, conta quando o meu time estiver entre os marcados), que funciona nos dois casos.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-5 = D** (usuário): na T14 aparecem os projetos ligados a um sistema do meu time (`ConfigBM.equipes[].sistemas`, inclusive com 0% de atuação) e também qualquer projeto com pelo menos 1 card do meu time.
- DECISÃO DO DONO (2026-10-14, pedido 011): **Q-T14-6 = A** (usuário): "outros times" é publicado mesmo quando o projeto tem um único outro time, sempre sem nome, sem tempo, sem vazão e sem ranking.
- DECISÃO DO DONO (2026-10-17, pedido 011): **Q-T14-10 = B, confirmada** ("2-2", depois "2 e o B"): na regra "menos de 2 pessoas" da T14, conta como pessoa quem está num cadastro de membros por time, mantido na configuração (WS1). O cadastro é dado de pessoa: há gatilho de segurança, e ele fica fora do alcance do `dspd_api`.
- DECISÃO DO DONO (2026-10-17, pedido 011): **T14-M1 = B** (usuário, resposta "D1 - B"): quando "outros times" estiver oculto (R-1 = B), a T14 mostra só a fatia do meu time, sem o total exato do projeto. Assim não dá para calcular n − k.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- ADR 0020 (citada no pedido): a contagem sobre identidade fica só na fronteira, com saída inteira; o booleano `outrosPublicavel` vem de fora da biblioteca (item 9); R-1 = B (outros times oculto com menos de 2 pessoas). O modelo de ameaças não afrouxa nada disso.
- ADR 0021 (citada no pedido): cálculo do mock em Web Worker; é do E3.3 e não muda aqui.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica serve para avaliação individual; nome, e-mail e id de pessoa nunca chegam à API; o `dspd_api` não lê colunas de pessoa (GRANT por coluna); dúvida de regra de negócio vira pergunta ao dono.
- Análise estática e defensiva: não rode a suíte, a E2E nem o `pronto` (nada de código muda nesta etapa).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas. R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048a/docs/security/048-t14-ameacas.md` · existe
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --name-only 4137981e5333bee5b69f3c515b26c64d3a0b71c0 HEAD` · espera: igual 'docs/security/048-t14-ameacas.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-4 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD-048a/docs/security/048-t14-ameacas.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real: as ameaças e os controles exigidos do E1.3 (cada um com o teste que o prova), as linhas `PERGUNTA:` de regra de negócio, o sha do commit; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
