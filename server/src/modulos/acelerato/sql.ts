import { createHash } from 'node:crypto';

/**
 * Consultas constantes da leitura do MySQL (ADR 0023, itens 4, 5 e 6). Texto versionado em
 * `docs/architecture/fontes/acelerato-mysql.sql` (um teste compara os dois). Valores (marca d'água, chave da página,
 * listas do recorte, chaves da página) vão SÓ por placeholder em instrução preparada; `<lista>` é expandido para
 * `?, ?, ?` pela quantidade, nunca por texto. As 11 colunas barradas nunca aparecem aqui; nunca `*`; nunca uma coluna
 * `json` inteira (só por caminho de `JSON_TABLE` ou por nome exato).
 */
export type Lista = 'tipos' | 'organizacoes' | 'equipes' | 'chaves' | 'nomes' | 'ids';

/** Q1: uma página de chamados do recorte. Ordem e página por chave composta, sem `OFFSET`. */
export const Q1_CHAMADOS = [
  'SELECT ticket_key, tipo_ticket_key, tipo_ticket, status_key, status, encerrado,',
  '       categoria_key, categoria, organizacao_key, organizacao, equipe_key, equipe,',
  '       (agente_key IS NOT NULL) AS com_agente,',
  '       prioridade, data_criacao, data_atualizacao, data_pronto, lixeira, arquivado,',
  '       suspenso, impedido, tempo_vida_dias, tempo_ciclico_dias,',
  '       sla_pa_tempo_min, sla_pa_saldo_min, sla_pa_prazo_min, sla_pa_violado, sla_pa_status,',
  '       sla_r_saldo_min, sla_r_prazo_min, sla_r_violado, sla_r_status,',
  '       data_primeiro_comentario, primeiro_comentario_min_uteis,',
  '       sincronizado_em, estatisticas_em',
  'FROM ACELERATO_CHAMADOS',
  'WHERE tipo_ticket_key IN (<tipos>) AND organizacao_key IN (<organizacoes>) AND equipe_key IN (<equipes>)',
  '  AND data_atualizacao >= ?',
  '  AND (data_atualizacao > ? OR (data_atualizacao = ? AND ticket_key > ?))',
  'ORDER BY data_atualizacao, ticket_key',
  'LIMIT 1000',
].join('\n');

/** Q2: etapas dos chamados da página (só `workflow.etapas[]`, cinco chaves; `impedimentos` não sai do MySQL). */
export const Q2_ETAPAS = [
  'SELECT c.ticket_key, e.etapa_key, e.descricao, e.descricao_workflow, e.tempo_sla, e.quantidade_vezes',
  'FROM ACELERATO_CHAMADOS c,',
  "     JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (",
  "       etapa_key BIGINT PATH '$.etapaKey', descricao VARCHAR(255) PATH '$.descricao',",
  "       descricao_workflow VARCHAR(255) PATH '$.descricaoWorkflow',",
  "       tempo_sla BIGINT PATH '$.tempoSla', quantidade_vezes INT PATH '$.quantidadeDeVezes')) e",
  'WHERE c.ticket_key IN (<chaves>)',
].join('\n');

/** Q3: campos personalizados por nome EXATO (nome fora da lista não sai do MySQL); `valor` limitado a 80 caracteres. */
export const Q3_CAMPOS = [
  'SELECT c.ticket_key, f.nome, f.valor',
  'FROM ACELERATO_CHAMADOS c,',
  "     JSON_TABLE(c.campos_personalizados, '$[*]' COLUMNS (",
  "       nome VARCHAR(255) PATH '$.nomeCampo', valor VARCHAR(80) PATH '$.valor')) f",
  'WHERE c.ticket_key IN (<chaves>) AND f.nome IN (<nomes>)',
].join('\n');

/** Contagem dos chamados SSSC das equipes fora das organizações do recorte (A2 do review). Só um número. */
export const Q4_FORA_ORGANIZACOES = [
  'SELECT COUNT(*) AS n FROM ACELERATO_CHAMADOS',
  'WHERE tipo_ticket_key IN (<tipos>) AND equipe_key IN (<equipes>) AND organizacao_key NOT IN (<organizacoes>)',
].join('\n');

/** Saída do recorte (releitura semanal): ids já conhecidos e não vistos, só por chave, as 3 chaves do recorte, lixeira e data. */
export const Q5_SAIDA = [
  'SELECT ticket_key, tipo_ticket_key, organizacao_key, equipe_key, lixeira, data_atualizacao',
  'FROM ACELERATO_CHAMADOS',
  'WHERE ticket_key IN (<ids>)',
].join('\n');

export const CONSULTAS = [Q1_CHAMADOS, Q2_ETAPAS, Q3_CAMPOS, Q4_FORA_ORGANIZACOES, Q5_SAIDA] as const;

/** Instruções de controle da sessão (sem parâmetro; o protocolo preparado não aceita transação). Conjunto fechado. */
export const CONTROLE = {
  somenteLeituraSessao: 'SET SESSION TRANSACTION READ ONLY',
  iniciarSomenteLeitura: 'START TRANSACTION READ ONLY',
  desfazer: 'ROLLBACK',
} as const;
/** Com o teto em ms como placeholder (instrução preparada). */
export const SET_TETO = 'SET SESSION max_execution_time = ?';

export const TAMANHO_PAGINA = 1000;
/** Menor data aceita pelo MySQL: a primeira carga lê o recorte inteiro. */
export const DATA_MINIMA = '1000-01-01 00:00:00';

export const sha256Texto = (texto: string): string => createHash('sha256').update(texto, 'utf8').digest('hex');

/** SHA-256 do SQL versionado: as consultas, nesta ordem, separadas por linha em branco. */
export const textoVersionado = (): string => CONSULTAS.join('\n\n');
export const sqlSha256 = (): string => sha256Texto(textoVersionado());

/** Expande `<lista>` em `?, ?, ?` (quantidade, nunca valor). Lista vazia é recusada: `IN ()` não é SQL e esconderia um recorte vazio. */
export function expandir(modelo: string, tamanhos: Partial<Record<Lista, number>>): string {
  return modelo.replace(/<(tipos|organizacoes|equipes|chaves|nomes|ids)>/g, (_t, nome: Lista) => {
    const n = tamanhos[nome];
    if (n === undefined || !Number.isInteger(n) || n < 1 || n > 5000) throw new RangeError(`lista ${nome}: tamanho inválido`);
    return Array.from({ length: n }, () => '?').join(', ');
  });
}
