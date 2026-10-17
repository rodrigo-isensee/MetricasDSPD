---
tipo: revisao-seguranca
contrato: 1
pedido: 011-fase2-taticas
branch: feature/011-fase2-taticas
commit: 6eda1cca5a6c3f214fcf9f6359bc78ee966c3898
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-16
---
# Review de segurança: back da fase 2 do pedido 011, lote 2 (táticas: T13, T14)

Propósito: portão de segurança (R-SEGURANCA, gatilho de dado pessoal no T14) antes do PR do lote 2. Público: tech-lead, node-backend, software-architect, qa-engineer, Jarvis.

**Veredito: aprovado para a fase 2 (mock).** Nenhum dado de pessoa nem nome de outro time sai em contrato, resposta, log ou mock, e a biblioteca não conta pessoas. Um achado (M-1) só vale para a fase 3 e vai ao usuário antes dela: na API, ocultar "outros times" não esconde o número, porque `meuTime` traz `k` e `n`.

**Revalidado sobre `6eda1cc` (2026-10-16): aprovado, sem achado novo que bloqueie a fase 2.** Detalhe na seção "Revalidação sobre 6eda1cc". O M-1 foi decidido pelo usuário (T14-M1 = B) e a decisão ganha um complemento para o cartão da fase 3 (M-1a: o agregado do bloco também revela o número).

