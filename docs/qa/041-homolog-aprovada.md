---
tipo: qa
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-homolog-aprovada
commit: 89a0bb22cd2f137e3019cdb5df4e215d539e7dff
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---

# QA: homolog-aprovada sem espera paga (E3.3 do pedido 041, K-108, decisão B)

Escopo: `.github/workflows/homolog-aprovada.yml` (alterado), `.github/workflows/homolog-reavalia.yml` (novo) e uma linha em `docs/engineering/fluxo-homologacao.md`, mais os pareceres de devops, review e segurança. Diff `origin/develop...HEAD`: 6 arquivos, nenhum de código de produção ou de teste; sem teste local (brief). Os commits depois de 89a0bb2 (b98a32f, b24bf18, 73a13b0) só mudam pareceres (`git diff --name-only 89a0bb2 HEAD` lista só `docs/reviews/` e `docs/security/`). A prova é a CI do push e a verificação estática abaixo.

## Pareceres de entrada
- devops (72ca360): aprovado.
- review (a411f9f): aprovado, achados A1 a A3 recomendados.
- segurança (a411f9f): aprovado, achados A1 a A3 recomendados.
Nenhum bloqueante aberto.

## CI do head
Run de push de 89a0bb2: 40657147420, concluído com `success`. Jobs: testes success, rapida success, imagem success, build success, seguranca success, openapi success, filtro success, banco success, e2e skipped, perf skipped (desenho: e2e e perf rodam em push de `develop`/`homolog`, não em feature; mesma situação do PR #150). Os runs dos commits seguintes (40658084884, 40659254034, 40661178860) também terminaram em `success`.

## Critério → teste → resultado
| Critério (decisão B e fluxo) | Verificação | Fronteira protegida | Resultado |
|---|---|---|---|
| Sem espera paga: sem `sleep` nem sondagem no `homolog-aprovada` | leitura do diff: o passo chama `aprovacao` uma vez; `sleep` só existe no `homolog-reavalia` (até 60 s, em job de segundos, dentro de `timeout-minutes: 5`) | custo de Actions por release | passou |
| Critério de aprovação inalterado (código da base do PR) | diff: a chamada `node tools/homolog/src/main.ts aprovacao ...` mantém os mesmos argumentos; a guarda da primeira release (`tools/homolog/src/main.ts` ausente = aviso e saída 0) segue | regra vem da base, não do candidato | passou |
| Portão em curso ou não listado falha com mensagem clara e sai 1 | diff: `gh api ... runs?head_sha&event=push`, conta `status != completed`; as duas ramificações emitem `::error::` e `exit 1` | portão ausente, em curso, concluído sem sucesso | passou |
| O fim do portão dispara de novo o check do PR | `homolog-reavalia.yml`: `workflow_run` com `workflows: [Homologação]` (nome idêntico ao `name:` de `homolog.yml`), `completed`, filtro `event == push` e `head_branch == homolog`; acha o PR aberto para `main` com o mesmo head e faz `POST .../rerun` da execução `pull_request` | schedule e PR ficam fora; sem PR aberto ou sem execução, sai 0 | passou (estático) |
| Sem checkout nem código da branch com token de escrita | arquivo sem `actions/checkout`; `permissions` mínimas (`contents: read`, `actions: write`, `pull-requests: read`) | `workflow_run` não roda código de PR | passou (confere com o parecer de segurança) |
| `fluxo-homologacao.md` descreve o desenho | linha nova nas Observações: estado atual do portão, `homolog-reavalia.yml`, custo, só vale com o arquivo na `main`, primeira release com Re-run manual | n/a | passou |
| Decisão B: se não funcionar, a opção A volta ao dono | item pendente 1 abaixo | n/a | pendente (primeira release) |

## Itens pendentes (só se provam na primeira release real)
1. `workflow_run` só dispara do arquivo na branch padrão. Na primeira release, depois do merge do `homolog-reavalia.yml` na `main`, e na release seguinte a ela: abrir o PR `homolog` -> `main` com o portão ainda em curso. Critério de verificação: o check `homolog-aprovada` falha com "Portão ainda não terminou", a execução `Homologação reavalia` aparece no fim do portão com "reexecutada para <sha>" e o check do próprio PR passa a verde sem ação manual. Falhou: volta ao dono a opção A.
2. O `rerun` recusado por execução em andamento deve ser vencido pelas tentativas (6 x 10 s). Verificar no log da execução de reavalia que a tentativa 1 ou posterior passou.
3. Na primeira release o check passa com aviso (regra ainda não está na base) e a conferência é manual, como o fluxo já diz.

## Achados

- A1 (recomendado) .github/workflows/homolog-aprovada.yml:54 · a mensagem final promete reexecução automática também com o portão já vermelho ou em PR `hotfix/*` (ignorado pelo reavalia); texto neutro ou ramo próprio (igual ao A1 do review).
- A2 (recomendado) .github/workflows/homolog-reavalia.yml:35 · o `rerun` recusado vai a `/dev/null` e consome 60 s antes de falhar; registrar a resposta da API no log (igual ao A2 do review).
- A3 (recomendado) docs/qa/041-homolog-aprovada.md:41 · registrar no quadro de leituras que a primeira release real é o teste do desenho B, com os critérios dos itens pendentes 1 e 2 (A3 do review).

## Resultado
Parecer: **aprovado**, sem bug aberto e sem achado bloqueante. Tudo o que a CI e a leitura do diff provam passou; o que depende do arquivo na `main` está nos itens pendentes, com critério de verificação.
