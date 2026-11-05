Agente destino: forge:tech-lead
Pedido: 073-melhorias-tecnicas-2026-11-05
Tipo: codigo
Branch: docs/073-pareceres-faltantes   Base: develop   Base-sha: 8a789d43dd6227255e7f686728bcaaaaa1ed1797
Etapa: codigo   Cobre: E7.1

## Objetivo
Levar à develop os pareceres que ficaram só nas branches antigas e que a limpeza não pode apagar sem perder registro: os de QA e segurança 069-zz2-l7a (feature/069-l7-calendario) e a revalidação de QA e review do back do 011 (feature/011-metricas-tambem-back) (pedido 073, E7.1, item E7, K-230). Branch nova docs/073-pareceres-faltantes a partir da develop 8a789d43, na worktree `/home/rodrigoisensee/MetricasDSPD-052d`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show --stat 57932784 d8d08c71` (pareceres 069-zz2-l7a) e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show --stat 21fca162 97fe4921 4d0539e8` (revalidação 011-back).
- O relatório da E1.4 do pedido 072 no Histórico de `docs/pedidos/072-limpar-branches.md` (o que falta na develop e por quê).

## Entregar
- "E7.1 (tech-lead): montar a branch de documentação com os pareceres que só existem nas branches antigas (069-zz2-l7a e a revalidação do 011-back), sem mudar o texto deles; o PR para a develop é passo seguinte, depois do review." (E7.1)
- (E7) (E7.1) `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c docs/073-pareceres-faltantes 8a789d43dd6227255e7f686728bcaaaaa1ed1797` (a worktree está na docs/070-adr-0028-vigente, já mesclada no PR 234; se tiver mudança local, pare e relate); trazer só os arquivos de parecer desses commits (`git -C /home/rodrigoisensee/MetricasDSPD-052d checkout <commit> -- <arquivo>` por arquivo: docs/qa/069-zz2-l7a.md de 57932784 e docs/security/069-zz2-l7a.md de d8d08c71, arquivos novos na develop; docs/qa/011-back.md de 21fca162 e docs/reviews/011-back.md de 4d0539e8, que substituem as versões anteriores da develop, como decide o Histórico do pedido), sem mudar o texto deles; `pnpm run docs:check`; um commit só com esses arquivos, `git -C /home/rodrigoisensee/MetricasDSPD-052d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-230' -- <arquivos>` (sem heredoc e sem pipe), citando na mensagem os commits de origem; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/073-pareceres-faltantes`; sem PR nesta delegação (o PR vem depois do review, como decide o Histórico do pedido).
- (E1, E2, E3, E4, E5, E6, E8) Nada a entregar aqui: não nesta delegação (outros itens do pedido).

## Decisões e restrições (o pedido não tem linha DECISÃO DO DONO; valem as DECISÕES TÉCNICAS abaixo, e para o E7 vale a segunda)
### ADRs citadas no pedido
- ADR 0028 (citada no pedido): só como molde de cabeçalho da proposta da ADR 0023 (E2); nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/073-melhorias-tecnicas-2026-11-05.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:08: pedido aberto (Jarvis) a partir dos cartões K-224 a K-230. DECISÃO TÉCNICA (Jarvis): começa pela triagem do Dependabot (E1, security-engineer, só leitura) e pelo estado da ADR 0023 (E2, software-architect, sem commit), que não dependem de nada; os itens de código entram um por vez, depois da triagem; o dono é avisado no resumo, sem recibo, por ser melhoria técnica (autonomia dada pelo dono).
- 2026-11-05 19:43: DECISÃO TÉCNICA (Jarvis): E7.1 em dois passos: nesta delegação o tech-lead monta a branch docs/073-pareceres-faltantes e envia; o PR vem depois do review dela. Os dois arquivos do 011 já existem na develop em versão anterior (de f9fc3cd3, 2026-10-16); a revalidação de 2026-10-16 os substitui: docs/qa/011-back.md vem de 21fca162 e docs/reviews/011-back.md vem de 4d0539e8; os do 069 (069-zz2-l7a) são arquivos novos.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Os pareceres são copiados como estão: nenhuma linha muda (o hook barra editar parecer alheio).
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, outros pareceres, as branches de origem, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E3.2 (tech-lead): review e PR por item." · etapa de outra delegação; continua no pedido
- "E1.1 (security-engineer): triagem dos alertas abertos do Dependabot, só leitura, parecer em docs/security/." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): proposta do texto de estado da ADR 0023, sem commit." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): implementação por item, com review, QA e segurança quando houver gatilho." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por item." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): análise só leitura do format:check do server (por que ficou de fora e o custo de cobrir), sem commit, antes de qualquer mudança no E5." · etapa de outra delegação; continua no pedido
- Apagar as branches de origem: fica com a limpeza do pedido 072, pelo dono, depois do merge.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin docs/073-pareceres-faltantes` · espera: contém 'refs/heads/docs/073-pareceres-faltantes'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only 8a789d43dd6227255e7f686728bcaaaaa1ed1797 origin/docs/073-pareceres-faltantes` · espera: linhas=4

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
