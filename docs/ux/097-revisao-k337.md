# Revisão de UX do K-337 (web): filtro Setor na aba Apontamento (E4.121)

Revisado na worktree `MetricasDSPD-041b`, branch `feature/097-k337-web`: `BarraFiltrosApontamento.tsx`, `filtros.ts`, `textos.ts`, `filtro-setor.test.tsx`, e, por causa da decisão do dono, `CartaoDiario.tsx`. Contra `docs/ux/097-filtros-time-busca.md` (E7, CA-39 a CA-48, Q-7) e a decisão do dono de 2026-11-14 16:28 ("A": o Setor também recorta o mapa diário, como a Equipe no K-286). `docs/ux/097-equipe-em-todas-as-telas.md` não existe na worktree; a regra da Equipe no mapa saiu de `textos.ts` e `CartaoDiario.tsx`. Acessibilidade abaixo é `lido` (código), nada `medido`.

Veredito: a barra e o estado na URL estão corretos. **A tela ainda trata só a Equipe como recorte do mapa diário**: com Setor ativo, os textos do mapa ficam errados (A1 a A4, altos). Aprovado só depois dessas correções de texto e de teste.

## O que está certo
- Ordem na barra: Período, Setor, Equipe, ... (do mais amplo ao mais estreito, como a especificação). Só aparece com `opcoes.setores`; lista vazia mostra o filtro sem opções.
- Estado só em slugs na URL, valor fora do formato descartado e avisado sem eco; chip "Setor: X" com "Remover filtro Setor: X"; "Limpar filtros" remove o Setor. Sem sobrenome de responsável: o rótulo vem da resposta, não do nome bruto do quadro. O fallback sem `setores` mostra o próprio slug (aceitável, sem pessoa).
- Nenhuma comparação entre setores: o teste "nada de pessoa nem comparação" cobre o recorte sem bloco por setor. Nenhum ranking, nenhuma coluna de pessoa nova.

## Achados

### A1 (alto) Nota do mapa diário diz que só a Equipe recorta
`textos.ts`, `CARTOES.diario.comoLer`: "A Equipe escolhida na barra recorta este mapa; os demais filtros e o período da barra não o afetam ... O dia atípico é decidido sobre o dia inteiro da pessoa, em qualquer equipe." Com a decisão do dono, a frase passa a mentir: quem escolhe Setor acha que o mapa não mudou ou que o recorte é só de equipe. Correção (substituir a frase inteira):

> O Setor e a Equipe escolhidos na barra recortam este mapa; os demais filtros e o período da barra não o afetam, e a janela dele é a escolhida aqui. O dia atípico é decidido sobre o dia inteiro da pessoa, em qualquer setor ou equipe.

O resto do `comoLer` não muda. O texto fica correto com um só dos dois filtros ativos.

### A2 (alto) Mensagem de mapa vazio ignora o Setor
`CartaoDiario.tsx` linha 282 escolhe `DIARIO_VAZIO.comEquipe` só quando há Equipe; com Setor ativo cai em `semEquipe` ("Nenhum apontamento nesta janela. Troque as datas do mapa."), sem dizer que há recorte e sem saída. Não há botão "Remover filtro Setor". Correção em `DIARIO_VAZIO` (e a chave `semEquipe` passa a `semRecorte`):

| Situação | Texto |
|---|---|
| Sem Setor nem Equipe | Nenhum apontamento nesta janela. Troque as datas do mapa. (igual ao atual) |
| Só Setor | Nenhum apontamento do setor escolhido nesta janela. Troque as datas do mapa ou remova o filtro Setor. |
| Só Equipe | Nenhum apontamento da equipe escolhida nesta janela. Troque as datas do mapa ou remova o filtro Equipe. (igual ao atual) |
| Setor e Equipe | Nenhum apontamento do setor e da equipe escolhidos nesta janela. Troque as datas do mapa ou remova os filtros Setor e Equipe. |

