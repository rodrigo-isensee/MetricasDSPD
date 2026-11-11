## Objetivo
O dono respondeu ao roteiro de campos (Histórico de 14:57 do pedido 099): quase tudo já existe nas ferramentas e não pede campo novo. Revisar o roteiro e o plano com as respostas e preparar o que ele pediu para aprovar.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/099-nenhuma-metrica-simulada.md`, a linha de 14:57 (as seis respostas literais).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-campos-para-configurar.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md`.
- Na develop (`/home/rodrigoisensee/Metricas/MetricasDSPD-demo`): `docs/architecture/fontes/businessmap-dominio.json`, `docs/architecture/fontes/acelerato-listas.md` e o que a coleta do BusinessMap já guarda de tags, prioridade/criticidade, deadline, campos personalizados do card pai (Diretoria, Gerência) e do workflow do Acelerato.

## Entregar
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." (E2.2) Nesta delegação, a revisão do plano com as respostas do dono.
- (E1) (E2) (E2.2) Escrever `docs/analises/099-revisao-campos.md` (novo), pela ferramenta Write, no repositório principal: (a) por cartão (O8, O12, O14, O16, O24, S9), de onde vem o dado agora e o que muda no plano e nos lotes; (b) as consultas só de leitura para o dono rodar (só contagens e nomes, nenhuma coluna de pessoa), para: as tags existentes nos cards dos quadros das equipes (para mapear classe de serviço), o campo nativo de criticidade/prioridade e os seus valores, os campos Diretoria e Gerência do card de projeto pai e o seu preenchimento, e o desenho do workflow do Acelerato (etapas e a ordem); (c) a proposta da ordem das etapas do Acelerato a partir do que já está na base ou na documentação, para o dono só aprovar; (d) a proposta de mapeamento tag para classe, se der para fazer pela documentação, ou o que a consulta precisa trazer; (e) os campos do Acelerato da parte 2 (Motivo de Encerramento, Motivo da Escalação, Prioridade ajustada, Avaliação de Problema, Motivo de Pendência): para cada um, se já existe algo equivalente nas listas conhecidas, com opções para o dono, uma pergunta por campo; (f) a responsabilidade do atraso do O12 com o deadline nativo: opções e recomendação. Sem ler a base real nem `.env`. Sem commit.
- (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/099-revisao-campos.md

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-revisao-campos.md` · espera: existe e traz as consultas só de leitura
