---
tipo: revisao-seguranca
contrato: 1
pedido: 085-suite-unica-trava-no-pronto
branch: feature/085-suite-unica-pronto
commit: bd71848448453830357a0b91207914a1237bfaa6
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança: correção do teste 4 de `scripts/suite-unica.test.sh` (pedido 085)

Propósito: dar o parecer de segurança exigido porque o `forge-check pr` classifica o diff como classe C (arquivo sensível da catraca). Revisão estática do diff `76be45ee...bd718484 -- scripts` (só `scripts/suite-unica.test.sh`; o código revisado é o 5369e9cc, contido em bd718484). Nenhum código foi alterado e nenhum teste foi rodado (sem Bash neste papel).

## Gatilhos
Arquivo sensível da catraca (trava da suíte única), classe C.

## Resultado por pergunta
1. Afrouxa a trava? Não. `scripts/suite-unica.sh` não está no diff; o contrato da trava (flock exclusivo, recusa de link simbólico em `/tmp/claude-<uid>` e no arquivo, não aninha só via `METRICAS_DSPD_SUITE_SEGURA=1`) é o mesmo.
2. Abre caminho para pular a trava? Não. A mudança só decide se o teste 4 roda ou é pulado, dentro do próprio teste; nenhum comando de produção passa a rodar sem a trava. O bypass por `METRICAS_DSPD_SUITE_SEGURA=1` já existia no script e é por desenho (quem o forja já controla o ambiente do processo e pode rodar o comando direto).
3. Leitura e escrita fora do permitido? Não. O teste usa `mktemp -d` (removido por `trap`), o arquivo da trava de teste e `/tmp/claude-<uid>/metricas-dspd-suite.lock`. A sonda `( flock -n 8 ) 8>>"$padrao"` abre em append sem gravar byte e só roda se o arquivo já existe (`-e`); solta a trava ao sair do subshell.
4. Depende de variável forjável para esconder defeito? Só em grau mínimo: `METRICAS_DSPD_SUITE_SEGURA=1` no ambiente faz o teste 4 ser pulado. Efeito: o caso do caminho padrão deixa de ser provado, não o contrário (nada passa a ser dado como verificado). O pulo é anunciado na saída (`pulado - ...`) e a execução do teste isolado prova o caso. Ver A1.

## Achados
- A1 (recomendado) scripts/suite-unica.test.sh:55 · O pulo do teste 4 conta como sucesso e depende de `METRICAS_DSPD_SUITE_SEGURA` ou de lock alheio; quem forja a variável só reduz a cobertura do caminho padrão, sem ganho de acesso. Risco baixo; o QA roda o teste sozinho para provar o caso.
- A2 (recomendado) scripts/suite-unica.test.sh:60 · A sonda `-e` e `8>>"$padrao"` segue link simbólico, diferente do `suite-unica.sh`, que recusa; o teste só abre em append sem gravar e o diretório é 700 do próprio uid, então sem caminho de ataque realista.

## Riscos aceitos
Nenhum que dependa do aceite do usuário; A1 e A2 são recomendações e não bloqueiam.

## Lacunas de ferramenta
Sem Bash neste papel: `gitleaks`, `shellcheck` e `actionlint` não foram executados. O diff não contém segredo nem workflow, e o tipo de mudança é só bash de teste.
