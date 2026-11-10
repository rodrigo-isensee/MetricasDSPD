---
tipo: qa
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-ca8-ref-dominio
commit: aaa52dab2e3850063edf34a645a60117e71dc143
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---

# QA: listas de ref_dominio no CA-8 do Acelerato (E3, K-224)

Links: desenho `docs/analises/073-e3-desenho.md` (§3 e §4), CT-34 em `docs/qa/056-coletor-plano-de-testes.md`, review `docs/reviews/073-ca8-ref-dominio.md` (aprovado, revalidado em 979072e8), segurança `docs/security/073-ca8-ref-dominio.md` (aprovado).

## Veredito
**Aprovado.** Valem o parecer anterior (a6363d2c) e o delta da volta, 848e4320, que só mexe em teste: o falso do MySQL no teste pg passa a devolver o nome novo da equipe (antes o chamado 91 caía em fora-do-recorte, CA-11, comportamento correto do código) e um teste novo cobre o desempate do comparador de `listasSha256`. O merge aaa52dab trouxe a develop (PRs 240 a 243), conferido por conteúdo pelo review. Nenhuma asserção saiu: o delta tem 6 linhas somadas e 1 trocada (`const mysql` para `let mysql`).

## Execução (worktree da branch, 2 workers)
| Comando | Resultado |
|---|---|
| `npx vitest run --maxWorkers=2 acelerato-ca8-listas acelerato-campos-etapa` (server) | 2 arquivos, 58 testes passam |
| CI do push no head com código (aaa52dab, run 42233046914) | success; prova os testes pg e a cobertura de branches em 100% |
| CI do push em 979072e8 (só parecer de review) | em andamento na leitura; sem código novo |

A suíte inteira, o eslint, o tsc e o `docs:check` do parecer anterior valem para o código; o delta é só teste e a CI do push cobre a suíte completa e o banco.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-8: recorte ou vocabulário mudou recusa só com o nome da chave (CT-34) | `acelerato-ca8-listas.test.ts` CT-34 | valor nunca na mensagem | passou (sem mudança) |
| Hash estável: ordem, `ordem` de exibição, lista vazia | `acelerato-ca8-listas.test.ts` (casos do hash) | vazio, ordem | passou |
| Hash: mesmo campo e mesmo código mantém a ordem de chegada (desempate, `controle.ts:43`) | `acelerato-ca8-listas.test.ts` (caso novo de 848e4320) | empate do comparador | passou |
| P-E3-1 e P-E3-2: `natureza_prefixo` não recusa; reconhecer relê só acrescentando versões | `acelerato-ca8-listas.test.ts` e `acelerato-ca8-ref-sync.pg.test.ts` | releitura aditiva | passou (unitário); pg passou na CI aaa52dab |
| `ac:ref-sync` fecha vigência sem apagar; recusa e, reconhecida, segue (nome novo no falso) | `acelerato-ca8-ref-sync.pg.test.ts` | histórico preservado; chamado só no recorte se o nome casa (CA-11) | passou na CI aaa52dab |

## Mutação à mão no delta (desfeita, sem commit)
| Mutante | Resultado |
|---|---|
| `controle.ts:43`: desempate `: 0` trocado por `: -1` | 1 falha: "mesmo campo e mesmo código ... mantém a ordem de chegada" (o teste novo mata o mutante) |

Árvore conferida limpa depois da mutação (`git checkout` do arquivo; `git status` sem alteração).

## Achados
- A1 (recomendado) docs/qa/073-ca8-ref-dominio.md:1 · A primeira coleta depois do deploy reconhece sem reler (comportamento testado e igual ao A1 do parecer de segurança); o roteiro da release deve mandar rodar a coleta com releitura e reconhecimento se o recorte mudar. Dono: tech-lead.
