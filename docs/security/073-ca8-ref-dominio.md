---
tipo: revisao-seguranca
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-ca8-ref-dominio
commit: a6363d2cd51fabf2e2fd6233c97cc05f32deaf62
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-06
---
# Review de segurança: listas de ref_dominio no CA-8 do Acelerato (E3, K-224)

Propósito: parecer de segurança do E3 do pedido 073 na ponta `a6363d2c` (`R-SEGURANCA`, E3.6). Público: tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado.** O controle de reconhecimento (CA-8) ficou mais forte: duas chaves novas, só hash, sem valor de lista nem dado de pessoa na recusa e nos logs; a releitura disparada pelo reconhecimento usa o caminho de leitura que já existia (só SELECT no MySQL do Acelerato, só acrescenta versões); o reconhecimento continua manual; nada do BusinessMap entra no hash. Sem achado bloqueante.

Revisão estática de `git diff 8a789d43...a6363d2c` (8 arquivos, +310 -26) contra o desenho `docs/analises/073-e3-desenho.md` §3 e §5 e as decisões do dono P-E3-1 e P-E3-2. Rodados só os testes dos arquivos tocados: `acelerato-ca8-listas.test.ts` e `acelerato-campos-etapa.test.ts` (57 verdes); `acelerato-ca8-ref-sync.pg.test.ts` pulou (sem banco). Os testes pg e os 4 arquivos de entrada que lançam tsx em processo filho (apontamento-entradas, ref-sync-ac-entrada, ref-sync-businessmap-entrada, ref-sync-calendario-entrada; falham no sandbox por `/tmp/tsx-1000`) se provam na CI do PR. Nada contra base real nem API; nenhum `.env` lido.

## Gatilho
Controle de coleta (recusa por mudança de parâmetros, CA-8) e banco (`dspd_ac.ctl_coleta.parametros`, `ref_dominio`), com releitura completa do recorte no Acelerato.

## Avaliação
- **Recusa e logs só com o nome da chave (`server/src/modulos/acelerato/coletor.ts:215`):** `parametros-mudaram` leva em `coluna` só os nomes de `CHAVES_COMPARADAS` (`controle.ts:22`), filtrados por `PADRAO_COLUNA` (`erros.ts:44`) e expostos por `paraLog()` (`erros.ts:62`). O `erro_resumo` gravado é `parametros-mudaram (recorte_sha256)`; o teste `acelerato-ca8-listas.test.ts` confere que o erro serializado não contém rótulo da lista. O log de sucesso (`coletor.ts:184`) não mudou e não leva lista.
- **Só hash em `ctl_coleta.parametros` (`controle.ts:42-61`):** `recorte_sha256` e `vocabulario_sha256` são SHA-256 de `campo|codigo|rotulo` da lista inteira; o valor das listas (equipes, organizações, rótulos) não é gravado em claro. `ref_dominio` não tem dado de pessoa (allow-list do coletor e `acelerato-listas.md`), então o hash também não carrega pessoa.
- **Releitura só leitura e só acréscimo (`coletor.ts:216-222`):** reconhecer com `recorte_sha256` mudado troca `modo` para `releitura` e `tarefa` para `varredura`, o mesmo caminho da releitura semanal: as consultas Q1 a Q7 (`sql.js`) e a sessão MySQL não mudaram; nenhum INSERT/UPDATE/DELETE novo no diff fora de teste; o teste confere que o staging anterior fica igual e só cresce (`acelerato-ca8-listas.test.ts`, caso "recorte mudou e reconhecido"). Falha da releitura vira linha de falha com `tarefa = varredura` e sem sucesso novo: a coleta seguinte volta a recusar (fecha fechado).
- **Reconhecimento manual, fora do agendador:** `reconhecerMudanca` só vem da opção `--reconhecer-mudanca` de `server/src/entradas/coleta.ts:27` (uso manual por `scripts/coleta.sh`); as unidades `deploy/systemd/metricas-coleta-acelerato.service:12` e `metricas-coleta-acelerato-releitura.service:12` não passam a opção, e o diff não as toca.
- **Fontes separadas:** `hashesDasListas` recebe só linhas de `${S.ac}.ref_dominio` (`referencia.ts:28`, `referencia.ts:62`); nenhum import nem esquema do BusinessMap no diff. A consulta dos domínios `cpe_*` segue parametrizada, com o `campo` vindo da constante `CAMPOS_ETAPA_F3`.
- **Retrato único:** os domínios de etapa subiram para antes da comparação (`coletor.ts:206-208`), então o hash é do mesmo retrato que a leitura usa; a leitura nova é só um SELECT no PostgreSQL, antes de qualquer conexão MySQL (o teste confere `conexoes` inalterado na recusa).
- **`natureza_prefixo` fora (P-E3-1):** fica fora dos dois hashes (teste unitário e pg); a mudança segue registrada como versão de critério pelo `ac:ref-sync`.
- **Fora deste item (desenho §5):** o reconhecimento continua liberando também uma edição direta no banco sem `ref_versao_criterio` (R1 de `docs/reviews/056-coletor-f1-f2.md:109`, vale para todas as chaves) e o coletor do BusinessMap não tem CA-8; os dois são anteriores ao E3 e ficam para cartão próprio, a critério do Jarvis.
- **GRANT e LGPD:** sem migração e sem mudança em `grants.ts`; `dspd_api` não ganha acesso.
- **Ferramentas:** `gitleaks`, `osv-scanner` e `semgrep` não estão no PATH desta estação (lacuna registrada); o diff não tem dependência nem segredo novo.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/coletor.ts:216 · Sem `recorte_sha256` na linha anterior (primeira coleta depois do deploy) o reconhecimento não relê; se o `ac:ref-sync` da mesma release mudar o recorte, os chamados antigos da equipe ou organização nova só entram na releitura semanal. Correção mínima: o roteiro da release manda rodar a primeira coleta com `pnpm coleta ac --releitura --reconhecer-mudanca` quando o `ac:ref-sync` da release mudar `tipo_recorte`, `organizacao_recorte` ou `equipe`. Não é vulnerabilidade (completude, sem caminho de ataque). Dono: tech-lead (roteiro da release).

## Riscos aceitos
Nenhum.
