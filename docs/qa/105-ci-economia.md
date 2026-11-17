---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-ci-economia
commit: 06aecfda01fb7ee2981a4ce4f11309ac8a24ef15
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-ci-economia (E7.596)

Pedido de CI econômico (E7.594), sem especificação de UX nem contrato de API: sem plano antecipado. Obrigações: (O1) nenhum check exigido some ou fica pendente; (O2) "só documento" não classifica mudança que afeta código; (O3) push em `main` sem CI não tira garantia; (O4) sem afrouxamento. Não há teste automatizado novo no diff (só `ci.yml`, nota e changelog); a prova é por reprodução da lógica dos passos. Sem PR e com o CI parado por cobrança: este parecer não afirma CI verde nem cita `bateria`; o PQ do autor não rodou `pronto` nem `actionlint` (lacuna dele, não minha).

## Achados
- A1 (recomendado) .github/workflows/ci.yml:136 · o passo `p` trata `FORA` vazio como "só documento" (`!= 'true'`): se o filtro não emitir saída, PR para develop vira pesado=false. Prefira `= 'false'` para falhar para o lado inteiro.
- A2 (recomendado) .github/workflows/ci.yml:43 · `testes`, `build`, `openapi` e `imagem` agora dependem de `filtro`: se ele falhar, ficam pulados (verde para o check exigido). Só o agregador `e2e` pega isso (PESADO vazio falha). Confirmar que `e2e` e `filtro` são exigidos.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| O1 checks exigidos (rapida, testes, build, e2e, filtro, banco, openapi, imagem, seguranca, `docs/engineering/fluxo-homologacao.md:202`) | leitura do `ci.yml` + `yaml.safe_load`: os 9 jobs seguem com o mesmo nome; pulados por `if` contam como sucesso; `e2e` roda com `always()` | job renomeado ou removido | passou (a proteção real não é legível: `gh api .../protection` e `/rulesets` devolvem 403, plano sem o recurso) |
| O2 classificação de documento | `picomatch@4.0.7` do repositório com os 4 padrões e `dot:true` (`every`, como o dorny): `docs/**/*.md`, `README.md`, `CLAUDE.md`, `changelog.d/*` = documento; `docs/api/*.json`, `docs/architecture/fontes/*.json`, `.github/workflows/ci.yml`, `server/*.ts`, `docs/x.MD`, `a/README.md`, `docs/img.png`, `.claude/*.md`, `.gitignore` = código | JSON lido pelo código, extensão em maiúscula, `.md` fora da raiz | passou |
| O2 código lê `.md`? | grep em `server`, `web`, `tools`, `e2e`: nenhum teste lê `docs/**/*.md` ou `.md` da raiz como entrada; `docs:check` e `spec:check` seguem no `testes` | teste que depende de documento | passou |
| Lógica do passo `p` e do agregador `e2e` | `bash` com o trecho copiado: PR develop + só doc = false; PR homolog ou main, push homolog ou main, dispatch, schedule = true; push develop + só doc = false; com código = true; agregador: skipped só vale com `false`, `true`+skipped, vazio+skipped, cancelled e failure falham | release e dispatch inteiros | passou (A1 é o caso vazio) |
| O3 push em `main` | a `main` só recebe PR de release (CI do PR com base main = pesado, `perf` e `banco` incluídos) e o mesmo conteúdo já passou no portão de `homolog` (`homolog.yml` intacto, `homolog-aprovada` lê só o workflow Homologação) | commit de merge sem run próprio | passou, sem perda de garantia exigida |
| O4 sem afrouxamento | grep no diff: sem `continue-on-error` novo (o de `seguranca` já existia), retry, `[skip ci]` nem `skip` de teste; custo zero | teste pulado em mudança de código | passou |
| Efeito colateral | sem push em branch de trabalho some o par de check runs de mesmo nome (push e PR) que `fluxo-homologacao.md:205` descreve | check duplicado | observado, favorável |

## Cenários e resultado real
- Reprodução local do passo `p` e do agregador: 11 combinações de evento e 6 do agregador, saída conforme a tabela; única divergência de robustez é a linha `fora=vazio -> pesado=false` (A1).
- Não verificado: rodada real do Actions (parado), `actionlint` (ausente do PATH), ruleset vivo (403) e `pnpm run pronto` (sem rodar: o diff não toca código de produção nem teste). Vermelho antes do verde e mutação: não se aplicam (sem teste novo, sem código).
- Resíduo aceito: `changelog.d/**` conta como documento em qualquer extensão; só há fragmentos `.md` lá hoje.
- Bugs abertos: nenhum.
