Agente destino: forge:react-frontend
Pedido: 048-o-que-falta-em-mock
Tipo: volta
Branch: feature/048-usabilidade   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Volta-de: docs/briefs/048-o-que-falta-em-mock-react-frontend-7.md sha256 4e48a198da834ea98796ec6e7604f05ecca9d0bf6cc58330fa94d868aa786fb9

## Objetivo
Volta do E4.1 do pedido 048 (cartão K-074): a conferência de entrega de 11135f76a30c707b9ffa858ddccee8cfb709c044 não cumpriu porque o P2 (topo enxuto) saiu parcial: a barra única de ações e o "Detalhes da coleta" não existem em `web/src`, e o corte não tem decisão. Completar o P2 e relatar as decisões técnicas de UX do E4.0 que ficaram sem relato. Worktree `/home/rodrigoisensee/MetricasDSPD-048b`, branch `feature/048-usabilidade`, head 11135f76a30c707b9ffa858ddccee8cfb709c044, já no origin.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-048b/docs/reviews/048-usabilidade.md`, só o bloco `## Achados` (A1 a A4).
- `web/src/features/operacional/IndiceDeSecoes.tsx`, `web/src/features/filtros/BarraFiltros.tsx`, `web/src/features/preferencias/ProvedorPreferencias.tsx` (linhas 140 a 170), `web/src/features/visao-geral/VisaoGeralPage.tsx` (perto da linha 228) e `web/src/components/ui/BotaoCopiarLink.tsx`.
- `docs/architecture/adr/0003-orcamento-de-performance.md`, só a linha F2 (CLS) da tabela de orçamento.

