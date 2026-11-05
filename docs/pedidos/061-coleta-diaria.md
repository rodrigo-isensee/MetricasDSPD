# Pedido 061: como programar a coleta diária na publicação

- **Modo:** analisar (E1); implementar (E2, pela decisão do dono de 2026-11-02)
- **Objetivo:** "logo devo publicar o sistema daí preciso entender como programar essa coleta diariamente" (dono, 2026-11-02)
- **Clareza:** 1 confirmado; 2 suposições; 0 perguntas
- **Depende de:** nenhum pedido aberto (as coletas já estão na develop)

## Escopo
- E1. Explicar ao dono como as coletas rodam hoje (BusinessMap, Acelerato, worklog do apontamento, pesquisa de percepção) e propor como agendá-las uma vez por dia no ambiente publicado, com opções, custo e riscos · `suposição` (base: "essa coleta" lida como todas as coletas que alimentam as métricas)

- E2. Implementar a coleta diária pela opção B1 no servidor interno, com aviso por e-mail, mantendo a chave do dono e a conta compartilhada do Acelerato, e revisar as ADRs 0022 e 0023 com os riscos aceitos · `confirmado`

## Etapas
- E1.1 (devops-engineer): levantamento e proposta em docs/devops/061-coleta-diaria.md, só lendo o código, os scripts e a documentação, sem criar agendamento.
- E1.2 (dono): escolher a opção; a implementação vira pedido próprio.
- E2.1 (software-architect): revisão das ADRs 0022 (coleta no servidor interno, chave do dono) e 0023 (conta compartilhada sem SSL), com os riscos aceitos pelo dono.
- E2.2 (devops-engineer): Dockerfile com docs/architecture/fontes, serviço coleta no Compose sem porta, timers 06:00 e 06:30 BRT com OnFailure por e-mail, releitura semanal do Acelerato, runbook.
- E2.3 (tech-lead): review.
- E2.4 (security-engineer): parecer de segurança.
- E2.5 (qa-engineer): QA.
- E2.6 (tech-lead): PR na develop, sem merge.
- E2.7 (tech-lead): merge (squash) do PR na develop.

## Fora do escopo
- Criar o agendamento, publicar o sistema ou mexer em servidor · `suposição` (base: modo analisar)
- Escolher onde o sistema será publicado · `suposição` (base: decisão do dono; a proposta cobre as opções)

DECISÃO DO DONO (2026-11-02): "Isso" (recibo do 061): o devops-engineer explica como as coletas rodam hoje e propõe opções para agendá-las uma vez por dia no ambiente publicado, só lendo; nada é agendado, publicado nem mexido em servidor nesta etapa; a implementação vira pedido próprio.

DECISÃO DO DONO (2026-11-02): "B1" (como agendar): container de coleta chamado pelo agendador do host (timer por fonte), BusinessMap às 06:00 com --projetar e Acelerato às 06:30, pela recomendação do parecer docs/devops/061-coleta-diaria.md.

DECISÃO DO DONO (2026-11-02): "A" (onde publicar): num servidor interno da empresa, VM Linux na rede do Acelerato, com Docker, ligado 24 horas.

DECISÃO DO DONO (2026-11-02): "A, porém pode manter minha chave o sistema não tem funcionalidades de alteração" (coleta fora da máquina do dono): a ADR 0022 é revista para a coleta rodar no servidor interno, mantendo a apikey atual do dono no BusinessMap, sem criar usuário de serviço só leitor.

DECISÃO DO DONO (2026-11-02): "B" (acesso ao MySQL do Acelerato a partir do servidor): usar a conta compartilhada atual, sem pedir ao DBA usuário próprio, host amarrado nem SSL; exige revisar a ADR 0023, que pedia isso antes da coleta agendada.

DECISÃO DO DONO (2026-11-02): "A" (aviso de falha e horário): aviso por e-mail ao dono quando a coleta falhar; BusinessMap às 06:00 e Acelerato às 06:30, horário de Brasília.

DECISÃO DO DONO (2026-11-02): "A" (pesquisa de percepção): continua manual, com carga do arquivo a cada trimestre.

DECISÃO DO DONO (2026-11-02): "A" (tocar tudo durante a noite): implementar P2 a P5 do plano 060-sem-mock, a coleta diária do 061 com as revisões das ADRs 0022 e 0023, e a Visão Geral validada depois de P2 e P3; cada parte com review, segurança e QA até a develop; nada na main sem o dono.

