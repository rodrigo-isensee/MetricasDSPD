import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Carga inicial da tabela de times (pedido 057 E3, sem a tela; plano 052, F0). Fonte: respostas do dono de 2026-10-30
 * (H-6 (ii) "C", H-7, H-21 = A, H-22 = A e a lista do 057 E3). Dado de configuração, não dado do BusinessMap: vem do plano.
 * Vigência de partida = início da carga inicial (hoje menos 12 meses), definição que vale para todo o período coletado
 * (como a correção da U-1); a versão de critério de partida não leva métrica, então não gera marca nos gráficos (T2.6).
 * Mudança depois disso nasce na tela do 057 como nova vigência com `processo` ou `correcao`.
 * Os 47 demais times saem com o nome provisório "Workflow <id>": o nome real vem do workflow lido na F2 e entra por
 * `correcao` (nunca nome de pessoa).
 */
export const REFERENCIA_VERSAO = 'plano-052-F0:carga-inicial-times';
export const REGISTRADO_POR = 'carga-inicial-057-E3';

type Fora = 'fora_de_todo_calculo' | 'fora_do_operacional';
/** [workflow_id, quadro_id] */
type Wf = readonly [string, string];

/** Times próprios (H-6 (ii) "C"): [workflow, quadro, nome do time]. */
export const TIMES_PROPRIOS: readonly (readonly [string, string, string])[] = [
  ['224', '24', 'Equipe de processos'],
  ['265', '23', 'Arquitetura'],
  ['229', '23', 'Auditoria PwC - ITGC'],
];
/** Fora de todo cálculo (H-7). */
export const FORA_DE_TODO_CALCULO: readonly Wf[] = [['257', '25'], ['201', '31'], ['321', '79'], ['215', '35'], ['216', '35'], ['196', '25']];
/** Fora do painel operacional (057 E3 e H-22 = A para o 323). */
export const FORA_DO_OPERACIONAL: readonly Wf[] = [
  ['200', '23'], ['207', '24'], ['198', '31'], ['313', '79'], ['203', '23'], ['234', '23'], ['323', '79'],
];
/** Demais workflows de time (`type=0`), um time cada (H-21 = A). */
export const DEMAIS_TIMES: readonly Wf[] = [
  ...['267', '255', '63', '222', '264', '245', '221', '269', '322'].map((w): Wf => [w, '23']),
  ...['249', '243', '251', '271', '177', '192', '232', '105', '188', '65', '126', '127', '220'].map((w): Wf => [w, '24']),
  ...['191', '266', '212', '231', '250', '248', '242', '246', '223', '260', '262', '263'].map((w): Wf => [w, '25']),
  ...['208', '190', '210', '233'].map((w): Wf => [w, '27']),
  ...['76', '199', '202', '206', '324', '326', '205'].map((w): Wf => [w, '31']),
  ...['311', '328'].map((w): Wf => [w, '79']),
];

type LinhaTime = { id: number; nome: string; workflow: string; quadro: string };
export const TIMES: readonly LinhaTime[] = [
  ...TIMES_PROPRIOS.map(([workflow, quadro, nome], i) => ({ id: i + 1, nome, workflow, quadro })),
  ...DEMAIS_TIMES.map(([workflow, quadro], i) => ({ id: TIMES_PROPRIOS.length + i + 1, nome: `Workflow ${workflow}`, workflow, quadro })),
];

const aspas = (v: string): string => `'${v.replaceAll("'", "''")}'`;

export const ddl = (S: Esquemas): Ddl => {
  const versao = `(SELECT max(versao_id) FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = ${aspas(REFERENCIA_VERSAO)})`;
  const desde = `(SELECT vigente_desde FROM ${S.core}.ref_versao_criterio WHERE versao_id = ${versao})`;
  const rastro = `'carga_inicial', ${versao}, ${aspas(REGISTRADO_POR)}`;
  const linhasTime = TIMES.map((t) => `(${t.id}, ${desde}, ${aspas(t.nome)}, true, ${rastro})`);
  const linhasWf = [
    ...TIMES.map((t) => `(${aspas(t.workflow)}, ${desde}, ${aspas(t.quadro)}, ${t.id}, 'time', NULL, ${rastro})`),
    ...([['fora_de_todo_calculo', FORA_DE_TODO_CALCULO], ['fora_do_operacional', FORA_DO_OPERACIONAL]] as [Fora, readonly Wf[]][]).flatMap(([m, lista]) =>
      lista.map(([w, q]) => `(${aspas(w)}, ${desde}, ${aspas(q)}, NULL, 'fora', '${m}', ${rastro})`)),
  ];
  const tabelas = [`${S.bm}.ref_time_workflow`, `${S.bm}.ref_time`];
  return {
    up: [
      `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
VALUES ((current_date - interval '12 months')::date, 'businessmap', 'Tabela de times: carga inicial (definição de partida)',
  'Definição de partida do período coletado (12 meses); não é mudança de critério, sem marca nos gráficos.', ${aspas(REFERENCIA_VERSAO)}, now())`,
      `INSERT INTO ${S.bm}.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por)
VALUES ${linhasTime.join(',\n  ')}`,
      `INSERT INTO ${S.bm}.ref_time_workflow (workflow_id, vigente_de, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por)
VALUES ${linhasWf.join(',\n  ')}`,
    ],
    // Só desfaz a carga se nada mais foi escrito depois dela (nada de histórico se perde); o gatilho de vigência é desligado
    // só dentro desta transação, para remover as linhas da própria carga.
    down: [
      `DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM ${S.bm}.ref_time WHERE motivo <> 'carga_inicial' OR vigente_ate IS NOT NULL)
     OR EXISTS (SELECT 1 FROM ${S.bm}.ref_time_workflow WHERE motivo <> 'carga_inicial' OR vigente_ate IS NOT NULL) THEN
    RAISE EXCEPTION 'a tabela de times tem vigências posteriores à carga inicial; desfazer a carga perderia histórico.';
  END IF;
END $$`,
      ...tabelas.map((t) => `ALTER TABLE ${t} DISABLE TRIGGER tg_${t.split('.')[1]}_vigencia`),
      ...tabelas.map((t) => `DELETE FROM ${t} WHERE registrado_por = ${aspas(REGISTRADO_POR)}`),
      ...tabelas.map((t) => `ALTER TABLE ${t} ENABLE TRIGGER tg_${t.split('.')[1]}_vigencia`),
      `DELETE FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = ${aspas(REFERENCIA_VERSAO)}`,
    ],
  };
};
export const { up, down } = migracao(ddl);
