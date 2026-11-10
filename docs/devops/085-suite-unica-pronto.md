---
tipo: revisao-devops
contrato: 1
pedido: 085-suite-unica-trava-no-pronto
branch: feature/085-suite-unica-pronto
commit: 5369e9cc9e6c2df45a4f65670e8a9d98f56bf30d
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-10
---
# Review de devops: 085-suite-unica-pronto (K-256)

## Parecer
Aprovado. Só `scripts/suite-unica.test.sh` mudou; `scripts/suite-unica.sh` e a CI ficam iguais, então a trava não foi afrouxada. O teste 4 (caminho padrão da trava) agora é pulado, com o motivo impresso, quando a trava padrão já está segurada: pela marca `METRICAS_DSPD_SUITE_SEGURA=1` herdada (rodando dentro de `pnpm run pronto`) ou por uma sonda `flock -n` que falha no arquivo padrão (outra suíte da estação). Fora disso a prova roda inteira, como antes.

- Provado: `bash scripts/suite-unica.test.sh` sozinho, 7 casos ok em 4 s, rc 0 (inclui o caminho padrão). Dentro de `bash scripts/suite-unica.sh bash scripts/suite-unica.test.sh`: 5 ok e 1 "pulado" com o motivo, 2 s, rc 0.
- Lacuna: o ramo da sonda `flock -n` (trava ocupada por processo sem a marca) não foi exercitado por teste automático nem manual, porque o hook recusa o lançador `flock` na sessão. Ramo simples; o ramo da marca está provado.
- Lacuna: `shellcheck` só acusa SC2164 (`cd` sem `|| exit`), linha que já existia. `actionlint` não se aplica (nenhum arquivo de `.github/` mudou).
- recomendado: o caso pulado não aparece como falha; o QA deve rodar o teste sozinho para ver o caminho padrão provado.

## Custo e rollback
Custo zero (`R-CUSTO`), nenhum minuto de CI novo. Rollback: reverter o commit.
