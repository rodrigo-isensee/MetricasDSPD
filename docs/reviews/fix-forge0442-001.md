---
tipo: review
contrato: 1
pedido: fix-forge0442-001
branch: fix/forge0442-001
commit: bdb6669e3c7176d78d5a31452df49f5b00e651e2
parecer: aprovado
revisor: tech-lead
data: 2026-11-14
---

# Code review: FORGE0442-001, falhas preexistentes do pronto (retomada)

Revalidação depois do merge da develop (bdb6669e, base 62823ca0) e do parecer de devops (3506ffdb). Pedido 102-forge-0460, etapa E1.21.

## Delta lido
`forge-check parecer delta docs/reviews/fix-forge0442-001.md`, intervalo 79e9790d..3506ffdb, sem o que veio da develop. No domínio: `package.json` e `scripts/suite-unica.test.sh`.

- `package.json`: a resolução mantém o lint do server da develop (`&& pnpm --filter @metricas-dspd/server run lint`, igual ao de 62823ca0) e põe o heap de 4 GB só no eslint da raiz (`node --max-old-space-size=4096 node_modules/eslint/bin/eslint.js .`; o binário existe no caminho). `test:trava` e os scripts novos vêm da develop, sem mudança.
- `scripts/suite-unica.test.sh`: o teste 4 usa `METRICAS_DSPD_SUITE_DIR` num diretório temporário e não depende mais da trava do pronto: o "pulado" da develop saiu, e o caso roda inteiro mesmo dentro da suíte (K-256). Rodei `bash scripts/suite-unica.test.sh` em 3506ffdb: 8 ok, "tudo certo".
- Medição do devops (`docs/devops/fix-forge0442-001.md`): com 2048 MB, o equivalente ao padrão do Node sob o teto de 8 GB, o lint dá rc=134 por falta de heap; com 4096 MB, rc=0 com pico de 3,62 GB. Isso sustenta o heap explícito. Nesta estação o padrão já é cerca de 4 GB, por isso o lint sem a opção também passa aqui.
- CI do head 3506ffdb pelos check-runs: rapida, testes, banco, build, openapi, seguranca, imagem e filtro com success; perf e e2e skipped (o filtro não os disparou).
- shellcheck (rodado no review, sem regra "ferramenta" configurada no `praticas.md`): só o SC2034 do A1 é novo; SC2164 e SC2174 já existiam e o SC2016 é intencional (literal).

## Pareceres antigos
Os pareceres de QA (0dd4625) e de segurança (e81545f7) são de 11/11. O delta de cada um traz `package.json` e `scripts/suite-unica.test.sh` no domínio, então os dois precisam de delta (E1.22 e E1.23). Este parecer substitui o review de 79e9790d. O A1 do review anterior (tempo de `classificarApontamento`) virou o K-316, entregue no E1.7.

## Achados
- A1 (recomendado) scripts/suite-unica.test.sh:8 · `DENTRO_DE_SUITE` ficou sem uso depois da resolução do merge (o teste 4 não pula mais) e o shellcheck acusa SC2034. É código morto: remova as linhas 7 e 8 numa próxima mudança desse arquivo. Não altera comportamento, por isso não devolve.

## Conclusão
Sem bloqueantes. Guardas: nenhuma nova. O `:-` é valor padrão, coberto pelo teste 4. Tamanho: 58 linhas de código e teste, dentro do teto de 150 (M14).
