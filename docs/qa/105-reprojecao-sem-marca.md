---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-reprojecao-sem-marca
commit: abd6ce6f5f246512c8c6e36a74f5cc87755743e6
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---

# QA: K-397, reprojeção sem mudança não move a marca d'água (E7.415)

parecer: aprovado, sem achado. Testado em abd6ce6f. Sem `CA-n` de UX (comando de dados); as obrigações são as do brief: `ac:reprojetar-fluxo` só grava `ctl_coleta` quando preenche algum chamado; `ac:reprojetar-etapas` compara antes, só lendo, e não grava nada se os intervalos são iguais e a versão de critério já existia; reprojeção que muda linhas segue como antes; `coletaId` vira `number | null`; `lerMarcaDagua` e a coleta incremental intactas.

## Diff contra a obrigação
Diff `8a40f662..abd6ce6f` no domínio: `reprojecao-fluxo.ts` (o INSERT em `ctl_coleta` desce para depois do laço e sai antes dele se `preenchidos === 0`), `reprojecao-etapas.ts` (`registrarCriterioD7528` sobe antes do INSERT; `compararComGravado` só com SELECT; retorno antecipado com `coletaId: null` se versão já existia e nada mudou) e os quatro testes das reprojeções. O resto do diff (`vm-preparar`, `criterios-ac`, `package.json`) é da branch-mãe `fix/105-vm-criterios-ac`, fora deste pedido. `lerMarcaDagua` (`operacao/repositorio.ts`) e a coleta incremental não aparecem no diff. Escopo bate com o brief.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Fluxo: segunda execução sem preenchimento não cria `ctl_coleta` | pg `K-397: segunda execução não muda tabela alguma…` (execuções iguais, `coletaId: null`, hash das tabelas igual) | repetição, zero linhas mudadas | passa |
| Fluxo: com preenchimento segue gravando a linha de execução | pg `nulo com um workflow ganha fluxo…` (status sucesso, 3 entidades) | n/a | passa |
| Etapas: segunda reprojeção sem mudança, versão existente: nenhum `ctl_coleta` novo, uma versão, mesmas linhas | pg `(e) (f) K-397…` | repetição, versão já registrada | passa |
| Etapas: primeira reprojeção (versão nova) segue gravando, `ctl_coleta` de sucesso | pg `(b) (c) (d)` e unit `versão de critério nova conta como mudança…` | versão nova | passa |
| Etapas: intervalo divergente do gravado com versão existente regrava | unit `com mudança nos intervalos (mesma versão) segue como hoje…` e `a mudança no primeiro lote basta…` (banco falso) | intervalo diferente, lote | passa |
| `coletaId: number \| null` | asserts `coletaId: null` nos dois pg e `tsc --noEmit` do servidor sem erro | n/a | passa |
| Marca d'água igual depois da segunda reprojeção | prova extra do QA (abaixo) | marca = última coleta de sucesso | passa |
| `lerMarcaDagua` e coleta incremental intactas | fora do diff; suíte pg inteira verde | n/a | passa |

## Provas
- Testes de banco (descartável, K-392): `bash scripts/test-pg.sh` (o `test:pg` com Postgres próprio) no head abd6ce6f: `Test Files 50 passed (50)`, `Tests 342 passed (342)`, rc=0. Inclui `acelerato-reprojecao-fluxo.pg.test.ts` e `acelerato-reprojecao-etapas.pg.test.ts`.
- Marca d'água, prova direta: o teste existente só conta linhas de `ctl_coleta`. Acrescentei, numa cópia local descartável (restaurada com `git checkout abd6ce6f -- server/tests`, árvore limpa depois, nada commitado), `lerMarcaDagua(dono, 'acelerato', E)` antes e depois da segunda reprojeção nos dois testes, com `expect(depois).toEqual(antes)` e `antes` não nulo. Rodada completa de `test:pg`: 50 arquivos, 342 testes passaram, rc=0. `ctl_coleta` (contagem) e marca (`coletaId`, `finalizadoEm`) iguais antes e depois, nas duas reprojeções.
- Vermelho antes do verde: mesmos testes (com o assert da marca) contra a fonte da base (`reprojecao-etapas.ts` e `reprojecao-fluxo.ts` de 8a40f662): `Test Files 2 failed | 48 passed (50)`, `Tests 2 failed | 340 passed (342)`, rc=1. As duas falhas são `(e) (f) K-397…` (etapas) e `K-397: segunda execução…` (fluxo), ambas `AssertionError: expected { coletaId: '4', … } to deeply equal { coletaId: '3', … }`: sem a correção a marca anda de 3 para 4. Árvore restaurada ao abd6ce6f e limpa (`git status` e `git diff abd6ce6f` vazios). Não usei `forge-testes --vermelho` (as duas partes pg dependem do banco descartável do `test-pg.sh`), por isso o vermelho foi feito à mão, com o comando acima.
- Unit: `vitest run tests/acelerato-reprojecao-etapas.test.ts tests/acelerato-reprojecao-fluxo.test.ts`: 2 arquivos, 23 testes passaram.
- Suíte inteira e CI: não rodei; sem PR para a branch, a suíte inteira fica para o CI do PR. Este parecer não afirma CI verde.

## Bordas lidas
- Versão nova com intervalos iguais ainda grava `ctl_coleta` (a versão mudou o critério, é carga real): coerente com o brief ("e a versão de critério já existia").
- `compararComGravado` só lê (SELECT); em falha de leitura a transação aborta e nada é gravado. O cursor e o lote iguais aos da reprojeção real.
- Registro de `registrarCriterioD7528` antes do INSERT não muda o resultado quando a versão é nova; quando existe, devolve `false` sem gravar.

## Achados
Nenhum bloqueante nem recomendado.
