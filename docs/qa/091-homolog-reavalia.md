---
tipo: qa
contrato: 1
pedido: 091-homolog-reavalia-nova-tentativa
branch: fix/k263-reavalia-espera
commit: d1693a72b467afaf6f74fcc97618481efd16565d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: homolog-aprovada com nova tentativa do portão (pedido 091, K-263)

Propósito: parecer de QA do check `homolog-aprovada` que espera o portão recém-concluído antes de falhar. Público: tech-lead e usuário.

Escopo: diff `6e42dfb8..d1693a72` (`tools/homolog/src/aprovacao.ts`, `aprovacao.test.ts`, parecer de devops). Sem especificação de UX nem contrato de API: as obrigações são as do pedido 091 (E1). A suíte inteira vai ao CI do PR; aqui só `tools/homolog`.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Falha transitória vira verde | `falha transitória que vira verde na segunda consulta passa, esperando uma vez` | uma espera de 10 s, depois aprova | passou |
| Portão vermelho ou ausente segue vermelho após as tentativas | `portão vermelho falha só depois de esgotar as tentativas` (4 consultas, 3 esperas) | máximo de tentativas | passou |
| Portão verde de primeira não espera | `portão verde na primeira consulta não espera` | zero esperas | passou |
| Espera total de ~60 s em produção | `o padrão de produção espera ~60 s no total e dorme de verdade` | 6 x 10 s | passou |
| Outras falhas não esperam | `outras falhas (origem errada, candidato fora da ponta) não esperam` | só "portão sem sucesso" espera | passou |

## Execução
- `tools/homolog`, `TZ=UTC npx vitest run --maxWorkers=2` (R-TETO): 6 arquivos, 78 testes, todos verdes.
- Mutação 1 (nova tentativa removida, `i < espera.tentativas` virou `i < 0`): 2 testes caem (falha transitória; vermelho após tentativas). Restaurado.
- Mutação 2 (portão não verde aceito, `if (!portao)` virou `if (false)`): 6 testes caem, entre eles os de portão ausente, de outro SHA e vermelho. Restaurado; árvore limpa depois (`git status` vazio).
- Vermelho antes do verde: as duas mutações reproduzem o código sem a implementação (sem nova tentativa, sem a recusa) e os testes novos caem; o `forge-testes --vermelho` não foi rodado.

## Bugs
Nenhum.
