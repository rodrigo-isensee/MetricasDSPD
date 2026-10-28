## Projeto de origem
Projeto full-stack de métricas ágeis em Node.js e React, com branch de homologação e PR de release para a `main`.

## Situação observada
Não havia passo documentado para abrir o PR de release da homologação para a `main`. O PR era aberto cedo (antes de o portão da homologação terminar); o check de promoção, que só lê execuções concluídas com sucesso, saía vermelho por corrida, e a criação posterior pelo tech-lead falhava por PR já existente. Nenhum workflow cria esse PR: a lacuna é de processo na fábrica.

## O que muda
Só texto, opção A da análise; nenhum workflow, hook ou modelo de projeto alterado.
- `docs/regras/R-FLUXO.md`: PR de release, um só por candidato: abre só com o portão verde; lista antes de criar (`--base main --head homolog --state open`) e confere fork, base e autor; edita só título e corpo (`--body-file`), nunca a base; erro do `gh` não é "sem PR"; o tech-lead não mescla (`R-MAIN`).
- `skills/ci-cd/SKILL.md`: check de promoção distingue pendente de falhou; pendente espera e reexecuta o mesmo sha, sem afrouxar o check.
- `agents/tech-lead.md`: resumo do passo, apontando para `R-FLUXO`.
- `changelog.d/MetricasDSPD-f22-release.md`: fragmento (Alterado).

## Como medir
Em 2 releases seguidas: 0 checks de promoção vermelhos por corrida (run iniciado antes do fim do job do portão, via `gh run list` e `gh run view --json jobs`) e 0 PR de release duplicado (`gh pr list --base main --head homolog --state all` mostra 1 por release). Fora de 0, passa-se à opção B (guarda em hook).

## Checklist
- [ ] `python3 -m unittest discover -s tests -v` verde (rodar fora do Claude: `test_atualizar` e `test_sugerir` recusam rodar dentro dele)
- [x] `claude plugin validate . --strict` verde (`scripts/validar-plugin.sh`: passou)
- [x] `scripts/verificar-contribuicao.sh` sem achados
- [x] Fragmento novo em `changelog.d/` (versão não alterada, `CHANGELOG.md` intocado)
- [x] Neutralidade: nada do projeto de origem; `tests/config.json` intocado
- [ ] Rótulo `afrouxa-regra` pedido ao dono (não marcar: a mudança não afrouxa regra protegida)
