export { carregarConfigAcelerato, carregarConfigColetaAcelerato, VARIAVEIS_ACELERATO, type ConfigAcelerato } from './config.js';
export { coletarAcelerato, type DepsColeta, type LogColeta, type ModoColeta, type ResultadoColeta } from './coletor.js';
export { ErroColeta, type CodigoErro } from './erros.js';
export { prepararTls } from './tls.js';
export { projetarAcelerato, type ResultadoProjecao } from './projetor.js';
export { agregadosDoPainel, dentroDaTolerancia, esquemaDash, reconciliar, resumir, type Agregados, type LinhaComparacao } from './reconciliacao.js';
export { comSessaoMysql, type SessaoMysql } from './cliente-mysql.js';
export { NOMES_ETAPA_LISTA } from './listas-fechadas.js';
export { expandir } from './sql.js';
