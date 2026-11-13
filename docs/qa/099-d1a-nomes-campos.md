---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1a-nomes-campos
commit: 75c59c1b17f4ed766478e225d42c92f1aa9a9d76
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: D1a, nomes exatos dos campos de etapa do Acelerato

## Achados
- A1 (recomendado) scripts/sql/consultas-098-099/07-B6-a.sql:13 · o IN ainda usa os nomes antigos (sem dois-pontos) e "Qual suporte foi acionado?". Consulta exploratória de leitura, fora do coletor e da lista fechada; não bloqueia. Alinhar quando for usada de novo.

## Escopo
Diff 4c4a7a33..75c59c1b: `listas-fechadas.ts` (três nomes com dois-pontos; `suporte_acionado` sai de `CAMPOS_ETAPA_F3`, 9 para 8 nomes) e 6 arquivos de teste/fixture. Sem `CA-n` de UX; obrigações: desenho `docs/analises/099-saidas-consultas.md` §5 e §7 (D1a-nome-exato e o bloqueio "texto livre não chega à base"). Os `.pg` e a suíte completa ficam com o CI do PR (check-run `bateria` do mesmo sha). A mudança do hash da coleta (`--reconhecer-mudanca`) é ato do dono, não testável aqui. Nada rodou contra base real nem leu `.env*`.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Três nomes com dois-pontos lidos; lista pelo domínio, preenchido só o booleano | `acelerato-campos-etapa.test.ts` "os três nomes com dois-pontos..." | nome exato, sem contador de variante | passa |
| Texto livre "Qual suporte foi acionado?" fora da lista e falha fechado sem o valor | mesmo arquivo, "(TEXT, texto livre)..." | texto livre na fronteira | passa |
| Consultas Q6/Q7 recebem só os nomes novos; `suporte_acionado` não chega ao staging | mesmo arquivo, "as consultas Q6 e Q7..." e `apoio-l9c.test.ts` (6 nomes) | allow-list | passa |
| Constante escrita à mão, 8 nomes, chaves únicas, `campo_dominio` <= 40 | "constante de nomes (A1)" | máximo varchar(40) | passa |
| Variantes de acento, caixa e espaço seguem com contador, agora com dois-pontos | `acelerato-allow-list.test.ts` BUG-087-2 | normalização | passa |
| Fixture de 50 colunas sem marcador proibido no staging | "a fixture completa de 50 colunas" | PII/texto livre | passa |

## Vermelho antes do verde
Cópia do head com `listas-fechadas.ts` da base (4c4a7a33), mesmos 4 arquivos de teste: 45 falham, 60 passam (inclui os 3 testes novos do D1a, a constante, as variantes BUG-087-2 e a fronteira de coleta). Head: `Test Files 4 passed, Tests 105 passed (105)`. Árvore do autor restaurada e limpa.

Mutação: a base é o mutante natural da linha de guarda (nome sem dois-pontos e campo de texto na lista); morreu em 45 testes. Sem ferramenta de mutação adicional rodada.

## Resultado
Aprovado. Suíte completa e `.pg`: CI do PR.
