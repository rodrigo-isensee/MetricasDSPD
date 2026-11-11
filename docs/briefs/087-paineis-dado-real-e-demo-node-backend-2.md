Agente destino: forge:node-backend
Pedido: 087-paineis-dado-real-e-demo
Tipo: codigo
Branch: feature/087-bug2-campo-etapa   Base: develop   Base-sha: 6b43d980aa18eecaf94e190dc37b2fa22459057d
Etapa: codigo   Cobre: E4.6

## Objetivo
BUG-087-2 (pedido 087, E4.6): na primeira execução da demo pelo dono, a carga do Acelerato parou com `{"codigo":"dados-invalidos","entidade":"campo_etapa","coluna":"nome"}`. Causa provável (não confirmada contra o MySQL): a Q6 e a Q7 de `server/src/modulos/acelerato/sql.ts` filtram `f.nome IN (...)` pela collation da conexão (ignora maiúscula, acento e espaço no fim), e `server/src/modulos/acelerato/allow-list.ts` (esquemaEtapaLista e esquemaEtapaPreenchido) valida `nome` com `z.enum` exato contra `CAMPOS_ETAPA_F3` de `listas-fechadas.ts`. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/087-bug2-campo-etapa` (já criada sobre a develop 6b43d980aa18eecaf94e190dc37b2fa22459057d).

## Ler
- `server/src/modulos/acelerato/allow-list.ts` (esquemas da Q6 e da Q7 e `camposEtapa`), `server/src/modulos/acelerato/listas-fechadas.ts` (`CAMPOS_ETAPA_F3`) e `server/src/modulos/acelerato/sql.ts` (Q6 e Q7), na worktree.
- `server/tests/acelerato-allow-list.test.ts`, como modelo de teste.

## Entregar
- "E4.6 (node-backend): correção do BUG-087-2 (primeira execução da demo pelo dono: a carga do Acelerato para com dados-invalidos em campo_etapa.nome)" (E4.6)
- (E4) (E4.6) Antes da validação do `nome` na Q6 e na Q7, levar o nome recebido ao nome canônico de `CAMPOS_ETAPA_F3` por comparação normalizada (Unicode NFD sem as marcas combinantes, sem diferença de maiúscula, de acento e de espaço no fim), somando `nome_variante_<chave>` nos Contadores quando a grafia diferir; nome que não casa com nenhum continua falhando fechado (`dados-invalidos`), sem o valor. Não mexer na Q6, na Q7 nem nos nomes da lista fechada. Testes: um para cada variante (acento, maiúscula, espaço no fim) na `lista` e no `preenchido`, um que mantém a falha fechada para nome desconhecido e um que confirma o contador. Vermelho antes do verde no teste da variante. Um commit só, com `Cartão: K-258` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos caminhos), e push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/087-bug2-campo-etapa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: server/src/modulos/acelerato/allow-list.ts, server/tests/acelerato-allow-list.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 087-paineis-dado-real-e-demo até b5c57ee36c8f03763459cab88c730903fa7e12a4d83ac61503fa8c866e69f5ce (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/087-paineis-dado-real-e-demo.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): release pelo pedido 078." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): lote 6b;" · etapa de outra delegação; continua no pedido
- "E2.2 (react-frontend): lote 9a;" · etapa de outra delegação; continua no pedido
- "E2.3 (node-backend): lote 9b; com review, QA e segurança por lote, pelo plano do 075." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): K-215." · etapa de outra delegação; continua no pedido
- "E3.2 (node-backend): K-244." · etapa de outra delegação; continua no pedido
- "E3.3 (software-architect): K-213, leitura só do código, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): review de cada branch" · etapa de outra delegação; continua no pedido
- "E3.5 (qa-engineer): QA de cada branch" · etapa de outra delegação; continua no pedido
- "E3.6 (tech-lead): PR de cada branch" · etapa de outra delegação; continua no pedido
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E4.7 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E4.8 (qa-engineer): QA;" · etapa de outra delegação; continua no pedido
- "E4.9 (security-engineer): parecer (coletor do Acelerato, gatilho de segurança);" · etapa de outra delegação; continua no pedido
- "E4.10 (devops-engineer): aviso na documentação da demo e no exemplo de configuração sobre a troca dos nomes ACELERATO_MYSQL_PORTA/BANCO/USUARIO/SENHA para _PORT/_DATABASE/_USER/_PASSWORD;" · etapa de outra delegação; continua no pedido
- "E4.11 (tech-lead): PR e, com o dono, a release da correção." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052g`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log --oneline 6b43d980aa18eecaf94e190dc37b2fa22459057d..origin/feature/087-bug2-campo-etapa` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
