import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 098, E4 (decisões 7 a 9 do dono, 2026-11-12): os times do BusinessMap passam do nome provisório "Workflow <id>" ao nome real.
 * Lista fechada `time_id -> nome` (plano 098, §3.2); nome de time ou sistema, nunca de pessoa. Correção (U-1): a vigência nova vale para
 * todo o período coletado (`vigenteEm`), a versão de critério não leva métrica (renomear não muda cálculo) e nada do histórico é
 * sobrescrito: a vigência antiga só ganha `vigente_ate` e a nova entra por INSERT.
 *  - 45 times ficam ativos com o nome novo (os ids 4 a 50, menos o 24 e o 25);
 *  - 24 e 25 (sem card) passam a inativos, com o nome atual; seus workflows 127 e 220 passam a apontar para os times 20 e 10 (decisão 7a);
 *  - os times 1 a 3 já têm nome (0019) e só entram na checagem de slug único.
 * Falha fechada: as validações (em TypeScript, ao montar o SQL, e em SQL, antes do primeiro UPDATE) abortam sem gravar nada, e a
 * mensagem cita só o `time_id`. O slug único (função `slug` do projeto) é conferido só no teste (`nomes-times.test.ts`):
 * o `ddl()` não depende de código vivo que possa mudar depois de a migração aplicada (checksum e `down` seguem estáveis).
 * `down`: como a 0019, só desfaz se nada foi gravado depois; o gatilho de vigência é desligado só dentro da transação.
 */
export const REFERENCIA_VERSAO = '098-E4:nomes-dos-times';
export const REGISTRADO_POR = 'correcao-098-E4';
/** Quem gravou a vigência de partida (0019). */
export const REGISTRADO_POR_CARGA = 'carga-inicial-057-E3';

type NomeNovo = readonly [timeId: number, workflow: string, nome: string];
/** Os 45 times ativos com o nome real: [time_id, workflow, nome]. */
export const NOMES_NOVOS: readonly NomeNovo[] = [
  [4, '267', 'Desenvolvimento PM100'], [5, '255', 'Sistemas Corporativos Adjacentes e Pequenas Melhorias'], [6, '63', 'Protheus'],
  [7, '222', 'Fluxo de Sustentação de Sistemas'], [8, '264', 'Squad Casos de IA'], [9, '245', 'Projeto IFRS16 - Parte II'],
  [10, '221', 'Relatórios e Indicadores - Dir. Financeira'], [11, '269', 'Projeto PMS'], [12, '322', 'Projeto WMS'],
  [13, '249', 'Projeto Faturamento Integrado'], [14, '243', 'Projeto Argus'], [15, '251', 'Projeto Telefonia/TV'],
  [16, '271', 'Projeto Hermes - AICC'], [17, '177', 'Falcon (Escritório de Projetos)'], [18, '192', 'Projeto Fluxo contratos - Fluig'],
  [19, '232', 'Projeto RGC'], [20, '105', '5G BTV'], [21, '188', 'IFRS16'], [22, '65', 'ATO'], [23, '126', 'EXA Books'],
  [26, '191', 'Time de Melhorias / Projetos'], [27, '266', 'Devops'], [28, '212', 'Minha Unifique APP'], [29, '231', 'Novo Bilhetador'],
  [30, '250', 'Athena'], [31, '248', 'Health Check'], [32, '242', 'Nova Central do Assinante'], [33, '246', 'Prometeu (Autenticador)'],
  [34, '223', 'Novo Migrador'], [35, '260', 'API SIP'], [36, '262', 'Sustentação'], [37, '263', 'IFS'], [38, '208', 'Unifique Móvel'],
  [39, '190', 'Plataforma BOSS'], [40, '210', 'MVNX'], [41, '233', 'N3'], [42, '76', 'Analytics'], [43, '199', 'Melhorias'],
  [44, '202', 'DataOps'], [45, '206', 'MLOps'], [46, '324', 'Projeto WebChat'], [47, '326', 'AI Agent Factory'], [48, '205', 'Chatbot'],
  [49, '311', 'Falcon (Marketing e Vendas)'], [50, '328', 'Falcon - IA'],
];
/** Times sem card, unificados em outro (decisão 7a): [time_id, workflow]. Ficam inativos, com o nome atual. */
export const INATIVOS: readonly (readonly [timeId: number, workflow: string])[] = [[24, '127'], [25, '220']];
/** Workflows que passam a apontar para outro time: [workflow, quadro, time_id novo]. */
export const UNIFICADOS: readonly (readonly [workflow: string, quadro: string, timeId: number])[] = [['127', '24', 20], ['220', '24', 10]];
/** Times 1 a 3: nome da 0019, que a migração só confere (entram na checagem de slug único). */
export const JA_NOMEADOS: readonly (readonly [timeId: number, nome: string])[] = [[1, 'Equipe de processos'], [2, 'Arquitetura'], [3, 'Auditoria PwC - ITGC']];

const aspas = (v: string): string => `'${v.replaceAll("'", "''")}'`;

