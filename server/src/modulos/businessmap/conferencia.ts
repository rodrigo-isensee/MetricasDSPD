import { readFileSync } from 'node:fs';
import { z } from 'zod';

// Arquivo versionado de conferência do BusinessMap (plano 052, F0): exceções de papel de coluna (H-8 a H-11) e mapa de
// tipos (H-2, H-17), aceitos pelo dono. É lido pelo `ref:sync` (F2) e valida aqui, antes de qualquer gravação:
// arquivo sem versão de critério é recusado (mudança de critério sempre tem data e marca, T2.6). Sem dado de pessoa.

export const ARQUIVO_CONFERENCIA = new URL('../../../../docs/architecture/fontes/businessmap-conferencia.json', import.meta.url);

export const CATEGORIAS = ['bug_interno', 'defeito_producao', 'requisicao', 'divida_tecnica', 'melhoria', 'produto'] as const;
const id = z.string().regex(/^\d{1,12}$/);
const unicos = <T>(lista: readonly T[], chave: (x: T) => string): boolean => new Set(lista.map(chave)).size === lista.length;
const coluna = z.object({ workflow_id: id, coluna_id: id, nome: z.string().min(1).max(80), papel: z.enum(['fila', 'execucao']), base: z.string().min(1) }).strict();
const colunaDescartado = z.object({ workflow_id: id, coluna_id: id }).strict();
// Exceção de papel (pergunta 2 do dono, 2026-10-31): a folha de seção 4 conta como trabalho; o tipo segue o flow_type. `nome` é só rótulo.
const colunaTrabalho = z
  .object({ workflow_id: id, coluna_id: id, nome: z.string().min(1).max(80).optional(), papel: z.literal('trabalho'), base: z.string().min(1) })
  .strict();
const tipo = z
  .object({ nome: z.string().min(1).max(80), eh_item: z.boolean(), categoria: z.enum(CATEGORIAS).nullable() })
  .strict()
  .refine((t) => t.eh_item === (t.categoria !== null), 'item tem categoria; não item não tem');

export const esquemaConferencia = z
  .object({
    versao: z.literal(1),
    versao_criterio: z
      .object({
        dominio: z.literal('businessmap'),
        descricao: z.string().min(1).max(300),
        motivo: z.string().min(1).max(500),
        referencia: z.string().min(1).max(200),
      })
      .strict(),
    excecoes_papel_coluna: z.array(coluna).refine((l) => unicos(l, (c) => c.coluna_id), 'coluna repetida'),
    excecoes_papel_trabalho: z.array(colunaTrabalho).refine((l) => unicos(l, (c) => c.coluna_id), 'coluna repetida').default([]),
    excecoes_compromisso: z.array(colunaDescartado),
    excecoes_entrega: z.array(colunaDescartado),
    colunas_descartado: z.array(colunaDescartado).refine((l) => unicos(l, (c) => c.coluna_id), 'coluna repetida'),
    mapa_tipos: z
      .object({
        padrao: z.object({ eh_item: z.literal(true), categoria: z.literal('produto') }).strict(),
        tipos: z.array(tipo).refine((l) => unicos(l, (t) => t.nome.toLowerCase()), 'tipo repetido'),
      })
      .strict(),
    notas: z.array(z.string()),
  })
  .strict();

export type Conferencia = z.output<typeof esquemaConferencia>;

export class ErroConferencia extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroConferencia';
  }
}

/** Valida o texto do arquivo. A mensagem cita só o caminho do campo (nunca o valor). */
export function analisarConferencia(texto: string): Conferencia {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroConferencia('arquivo de conferência não é JSON');
  }
  const semVersao = typeof bruto === 'object' && bruto !== null && !('versao_criterio' in bruto);
  if (semVersao) throw new ErroConferencia('arquivo de conferência sem versão de critério (versao_criterio): recusado');
  const r = esquemaConferencia.safeParse(bruto);
  if (!r.success) {
    const campos = [...new Set(r.error.issues.map((i) => i.path.join('.') || '(raiz)'))];
    throw new ErroConferencia(`arquivo de conferência inválido (campos: ${campos.join(', ')})`);
  }
  return r.data;
}

export const lerConferencia = (arquivo: URL | string = ARQUIVO_CONFERENCIA): Conferencia => analisarConferencia(readFileSync(arquivo, 'utf8'));
