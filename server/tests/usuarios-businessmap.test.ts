import { describe, expect, it } from 'vitest';
import { PRAZO_RELEITURA_DIAS, projetarUsuarios, resolverResponsaveis } from '../src/modulos/businessmap/usuarios.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { ErroBusinessMap } from '../src/plataforma/http.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// F3 do plano 052, Q-8 = B: nome do responsável por /users, projetado só em user_id e realname (A4 da segurança da F1).
const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');
const DIA = 86_400_000;

describe('projetarUsuarios (A4): a resposta de /users é cortada em user_id e realname antes de qualquer uso', () => {
  it('descarta attributes, e-mail, nome de usuário e qualquer outro campo, item por item', () => {
    const corpo = { data: [{ user_id: 5, realname: 'NOME-MARCADOR', email: 'pessoa@exemplo.com', username: 'usuario-marcador', attributes: { x: 'ATTR-MARCADOR' }, avatar: 'a.png' }] };
    const r = projetarUsuarios(corpo);
    expect(r).toEqual([{ id: '5', nome: 'NOME-MARCADOR' }]);
    expect(Object.keys(r[0]!).sort()).toEqual(['id', 'nome']);
    expect(JSON.stringify(r)).not.toMatch(/pessoa@exemplo|usuario-marcador|ATTR-MARCADOR|avatar/);
  });

  it('id em texto numérico vale; id inválido, nome vazio, nome longo e item que não é objeto são ignorados; controles saem do nome', () => {
    const corpo = {
      data: [
        { user_id: '8', realname: '  Nome\n\tcom\u0000controle  ' }, { user_id: -1, realname: 'a' }, { user_id: 1.5, realname: 'a' }, { user_id: 'abc', realname: 'a' },
        { user_id: 3, realname: '   ' }, { user_id: 4, realname: 'x'.repeat(201) }, { user_id: 6 }, { user_id: null, realname: 'a' }, 'texto', null, { user_id: 9, realname: 'x'.repeat(200) },
      ],
    };
    expect(projetarUsuarios(corpo)).toEqual([{ id: '8', nome: 'Nome com controle' }, { id: '9', nome: 'x'.repeat(200) }]);
  });

  it('corpo fora do formato esperado dá lista vazia', () => {
    expect(projetarUsuarios(null)).toEqual([]);
    expect(projetarUsuarios({ data: 'x' })).toEqual([]);
  });
});

