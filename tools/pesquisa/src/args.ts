import { parseArgs } from 'node:util'

export interface ArgsCarga {
  trimestre: string
  arquivo: string
  oQueMudou?: string
  substituir?: string
  confirmar: boolean
}

export const USO =
  'Uso: pnpm --filter @metricas-dspd/pesquisa carregar --trimestre 2026-T3 --arquivo percepcao.csv [--o-que-mudou texto.txt] [--substituir 2026-T3] [--confirmar]'

/** Argumentos da linha de comando; erro de uso vira `Error` com a mensagem de uso (sem conteúdo de arquivo). */
export function lerArgs(argv: string[]): ArgsCarga {
  let v
  try {
    v = parseArgs({
      args: argv,
      strict: true,
      options: {
        trimestre: { type: 'string' },
        arquivo: { type: 'string' },
        'o-que-mudou': { type: 'string' },
        substituir: { type: 'string' },
        confirmar: { type: 'boolean', default: false },
      },
    }).values
  } catch {
    throw new Error(USO)
  }
  if (v.trimestre === undefined || v.arquivo === undefined) throw new Error(USO)
  return {
    trimestre: v.trimestre,
    arquivo: v.arquivo,
    ...(v['o-que-mudou'] === undefined ? {} : { oQueMudou: v['o-que-mudou'] }),
    ...(v.substituir === undefined ? {} : { substituir: v.substituir }),
    confirmar: v.confirmar,
  }
}