Botões abaixo da frase, um por filtro ativo, com o mesmo estilo do atual: "Remover filtro Setor" e "Remover filtro Equipe" (no caso combinado, os dois botões; nada de "Remover filtros" genérico, para nomear o que será afetado). Expor `setores` e `removerSetor` em `useDadosAba`, como já existe para equipe (`dados.tsx` linhas 22-24; `ApontamentoPage.tsx` linhas 94-95).

### A3 (alto) Dica do possível erro e nome acessível do mapa não citam o Setor
- `ANOMALIA.dicaRecorteEquipe` ("O dia é avaliado com todas as horas da pessoa, não só as da equipe escolhida.") só aparece com Equipe. Com Setor ativo o mesmo esclarecimento é necessário. Texto novo, mostrado com Setor ou Equipe (renomear a constante para `dicaRecorte`): "O dia é avaliado com todas as horas da pessoa, não só as do setor ou da equipe escolhidos."
- `daEquipe` (aria-label do mapa e legenda da tabela) acrescenta ", da equipe X". Com Setor: ", do setor X" (plural ", dos setores X, Y"), antes da equipe quando ambos: "Horas apontadas por pessoa e dia, do setor Plataformas, da equipe Portal, de 01/11/2026 a 30/11/2026". Só nomes de setor e de equipe, nunca de pessoa.

### A4 (alto) Cartão do mapa não marca o Setor como filtro aplicável
`CartaoDiario.tsx` linha 360: `aplicaveis={['equipe']}` e o comentário "os demais filtros não o afetam". O cartão usa essa lista para dizer quais filtros valem nele; com o Setor fora da lista, o cartão sinaliza que o Setor não o afeta, o oposto da decisão. Correção: `aplicaveis={['setor', 'equipe']}` e ajustar o comentário. Conferir que `FiltroFluxoChave` aceita `'setor'` (não verifiquei o tipo; se não aceitar, ampliar o tipo).

### A5 (médio) Falta teste do que a decisão do dono mudou
`filtro-setor.test.tsx` cobre barra, URL, chips e fonte fictícia, mas nenhum teste exercita o mapa com Setor: nota, vazio, botão de remover, dica de atípico, nome acessível. O `mapa-diario-equipe.test.tsx` existente é o modelo. Pedir ao QA/front um teste por A1 a A4, citando os CA correspondentes quando o K-337 os receber. Observação: `fixture.ts` (linha 565) filtra o resumo por Setor; confirmar que a fonte fictícia também encolhe o mapa, senão o vazio com Setor não é demonstrável.

### A6 (baixo) Aviso consolidado com 2 ou mais setores no Apontamento
A especificação E7 pede "Resultado consolidado de N setores. O sistema não compara setores." na multiseleção; a barra do Apontamento não mostra esse aviso (a Equipe também não, hoje). Não é regressão do K-337. Decisão de produto fica em aberto: recomendo manter sem aviso no Apontamento, pois a aba não exibe números por setor nem compara; a pergunta é do dono se quiser o aviso igual ao do Resumo.

## Não deve mudar
- O mapa continua sem filtros além de Setor e Equipe, com janela própria.
- O atípico continua decidido sobre o dia inteiro da pessoa.
- Nenhum recorte por Setor exibe número, série ou linha por setor.

## Critérios de aceite propostos para o ajuste (EARS)
- QUANDO o Setor está ativo O SISTEMA DEVE listar o Setor entre os filtros que valem para o mapa diário e exibir na nota "O Setor e a Equipe escolhidos na barra recortam este mapa".
- SE o mapa fica sem pessoas com Setor ativo ENTÃO O SISTEMA DEVE exibir "Nenhum apontamento do setor escolhido nesta janela. Troque as datas do mapa ou remova o filtro Setor." e o botão "Remover filtro Setor".
- QUANDO o mapa tem dia atípico e Setor ou Equipe está ativo O SISTEMA DEVE exibir "O dia é avaliado com todas as horas da pessoa, não só as do setor ou da equipe escolhidos."
- QUANDO o botão "Remover filtro Setor" é acionado O SISTEMA DEVE retirar só o Setor da URL, mantendo a Equipe e a janela do mapa.