## Suposições
- "Essa coleta" = todas as coletas das métricas · base: o dono falava das métricas com dado real.

## Perguntas na fila

## Histórico
- 2026-11-02 19:47: pedido aberto a partir da mensagem do dono na resposta à Q2 do pedido 060. Recibo enviado.
- 2026-11-02 19:48: recibo confirmado pelo dono: "Isso". Cartão K-196. DECISÃO TÉCNICA (Jarvis): a E1.1 escreve o parecer na worktree 052g (branch mesclada feature/059-rota-apontamento, limpa), branch nova docs/061-coleta-diaria a partir da develop, criada com --no-track e enviada sem -u por causa do .git/config.lock parado.
- 2026-11-02 19:56: E1.1 cumprida pelo devops-engineer: parecer docs/devops/061-coleta-diaria.md (c5bb99908a0e05dc5e14817beca0343e09f7ba8f, branch docs/061-coleta-diaria, sem PR). Recomendação: container de coleta chamado por timer do host (BusinessMap às 06:00 com --projetar, Acelerato às 06:30, releitura semanal do Acelerato, pesquisa fora da agenda por ser trimestral e por arquivo); cron direto equivalente em servidor simples. Achados: server/Dockerfile não leva docs/architecture/fontes/*.json (a coleta falha na imagem); worker do Compose vazio e sem variáveis; ADR 0022 item 5 e ADR 0023 mantêm a coleta real só na máquina do dono, e publicar exige revisar a ADR 0022, usuário só leitor no BusinessMap e usuário próprio com SSL no Acelerato. Duração das coletas não medida. PERGUNTA ao dono (E1.2): 6 decisões do parecer.
- 2026-11-02 20:04: DECISÃO DO DONO "B1" na decisão 1 de 6 (como agendar). Faltam 5.
- 2026-11-02 20:05: DECISÃO DO DONO "A" na decisão 2 de 6 (servidor interno da empresa). Faltam 4.
- 2026-11-02 20:10: DECISÃO DO DONO na decisão 3 de 6: "A, porém pode manter minha chave o sistema não tem funcionalidades de alteração". Risco a registrar na revisão da ADR 0022: a chave do dono tem permissão de escrita no quadro; o código só faz GET, mas a chave guardada no servidor, se vazar, permite alterar o quadro. Faltam 3.
- 2026-11-02 20:10: DECISÃO DO DONO "B" na decisão 4 de 6 (conta compartilhada do MySQL do Acelerato). Risco aceito pelo dono, a registrar na revisão da ADR 0023: senha válida de qualquer endereço e tráfego sem criptografia, com dado de pessoa do apontamento. Faltam 2 (aviso de falha e horário; pesquisa manual). Ação do dono à parte: providenciar os segredos no servidor.
- 2026-11-02 20:12: DECISÃO DO DONO "A" na decisão 5 de 6 (e-mail ao dono; 06:00 e 06:30 BRT). Falta 1 (pesquisa manual).
- 2026-11-02 20:13: DECISÃO DO DONO "A" na decisão 6 de 6 (pesquisa manual por trimestre). E1.2 cumprida: as 6 decisões tomadas; a implementação vira pedido próprio.
- 2026-11-02 20:23: DECISÃO DO DONO  "A": implementar a coleta diária. Etapas E2.1 a E2.6 abertas.
- 2026-11-02 20:32: E2.1 cumprida pelo software-architect: ADR 0022 item 6 e ADR 0023 §8 revistos em 2026-11-02 na worktree 052g, sem commit, com os riscos aceitos e o critério de reversão. Ponto registrado: a decisão 4 vale para o servidor MySQL, que não exige TLS; o coletor continua exigindo TLS com certificado fixado (tls.ts), então a conexão segue cifrada; desligar isso seria decisão nova do dono. DECISÃO TÉCNICA (Jarvis): a E2.2 (devops) cria a branch feature/061-coleta-diaria a partir da docs/061-coleta-diaria na worktree 052g, commita o texto das ADRs em commit próprio e depois a implementação.
- 2026-11-02 21:26: E2.2 cumprida pelo devops-engineer: feature/061-coleta-diaria em e992a5fdbf0acf82ebd707bb0191d298f0f1b065 (3034e96 só as ADRs do arquiteto; e992a5f implementação), sem PR. Dockerfile e .dockerignore levam docs/architecture/fontes; serviço coleta no Compose (perfil coleta, sem porta, env_file do host, PEM só leitura); deploy/systemd com timers 06:00, 06:30 e domingo 07:30 BRT e OnFailure por e-mail (AVISO_EMAIL do host); runbook docs/devops/runbook-coleta-diaria.md. docker build e compose config ok; pronto rc=0 fora do sandbox; nenhuma coleta executada. Decisões do autor para o review: releitura domingo 07:30; senhas DSPD_PWD_* do servidor no .env do Compose.
- 2026-11-02 21:30: entrega conferida e992a5fdbf0acf82ebd707bb0191d298f0f1b065
- 2026-11-02 21:30: DECISÃO TÉCNICA (Jarvis): review (E2.3) e segurança (E2.4) em paralelo; QA (E2.5) depois do review. O parecer de devops é dispensado aqui porque o autor é o próprio devops-engineer.
- 2026-11-02 21:40: E2.4 cumprida pelo security-engineer: parecer docs/security/061-coleta-diaria.md aprovado em e992a5f (6cb6bc33bf862bb40968c8c4164e6aad4c359223). Recomendados para o devops: A1 segredos com 700 de root impedem o container (uid 1000) de ler o PEM e a coleta do Acelerato falharia (defeito de funcionamento); A2 clone em /opt pertencente a root; A3 chmod 600 no .env do Compose e sem senhas _dev. DECISÃO TÉCNICA (Jarvis): o A1 volta ao devops antes do QA, num brief único com os achados do review quando ele sair.
- 2026-11-02 21:46: E2.3 cumprida pelo tech-lead: review docs/reviews/061-coleta-diaria.md REPROVADO em e992a5f (17481f899961a6866bf9a4ae584bf82e447f7d00). A1 bloqueante: runbook dá 700 de root em segredos e 600 no PEM, o container (uid 1000) não lê e o Acelerato falha em tls; correção no runbook (755 e 644, PEM é público). Recomendados: A2 After= na releitura; A3 env_file required exige Compose 2.24; A4 conferir trava com TimeoutStartSec; A5 apontar o runbook em docs. DECISÃO TÉCNICA (Jarvis): volta 1 da E2.2 ao devops num brief único com o A1 do review e os recomendados A1 a A3 da segurança e A2, A3 e A5 do review; o QA espera.
- 2026-11-02 21:55: DECISÃO TÉCNICA (Jarvis): no brief da volta da coleta, o Objetivo fica idêntico ao aprovado (exigência do forge-check para volta) e o primeiro item do Entregar esclarece que a branch e os commits já existem; o A4 do review entra como conferência no runbook. MELHORIA (Forge): o bloco Objetivo idêntico exigido na volta pode contradizer o estado real da branch.
- 2026-11-02 22:15: volta 1 da E2.2 cumprida pelo devops-engineer: 6dece9a61c6c152f2e61422dcd881286e3beafd8 (runbook com 755 e 644 em segredos e PEM, clone de root, chmod 600 e conferência das senhas _dev, Compose 2.24, conferência da trava no TimeoutStartSec; After= na releitura; README cita o runbook); pronto rc=0. Próximo: conferente, revalidação do review por delta (E2.3) e QA (E2.5).
- 2026-11-02 22:16: o forge-check brief mensagem --entrega recusa o brief de volta gerado por gerar --volta (cabeçalho sem Etapa:). DECISÃO TÉCNICA (Jarvis): brief de referência da volta 1 da E2.2, com cabeçalho completo e o mesmo Entregar, só para conferir a entrega 6dece9a; sem nova execução. MELHORIA (Forge): gerar --volta e mensagem --entrega discordam sobre o cabeçalho.
- 2026-11-02 22:25: entrega conferida 6dece9a61c6c152f2e61422dcd881286e3beafd8
- 2026-11-02 22:25: DECISÃO TÉCNICA (Jarvis): o tech-lead revalida o review por delta (E2.3) sobre 6dece9a; o QA (E2.5) começa depois do review aprovado.
- 2026-11-02 22:30: E2.3 cumprida pelo tech-lead: review revalidado por delta e aprovado em 6dece9a (ce363ba1c32639c2c78668d83e4d450ff0186d36), sem achados. Próximo: QA (E2.5).
- 2026-11-02 22:33: recursos da máquina definidos pelo dono em 2026-11-02 20:40 (pelo assistente do app, registrados no topo do KANBAN.md): no máximo 1 tarefa pesada por vez (suíte completa, e2e, build), até 2 worktrees testando ao mesmo tempo, antes de tarefa pesada MemAvailable acima de 3000 MB e load abaixo de 7, vitest e playwright com no máximo 4 workers, nunca pkill amplo.
- 2026-11-02 22:45: E2.5 cumprida pelo qa-engineer: QA da coleta aprovado em ce363ba (808034100af8feec83e9490dc4fbdec4b95afecf), sem bugs; docker build, compose config, horários e aviso de falha conferidos; pronto não rodou no sandbox (fica para a CI do PR). Recomendados: A1 runbook conferir o PEM antes de ligar os timers; A2 caminho fixo do sendmail. Próximo: PR (E2.6).
- 2026-11-02 22:53: conferência de entrega do QA da coleta: não cumpriu só pelo anexo com remoção do parecer de review (commit ce363ba, revalidação do tech-lead, sem mérito). O forge-check pr da branch acusa: parecer de QA sem registro de autoria e achado A1 com mais de 300 caracteres; parecer de segurança desatualizado (o README mudou depois); parecer de devops (docs/devops/061-coleta-diaria.md) desatualizado e sem autoria. DECISÃO TÉCNICA (Jarvis): voltas curtas antes do PR da coleta, em paralelo: QA regrava o próprio parecer pela ferramenta Write com o A1 abaixo de 300 caracteres; segurança renova por delta sobre a ponta atual; devops renova o próprio parecer como revisão de devops da branch.
- 2026-11-02 23:04: volta do parecer de segurança da coleta: renovado e aprovado (3935bf9fd5be5d413709abe05de8e249a8b134ae); recomendado A4: o runbook dizer que no diretório de segredos fica só o PEM. MELHORIA: vários papéis enviando na mesma worktree causam corrida de push; um push por rodada evitaria.
- 2026-11-02 23:06: volta do parecer de devops da coleta: renovado e aprovado como revisão da implementação (fca1c9af4ed3e5430dad36ad5d1c983449897847); recomendados R1 validar as unidades na VM com coleta de teste; R2 coleta sem depender do migrate; R3 imagem base por digest. forge-check pr rc=0.
- 2026-11-02 23:13: volta do parecer de QA da coleta: regravado com o A1 abaixo de 300 caracteres (3317eb3f05180ede624e13997c5507637aa57010); forge-check pr da branch na ponta fca1c9a com rc=0, sem nenhuma linha. Próximo: PR (E2.6).
- 2026-11-02 23:20: E2.6 cumprida pelo tech-lead: PR 204 da coleta diária aberto como rascunho para a develop (https://github.com/rodrigo-isensee/MetricasDSPD/pull/204), ponta fca1c9af4ed3e5430dad36ad5d1c983449897847, forge-check pr limpo; o pronto fica para a CI do PR. Próximo: E2.7 (merge).
- 2026-11-02 23:23: conferência de entrega do PR 204: não cumpriu só por anexo com remoção nos pareceres de review, segurança e devops, que foram renovados pelos próprios donos nas voltas registradas (sem mérito); PQ-1, etapa e forge-check pr limpos. DECISÃO TÉCNICA (Jarvis): o merge (E2.7), já delegado com brief aprovado, segue; o forge-check pr da branch é limpo. MELHORIA (Forge): a conferência de entrega trata renovação de parecer pelo dono como anexo com remoção.
- 2026-11-02 23:24: E2.7 parou: PR 204 atrás da develop (o P1 entrou antes, em 3c284ff). DECISÃO TÉCNICA (Jarvis): volta 1 da E2.7: atualizar a branch com a develop pelo próprio PR (update-branch, merge commit, sem force), esperar os checks e o forge-check pr; parecer que ficar desatualizado: parar e relatar; com tudo verde, mesclar.
- 2026-11-02 23:48: E2.7 cumprida pelo tech-lead: PR 204 mesclado (squash) na develop em 46f0e121ad704b01f945b60cf439865a9832b2e1, depois do update-branch (c708a37), checks verdes, forge-check pr limpo. A coleta diária está na develop; para valer no servidor, falta o dono instalar pela runbook na VM interna e providenciar os segredos. Pendente: limpeza da branch e da worktree 052g.
