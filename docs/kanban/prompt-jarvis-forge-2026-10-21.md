Jarvis, sou o dono. Trago melhorias de fábrica observadas no projeto MetricasDSPD (Forge 0.27.0), em 2026-10-20 e 2026-10-21. Cada uma vale para todos os projetos. Abra um cartão por melhoria e um PR por melhoria para a develop do Forge (skill contribuir-com-o-forge), com o problema, a evidência e como medir o efeito. O que mudar processo, custo ou controle volta para mim como decisão, uma por vez, com recomendação.

Observação: a lista anterior (M1 a M21, de 2026-10-20) ficou num scratchpad temporário e se perdeu. As melhorias abaixo foram reconstruídas dos pedidos e da retrospectiva; se algum item já estiver no Forge, só confirme.

## F1. Registro de agentes ativos fica preso quando a sessão fecha (hooks/agentes.py, R-TETO)
- Problema: o agente morto pelo fechamento da sessão nunca dispara SubagentStop; o registro em .forge/run/agentes.json o mantém "ativo" por expiracao_horas (2 h). Relançar com a mesma descrição é barrado ("já há um agente ... ativo") e a entrega fica parada 2 h sem ninguém trabalhando.
- Evidência: 2026-10-21, dois forge:react-frontend (pedidos 037 e 025) bloqueados das ~10:00 às ~12:00.
- Sugestão: limpar o registro no SessionStart (ou quando o id da sessão muda), ou conferir se o agente ainda existe antes de barrar.
- Medida: tempo de bloqueio por registro órfão = 0.

## F2. Processo órfão de suíte pesada segura a carga depois que o agente morre (R-TETO)
- Problema: o `pnpm run pronto` lançado pelo agente continua rodando depois que a sessão fecha (pai vira o init). A carga passa do limite e o hook barra qualquer agente novo; o Jarvis não pode encerrar o processo (o classificador nega) e o dono precisa fazer pkill à mão.
- Evidência: 2026-10-21 09:52, pronto órfão na worktree -025, load 7,35 de 8.
- Sugestão: rodar as suítes pesadas num grupo de processos marcado e encerrar o grupo no SessionEnd/SubagentStop; ou o `forge doutor` listar e oferecer encerrar órfãos.
- Medida: órfãos de suíte depois de fechar a sessão = 0.

## F3. Comando de pronto completo rodado várias vezes por entrega (economia de recursos)
- Problema: cada dev roda o comando de pronto completo (lint, typecheck, cobertura de todos os pacotes, build, size) a cada iteração; com 2 agentes em paralelo a máquina (8 núcleos, 8 GB) fica com load acima de 9 e um espera o outro.
- Sugestão: regra de fábrica "durante o desenvolvimento, só os testes e o typecheck do pacote alterado; o comando de pronto completo uma vez, antes do commit final", no prompt dos agentes da stack e no modelo de brief.
- Medida: execuções do comando de pronto por entrega <= 2; tempo de espera por suíte pesada.

## F4. Upgrade de versão sem caminho para o time (.forge/versao, R-CONFORMIDADE)
- Problema: o hook só deixa o usuário alterar `.forge/versao`. Quando a branch do upgrade conflita com a develop, o tech-lead não consegue resolver nem com a autorização do dono passada pelo Jarvis; o dono resolve à mão.
- Evidência: PR #134 do MetricasDSPD, 2026-10-21 (conflito de uma linha; tech-lead barrado).
- Sugestão: o `forge atualizar` criar a branch a partir da develop atual (o #134 saiu de uma develop antiga, 00a634f) e oferecer resolver o conflito de `.forge/versao`; ou um comando oficial que grava a versão no merge.
- Medida: PRs de upgrade com conflito = 0.

## F5. Brief pede commit a agente sem Bash
- Problema: o ux-designer (sem Bash) recebeu brief com "commit"; gravou o parecer sem commit e a entrega foi "não cumpriu".
- Sugestão: `forge-check brief` reprova "commit"/"push" no Entregar quando o destino não tem Bash, e o modelo de brief indica quem commita o arquivo.
- Medida: entregas "não cumpriu" por falta de ferramenta = 0.

## F6. Conferente reprova corte por leitura própria, não pelo forge-check (M16)
- Problema: 3 reprovações puras e 2 parciais no pedido 036 em que o `forge-check brief` dava "corte: ok"; cada rodada atrasa a delegação.
- Sugestão: o conferente só reprova corte com o achado do forge-check ou com o trecho literal do pedido que falta; o resto vira aviso.
- Medida: reprovações de corte com forge-check "ok" por pedido.

## F7. Ordem UX depois do QA invalida os pareceres
- Problema: o commit do parecer de UX depois do QA deixou o QA "desatualizado" no `forge-check pr`; 2 delegações extras.
- Sugestão: parecer de UX antes do QA final, ou `forge-check pr` aceitar commit só de `docs/ux/` depois do QA sem invalidá-lo.
- Medida: revalidações pós-UX por pedido = 0.

## F8. Merge pelo site antes dos checks e sem os pareceres (proteção de branch)
- Problema: merges na develop e na homolog pela conta do dono, com checks pendentes ou sem os pareceres da promoção (#133 em 2026-10-20; #134, #135 e #136 em 2026-10-21). O `homolog-aprovada` falhou porque o portão de homologação não disparou no push da homolog.
- Sugestão: o modelo de CI/CD da fábrica trazer, como recomendação de setup, a proteção "exigir checks verdes" em develop e homolog; e o `homolog-aprovada` esperar o portão (ou disparar) em vez de falhar na corrida.
- Medida: merges com check pendente = 0; falhas do homolog-aprovada por corrida = 0.

## F9. Cartão em Pronto sem merge quando não há código
- Problema: a política diz "Pronto só com o merge do usuário"; um bug que não reproduz (medição sem mudança) não tem merge e o cartão foi a Pronto assim mesmo.
- Sugestão: a skill kanban-scrum prever o fechamento sem código (ex.: "Pronto: não reproduz", com a prova).
- Medida: cartões em Pronto fora da política = 0.

## F10. Arquivos de estado e prompts em scratchpad temporário se perdem
- Problema: o prompt de melhorias M1 a M21 ficou no scratchpad da sessão e sumiu na sessão seguinte.
- Sugestão: o Jarvis grava documentos que o dono vai levar adiante num caminho persistente (ex.: docs/kanban/ ou ~/), nunca só no scratchpad.
- Medida: artefatos perdidos entre sessões = 0.
