---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k281-consultas-funcoes
commit: 805130049313de3ec987d07b0cafbfa44c6b797c
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: K-281, o comando de consultas de leitura recusa as funções que executam texto como SQL (E3.8)

## O que foi conferido
- Diff `9e76d175..80513004`: dois arquivos, 10 linhas adicionadas e 1 removida (`scripts/consultas-leitura-098-099.sh:90`, `scripts/consultas-leitura-098-099.test.sh:170-178`). Dentro do teto de 150 linhas; um comportamento só.
- Faz o que o A6 de `docs/security/099-k277-consultas-escape.md` pede, nem mais nem menos: as cinco palavras `query_to_xml`, `query_to_xmlschema`, `query_to_xml_and_xmlschema`, `ts_stat` e `ts_rewrite` entram em `PALAVRAS_PROIBIDAS`, comparadas como palavra inteira e sem diferença de caixa pela guarda já existente (`grep -Eiw`). Como `_` é caractere de palavra, `query_to_xml` não cobre as outras duas formas; por isso as três estão listadas, corretamente. Os 31 `.sql` versionados seguem aceitos (o caso do corpus passa).
- Testes: as sondas S13 e S14 do parecer de segurança, uma sonda por função restante, uma em maiúscula e `SELECT U&"x"` sem UESCAPE (A1 do review do K-277). Contra o script da base (`9e76d175`), as seis sondas das funções falham; a de `U&` passa nas duas versões, como esperado: ela trava a guarda do K-277, não muda comportamento.
- Commit `80513004`: Conventional Commits em português, corpo explica o porquê (contorno da recusa de `pg_` por concatenação), trailer `Cartão: K-281`.
- Ferramentas (só as do brief): `bash scripts/consultas-leitura-098-099.test.sh` → `todos os casos passaram` (rc 0); `shellcheck` dos dois arquivos → sem saída (rc 0). Nada contra banco real; nenhum `.env*` aberto; sem `pnpm run pronto` (o CI do PR confirma).
- Mutação manual numa cópia no scratchpad (o caso `gitignore cobre ...` falha em toda cópia por não haver `.gitignore` nela; ignorado), tirando uma palavra por vez da lista:
  - sem `query_to_xml`: morto por S13 e `query_to_xml em maiuscula`.
  - sem `query_to_xmlschema`: morto pela sonda `query_to_xmlschema`.
  - sem `query_to_xml_and_xmlschema`: morto pela sonda `query_to_xml_and_xmlschema`.
  - sem `ts_stat`: morto por S14.
  - sem `ts_rewrite`: morto por `ts_rewrite com consulta`.
  - sem a alternativa `U&|` da guarda do K-277 (sh:104): agora morto por `U& sem UESCAPE`. O A1 do review do K-277 está fechado.

## Achados

## Veredito
Aprovado no head `80513004`. Nenhum achado: a lista cumpre o A6, cada palavra nova tem uma sonda que a mata e o mutante que sobrevivia no K-277 agora morre. PR e merge ficam para outra delegação (E3.8).
