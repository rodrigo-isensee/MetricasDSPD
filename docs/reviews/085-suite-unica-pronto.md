---
tipo: review
contrato: 1
pedido: 085-suite-unica-trava-no-pronto
branch: feature/085-suite-unica-pronto
commit: bd71848448453830357a0b91207914a1237bfaa6
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-10
---
# Review: 085-suite-unica-pronto (K-256)

## Parecer
Aprovado. O diff toca só `scripts/suite-unica.test.sh` (e o parecer de devops); `scripts/suite-unica.sh` e a CI não mudaram, então a trava não foi afrouxada. O teste 4 guarda a marca herdada antes de limpá-la e pula o caso, com o motivo impresso, quando a trava padrão já está segurada (marca ou sonda `flock -n`). Fora disso a prova roda inteira.

Provado nesta revisão: `bash scripts/suite-unica.test.sh` sozinho, 7 casos ok, rc 0, com o caminho padrão provado (a segunda chamada espera a primeira). `bash scripts/suite-unica.sh bash scripts/suite-unica.test.sh`: 5 ok e 1 "pulado" com o motivo, rc 0, sem pendurar.

Sobre a observação do conferente: o caso pulado é só impresso e o ramo da sonda `flock -n` não foi exercitado. Fica como recomendado, não volta: o ramo da marca (o que o `pnpm run pronto` aciona) está provado; a prova do caminho padrão continua rodando no teste avulso; a sonda é uma linha que só amplia o pulo, e errar para o lado de pular não esconde defeito da trava (que tem teste próprio nos casos 1 a 3).

## Achados
- A1 (recomendado) scripts/suite-unica.test.sh:61 · a sonda `flock -n` (trava ocupada sem a marca) não tem teste do ramo; cubra num teste futuro com a trava segurada por processo sem a marca.
- A2 (recomendado) scripts/suite-unica.test.sh:64 · o pulo é só impresso, sem asserção; se o pulo virar rotina no `pronto`, conte-o (ex.: linha `pulado` no resumo).
