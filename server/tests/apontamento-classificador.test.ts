import { FLAGS_QUALIDADE } from '@metricas-dspd/contratos';
import { classificarApontamento, flagsDaMascara, MASCARA_FLAG, type DicionarioApontamento } from '@metricas-dspd/metricas/coletor';
import { describe, expect, it } from 'vitest';
import { classificadorDoDicionario, conferirClassificacao, FLAGS, MASCARA_DA_CLASSIFICACAO } from '../src/modulos/businessmap/apontamento/index.js';
import { classificar as classificarRegistro } from '../src/modulos/businessmap/apontamento/registro.js';
import { flagsDaMascara as flagsDaRota } from '../src/modulos/apontamento/servico.js';

// Pedido 059, B4: a interface local de `classificarApontamento` da trilha A foi trocada pela função real da biblioteca. Os bits das flags têm de bater
// (coletor grava, rota lê), e a saída da função tem de passar na conferência da fronteira do coletor.
const DICIONARIO: DicionarioApontamento = {
  versao: 'v1',
  termos: [{ prioridade: 1, subgrupo: 'desenvolvimento', termos: ['desenvolv', 'implement'] }],
  regrasPorTipo: [],
};

describe('bits das flags: coletor (servidor), biblioteca e rota', () => {
  it('FLAGS do servidor = MASCARA_FLAG da biblioteca = 1 << índice em FLAGS_QUALIDADE do contrato', () => {
    FLAGS_QUALIDADE.forEach((f, i) => {
      expect(MASCARA_FLAG[f], f).toBe(1 << i);
    });
    expect(FLAGS).toEqual({ SEM_COMENTARIO: 1, GENERICO: 2, SEM_VINCULO: 4, SEM_INICIATIVA: 8, VALOR_ATIPICO: 16 });
    expect(MASCARA_DA_CLASSIFICACAO).toBe(7);
  });
  it('a rota decodifica a máscara como a biblioteca: bits 1, 2 e 4 viram flags, os da projeção (8 e 16) ficam de fora', () => {
    for (let m = 0; m <= 31; m++) expect(flagsDaRota(m), String(m)).toEqual(flagsDaMascara(m & MASCARA_DA_CLASSIFICACAO));
  });
});

describe('classificadorDoDicionario', () => {
  const classificar = classificadorDoDicionario(DICIONARIO);
  it('liga a função real ao dicionário vigente e devolve só lista fechada e inteiros', () => {
    const comentario = 'Desenvolvimento da tela de apontamento com validação';
    const s = classificar({ comentario, typeId: null, categoriaId: null });
    expect(s).toEqual(classificarApontamento({ comentario, typeId: null }, DICIONARIO));
    expect(s.subgrupo).toBe('desenvolvimento');
    expect(s.versaoDicionario).toBe('v1');
    expect(conferirClassificacao(s)).toEqual(s);
  });
  it('sem comentário: não classificado, com as flags sem-comentario e sem-vinculo na máscara (o vínculo só falta aqui, pedido 089) (genérico só vale para comentário escrito)', () => {
    const s = classificar({ comentario: null, typeId: null, categoriaId: null });
    expect(s.subgrupo).toBe('nao-classificado');
    expect(s.flags).toBe(FLAGS.SEM_COMENTARIO | FLAGS.SEM_VINCULO);
    expect(conferirClassificacao(s)).not.toBeNull();
  });
  it('pedido 089 (D2): comentário escrito que o dicionário não reconhece é execução técnica e NÃO liga sem-vinculo; só o sem comentário liga', () => {
    const s = classificar({ comentario: 'ajuste combinado com a equipe ontem à tarde', typeId: null, categoriaId: null });
    expect(s.subgrupo).toBe('execucao-tecnica');
    expect(s.flags & FLAGS.SEM_VINCULO).toBe(0);
    expect(s.flags).toBe(0);
    expect(conferirClassificacao(s)).toEqual(s);
    const vazio = classificar({ comentario: '', typeId: null, categoriaId: null });
    expect(vazio.flags & FLAGS.SEM_VINCULO).toBe(FLAGS.SEM_VINCULO);
  });
  it('pedido 089: a releitura com a máscara nova muda o registro_sha256 (versão nova na staging, a antiga fica) e o bit 4 é o único que sai da classificação', () => {
    const linha = {
      logged_time_id: '1', card_id: '2', parent_card_id: null, subtask_id: null, lane_id: null, column_id: null, category_id: null,
      data_apontamento: '2026-10-20', segundos: 3600, registrado_em: null,
    };
    const nova = classificar({ comentario: 'ajuste combinado com a equipe ontem à tarde', typeId: null, categoriaId: null });
    const antiga = { ...nova, flags: nova.flags | FLAGS.SEM_VINCULO }; // o que a regra anterior gravava para execução técnica
    expect(classificarRegistro(linha, nova).registro_sha256).not.toBe(classificarRegistro(linha, antiga).registro_sha256);
    expect(classificarRegistro(linha, nova).registro_sha256).toBe(classificarRegistro(linha, { ...nova }).registro_sha256);
    // os bits 8 e 16 não saem da classificação (o UPDATE do fato os preserva; ver apontamento-sql.test.ts)
    expect(nova.flags & (FLAGS.SEM_INICIATIVA | FLAGS.VALOR_ATIPICO)).toBe(0);
  });
  it('o comentário não aparece na saída serializada', () => {
    const s = classificar({ comentario: 'PESSOA-FICTICIA-MARCADOR-059 refatorou o módulo de cobrança', typeId: null, categoriaId: null });
    expect(JSON.stringify(s)).not.toContain('MARCADOR');
    expect(JSON.stringify(s)).not.toContain('cobrança');
  });
});