## Entregar (volta 2)
- Escopo da entrega original, já conferido e inalterado; esta volta só corrige os achados abaixo (E1, E2, E3, E4, E4.1).
- (review 2684cc3 A1) O índice fica sticky no topo (`top` = altura do cabeçalho), igual à BarraFiltros (`top-[var(--h-cabecalho)]`, z-30); ele vem depois e a cobre ao rolar. Somar `--h-filtros` ao `top`; o teste só vê a classe `sticky`. [web/src/features/operacional/IndiceDeSecoes.tsx:67]
Recomendados, que entram nesta volta (decisão técnica do Jarvis; nenhum corte):
- (review 2684cc3 A2) Restaurar de novo, com nada oculto, faz `setAntes(null)` e perde o Desfazer pendente; e `gravar(antes)` (:160) apaga o que a pessoa mudou depois. Manter o retrato anterior quando n for 0. [web/src/features/preferencias/ProvedorPreferencias.tsx:151] · entra
- (review 2684cc3 A3) O recorte de datas e "esta tela mostra tudo" foram para `details` fechado. A "Dados até" e o consolidado seguem à vista, então não é aviso obrigatório, mas o recorte muda a leitura; considerar uma linha curta. [web/src/features/visao-geral/VisaoGeralPage.tsx:228] · entra
- (review 2684cc3 A4) "Link copiado." e o campo manual entram na barra em fluxo e podem refluir a linha (CLS pequeno, F2). Reservar espaço ou posicionar sobreposto; o QA mede. [web/src/components/ui/BotaoCopiarLink.tsx:43] · entra
- (E4.1) Para cada achado, um teste que falha sem a correção (no A1, o `top` calculado com `--h-filtros`, não só a classe `sticky`). Um commit único no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-074` e `git add` por caminho; `pnpm run pronto` uma vez antes desse commit; push com `git push origin feature/048-usabilidade`, sem `--force` e sem PR. Esta volta 2 parte do head 2684cc392b5c9e080525980c37fa0c1915d02bb6 (o parecer de review), não do 11135f7 citado no Objetivo; o P2 já foi entregue em 2916b052a20801ed55ce3e2cc4fb00467db8c8a4 e não se refaz. No relatório, além do pedido no bloco Relatório, diga a correção de cada achado A1 a A4 com arquivo:linha e o teste que a cobre; o P2 e as decisões de UX do E4.0 já foram relatados na volta 1.

## Fora do escopo
- "E1.1 (forge:software-architect): desenho da T14 em mock (K-112): fechar a ADR 0020 e o plano §9.5 (cadastro de membros por time com membros simulados), o contrato da T14 sem `pendente-usuario` e o desenho do K-130 (E2); regra de negócio aberta vira pergunta ao dono." · etapa de outra delegação; já entregue (7ca71ce)
- "E1.2 (forge:security-engineer): modelo de ameaças do cadastro de membros e da API da T14 (E1, E2), em paralelo ao E1.1, a partir do parecer 025-t14-reidentificacao." · etapa de outra delegação; já entregue (3539222)
- "E1.3 (forge:node-backend): cadastro de membros em mock e API da T14 sem o agregado dedutível (E1, E2), num lote, a partir do E1.1 e do E1.2." · etapa de outra delegação; já entregue (3c9f6a42fd782d1a36a36a779b4cb49bb42a1a1d)
- "E1.4 (forge:react-frontend): o que o E1.1 pedir de tela para a T14 (E1), com mock." · etapa de outra delegação; já entregue (c6a2f6071f16814fccbaa5c6ab2e005bc31974a2)
- "E1.5 (forge:tech-lead): commit e push do E1.1 na `docs/048-t14-desenho` (o software-architect não tem Bash)." · etapa de outra delegação; já entregue (7ca71ce1e145eca87d265c81aefff378a6746fc2)
- "E3.1 (forge:node-backend): K-129 (meses de pico da T11 no DTO), K-093 (primeira consulta lenta) e a página de contrato da O23 (E3), depois do E1.3." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:react-frontend): K-128, K-126 e K-133 (E3)." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:software-architect): K-127 (F9 dos chunks e ADR 0021) (E3)." · etapa de outra delegação; continua no pedido
- "E4.0 (forge:ux-designer): refazer o protótipo HTML do K-074 em `docs/ux/revisao-geral-usabilidade/03-prototipo/` na worktree 048b, já com as decisões U1 a U5 e o catálogo na Ajuda de `04-decisoes.md` (o protótipo de 2026-10-13 nunca foi commitado), antes do E4.1 (E4)." · etapa de outra delegação; já entregue (commitado em ce4cee9)
- "E4.2 (forge:react-frontend): K-075, celular e tablet em 3 fatias (E4), depois do E4.1." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:ux-designer): revisão da interface implementada do E1.4, E3.2, E4.1 e E4.2." · etapa de outra delegação; continua no pedido
- "E5.0 (forge:tech-lead): worktrees e branches do pedido a partir da develop: `/home/rodrigoisensee/MetricasDSPD-048a` com `docs/048-t14-desenho` (E1.1 e E1.2) e `/home/rodrigoisensee/MetricasDSPD-048b` com `feature/048-usabilidade` (E4.1), com push das duas." · etapa de outra delegação; já entregue
- "E5.1 (forge:tech-lead): code review de cada entrega, PRs para a develop e merge." · etapa de outra delegação; continua no pedido
- "E5.4 (forge:security-engineer): review de segurança de cada entrega com gatilho (R-SEGURANCA), parecer em `docs/security/`, depois do code review e antes do QA." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:qa-engineer): parecer de QA de cada entrega." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-048-mock.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- U1 a U5 e o catálogo, já entregues em 11135f76a30c707b9ffa858ddccee8cfb709c044: não refaça. P4 a P12 do `02-propostas.md` (nomes antes de códigos, textos de alerta, exportação, O2, esqueleto, consistência); o modo resumido do U3; a espera invisível (pedido à parte); o back-end e os contratos; o PR; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- ADR 0003 (citada no pedido, "0003 - Orçamento de performance do projeto"): linha F2, "CLS | < 0,1". O E4.1 deixou parte do P2 de fora alegando CLS (Histórico do pedido, 16:27); o P2 completo precisa caber nesse orçamento.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 16:30, Histórico do pedido): "completar o P2 dentro da ADR 0003, não cortar"; a seção 6 do `02-propostas.md` dá ao time a forma do P2, "desde que nenhum aviso obrigatório deixe de ser alcançável".
- ADR 0020 (citada no pedido): proteção de pessoa no coletor; nada a decidir nesta etapa (é da T14).
- ADR 0021 (citada no pedido): cálculo do mock em web worker; nada a decidir nesta etapa (é do E3.3); não mexa no worker.
- Decisões do dono da revisão de usabilidade (2026-10-13), em `docs/ux/revisao-geral-usabilidade/04-decisoes.md`: U1 a U5 e catálogo, como no Entregar.
- DECISÃO TÉCNICA do Jarvis (2026-10-28, Histórico do pedido): o protótipo `03-prototipo` nunca foi commitado; o E4.0 o refez já com as decisões U1 a U5, e o E4.1 parte dele e o leva junto na branch.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica individual nem comparação entre times; abaixo de 20 itens, não publicar estatística; nada disso muda com a usabilidade.
- A trava de suíte única está na base: se o `pronto` esperar a trava, espere; não rode outra suíte em paralelo. O QA e o security-engineer trabalham na worktree 048a.
- NÃO tocar: `server/`, `docs/api/`, o `.env`, a `main`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b log --oneline 2684cc392b5c9e080525980c37fa0c1915d02bb6..HEAD` · espera: linhas=1
- PQ-2 (cmd): `grep -l 'h-filtros' /home/rodrigoisensee/MetricasDSPD-048b/web/src/features/operacional/IndiceDeSecoes.tsx` · espera: linhas=1
- PQ-3 (cmd): `pnpm run pronto`, rodado da raiz de `/home/rodrigoisensee/MetricasDSPD-048b` antes do commit final · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b diff --name-only 2684cc392b5c9e080525980c37fa0c1915d02bb6 HEAD -- server docs/api docs/reviews` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o que a barra única e o "Detalhes da coleta" mudaram na tela, o CLS medido se houver, as quatro decisões de UX do E4.0 (foco sem marcadores, destaque só com borda, dialog no Restaurar padrão, 44 px), as linhas alteradas do commit e o resultado do `pronto`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
