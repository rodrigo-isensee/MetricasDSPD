---
tipo: review
contrato: 1
pedido: 091-homolog-reavalia-nova-tentativa
branch: fix/k263-reavalia-espera
commit: d1693a72b467afaf6f74fcc97618481efd16565d
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: 091 homolog-aprovada com nova tentativa do portão (K-263)

Escopo: diff `6e42dfb8..d1693a72` (3 arquivos: `tools/homolog/src/aprovacao.ts` +27/-4, `tools/homolog/src/aprovacao.test.ts` +76/-1, `docs/devops/091-homolog-reavalia.md` novo). 103 linhas de código e teste, dentro da orientação de 150; um comportamento só. Lido também o parecer de devops (`docs/devops/091-homolog-reavalia.md`, aprovado sobre `e40524fd`), citado e não refeito.

Testes dos arquivos tocados: `tools/homolog` com `vitest run --coverage --maxWorkers=2` (6 arquivos, 78 testes verdes; cobertura 100% em statements, branches, functions e lines) e `tsc --noEmit -p .` verde. A suíte completa vai ao CI do PR (o `pnpm run pronto` local caiu só nos testes de CLI do server, por ambiente, K-264; nada de `server/` foi tocado).

## Conferência contra o pedido
- **Nova tentativa só no "portão sem sucesso":** o laço (`aprovacao.ts:101`) fica depois das guardas de fork, hotfix, origem, branch ausente e candidato fora da ponta; todas retornam antes, sem esperar. O teste "outras falhas não esperam" cobre origem errada e candidato fora da ponta. A noturna (hoje informativa) reaproveita as `execucoes` da última consulta, sem espera própria.
- **A regra não afrouxa:** a condição de saída do laço é a mesma `temPortaoVerde(api, execucoes, ponta, ['push'])`, sobre o mesmo sha `ponta` já conferido igual ao candidato; o laço só repete a consulta. Nada vira verde por tempo: esgotadas as tentativas, a mensagem e o retorno são os de antes.
- **Vermelho ou ausente continua falhando:** os testes antigos de portão ausente, vermelho e de outro sha seguem passando (com espera zero pelo invólucro `semEspera`); o teste novo "portão vermelho falha só depois de esgotar as tentativas" prova 4 consultas, 3 esperas e o motivo `portão de homolog sem sucesso`.
- **Falha transitória vira verde:** "falha transitória que vira verde na segunda consulta passa, esperando uma vez" prova `aprovada: true` com uma espera de 10 s injetada; "verde na primeira consulta não espera" prova que o caminho feliz não dorme.
- **Guardas do diff:** a única guarda nova é `!portao && i < espera.tentativas` (`aprovacao.ts:101`). Os dois ramos têm teste de comportamento: tirar `!portao` faz o verde esperar (pego por "não espera"); trocar o limite muda a contagem de consultas e esperas (pego por "esgotar as tentativas"). O devops registrou o vermelho antes do verde (2 falhas contra o código antigo).
- **Determinismo:** espera injetada, sem relógio real; o teste do `ESPERA_PADRAO` dorme 1 ms só para cobrir o `setTimeout`.
- **Custo e tempo (R-CUSTO):** no pior caso, ~60 s de runner a mais por execução do check, dentro do `timeout-minutes: 5` do `homolog-aprovada.yml`; sem workflow, permissão ou segredo novo (`.github/` intocado). Gatilho de segurança (CI/CD) fica com o parecer do `security-engineer`, não refeito aqui.

## Achados
- A1 (recomendado) docs/engineering/fluxo-homologacao.md:170 · o texto ainda diz "sem espera paga" e "em curso ou ainda não listado = falha"; agora a falha vem depois de até ~60 s de nova consulta. Atualizar a frase com a espera do K-263 (até 6 x 10 s, só no "portão sem sucesso", critério inalterado), no PR da E1.5 ou num commit do autor nesta branch.
- A2 (recomendado) tools/homolog/src/aprovacao.ts:101 · o pedido fala em "terminou há pouco"; a espera vale em todo "portão sem sucesso", inclusive com o portão em curso (~60 s de runner a mais). Não afrouxa a regra; para enxugar depois, exigir a execução do portão do sha listada como concluída.

## Notas
- A2: o caso comum é a abertura do PR de release com o portão ainda em curso, falha que o `homolog-reavalia` já resolve. O custo é pequeno. Não bloqueia: o critério de review do brief é "só no caso portão sem sucesso", e é o que está feito.
- Nenhum achado bloqueante. Itens do Entregar da E1.1 conferidos contra os commits: código e teste em `e40524fd`, parecer de devops em `d1693a72`; nenhum item sem commit.

## Parecer
Aprovado. Mudança pequena e localizada, regra de aprovação idêntica, espera injetável e testada nos dois sentidos (transitória vira verde; vermelho segue vermelho, depois das tentativas). Os pareceres de segurança e de QA são independentes deste.
