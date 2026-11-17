---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k410-roteiro-dono
commit: ed794f06103e7f39cd5470812be98121b22d4bc6
parecer: reprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: roteiro do dono, receita B alinhada à volta da 0041 (K-410; E7.566)

## Escopo lido
Diff `acb62951..ed794f06`: só `docs/devops/105-roteiro-dono.md` (8 linhas a mais, 2 a menos). Não há código, teste nem guarda, então não há mutante a declarar, e o teto M14 não se aplica porque o diff é só texto `.md`.

Conferido contra:
- `server/migrations/0041_bm_ref_tipo_card_habilitador.ts`: o `down` recria o CHECK de seis valores e falha com linha `habilitador`.
- a seção "Reversão da migração 0041" de `docs/devops/105-implantacao-vm.md`, aprovada no K-407 (`origin/docs/105-k407-roteiro-vm`, head 39daacb5, ainda fora da `develop`).

## O que está certo
- Linha 208: "o `down 1` vale para a última migração aplicada". Isso bate com o item 2 do rollback e com o item 4 da seção 2.1 da `105-implantacao-vm.md`.
- Linhas 237 a 241: as afirmações batem com a 0041 e com a seção aprovada no K-407.
  - o nome `0041_bm_ref_tipo_card_habilitador` é o do arquivo;
  - o `down` falha com linha `habilitador`, aberta ou fechada;
  - o SQL de contagem em `dspd_bm.ref_tipo_card` está certo;
  - com contagem maior que 0, a volta é só pela receita A;
  - a proibição de "limpar" o Enabler pelo `bm:ref-sync` está no texto.
- Verificador de documentação: `pnpm run docs:check` rodado neste head, nesta worktree, com rc=0 e `docs:check: ok (1762 páginas Markdown, 70 métricas, 2 eventos)`. O autor não o rodou.
- Suíte: não há PR para esta branch, então a suíte inteira fica para o CI do PR. Este parecer não afirma CI verde.

## Achados
- A1 (bloqueante) docs/devops/105-roteiro-dono.md:247 · No ramo da 0041 (contagem 0), "o segundo `down 1` tira a 0039" e "deve imprimir `0`, `2` e `0039_bm_toque_primeiro`" estão errados: o certo é `1`, `2` e `0040_ac_dim_chamado_escala_p`; detalhe abaixo.
- A2 (recomendado) docs/devops/105-roteiro-dono.md:200 · "A subida aplica três migrações (a lista real da develop)" e a linha 31 omitem a 0041, que a develop já traz; também as linhas 214 e 229 e o título da seção 4.
- A3 (recomendado) docs/devops/105-roteiro-dono.md:263 · "`down 1` só para a 0040 (receita B)" contradiz a receita B nova (última aplicada, 0040 ou 0041).

## Detalhe dos achados
**A1.** O diff abre um ramo novo nas linhas 237 a 241: com contagem 0, "o `down 1` abaixo tira a 0041". O dono então segue para o mesmo `down 1` e a mesma conferência da 0040, e o texto das linhas 247 e 253 está errado para esse ramo:
- "Não repita o comando: o segundo `down 1` tira a 0039": com a 0041 desfeita, o segundo tiraria a 0040.
- "deve imprimir `0`, `2` e `0039_bm_toque_primeiro`": o certo é `1`, `2` e `0040_ac_dim_chamado_escala_p`, porque `escala_p` continua e a última passa a ser a 0040.
- "Com a 0040 desfeita, o S1 não funciona": não vale nesse ramo.
- Falta conferir que o CHECK voltou a seis valores.

Seguindo o roteiro ao pé da letra, o dono vê saída diferente do "deve imprimir" depois de uma volta correta, e o texto não diz o que fazer. Este é o ramo provável: a `develop` já traz a 0041 (`server/migrations/` termina em `0041_bm_ref_tipo_card_habilitador.ts`), então o `db:migrate` do passo 0.2 a aplica.

Sugestão: dar ao ramo da 0041 conferência, "não repita" e efeito próprios.
- A conferência deve imprimir `1`, `2` e `0040_ac_dim_chamado_escala_p`, e `0` em `SELECT count(*) FROM pg_constraint WHERE conname = 'ref_tipo_card_categoria_check' AND pg_get_constraintdef(oid) LIKE '%habilitador%'`.
- O efeito a declarar é no T3: o Enabler sai da categoria `habilitador`.

**A2.** A tabela da seção 4 e a contagem "três" precisam da 0041. Na tabela, a coluna "Se sair por `down`" fica "só o CHECK; falha com linha `habilitador`". A conferência da receita A, na linha 229, precisa do nome da 0041. A frase nova da linha 208, "se a 0041 ainda não estiver aplicada", trata como exceção o que é o caso comum.

## Itens do Entregar
- E7.566 (review do K-410): coberto por este parecer. O commit único da branch (`ed794f06`) é o objeto revisado e não há item sem commit.

## Parecer
**Reprovado** pelo A1. O A2 e o A3 são recomendados e cabem na mesma volta do autor.
