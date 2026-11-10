import { executarApoioL9c } from '../apoio/apoio-l9c.js';
import { carregarConfigAcelerato, comSessaoMysql, ErroColeta, prepararTls } from '../modulos/acelerato/index.js';

// Entrada `pnpm --filter @metricas-dspd/server ac:apoio-l9c`: consultas A e B do L9-c (docs/analises/069-l9c-ordem.md §8), SÓ LEITURA, no MySQL do
// Acelerato, pela mesma conexão e sessão só leitura da coleta (variáveis ACELERATO_MYSQL_*). Imprime só contagens (JSON); nunca valor de campo,
// pessoa, título, descrição nem configuração. Não toca o PostgreSQL. Rodado pelo dono, não pelo time.
try {
  const config = carregarConfigAcelerato();
  const tls = prepararTls(config.tlsSha256, config.tlsCertFile);
  const r = await comSessaoMysql(config, tls, (sessao) => executarApoioL9c(sessao));
  process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
} catch (e) {
  const detalhe = e instanceof ErroColeta ? e.paraLog() : { codigo: 'erro-interno' };
  process.stderr.write(`ac:apoio-l9c falhou: ${JSON.stringify(detalhe)}\n`);
  process.exitCode = 1;
}
