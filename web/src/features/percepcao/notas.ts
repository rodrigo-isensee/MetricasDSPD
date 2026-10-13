import type { TextoNota } from '@/components/ui'

/** Nota metodológica da PV1 (pesquisa trimestral de percepção). Decisões 22 a 31 do alinhamento de 11/10. */
export const NOTA_PV1: TextoNota = {
  oQueE:
    'Como os gestores das áreas atendidas percebem o serviço da sustentação, em uma pesquisa trimestral com cinco perguntas fechadas e escala de cinco pontos.',
  comoSeCalcula:
    'A pesquisa roda fora do app e o painel recebe só contagens por trimestre, área, pergunta e faixa da escala. Nada é calculado aqui: o resultado já chega decidido. "Concordam" soma as faixas 4 e 5 e é só o que a tendência mostra: o lado que discorda fica na distribuição.',
  comoLer:
    'Leia a distribuição inteira, pergunta a pergunta, ao lado de S1 e S2, sem cruzar os números. A fonte é a pesquisa, não o Acelerato. O bloco "O que mudou" mostra o retorno dado após o ciclo anterior.',
  meta: 'Sem meta de satisfação nem de participação: uma meta induziria respostas.',
  cuidados:
    'Sem média, nota única, ranking ou semáforo. Abaixo de 5 respostas no consolidado e de 3 por área nada é publicado; abaixo de 20 só aparece "k de n", sem percentual. O recorte por área começa no segundo ciclo, e áreas pequenas são somadas em "Outras áreas". Comentário livre nunca entra no painel. Mudança de pergunta ou escala quebra a série.',
}
