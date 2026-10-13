// Entrada de linha de comando: só liga arquivo, ambiente e pool real à lógica testada (excluída da cobertura).
import { readFileSync } from 'node:fs'
import pg from 'pg'
import { lerArgs } from './args.ts'
import { carregar, descrever, esquemaCoreDe } from './carga.ts'

const url = process.env.PG_PESQUISA_URL
if (!url) {
  console.error('Defina PG_PESQUISA_URL (papel dspd_pesquisa; credencial só no .env).')
  process.exit(2)
}
const pool = new pg.Pool({ connectionString: url, max: 1, options: '-c TimeZone=UTC' })
try {
  const a = lerArgs(process.argv.slice(2))
  const r = await carregar(pool, {
    trimestre: a.trimestre,
    csv: readFileSync(a.arquivo, 'utf8'),
    ...(a.oQueMudou === undefined ? {} : { oQueMudou: readFileSync(a.oQueMudou, 'utf8') }),
    ...(a.substituir === undefined ? {} : { substituir: a.substituir }),
    confirmar: a.confirmar,
    esquemaCore: esquemaCoreDe(process.env.DSPD_SCHEMA_PREFIXO),
  })
  for (const l of descrever(r)) console.log(l)
  process.exitCode = r.status === 'recusada' || r.status === 'ja-existe' ? 1 : 0
} catch (e) {
  // Só a mensagem: nunca o objeto do erro do driver (pode trazer parâmetros) nem o arquivo.
  console.error(e instanceof Error ? e.message : 'erro inesperado')
  process.exitCode = 2
} finally {
  await pool.end()
}