const TODOS: readonly (readonly [number, string])[] = [...NOMES_NOVOS.map((n) => [n[0], n[1]] as const), ...INATIVOS];
const IDS = TODOS.map(([id]) => id).join(',');
const WORKFLOWS_UNIFICADOS = UNIFICADOS.map(([w]) => aspas(w)).join(',');
export const LIMITE_NOME = 80;

/**
 * Validações em TypeScript, antes de montar o SQL; a mensagem cita só o `time_id`. Recebe a lista por parâmetro para o teste
 * provar cada recusa sem tocar na lista real.
 */
export function validarNomes(
  novos: readonly NomeNovo[] = NOMES_NOVOS, inativos: readonly (readonly [number, string])[] = INATIVOS,
  jaNomeados: readonly (readonly [number, string])[] = JA_NOMEADOS,
): void {
  const ids = [...novos.map((n) => n[0]), ...inativos.map((n) => n[0])];
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (repetidos.length > 0) throw new Error(`time_id repetido na lista: ${[...new Set(repetidos)].join(', ')}`);
  if (ids.length !== 47) throw new Error(`a lista fechada tem ${ids.length} times; esperados 47 (ids 4 a 50)`);
  const fora = ids.filter((id) => id < 4 || id > 50);
  if (fora.length > 0) throw new Error(`time_id fora de 4 a 50: ${fora.join(', ')}`);
  for (const [id, , nome] of novos) {
    if (nome.trim() === '') throw new Error(`time ${id}: nome vazio`);
    if (nome !== nome.trim()) throw new Error(`time ${id}: nome com espaço nas pontas`);
    if (nome.length > LIMITE_NOME) throw new Error(`time ${id}: nome com mais de ${LIMITE_NOME} caracteres`);
    if (/\[revisar\]/i.test(nome)) throw new Error(`time ${id}: nome ainda marcado [revisar]`);
    if (/^Workflow \d+$/.test(nome)) throw new Error(`time ${id}: nome continua provisório`);
    if (nome.includes('$')) throw new Error(`time ${id}: nome com cifrão (fecharia o bloco DO)`);
  }
  for (const [id, nome] of jaNomeados) if (nome.includes('$')) throw new Error(`time ${id}: nome com cifrão (fecharia o bloco DO)`);
}

/**
 * Conferência de slug (só o teste chama): nome com letra ou número e slug único entre os 48 ativos. Recebe o `slug` por parâmetro
 * para a migração não depender do `slug.ts` vivo.
 */
export function validarSlugs(
  slug: (nome: string) => string, novos: readonly NomeNovo[] = NOMES_NOVOS,
  jaNomeados: readonly (readonly [number, string])[] = JA_NOMEADOS,
): void {
  for (const [id, , nome] of novos) if (slug(nome) === '') throw new Error(`time ${id}: nome sem letra nem número`);
  const vistos = new Map<string, number>();
  for (const [id, nome] of [...jaNomeados.map(([i, n]) => [i, n] as const), ...novos.map(([i, , n]) => [i, n] as const)]) {
    const s = slug(nome);
    const outro = vistos.get(s);
    if (outro !== undefined) throw new Error(`times ${outro} e ${id}: mesmo slug entre os times ativos`);
    vistos.set(s, id);
  }
}

