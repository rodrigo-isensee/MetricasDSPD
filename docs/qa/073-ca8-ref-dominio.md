---
tipo: qa
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-ca8-ref-dominio
commit: a6363d2cd51fabf2e2fd6233c97cc05f32deaf62
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---

# QA: listas de ref_dominio no CA-8 do Acelerato (E3, K-224)

Links: desenho `docs/analises/073-e3-desenho.md` (§3 e §4), CT-34 em `docs/qa/056-coletor-plano-de-testes.md`, review `docs/reviews/073-ca8-ref-dominio.md` (aprovado), segurança `docs/security/073-ca8-ref-dominio.md` (aprovado).

## Veredito
**Aprovado.** A mudança de recorte ou de vocabulário em `ref_dominio` recusa a coleta com só o nome da chave, `natureza_prefixo` não recusa, o reconhecimento de recorte mudado vira releitura que só acrescenta versões, e a primeira coleta depois do deploy é recusada por falta do hash anterior e liberada pelo reconhecimento manual, sem reler. Review e segurança aprovados na ponta 2aedc573 (só pareceres depois de a6363d2c); o código testado é o de a6363d2c.

## Execução (ponta 2aedc573, worktree da branch, 2 workers)
| Comando | Resultado |
|---|---|
| `npx vitest run --maxWorkers=2` (server) | 86 arquivos passam, 4 falham, 37 pulados; 1800 testes passam, 25 falham, 251 pulados |
| `npx eslint .` | rc 0, sem aviso |
| `npx tsc --noEmit` (server) | rc 0 |
| `pnpm run docs:check` | ok (1021 páginas Markdown, 69 métricas, 2 eventos) |

As 25 falhas são só dos 4 arquivos de entrada que lançam tsx em processo filho (`apontamento-entradas`, `ref-sync-ac-entrada`, `ref-sync-businessmap-entrada`, `ref-sync-calendario-entrada`; 12, 3, 5 e 5): `mkdir /tmp/tsx-1000` negado no sandbox. Os 251 pulados são os testes pg, sem banco. Ambos: prova na CI do PR, não são bug. Os testes pg do E3 (`acelerato-ca8-ref-sync.pg.test.ts`, 3 casos) não rodaram aqui.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-8: recorte mudou sem reconhecimento recusa só com o nome da chave, sem abrir conexão | `acelerato-ca8-listas.test.ts` CT-34 (equipe nova; rótulo trocado) | lista nova e rótulo trocado; valor nunca na mensagem | passou |
| CA-8: vocabulário ou `cpe_*` mudou recusa com `vocabulario_sha256` | `acelerato-ca8-listas.test.ts` CT-34 e hash separado | separação recorte x vocabulário | passou |
| Hash estável: ordem de chegada e `ordem` fora; código ou rótulo mudam; lista vazia estável | `acelerato-ca8-listas.test.ts` (3 casos do hash) | vazio, ordem | passou |
| P-E3-1: `natureza_prefixo` não recusa e grava versão de critério | `acelerato-ca8-listas.test.ts` (natureza_prefixo não é chave); pg (versão de critério) | chave fora do hash | passou (unitário); pg, prova na CI |
| P-E3-2: reconhecer recorte mudado relê (varredura sem marca, desde a data mínima, só acrescenta versões, grava hash novo) | `acelerato-ca8-listas.test.ts` P-E3-2 (recorte mudou e reconhecido) | releitura só aditiva | passou |
| Só vocabulário mudou: reconhece sem reler | `acelerato-ca8-listas.test.ts` P-E3-2 | não relê além do necessário | passou |
| Primeira coleta depois do deploy (linha sem as chaves novas): recusa; reconhecimento libera sem reler | `acelerato-ca8-listas.test.ts` (primeira coleta depois do deploy; linha sem `recorte_sha256`) | linha anterior sem hash | passou |
| Recusa sem a opção registra a falha com a tarefa pedida | `acelerato-ca8-listas.test.ts` P-E3-2 (última) | falha sem marca d'água | passou |
| `ac:ref-sync` fecha vigência sem apagar; coleta recusa e, reconhecida, segue | `acelerato-ca8-ref-sync.pg.test.ts` (equipe; prioridade) | histórico preservado | prova na CI |

## Mutação à mão (desfeita, sem commit)
| Mutante | Resultado |
|---|---|
| `coletor.ts`: `modo = 'releitura'` trocado por `modo = modo` (reconhecimento não relê) | 1 falha: "recorte mudou e reconhecido: varredura sem marca..." |
| `controle.ts`: `equipe` fora de `CAMPOS_RECORTE` | 5 falhas (hash de recorte, 2 recusas CT-34, releitura, falha registrada) |

Árvore conferida limpa depois de cada mutação (`git status` sem alteração).

## Achados
- A1 (recomendado) docs/qa/073-ca8-ref-dominio.md:1 · A primeira coleta depois do deploy reconhece sem reler (comportamento testado e igual ao A1 do parecer de segurança); o roteiro da release deve mandar rodar a coleta com releitura e reconhecimento se o recorte mudar. Dono: tech-lead.
