Agente destino: forge:software-architect
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: codigo

## Objetivo
Etapa E1.1 do pedido 048 (cartões K-112 e K-130): desenho da T14 em mock, para o node-backend implementar no E1.3 o cadastro de membros por time com membros simulados (Q-T14-10 = B) e a API da T14 sem o agregado oculto dedutível. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, branch `docs/048-t14-desenho`, head 4137981e5333bee5b69f3c515b26c64d3a0b71c0. Você não tem Bash: escreve os arquivos na worktree e o tech-lead commita no E1.5.

## Ler
- `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`: Estado, Decisão (item 9) e Decisões do usuário.
- `docs/architecture/features/metricas-tambem-disponiveis.md`: §9.5 (linha 655 em diante), a linha 29 e o trecho da T14 nas linhas 600 a 640.
- `docs/api/metricas.md`: o bloco da T14, linhas 260 a 280.
- `docs/architecture/regras-metricas.md`: linhas 124 e 146.
- `docs/security/025-t14-reidentificacao.md` e `docs/security/025-t14-reidentificacao-incremental.md`: só os achados M-1 e M-1a.

## Entregar
- (E1.1, E1) Desenho do cadastro de membros por time em mock (K-112): onde mora (tabela de configuração ou extensão do mock), forma dos membros simulados sem nome nem e-mail de pessoa real, e como o booleano `outrosPublicavel` passa a ser calculado a partir dele (ADR 0020, item 9). Registre na ADR 0020 (seção nova ou revisão 2, com data 2026-10-28) e no plano §9.5 (linha da Q-T14-10).
- (E1.1, E2) Desenho do K-130: quais campos a API da T14 deixa de enviar, ou como os envia, para que o agregado oculto de "outros times" (n − k) não possa ser deduzido pela aba de rede (M-1 e M-1a); contrato novo do bloco da T14 em `docs/api/metricas.md`.
- (E1.1, E1) Contrato da T14 sem `pendente-usuario` só onde já há decisão do dono, citadas abaixo (Q-T14-1 = B quanto à fonte, Q-T14-5 = D, Q-T14-6 = A, Q-T14-10 = B e T14-M1 = B). As pendências ainda abertas (nome exato e cardinalidade do campo "Time responsável", Q-T14-2, 3, 4, 7 e 8, e a Q-T14-9 = A, que vale só até a cardinalidade ser confirmada) continuam `pendente-usuario` e não se decidem por inferência: escreva cada uma como pergunta ao dono, com opções, recomendação e o efeito de cada opção, numa seção `## Perguntas ao dono` do arquivo novo `docs/architecture/features/048-t14-mock.md`, que também resume o desenho e a divisão para o E1.3 (back) e o E1.4 (tela).
- (E1.1) Atualize na mesma entrega a documentação afetada (`regras-metricas.md` linha da T14, se mudar).
- (E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; continua no pedido
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
- Código, testes e migrações; o parecer de segurança; a ADR 0021; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- ADR 0020 (citada no pedido): a contagem sobre identidade fica só na fronteira, com saída inteira; o booleano `outrosPublicavel` vem de fora da biblioteca (item 9); R-1 = B (outros times oculto com menos de 2 pessoas). Esta entrega a estende, sem afrouxar.
- ADR 0021 (citada no pedido): cálculo do mock em Web Worker; é do E3.3 e não muda aqui.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica serve para avaliação individual, sem ranking nem comparação entre times; abaixo de 20 itens não se publica estatística; dúvida de regra de negócio vira pergunta ao dono, nunca decisão no texto; nome, e-mail e id de pessoa nunca chegam à API.
- NÃO tocar: código, testes e migrações; os pareceres de segurança; as outras worktrees; o `.env`.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/features/048-t14-mock.md` · existe
- PQ-2 (cmd): `grep -c '^## Perguntas ao dono' /home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/features/048-t14-mock.md` · espera: igual '1'
- PQ-3 (cmd): `grep -q 2026-10-28 /home/rodrigoisensee/MetricasDSPD-048a/docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` · espera: rc=0
- PQ-4 (cmd): `grep -q K-130 /home/rodrigoisensee/MetricasDSPD-048a/docs/api/metricas.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real: o desenho do cadastro e do K-130, os campos do contrato que mudam, a lista de arquivos alterados (para o E1.5) e quantas perguntas ao dono ficaram; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
