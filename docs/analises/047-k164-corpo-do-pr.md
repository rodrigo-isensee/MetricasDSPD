## Projeto de origem
Projeto full-stack em Node.js e React (back-end, front-end e testes E2E), desenvolvido pela fábrica com branches de integração `develop` e `homolog`.

## Situação observada
O hook `parecer` e o `forge-check pr` decidem de modos diferentes se um parecer está desatualizado. O `forge-check pr`, com a base, aceita o merge puro da branch de integração depois do parecer (simula o patch do autor sobre a base nova). O hook chamava o mesmo cálculo sem base, em modo estrito, e tratava como desatualizado qualquer arquivo que chegou só pelo merge da base. Resultado: o `forge-check pr` dá verde, o hook barra o PR ou o merge, e o autor pede revalidação de parecer sem mudança de conteúdo. Medido em um projeto: 5 revalidações sem mudança de conteúdo num pedido. Além disso, a linha de achado só aceitava `arquivo:linha`, e um achado que cobre um trecho (`arquivo:10-14`) era recusado e forçava reescrita do parecer.

## O que muda
- `bin/forge-check`: nova função `base_do_delta(raiz, base, ref)`, que concentra a regra da base do delta (base do fluxo lida de `origin/<base>`, a local só sem remoto; head já contido na base volta a `None` com aviso). O `pr_da_cli` passa a usá-la, sem mudar o comportamento. A gramática do achado aceita `arquivo:linha-linha`; intervalo invertido (`9-3`) e malformado (`3-`, `-3`, `3-5-7`) continuam recusados como linha fora do formato.
- `hooks/parecer.py`: `verificar` usa a mesma `base_do_delta` e passa a base ao `cmd_pr`. Base fora do fluxo (`develop`, `homolog`, `main`) ou inexistente continua em modo estrito, e a base do merge em branch de integração passa a ser o nome da branch atual.
- O que não muda e não afrouxa: mudança real do autor depois do parecer invalida nos dois (testado com merge da base e mudança do autor em seguida). Não entra: deixar de cobrar parecer de branch já mesclada nem revalidar por mudança em `.forge/versao`.
- Testes: dois casos de corpus do hook (`tests/hooks/parecer/`: merge puro libera; merge puro mais mudança do autor bloqueia; o primeiro falha no código antigo) e dois testes em `tests/test_forge.py` (intervalo aceito e copiado inteiro; malformado e invertido recusados). Fragmento em `changelog.d/`.
- Por que o existente não basta: o `forge-check pr` já tinha a regra; faltava o hook usá-la. Não há mecanismo novo, só uma função compartilhada.

## Como medir
Contar, por PR, as revalidações de parecer pedidas sem mudança de conteúdo do autor (o `forge-check pr` verde e o hook barrando, ou o parecer só refeito para mudar o `commit:`). Base medida no projeto de origem: 5 em um pedido, 2 reprovações de brief e 3 "não cumpriu" em outro. Meta: 0. Reversão: se aparecer parecer aceito com mudança real do autor, voltar o hook ao modo estrito (uma linha em `verificar`).

## Checklist
- [ ] `python3 -m unittest discover -s tests -v` verde
- [ ] `claude plugin validate . --strict` verde
- [ ] `scripts/verificar-contribuicao.sh` sem achados
- [x] Fragmento novo em `changelog.d/` (`bin/forge-changelog novo`; versão não alterada, `CHANGELOG.md` intocado)
- [x] Neutralidade: nada do projeto de origem; sem afrouxar `tests/config.json`
- [x] Rótulo `afrouxa-regra`: não se aplica (a mudança não afrouxa o portão)