type Get = (caminho: string, o?: { consulta?: Readonly<Record<string, string | number>> }) => Promise<unknown>;
const clienteCom = (resposta: (consulta: Readonly<Record<string, string | number>>) => unknown) => {
  const pedidos: { caminho: string; consulta: Readonly<Record<string, string | number>> }[] = [];
  const get: Get = (caminho, o) => {
    pedidos.push({ caminho, consulta: o?.consulta ?? {} });
    try {
      return Promise.resolve(resposta(o?.consulta ?? {}));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  return { cliente: { get } as never, pedidos };
};
const bancoCom = (frescos: string[] = []) =>
  criarDublePg((c: Chamada) => (c.texto.includes('FROM dspd_bm.dim_responsavel WHERE') ? frescos.map((responsavel_id) => ({ responsavel_id })) : []));
const upserts = (cs: Chamada[]): Chamada[] => cs.filter((c) => c.texto.startsWith('INSERT INTO dspd_bm.dim_responsavel'));

describe('resolverResponsaveis (DT-2): pede só o que falta ou passou de 30 dias; UPSERT com a data da leitura', () => {
  it('prazo de releitura é de 30 dias', () => {
    expect(PRAZO_RELEITURA_DIAS).toBe(30);
  });

  it('id com linha de menos de 30 dias não é pedido; o limite enviado ao banco é agora menos 30 dias', async () => {
    const db = bancoCom(['5']);
    const { cliente, pedidos } = clienteCom(() => ({ data: [{ user_id: 6, realname: 'Seis' }] }));
    const r = await resolverResponsaveis(db.pool, cliente, ['5', '6'], AGORA, S);
    expect(pedidos).toHaveLength(1);
    expect(pedidos[0]!.consulta).toEqual({ fields: 'user_id,realname', user_ids: '6' });
    expect(r).toEqual({ pedidos: 1, resolvidos: 1, naoResolvidos: 0, falha: null });
    const consultaLinhas = db.chamadas.find((c) => c.texto.includes('FROM dspd_bm.dim_responsavel WHERE'))!;
    expect(consultaLinhas.valores).toEqual([['5', '6'], new Date(AGORA.getTime() - 30 * DIA)]);
    expect(consultaLinhas.texto).toContain('atualizado_em >= $2');
  });

  it('com mais de 30 dias a linha não vem do banco como fresca: o id é pedido de novo e o nome e a data são atualizados (UPSERT)', async () => {
    const db = bancoCom([]);
    const { cliente, pedidos } = clienteCom(() => ({ data: [{ user_id: 5, realname: 'Novo nome' }] }));
    await resolverResponsaveis(db.pool, cliente, ['5'], AGORA, S);
    expect(pedidos).toHaveLength(1);
    const u = upserts(db.chamadas);
    expect(u).toHaveLength(1);
    expect(u[0]!.texto).toContain('ON CONFLICT ON CONSTRAINT dim_responsavel_pkey DO NOTHING');
    expect(u[0]!.valores).toEqual([['5'], ['Novo nome'], AGORA]);
    const atualiza = db.chamadas.filter((c) => c.texto.startsWith('UPDATE dspd_bm.dim_responsavel'));
    expect(atualiza).toHaveLength(1);
    expect(atualiza[0]!.valores).toEqual([['5'], ['Novo nome'], AGORA]);
    expect(atualiza[0]!.texto).toContain('SET responsavel_nome = u.nome, atualizado_em = $3');
  });

  it('id pedido e não devolvido: nenhuma escrita para ele (a linha fica como está) e a contagem sai sem o id', async () => {
    const db = bancoCom();
    const { cliente } = clienteCom(() => ({ data: [{ user_id: 5, realname: 'Cinco' }] }));
    const r = await resolverResponsaveis(db.pool, cliente, ['5', '6'], AGORA, S);
    expect(r).toEqual({ pedidos: 2, resolvidos: 1, naoResolvidos: 1, falha: null });
    expect(upserts(db.chamadas)[0]!.valores[0]).toEqual(['5']);
    expect(db.chamadas.filter((c) => /^DELETE/.test(c.texto))).toEqual([]);
    expect(db.chamadas.filter((c) => /^UPDATE/.test(c.texto)).map((c) => c.valores[0])).toEqual([['5']]);
    expect(JSON.stringify(r)).not.toContain('6');
  });

  it('resposta nenhuma útil: nada é escrito; id devolvido a mais e repetido não entra duas vezes', async () => {
    const vazio = bancoCom();
    expect(await resolverResponsaveis(vazio.pool, clienteCom(() => ({ data: [] })).cliente, ['5'], AGORA, S)).toMatchObject({ resolvidos: 0, naoResolvidos: 1 });
    expect(upserts(vazio.chamadas)).toEqual([]);
    const db = bancoCom();
    const { cliente } = clienteCom(() => ({ data: [{ user_id: 5, realname: 'A' }, { user_id: 5, realname: 'B' }, { user_id: 99, realname: 'Intruso' }] }));
    const r = await resolverResponsaveis(db.pool, cliente, ['5'], AGORA, S);
    expect(r.resolvidos).toBe(1);
    expect(upserts(db.chamadas)[0]!.valores).toEqual([['5'], ['B'], AGORA]);
  });

  it('muitos ids: chamadas em lotes de até 200 dentro da lista fechada; ids fora do formato nem são pedidos', async () => {
    const ids = Array.from({ length: 450 }, (_, i) => String(i + 1));
    const db = bancoCom();
    const { cliente, pedidos } = clienteCom((q) => ({ data: String(q.user_ids).split(',').map((i) => ({ user_id: Number(i), realname: `U${i}` })) }));
    const r = await resolverResponsaveis(db.pool, cliente, [...ids, 'abc', '1; DROP', ''], AGORA, S);
    expect(pedidos.map((p) => String(p.consulta.user_ids).split(',').length)).toEqual([200, 200, 50]);
    expect(r).toEqual({ pedidos: 450, resolvidos: 450, naoResolvidos: 0, falha: null });
  });

  it('sem ids: nem consulta o banco nem chama /users', async () => {
    const db = bancoCom();
    const { cliente, pedidos } = clienteCom(() => ({ data: [] }));
    expect(await resolverResponsaveis(db.pool, cliente, [], AGORA, S)).toEqual({ pedidos: 0, resolvidos: 0, naoResolvidos: 0, falha: null });
    expect(pedidos).toEqual([]);
    expect(db.chamadas).toEqual([]);
  });

  it('erro de /users devolve só o código e interrompe a etapa (os ids ficam para a próxima); erro que não é do cliente sobe', async () => {
    const db = bancoCom();
    const falha = clienteCom(() => { throw new ErroBusinessMap('indisponivel', 'GET /users: HTTP 503'); });
    expect(await resolverResponsaveis(db.pool, falha.cliente, ['5', '6'], AGORA, S)).toEqual({ pedidos: 2, resolvidos: 0, naoResolvidos: 0, falha: 'indisponivel' });
    expect(upserts(db.chamadas)).toEqual([]);
    const bug = clienteCom(() => { throw new Error('bug'); });
    await expect(resolverResponsaveis(db.pool, bug.cliente, ['5'], AGORA, S)).rejects.toThrow('bug');
  });
});
