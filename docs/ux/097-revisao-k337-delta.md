# Delta da revisão de UX do K-337 (mapa diário com Setor), E4.133

Revisado em `MetricasDSPD-041b`, branch `feature/097-k337-web`, head 5ab1c63e: `CartaoDiario.tsx`, `textos.ts`, `mapa-diario-setor.test.tsx`, contra os achados A1 a A5 de `docs/ux/097-revisao-k337.md`. Tudo é `lido` (código); não rodei os testes (meu papel não tem shell), então "o teste passa" não está medido por mim.

Veredito: A1 a A5 resolvidos. Os textos saíram como escrevi, palavra por palavra. Sem achado novo que bloqueie.

## Por achado

| Achado | Estado | Evidência |
|---|---|---|
| A1 nota do mapa | Resolvido | `CARTOES.diario.comoLer` traz a frase exata: "O Setor e a Equipe escolhidos na barra recortam este mapa; os demais filtros e o período da barra não o afetam, e a janela dele é a escolhida aqui. O dia atípico é decidido sobre o dia inteiro da pessoa, em qualquer setor ou equipe." O resto do `comoLer` ficou igual. |
| A2 vazio com Setor | Resolvido | `DIARIO_VAZIO` tem `semRecorte`, `comSetor`, `comEquipe`, `comSetorEEquipe`, com os quatro textos da minha tabela. `Diario` escolhe pelo par setor/equipe e mostra um botão por filtro ativo ("Remover filtro Setor", "Remover filtro Equipe"), sem botão genérico. `removerSetor` está em `useDadosAba` (`dados.tsx` linha 27, `ApontamentoPage.tsx` linha 97). |
| A3 dica e nome acessível | Resolvido | `ANOMALIA.dicaRecorte` ("... não só as do setor ou da equipe escolhidos.") aparece com Setor ou Equipe. `doRecorte` monta ", do setor X" / ", dos setores X, Y" antes de ", da equipe Y" e é usado no `aria-label` da grade e na legenda da tabela. Só nomes de setor e equipe, nunca de pessoa. |
| A4 cartão | Resolvido | `aplicaveis={['setor', 'equipe']}` com o comentário corrigido. Sobre o tipo: `FiltroFluxoChave` (contratos) não inclui `'setor'`, mas `CartaoApontamento` aceita `readonly string[]` e faz o cast; não há erro de tipo. `atua()` compara por string, então o Setor vale. |
| A5 testes | Resolvido | `mapa-diario-setor.test.tsx` tem um ou mais testes por A1 a A4: nota, vazio só Setor, vazio combinado, vazio só Equipe (regressão), vazio sem recorte, dica com e sem recorte, nome da grade com Setor, Setor e Equipe, dois setores, sem Setor, e "Filtros aplicados". O vazio não depende da fixture: o teste zera as linhas com `semPessoas`, então a dúvida que deixei sobre `fixture.ts` deixou de importar. |

## Observações (baixas, não bloqueiam)
- B1 (baixo) O teste de "Remover filtro Setor" confirma que a Equipe permanece na URL (`?equipe=portal`), mas não confirma que a janela do mapa permanece, que é a última cláusula do meu critério proposto. Sugestão ao QA: um caso com `?setor=plataformas&mapaDe=...&mapaAte=...` (nomes reais dos parâmetros conforme o código) verificando que só o Setor sai. Se o parâmetro da janela não vive na URL, o critério já está satisfeito por construção.
- B2 (baixo) O teste A1 confere trechos da nota (`toMatch`), não a frase inteira; suficiente para pegar regressão do essencial.

## Em aberto
- A6 (aviso consolidado de setores no Apontamento) segue pergunta ao dono, sem mudança. Minha recomendação continua: manter sem aviso, pois a aba não exibe número por setor nem compara.
- Acessibilidade: a ordem de foco e o rótulo dos botões de remover são `lido` e coerentes com os botões existentes (`alvo`, texto visível que nomeia o filtro). Contraste e leitor de tela não medidos; ficam com o QA (`@axe`).
