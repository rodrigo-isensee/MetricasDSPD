import { describe, expect, it } from 'vitest';
import { lerDominioBm, analisarDominioBm, listasDoArquivo, motivosDeLinhas } from '../src/modulos/businessmap/dominio-businessmap.js';
import { ErroDominio } from '../src/modulos/referencia/dominio-acelerato.js';

// Lote 3 do pedido 075 (K-204; CA-075-3). Os 7 motivos estão escritos AQUI, não importados do contrato.
const SETE = [
  'Aguardando fornecedor', 'Aguardando validação do negócio', 'Aguardando ambiente ou infraestrutura', 'Dependência de outra demanda',
  'Falta de informação no chamado', 'Janela de mudança', 'Aguardando licença ou contrato',
];
const arquivo = (motivo_bloqueio?: unknown): string => JSON.stringify({
  versao: 1,
  versao_criterio: { dominio: 'businessmap', descricao: 'Teste', motivo: 'Teste', referencia: 'teste' },
  schema: 'dspd_bm', tabela: 'ref_dominio', regra: 'teste', campos: [], ...(motivo_bloqueio === undefined ? {} : { motivo_bloqueio }),
});
const recusa = (m: unknown): string => {
  try { analisarDominioBm(arquivo(m)); } catch (e) { expect(e).toBeInstanceOf(ErroDominio); return (e as Error).message; }
  throw new Error('deveria recusar');
};

describe('bm:ref-sync: domínio motivo_bloqueio (mapa das pessoas, P-075-3)', () => {
  it('o arquivo real nasce com o mapa vazio e carrega zero linhas', () => {
    const lido = lerDominioBm();
    expect(lido.arquivo.motivo_bloqueio).toEqual([]);
    expect(listasDoArquivo(lido.arquivo).motivo_bloqueio).toEqual([]);
  });

  it('aceita os 7 motivos, vários reason_id para o mesmo motivo, e vira a lista motivo_bloqueio', () => {
    const m = [{ codigo: '10', rotulo: SETE[0] }, { codigo: '11', rotulo: SETE[0] }, ...SETE.slice(1).map((rotulo, i) => ({ codigo: String(20 + i), rotulo }))];
    expect(listasDoArquivo(analisarDominioBm(arquivo(m)).arquivo).motivo_bloqueio).toEqual(m);
  });

  it.each([
    ['marcador de pessoa', 'MARCADOR-PESSOA-075'],
    ['com arroba', 'Aguardando fornecedor @fulano'],
    ['fora dos 7', 'Outro motivo qualquer'],
    ['não classificado', 'não classificado'],
  ])('rótulo %s recusa a carga inteira, sem o valor na mensagem', (_n, rotulo) => {
    expect(recusa([{ codigo: '1', rotulo: SETE[0] }, { codigo: '2', rotulo }])).not.toContain(rotulo);
  });

  it.each(['abc', '', '1.5', '12345678901', '-1', '1 '])('código %j não numérico ou longo recusa a carga', (codigo) => {
    recusa([{ codigo, rotulo: SETE[0] }]);
  });

  it('reason_id repetido (inclusive com zeros à esquerda) e chave extra são recusados', () => {
    recusa([{ codigo: '5', rotulo: SETE[0] }, { codigo: '05', rotulo: SETE[1] }]);
    recusa([{ codigo: '5', rotulo: SETE[0], comentario: 'x' }]);
  });

  it('leitura para o projetor: só reason_id numérico e rótulo dos 7; ambíguo e fora do domínio ficam de fora', () => {
    const l = (codigo: string, rotulo = '', campo = 'motivo_bloqueio') => ({ campo, codigo, rotulo });
    const mapa = motivosDeLinhas([
      l('1', SETE[0]!), l('2', 'MARCADOR-PESSOA-075'), l('x', SETE[1]!), l('3', SETE[2]!), l('3', SETE[3]!), l('4', SETE[4]!, 'sistema'),
    ]);
    expect([...mapa]).toEqual([['1', SETE[0]]]);
    expect(motivosDeLinhas([]).size).toBe(0);
  });
});