**Escopo revisado (parecer original, sobre `ace8db8`):** `git diff 3aeaa3d..ace8db8` (45 arquivos), só o que este lote acrescenta ao lote 1. Base: ADR 0020 da develop `48b909a` (itens 8 e 9 e "Risco residual" (b)), `docs/security/adr-0020-protecao-de-pessoa.md` (R-1), o pedido 011 (T14 nova = A, Q-T14-1 = B, Q-T14-5 = D, Q-T14-6 = A com R-1 = B, Q-T14-9 = A, Q-T14-10 = B; D-14' = A, R-4) e `docs/reviews/011-fase2-taticas.md`. Leitura estática.

## Gatilhos
- **Dados pessoais:** T14. "Outros times" fica oculto com menos de 2 pessoas (R-1 = B), e na coleta real isso depende de um cadastro de membros por time (Q-T14-10 = B).
- **Comparação entre times (7.1):** T13 e T14 tocam outro quadro e outra equipe.
- Nenhuma migração, GRANT, workflow, dependência nem log novo.

## Verificações
| Item | Resultado | Evidência |
|---|---|---|
| T14 sem nome de outra equipe | ok. A resposta traz só a equipe do filtro (`equipe`), `meuTime`, `outrosTimes` (um inteiro anulável) e `semTime`. Não monta mapa por equipe | `packages/metricas/src/businessmap/t14.ts:99-110`; `server/tests/metricas.test.ts:568-586`; `packages/contratos/src/tambem2.test.ts` (trava de nomes, `LIBERADOS_T14`) |
| T14 sem contagem de pessoas | ok. A biblioteca recebe o booleano `outrosPublicavel` pronto e nunca conta pessoas. Chave ausente vale como não publicável, o mais restritivo | `t14.ts:106`; `packages/metricas/src/businessmap/extensao.ts` (`outrosPublicavel`) |
| T14 exige uma equipe | ok. Com "Todas" ou mais de uma, `semEquipe` e nada é calculado (CA-28) | `t14.ts:35-43` |
| T13 | ok. Só o booleano "dependeu de outro quadro". O quadro e a equipe do outro lado não saem. `relacionado_id` fica na extensão, em memória, e não chega à resposta | `packages/contratos/src/tambem.ts:275-293`; `t13.ts:35-43` |
| `ChaveSegmentacao` | ok. T13 `['tipo']`, T14 `[]`. Nenhuma chave nova | `packages/metricas/src/core/regras.ts:642-675`; `fase2.regras.test.ts` |
| Mock (ADR 0020, item 8) | ok. `outrosPublicavel` é gerado direto, sem ler `responsaveis`, e `equipeResponsavel` traz o nome da equipe (unidade organizacional) | `packages/mock/src/businessmap/extensaoTambemFase2.ts` (bloco T14) |
| Coletor | lote sem mudança em `coletor/` | diff |
| Log, erro e segredos | nada novo; nenhum padrão de credencial no diff | diff `3aeaa3d..ace8db8` |

## Achados

**M-1 (média na fase 3; sem efeito na fase 2, mock). "Outros times" oculto não esconde o número: `outrosTimes = n − k`, e `meuTime` publica `k` e `n`.**
- Evidência: `packages/metricas/src/businessmap/t14.ts:105-106` (`meuTime: taxa(k, n)`, `outrosTimes: publicavel ? n - k : null`); `packages/contratos/src/comum.ts:299-313` (`taxaSchema` sempre traz `k` e `n`, inclusive em `insuficiente`); ADR 0020, "Risco residual" (b).
- Caminho de ataque: um coordenador com acesso ao painel abre o T14 com o próprio time. Num projeto em que os outros times somam uma pessoa só, a tela oculta "outros times", mas a resposta da API (ou a própria tela, que mostra "k de n") dá `n − k`, que é a quantidade de cards dessa pessoa no projeto. Ele ganha uma contagem individual, que a R-1 = B queria evitar e que a regra inviolável proíbe usar para avaliação individual. Precisa de dado real (fase 3) e de conhecer o time, e por isso a probabilidade é média.
- Por que não é só um bug: a decisão do usuário (R-1 = B) diz "mostra só 'meu time: k de n'", e é esse "k de n" que entrega o número. A ADR registrou o risco "sem mudar a decisão". Pela proporcionalidade, isso é uma escolha do usuário, não uma correção técnica.
- Opções para o usuário (R-DECISAO, antes do primeiro cartão da fase 3 que alimente o T14 com dado real):
  - **(a) Aceitar ciente.** Mantém "k de n". O aceite precisa ser escrito pelo usuário em `docs/security/aceites/011-fase2-taticas.md`, com o `commit` do parecer vigente na fase 3.
  - **(b) Quando "outros times" estiver oculto, `meuTime` sai como "k de total".** O total inclui os cards sem time, e `n` e `semTime` não saem. A subtração passa a dar "outros times mais sem time", o que mistura os dois grupos. Mitigação parcial, com custo pequeno (contrato e teste).
  - **(c) Quando "outros times" estiver oculto, a linha do projeto mostra só se o meu time atua ou não, sem números.** Fecha o caminho, mas perde informação para o próprio time.
- Recomendação: (b) se o usuário quiser manter o número do próprio time; (a) só se ele aceitar o risco sabendo dele.
- Esforço: P. Dono: usuário (decisão, pelo Jarvis); depois, node-backend e ux-designer.
- **Estado (revalidação):** decidido pelo usuário, T14-M1 = B. Ver "Revalidação sobre 6eda1cc".

**B-1 (baixa). A P6 (nenhum valor de pessoa) não alcança o T14.**
- Evidência: a P6 roda com os filtros padrão (`packages/metricas/src/regras.property.test.ts:631`), e o T14 sem equipe responde `semEquipe`, com a resposta vazia. O teste de rota com uma equipe confere chaves e nomes de equipe, mas não confere valores de pseudônimos de pessoa (`server/tests/metricas.test.ts:580-583`).
- Caminho: uma mudança futura que ponha, por exemplo, o responsável no `titulo` ou numa lista passaria pelos testes. Não há caminho hoje, porque o código não lê pessoa.
- Correção mínima: na P6, rodar o T14 também com uma equipe no filtro (uma de cada, ou a primeira).
- Esforço: P. Dono: qa-engineer (E2.4).

**I-1 (informativa). Selecionar outra equipe no filtro.** Qualquer pessoa pode escolher outra equipe como "meu time" e ver o k de n dela. Isso não é uma visão de comparação (só uma equipe por vez, sem ranking), e é o mesmo padrão do filtro de equipe nas outras métricas. Sem ação.

**I-2 (informativa).** A pendência da Q-T14-10 em `regras.ts:673` ainda descreve a leitura A ("responsáveis distintos"), mas a decisão do usuário é B (cadastro de membros). Já está no code review (R2). Não tem efeito de segurança na fase 2. **Estado (revalidação):** resolvido.

## Revalidação sobre 6eda1cc
Escopo: `git diff ace8db8 6eda1cc -- packages server docs/api docs/contratos` (11 arquivos), que reúne o merge da develop com o lote 1 (`9e83bf5`, squash #105), o B11-001 do T10 (`942c26a`) e os ajustes das rodadas 2 a 4 do review (`d845d88`, `c3ac1ca`, `bb5e920`, `3c9a9cd`, `bfe0b2d`). Base: ADR 0020 da develop (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`, itens 4c, 4d, 8 e 9) e as decisões do pedido 011 (T14-M1 = B, B11-001 = sim, Q-T14-9 = A, Q-T14-10 = B). Leitura estática.

| Item | Resultado | Evidência |
|---|---|---|
| T14: cálculo e contrato | sem mudança no `t14.ts` desde `ace8db8`; continua sem nome de outra equipe e sem contar pessoas. As verificações da tabela acima continuam válidas | `packages/metricas/src/businessmap/t14.ts:95-110` |
| T14: chave do booleano | ok. O mock passa a montar a chave pela mesma função da biblioteca (`chaveOutrosPublicavel`), em vez de um literal. A chave é `(projeto, slug da equipe, granularidade)`, sem pessoa. Remove o risco de a chave divergir e o booleano cair no padrão "não publicável" por engano (que, por ser o mais restritivo, já era seguro) | `packages/metricas/src/businessmap/extensao.ts:126-130`; `packages/mock/src/businessmap/extensaoTambemFase2.ts:18,311` |
| T14: pendências (I-2) | resolvido. A Q-T14-10 saiu da lista de pendências (decidida = B, cadastro de membros na fase 3) e a Q-T14-9 virou decisão do usuário. O teste trava que não voltem | `packages/metricas/src/core/regras.ts:663-672`; `packages/metricas/src/fase2.regras.test.ts:35-46` |
| T13 | ok. A mudança só passa a janela e o rótulo da amostra pela granularidade de cada bloco (story e frente nunca juntas, regra inviolável reforçada). Nenhum campo novo; `relacionado_id` segue fora da resposta | `packages/metricas/src/businessmap/t13.ts:66-74,91-93` |
| T10 com B11-001 | ok. O fornecedor é unidade organizacional, dimensão permitida (ADR 0020, 4d: campo de domínio fechado em `ref_dominio`; fora do domínio grava `desconhecido`). O agrupamento por caixa e espaços não cria campo, não lê pessoa e só exibe uma grafia já existente no dado (a mais frequente, com desempate neutro). A mudança de critério está registrada e marcada só no T10 a partir de 2026-10-17 (T2.6) | `packages/metricas/src/businessmap/t10.ts:24-40`; `packages/metricas/src/core/criterios.ts:90-97`; `packages/metricas/src/businessmap/o23.test.ts:73-82` |
| Merge da develop (lote 1) | ok. O lote 1 está na develop (`1607a5f`, #105), e o meu parecer do lote 1 (`docs/security/011-fase2-estrategicas.md`, aprovado sobre `3aeaa3d`) está nela idêntico ao do commit `ac1519e`. O merge não trouxe para este lote nada que mude T13, T14 ou T10. O E7 com R$ é do lote 1 e sai no pedido 024 (D2 = A) | `git show origin/develop:docs/security/011-fase2-estrategicas.md` |
| Coletor, migração, GRANT, workflow, dependência, log | sem mudança no delta | diff |
| `responsaveis` e `usuario` | nenhuma leitura em T10, T13, T14 nem no gerador do mock (o teste de texto do arquivo continua) | `grep` nos quatro arquivos; `packages/metricas/src/fase2.regras.test.ts:48` |

**Estado dos achados do parecer original:**
- **M-1:** decidido pelo usuário, **T14-M1 = B** (pedido 011, 2026-10-17): com "outros times" oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto. O código da fase 2 ainda publica `total`, `semTime` e `meuTime` com `k` e `n` (`t14.ts:104-109`), como a decisão prevê ("o mock e a fase 2 não mudam até o cartão do ajuste"). Continua sem efeito no mock e é pré-condição da fase 3.
- **M-1a (complemento do M-1, média na fase 3; sem efeito na fase 2).** O ajuste B não fecha o caminho se ficar só na linha do projeto: o bloco publica o agregado `total: taxa(k, n)` somado sobre todos os projetos, e a `base` publica `n` da granularidade (`t14.ts:113-119,129-132`). Com um projeto oculto, `n` do bloco menos a soma dos `n` dos projetos visíveis dá o `n` do oculto, e o `k` sai da mesma forma; `n − k` volta a dar os cards da pessoa. Caminho: o mesmo coordenador do M-1, só com a resposta da API. Correção mínima, no mesmo cartão do T14-M1 = B (node-backend): o agregado do bloco e a `base` não podem permitir isolar um projeto oculto (por exemplo, o agregado sai com a mesma regra da linha, só a fatia do meu time, ou exclui os projetos ocultos e diz isso), e um teste de propriedade confere que nenhum `n` de projeto oculto é recuperável por subtração. O UX ajusta o CA junto. Isso não é decisão nova: é aplicar a T14-M1 = B por inteiro. Esforço: P.
- **T14-ordem** (levantada pelo UX no E3.2, em aberto no pedido 011): a ordem pelo total (`t14.ts:121-122`, CA-30) ainda revela o tamanho relativo do projeto oculto. Do lado da segurança: a posição dá só uma faixa, não o número, e por isso é baixa. Basta ordenar pelo código (ou pelo `k`) nos projetos ocultos, se o usuário quiser fechar; a decisão segue com o Jarvis e o UX.
- **B-1:** em aberto, sem mudança na P6 (`packages/metricas/src/regras.property.test.ts`). Segue para o QA (E2.4).
- **I-1:** sem mudança. **I-2:** resolvido (acima).

## Pré-condições da fase 3 (deste lote)
1. **M-1 respondido (T14-M1 = B)** e aplicado por inteiro antes de o T14 receber dado real: linha do projeto, agregado do bloco e `base` (M-1a), com teste de propriedade; CA do UX e ADR 0020 atualizados junto com o K-112; nova leitura minha do cartão.
2. **Q-T14-10 = B (cadastro de membros por time), cartão K-112:** o cadastro é dado de pessoa. Antes de existir, a ADR 0020 (item 9) e o plano §9.5 precisam definir: (i) a tabela fica fora do GRANT do `dspd_api`, como `ref_conta_automacao` (lista de tabelas fora da API em `grants.ts`), e as colunas de pessoa entram em `COLUNAS_PESSOA` ou na lista de fora da API; (ii) só o `dspd_coletor` lê; (iii) a escrita é feita por pessoas da WS1, com origem e data por linha; (iv) há retenção e eliminação a pedido do titular (a tabela é de referência e atualizável, nunca append-only); (v) o projetor sai só com o booleano por `(projeto, equipe, granularidade)`. Isso exige nova leitura minha da ADR.
3. Campo "Time responsável" com domínio fechado (ADR 0020, 4d, B-5): valor fora de `ref_dominio` vira `desconhecido`; se o spike mostrar que o campo é de tipo usuário ou texto livre, o cartão para e a decisão volta ao usuário.
4. T13 na coleta real: `linked_cards` reduzidos a `(card_id, link_type)` (ADR 0020, 4c), e `outro_quadro` derivado sem gravar o quadro de terceiros além do id.

## Riscos aceitos e ferramentas
- Nenhum risco aceito por este parecer. O M-1 foi decidido (B), não aceito; o ajuste vale antes da fase 3 e não bloqueia a fase 2.
- Ferramentas: leitura estática, `git diff` e `grep` (também na revalidação). `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH (lacuna registrada). O lote não muda dependência nem workflow.

## Plano em cartões (para o Jarvis)
| Cartão | Achado | Dono | Quando |
|---|---|---|---|
| Aplicar T14-M1 = B na linha, no agregado e na `base` do T14, com teste de propriedade (decidido) | M-1, M-1a | node-backend + ux-designer (CA); revisão: security-engineer | antes da fase 3 do T14 |
| Ordem dos projetos ocultos (T14-ordem) | T14-ordem | Jarvis → usuário, com UX | antes da fase 3 do T14 |
| P6 com o T14 com uma equipe | B-1 | qa-engineer | E2.4 |
| ADR 0020 item 9 e plano §9.5 com o cadastro de membros; nova leitura de segurança | pré-condição 2 | software-architect + security-engineer | K-112, antes da fase 3 |
