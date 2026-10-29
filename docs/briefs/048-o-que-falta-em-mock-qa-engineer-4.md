Agente destino: forge:qa-engineer
Pedido: 048-o-que-falta-em-mock
Tipo: codigo
Branch: docs/048-t14-desenho   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: qa

## Objetivo
Volta do E5.2 do pedido 048 (cartões K-112 e K-130) na `docs/048-t14-desenho`: o tech-lead trouxe a `develop` (merge 230b4e9, com o #160) e commitou a revisão de UX (acbbe78), a aprovação do arquiteto (9b97e9d) e a revalidação do review (aae3901). O `forge-check pr` agora acusa só o seu parecer: "docs/qa/048-t14-desenho.md: commit: desatualizado: .github/workflows/homolog.yml mudou depois do parecer; peça novo parecer (R-QA)". Sem a revalidação o PR (E5.1) não abre. Worktree `/home/rodrigoisensee/MetricasDSPD-048a`, head aae3901aa2d79bcad10001ec2305a1471447aee1, já no origin.

## Ler
- O seu parecer `docs/qa/048-t14-desenho.md` da worktree, frontmatter e o fim.
- `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --stat 4497268f36749b17c4b0928f3660551654fa11d4 HEAD` (o delta desde o head que você testou).
- A saída de `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 048-o-que-falta-em-mock --ref docs/048-t14-desenho`, rodado na worktree.

## Entregar
- (E5.2) Rodar `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto` uma vez na raiz da worktree; verde, revalidar o parecer `docs/qa/048-t14-desenho.md` pela leitura do delta 4497268f36749b17c4b0928f3660551654fa11d4..HEAD (documentação e o que veio da `develop`; nada do código da T14 mudou): pela ferramenta Edit ou Write, `commit:` para aae3901aa2d79bcad10001ec2305a1471447aee1, veredito inalterado se o delta não tocar o que você testou, e uma seção final `## Revalidação` (data, o delta conferido e por que o veredito não muda). Se o delta tocar o código ou os testes da T14, não revalide: relate o arquivo.
- (E5.2) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-130` e `git add docs/qa/048-t14-desenho.md`; push com `git push origin docs/048-t14-desenho`, sem `--force` e sem PR.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (35392227f93cf63df2f9f9c47e46acdf22a6e70b)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (ce4cee9ce89ccffee6486ba33c785644a5538152, na feature/048-usabilidade)
- "E4.1 (forge:react-frontend): K-074, usabilidade U1 a U5 (E4), a partir de docs/ux/revisao-geral-usabilidade/04-decisoes.md e do protótipo do E4.0, que vai junto na branch." · etapa de outra delegação; já entregue (2aac60225a5927f399b7ef12fe8833b786a022e8, na feature/048-usabilidade)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; a parte do E1.4 já entregue (acbbe78); o resto continua no pedido
- "E1.6 (forge:software-architect): aprovação da mudança incompatível do contrato da T14 (E2), registrada em `docs/architecture/features/048-t14-mock.md` na worktree 048a (`docs/contratos/politica-de-mudanca.md` §5 pede arquiteto e tech-lead), antes do PR do E5.1; o tech-lead a commita no PR." · etapa de outra delegação; já entregue (9b97e9d)
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue (4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; review revalidado (aae3901), o PR e o merge continuam no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; já entregue (f786c9c24ff1432adc62a863552083c7688629a7)
- Escrever ou mudar testes ou qualquer outro arquivo; os pareceres de outros papéis e os de outros pedidos que vieram da `develop`; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132). (docs/pedidos/025-front-do-011-lote2.md:43)
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio. (docs/pedidos/025-front-do-011-lote2.md:44)
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA). (docs/pedidos/025-front-do-011-lote2.md:45)
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias). (docs/pedidos/025-front-do-011-lote2.md:46)
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": T14-1 = A, ajustar a ficha da T14 ao que a tela mostra (só "Meu time: k" com o projeto oculto), sem mudar a tela. Cartão K-139 (ux-designer). (docs/pedidos/025-front-do-011-lote2.md:47)
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar." (docs/pedidos/025-front-do-011-lote2.md:48)
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total. (docs/pedidos/025-front-do-011-lote2.md:49)
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82). (docs/pedidos/025-front-do-011-lote2.md:50)
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135). (docs/pedidos/025-front-do-011-lote2.md:51)
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130). (docs/pedidos/025-front-do-011-lote2.md:52)
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades". (docs/pedidos/041-estabilizar-os-testes.md:55)
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico. (docs/pedidos/041-estabilizar-os-testes.md:56)
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20). (docs/pedidos/041-estabilizar-os-testes.md:57)
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers). (docs/pedidos/041-estabilizar-os-testes.md:58)
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória). (docs/pedidos/041-estabilizar-os-testes.md:59)
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo." (docs/pedidos/041-estabilizar-os-testes.md:60)
- DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows). (docs/pedidos/041-estabilizar-os-testes.md:61)
- DECISÃO DO DONO (2026-10-23): F4, opção A ("A"): corrigir a medição do F4: a primeira medição a frio sai da amostra, o teste colhe pelo menos 20 medições de verdade e a ADR 0003 registra a mudança da regra de medição com data; o limite de 100 ms não muda. (docs/pedidos/041-estabilizar-os-testes.md:62)
- DECISÃO DO DONO (2026-10-23): workers da E2E, opção A ("A"): limitar a 2 workers na máquina local pela configuração do Playwright, com variável de ambiente para subir quando quiser; a CI não muda. (docs/pedidos/041-estabilizar-os-testes.md:63)
- DECISÃO DO DONO (2026-10-23): custo do `homolog-aprovada`, opção B ("B"): sem espera paga; o fim do portão do `homolog.yml` dispara de novo o `homolog-aprovada` do PR (segundos de Actions por release); se o devops mostrar que não funciona, a opção A volta ao dono. (docs/pedidos/041-estabilizar-os-testes.md:64)
- DECISÃO DO DONO (2026-10-27): 3 falhas pré-existentes da E2E completa do E4.1, opção A ("A"): corrigir dentro do 041 antes do PR (react-frontend corrige, code review, QA dos 3 testes e E2E completa), na fila atrás da volta do 026, que mexe em /operacional. (docs/pedidos/041-estabilizar-os-testes.md:65)
- DECISÃO DO DONO (2026-10-27): medição a frio do F4, opção A ("A"): o dono não percebe demora na primeira troca de filtro; a 2ª condição do critério de reversão da ADR 0003 (seção "Medição do F4") não se cumpre e nada muda; a primeira medição segue informativa. Registro da leitura no quadro de leituras da ADR vai junto do PR do 041 (técnico). (docs/pedidos/041-estabilizar-os-testes.md:66)
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez). (docs/pedidos/041-estabilizar-os-testes.md:67)
- DECISÃO DO DONO (2026-10-27): base da conferência da E3.2 (feature/041-homolog-aprovada), opção A ("decisao e a A"): fixar a base do delta em e342a2c, a develop atual. (docs/pedidos/041-estabilizar-os-testes.md:99)
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar" (ordem ampla: só o que já está confirmado ou delegado; item novo ou irreversível fica para o dono). (docs/pedidos/041-estabilizar-os-testes.md:176)
- DECISÃO DO DONO (2026-10-28): "Faça suas recomendações para as decisões até eu voltar para nada ficar parado só registre as decisões tomadas" (R-DECISAO: decisões pendentes viram `delegado`, com a recomendação do time e a base gravadas aqui; custo, acesso, exceção a regra e ato irreversível continuam com o dono). (docs/pedidos/041-estabilizar-os-testes.md:177)
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição. (docs/pedidos/041-estabilizar-os-testes.md:192)
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa. (docs/pedidos/041-estabilizar-os-testes.md:194)
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
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 2 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- DECISÃO DO DONO (2026-10-28): "Vou dormir toque tudo" (ordem ampla: só o que já está confirmado ou delegado; item novo ou irreversível fica para o dono).
- ADR 0020 (citada no pedido): proteção de pessoa; o parecer não muda.
- ADR 0021 (citada no pedido, "Cálculo do mock em Web Worker"): não é objeto desta volta.
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): não é objeto desta volta.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 21:20, Histórico deste pedido): a revalidação do QA da `docs/048-t14-desenho` lê o delta desde o head testado e roda o `pronto` uma vez no head (substitui a de 21:14, que dispensava o `pronto`).
- Pronto antes do commit final (decisão do dono de 2026-10-21, acima): o último commit com código da branch é o merge 230b4e9 da `develop`, posterior ao pronto verde de 4497268; rode `pnpm run pronto` uma vez, da raiz da worktree, antes de commitar o parecer. É a única suíte da máquina neste momento (trava de suíte única); se falhar, não revalide: relate a falha literal.
- NÃO tocar: o código, os testes, os outros pareceres, a worktree 048b, a `main`, o `.env`.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha. Parecer se escreve só pela ferramenta Write ou Edit.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a diff --name-only aae3901aa2d79bcad10001ec2305a1471447aee1 HEAD` · espera: igual 'docs/qa/048-t14-desenho.md'
- PQ-2 (cmd): `grep -c '^commit: aae3901aa2d79bcad10001ec2305a1471447aee1' /home/rodrigoisensee/MetricasDSPD-048a/docs/qa/048-t14-desenho.md` · espera: igual '1'
- PQ-3 (cmd): `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 048-o-que-falta-em-mock --ref docs/048-t14-desenho`, rodado na worktree depois do push · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048a ls-remote origin refs/heads/docs/048-t14-desenho` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048a rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048a status --porcelain` · espera: linhas=0
- PQ-6 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto`, rodado na raiz da worktree antes do commit do parecer · espera: rc=0

## Relatório
Até 8 linhas, resultado real: o delta conferido, o veredito, o sha do commit do parecer e a saída do `forge-check pr`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
