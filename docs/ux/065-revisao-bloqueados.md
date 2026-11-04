---
pedido: 065-bloqueados-sem-dado-real
branch: feature/065-bloqueados
commit: 205052155dae9ff2e1465841130c197967b3a4d7
etapa: E1.7 (revisão de interface, ux-designer)
veredito: aprovado com ressalvas (nenhum achado crítico; 1 alto, 2 médios, 3 baixos)
---

# Revisão de interface 065: parte Sem dado real em O1, O2, O5 e BLOQUEADOS

Base: `docs/analises/065-desenho.md` (seções 2.5 e 4), heurísticas de Nielsen e WCAG 2.2 AA. Revisão por leitura do código; não houve navegação no navegador nem medição de contraste.

## O que está certo
- BLOQUEADOS usa `EstadoSemDadoReal`: ícone e texto "Sem dado real", motivo em texto, borda tracejada, sem número nem botão "Tentar de novo". Não parece zero nem erro.
- O1 troca o "N deles bloqueados" por "bloqueados: sem dado real", tira a série Bloqueados das barras e da legenda e mantém WIP, limite, dias dentro e série.
- O2 troca o "—" por "Sem dado real" na coluna Bloqueado, tira "anel: bloqueado" da legenda e mantém dispersão, percentis e parados.
- O5 mantém as barras e troca "fila e bloqueio" por "fila" e "bloqueio: sem dado real".
- A nota do contrato (ícone + texto) aparece nos três cartões; a marca não depende de cor.

## Achados

### Alto
- **A1. O5, "Como se calcula" e "O que é" iguais.** `notas.ts:44-46` diz "sem fila nem bloqueio" e "Não-execução = fila + bloqueio". Sem bloqueio coletado, o tempo bloqueado cai em fila ou execução (Q-065-1): o texto afirma o que não acontece e o percentual pode estar inflado. Correção: aguardar o dono em Q-065-1.

### Médio
- **M1. O5, leitura e "Leia" dizem "o restante é fila".** `fluxo.tsx:37,69` afirmam que todo o resto é fila, o que a base real não garante. Correção: "o restante é não-execução (fila; bloqueio sem dado real)" e, se o dono confirmar Q-065-1, a nota dizer que o tempo bloqueado está somado.
- **M2. A nota é a única explicação do motivo e fica em `text-xs`.** `CartaoMetrica.tsx:270` a põe em 12px sob a pergunta, longe do gráfico e da coluna afetada. Correção: manter a nota, mas em `text-sm`, e conferir o contraste de `texto-2` (mínimo 4.5:1) no tema escuro.

### Baixo
- **B1. O1 diz a mesma coisa três vezes.** Nota do topo, frase de leitura e parágrafo `o1-bloqueados-sem-dado` (`CartaoO1.tsx:107-111`). Ruído para leitor de tela. Correção: manter nota e frase de leitura e remover o parágrafo, ou o contrário.
- **B2. O2 repete "Sem dado real" em até 10 linhas.** `CartaoO2.tsx:200`. A tabela fica pesada e o leitor de tela repete o aviso. Correção: título da coluna "Bloqueado (sem dado real)" e células "—", ou manter e aceitar.
- **B3. O motivo é técnico.** "a coleta ainda não grava os bloqueios do quadro" descreve o sistema, não o efeito. Correção sugerida: "os bloqueios do quadro ainda não são coletados, por isso não há número". Sem número de cartão interno, como já está.

## Verificação de acessibilidade
- Informação por ícone + texto, nunca só cor: ok.
- A forma "anel" sai da legenda do O2 junto com o texto "bloqueado": coerente.
- Foco e teclado: nada novo; controles existentes inalterados.
- Contraste: não medido nesta revisão (ver M2).

## Não verificado
- Visual real nos três cartões e a faixa "Pede atenção" (coberta por W5, não vista).
- Tabela alternativa ("Ver como tabela") do O1 e do O2 com a nota.
