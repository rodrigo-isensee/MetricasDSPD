import type { EventoColeta, ResultadoColeta, TipoErroColeta } from '@metricas-dspd/contratos'

export const ROTULO_RESULTADO: Record<ResultadoColeta, string> = {
  ok: 'ok',
  parcial: 'parcial',
  falha: 'falha',
}

/** Só a categoria do erro: nunca mensagem, SQL, stack ou credencial (CA-15). */
export const ROTULO_TIPO_ERRO: Record<TipoErroColeta, string> = {
  indisponivel: 'Fonte indisponível',
  autenticacao: 'Falha de autenticação',
  'tempo-esgotado': 'Tempo esgotado ao ler a fonte',
  'dados-invalidos': 'Dados recebidos inválidos',
  desconhecido: 'Erro não identificado',
}

export const ROTULO_EFEITO: Record<EventoColeta['efeito'], string> = {
  aplicada: 'Coleta aplicada por inteiro',
  'parcial-aplicada': 'Itens lidos mantidos; o restante fica para a próxima coleta',
  'anteriores-mantidos': 'Painéis continuam com os dados da coleta anterior',
}
