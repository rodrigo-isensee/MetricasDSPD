Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: f61570400a45a86917e5f0ee30eaaf4b0a2e7ebc
Etapa: review   Cobre: E1.4

## Objetivo
Code review do lote L7-a do 069 (carregador de calendário e feriados) renovado por delta depois do update-branch do PR 222 com a develop (L9-a, L9-b e os pareceres da release 068), na ponta 95dab5d4f6e32d02e781c44e3efe03f599c06da0 (pedido 069, E1.4, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7-calendario`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d show 95dab5d4f6e32d02e781c44e3efe03f599c06da0 --stat` e `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...95dab5d4f6e32d02e781c44e3efe03f599c06da0` (o lote contra a develop atual; só o merge da develop é novo, o lote foi revisto nos pareceres 069-z8-l7a; conferir em especial a ADR 0027, que o L7-a muda e que a develop também trouxe).

## Entregar
- "E1.4 (tech-lead): code review por lote." (E1.4)
- (E5) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario`; revisar o lote contra o desenho, o tamanho frente ao teto de PR e os testes; parecer em `docs/reviews/069-zz1-l7a.md`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7-calendario`; sem PR.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): é a decisão que este lote implementa
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 03:42: Merge do PR 222 parado pelo forge-check depois do update-branch: o tech-lead reescreveu o corpo do PR 222 com os pareceres z8 (teto: excedido, 911 linhas), rodou o gh pr update-branch (ponta 95dab5d4f6e32d02e781c44e3efe03f599c06da0) e o forge-check pr passou a dar os pareceres 069-z9-l9b de review e QA (vindos da develop, os mais recentes do pedido) desatualizados por docs/architecture/adr/0027-calendario-por-dominio.md, que o L7-a muda; não mesclado. DECISÃO DO DONO (2026-11-05): "Quando for assim coloque mais agentes tech lead rodar para entregar rápido" (resposta ao relato de carga baixa). DECISÃO TÉCNICA (Jarvis): review e QA do L7-a renovados por delta, em paralelo, na ponta 95dab5d (só o merge da develop é novo), pareceres no nome 069-zz1-l7a.md para ficarem por último na ordem; depois o merge do PR 222 sem novo update-branch; em paralelo, outro tech-lead abre o PR de release da homolog para a main (068 E1.5).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `branch: feature/069-l7-calendario`, `commit: 95dab5d4f6e32d02e781c44e3efe03f599c06da0`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052d add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/069-l7-calendario:docs/reviews/069-zz1-l7a.md` · espera: contém 'commit: 95dab5d4f6e32d02e781c44e3efe03f599c06da0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).