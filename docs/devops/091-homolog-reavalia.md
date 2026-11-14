---
tipo: revisao-devops
contrato: 1
pedido: 091-homolog-reavalia-nova-tentativa
branch: fix/k263-reavalia-espera
commit: e40524fd108ba14d3dd88a929bd6092453b969da
parecer: aprovado
revisor: devops-engineer
data: 2026-11-11
---

# homolog-aprovada espera o portão recém-concluído (K-263)

## Mudança

- `tools/homolog/src/aprovacao.ts`: quando a consulta conclui "portão sem sucesso" para a ponta de `homolog`, consulta de novo (`execucoes` e `jobsComSucesso`) até 6 vezes, com 10 s entre elas (~60 s no total), antes de falhar. Parâmetro novo `espera` (`tentativas`, `intervaloMs`, `dormir`), com `ESPERA_PADRAO`; `main.ts` não muda.
- Só esse caso espera: fork, origem diferente de `homolog`, branch ausente, candidato fora da ponta, hotfix e noturna não esperam.
- A regra não muda (candidato = ponta de `homolog`, portão verde nesse sha). Portão vermelho ou ausente continua falhando, só depois das tentativas. Nada vira verde por tempo: o sucesso só conta se a API o listar.
- Workflows `homolog-reavalia.yml` e `homolog-aprovada.yml` não foram tocados: o `.github/` fica fora desta entrega (sem catraca `afrouxa-regra`, sem envio de workflow pelo dono).

## Causa tratada

Release 090, run 42970095292, tentativa 2: a reavaliação falhou 12 s depois do fim do portão porque a API ainda não listava o sucesso; a tentativa 3, sem mudança, passou. A espera cobre essa janela de propagação da API dentro do próprio check, sem depender de nova reexecução manual. O laço de 6 x 10 s do `homolog-reavalia.yml` (recusa de rerun com execução em curso) é outro caso e segue como está.

## Checklist

- `R-CUSTO`: até ~60 s extras de runner só quando o portão não aparece; o job `homolog-aprovada` tem `timeout-minutes: 5`, folga larga. Custo zero.
- `R-VERIFY`: sem `continue-on-error`, sem check desligado, sem teste pulado.
- `R-MAIN`, `R-CONFORMIDADE`: nenhum workflow, proteção ou ruleset alterado.
- Segurança: sem entrada nova não confiável, sem permissão nova, sem segredo.
- Testes (`aprovacao.test.ts`, API simulada, espera injetada, sem dormir): vermelho antes do verde (2 falhas contra o `aprovacao.ts` antigo); falha transitória que vira verde na 2ª consulta passa esperando 1 vez; portão vermelho falha após 4 consultas e 3 esperas; portão verde na 1ª não espera; outras falhas não esperam; padrão de produção soma 60 s. Testes antigos rodam com espera zero. Cobertura de `tools/homolog` em 100% (statements, branches, functions, lines).

## Lacunas

- `actionlint`, `shellcheck`: não se aplicam (nenhum workflow nem script alterado).
- `pnpm run pronto` da raiz: `tools/homolog` e demais pacotes verdes; o `server` tem 31 testes vermelhos em 5 arquivos (`apontamento-entradas`, `ref-sync-*-entrada`), todos de CLI filho. Causa provada: o filho roda com `env` só com `PATH`, e o `tsx` falha com `ENOENT mkdir '/tmp/tsx-1000'` dentro do sandbox desta sessão. Não é da mudança (nada em `server/` foi tocado); a prova do pronto completo depende de rodar fora do sandbox (o CI do PR).
- Prova real só na próxima release: a espera depende da API de Actions do GitHub.