/** `novos` só existe para o teste provar que o `ddl` valida a lista antes de montar o SQL. */
export const ddl = (S: Esquemas, novos: readonly NomeNovo[] = NOMES_NOVOS): Ddl => {
  validarNomes(novos);
  const rt = `${S.bm}.ref_time`;
  const rw = `${S.bm}.ref_time_workflow`;
  const versao = `(SELECT max(versao_id) FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = ${aspas(REFERENCIA_VERSAO)})`;
  const rastro = `'correcao', ${versao}, ${aspas(REGISTRADO_POR)}`;
  const esperados = [...novos.map((n) => [n[0], n[1]] as const), ...INATIVOS].map(([id, w]) => `(${id}, ${aspas(w)})`).join(', ');
  const jaNomeados = JA_NOMEADOS.map(([id, nome]) => `(${id}, ${aspas(nome)})`).join(', ');
  const linhasNovas = [
    ...novos.map(([id, , nome]) => `(${id}, current_date, ${aspas(nome)}, true, ${rastro})`),
    ...INATIVOS.map(([id, w]) => `(${id}, current_date, ${aspas(`Workflow ${w}`)}, false, ${rastro})`),
  ];
  const linhasWf = UNIFICADOS.map(([w, q, t]) => `(${aspas(w)}, current_date, ${aspas(q)}, ${t}, 'time', NULL, ${rastro})`);
  const gatilhos = (acao: 'DISABLE' | 'ENABLE'): string[] => [rt, rw].map((t) => `ALTER TABLE ${t} ${acao} TRIGGER tg_${t.split('.')[1]}_vigencia`);
  return {
    up: [
      // Falha fechada, antes de qualquer escrita: só `time_id` na mensagem.
      `DO $$ DECLARE ruins text; BEGIN
  SELECT string_agg(v.time_id::text, ', ' ORDER BY v.time_id) INTO ruins
    FROM (VALUES ${esperados}) AS v(time_id, wf)
   WHERE NOT EXISTS (SELECT 1 FROM ${rt} t JOIN ${rw} w ON w.time_id = t.time_id AND w.vigente_ate IS NULL AND w.situacao = 'time' AND w.workflow_id = v.wf
                      WHERE t.time_id = v.time_id AND t.vigente_ate IS NULL AND t.ativo AND t.nome = 'Workflow ' || v.wf);
  IF ruins IS NOT NULL THEN
    RAISE EXCEPTION 'times fora do estado esperado (nome provisório e workflow da lista): %', ruins;
  END IF;
  SELECT string_agg(v.time_id::text, ', ' ORDER BY v.time_id) INTO ruins
    FROM (VALUES ${jaNomeados}) AS v(time_id, nome)
   WHERE NOT EXISTS (SELECT 1 FROM ${rt} t WHERE t.time_id = v.time_id AND t.vigente_ate IS NULL AND t.ativo AND t.nome = v.nome);
  IF ruins IS NOT NULL THEN
    RAISE EXCEPTION 'times 1 a 3 fora do estado esperado: %', ruins;
  END IF;
  SELECT string_agg(t.time_id::text, ', ' ORDER BY t.time_id) INTO ruins FROM ${rt} t WHERE t.vigente_ate IS NULL AND t.ativo AND t.time_id NOT BETWEEN 1 AND 50;
  IF ruins IS NOT NULL THEN
    RAISE EXCEPTION 'times ativos fora de 1 a 50 (a unicidade do nome só foi conferida para a lista): %', ruins;
  END IF;
  IF EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = ${aspas(REFERENCIA_VERSAO)}) THEN
    RAISE EXCEPTION 'a versão de critério ${REFERENCIA_VERSAO} já existe';
  END IF;
END $$`,
      `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
VALUES (current_date, 'businessmap', 'Nomes reais dos times (correção)',
  'Correção do nome provisório dos times (decisões 7 a 9 do pedido 098); renomear não muda cálculo, sem marca nos gráficos.', ${aspas(REFERENCIA_VERSAO)}, now())`,
      `UPDATE ${rt} SET vigente_ate = current_date WHERE vigente_ate IS NULL AND time_id IN (${IDS})`,
      `INSERT INTO ${rt} (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por)
VALUES ${linhasNovas.join(',\n  ')}`,
      `UPDATE ${rw} SET vigente_ate = current_date WHERE vigente_ate IS NULL AND workflow_id IN (${WORKFLOWS_UNIFICADOS})`,
      `INSERT INTO ${rw} (workflow_id, vigente_de, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por)
VALUES ${linhasWf.join(',\n  ')}`,
    ],
    // Só desfaz se nada foi gravado depois (nenhuma vigência de outra origem, nenhuma das minhas fechada, nenhuma da 0019 fechada
    // fora desta lista); o gatilho de vigência é desligado só dentro desta transação, para reabrir e remover as linhas da própria migração.
    down: [
      `DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM ${rt} WHERE registrado_por NOT IN (${aspas(REGISTRADO_POR_CARGA)}, ${aspas(REGISTRADO_POR)})
                OR (registrado_por = ${aspas(REGISTRADO_POR)} AND vigente_ate IS NOT NULL)
                OR (registrado_por = ${aspas(REGISTRADO_POR_CARGA)} AND vigente_ate IS NOT NULL AND time_id NOT IN (${IDS})))
     OR EXISTS (SELECT 1 FROM ${rw} WHERE registrado_por NOT IN (${aspas(REGISTRADO_POR_CARGA)}, ${aspas(REGISTRADO_POR)})
                OR (registrado_por = ${aspas(REGISTRADO_POR)} AND vigente_ate IS NOT NULL)
                OR (registrado_por = ${aspas(REGISTRADO_POR_CARGA)} AND vigente_ate IS NOT NULL AND workflow_id NOT IN (${WORKFLOWS_UNIFICADOS}))) THEN
    RAISE EXCEPTION 'a tabela de times tem vigências posteriores à 0043; desfazer a correção perderia histórico.';
  END IF;
END $$`,
      ...gatilhos('DISABLE'),
      `DELETE FROM ${rt} WHERE registrado_por = ${aspas(REGISTRADO_POR)}`,
      `DELETE FROM ${rw} WHERE registrado_por = ${aspas(REGISTRADO_POR)}`,
      `UPDATE ${rt} SET vigente_ate = NULL WHERE registrado_por = ${aspas(REGISTRADO_POR_CARGA)} AND vigente_ate IS NOT NULL`,
      `UPDATE ${rw} SET vigente_ate = NULL WHERE registrado_por = ${aspas(REGISTRADO_POR_CARGA)} AND vigente_ate IS NOT NULL`,
      ...gatilhos('ENABLE'),
      `DELETE FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = ${aspas(REFERENCIA_VERSAO)}`,
    ],
  };
};
export const { up, down } = migracao(ddl);
