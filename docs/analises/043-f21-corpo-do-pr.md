## Projeto de origem
Projeto full-stack com front React e back-end Node, em desenvolvimento pela fábrica, com várias worktrees por agente.

## Situação observada
Numa worktree recém-criada não há dependências instaladas. A checagem do `pre-push.local` (lint e type-check) falha com "comando não encontrado" e o agente só descobre isso na hora do push, sem pista da causa; a saída do modelo apenas termina com código 1.

## O que muda
- `stacks/node-react/pronto.md`: seção "Preparação de cópia de trabalho nova", com o comando de instalação congelada pelo lockfile (stack sem dependências declara "nenhum").
- `docs/regras/R-TETO.md` e `skills/qa-testing/SKILL.md`: a worktree nova roda o comando de preparação da stack antes da primeira checagem (o texto da regra não nomeia ferramenta).
- `templates/projeto/.githooks/pre-push`: quando o `pre-push.local` falha numa worktree vinculada, imprime depois da saída dele uma dica fixa ("leia o erro acima; se a worktree foi criada agora, prepare as dependências com o comando de preparação da stack"). Texto literal, sem variável, sem executar nada, sem ler a stack; o status de saída continua 1; clone principal e envio para a main não mudam.
- `tests/test_forge.py` (`HookPrePush`): worktree com local falhando imprime a dica (e a saída do local vem antes); a dica não tem flag de contorno nem nome de branch/caminho; clone principal não imprime; código 127 continua barrando; local que passa não imprime; envio para a main de worktree segue bloqueado.
- Fragmento em `changelog.d/`. Mecanismo novo: nenhum; muda a mensagem de um hook existente e o texto de uma regra existente.

## Como medir
Pushes barrados por dependência ausente em worktree nova, contados por busca de "not found" e da dica fixa na saída do pre-push nas transcrições dos agentes por pedido: base 1 ocorrência, meta 0. Se a dica aparecer em push cuja falha não é dependência ausente em mais de 1 de cada 3 ocorrências em 30 dias, reverter a condição ou retirar a dica.

## Checklist
- [ ] `python3 -m unittest discover -s tests -v` verde
- [ ] `claude plugin validate . --strict` verde
- [ ] `scripts/verificar-contribuicao.sh` sem achados
- [x] Fragmento novo em `changelog.d/` (`bin/forge-changelog novo`; versão não alterada, `CHANGELOG.md` intocado)
- [x] Neutralidade: nada do projeto de origem; sem afrouxar `tests/config.json`
- [ ] Rótulo `afrouxa-regra`: não se aplica (a mudança não afrouxa regra protegida)
