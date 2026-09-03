const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validar, garantirValido, PessoaInvalidaError } = require('./pessoaFisica');

function formatarData(data) {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(data.getUTCDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function dataHaAnos(anos, diasExtras = 0) {
  const hoje = new Date();
  const data = new Date(Date.UTC(hoje.getUTCFullYear() - anos, hoje.getUTCMonth(), hoje.getUTCDate()));
  data.setUTCDate(data.getUTCDate() + diasExtras);
  return formatarData(data);
}

function pessoaValida() {
  return {
    nome: 'Maria Souza',
    cpf: '111.444.777-35',
    email: 'maria@exemplo.com',
    data_nascimento: dataHaAnos(30),
    possui_cnh: false,
  };
}

test('caminho feliz: pessoa com todos os dados corretos nao gera erros', () => {
  assert.deepStrictEqual(validar(pessoaValida()), []);
});

test('borda nome: duas palavras de 2 letras e valido, uma com 1 letra e invalido', () => {
  assert.deepStrictEqual(validar({ ...pessoaValida(), nome: 'Jo Li' }), []);
  assert.ok(validar({ ...pessoaValida(), nome: 'Jo L' }).includes('nome: informe nome e sobrenome'));
});

test('borda cpf: todos os digitos iguais e invalido', () => {
  assert.ok(validar({ ...pessoaValida(), cpf: '222.222.222-22' }).includes('cpf: invalido'));
});

test('borda email: minimo aceitavel e valido, sem ponto no dominio e invalido', () => {
  assert.deepStrictEqual(validar({ ...pessoaValida(), email: 'a@b.co' }), []);
  assert.ok(validar({ ...pessoaValida(), email: 'a@bco' }).includes('email: invalido'));
});

test('borda data_nascimento: 120 anos e valido, 121 e invalido', () => {
  assert.deepStrictEqual(validar({ ...pessoaValida(), data_nascimento: dataHaAnos(120) }), []);
  assert.ok(
    validar({ ...pessoaValida(), data_nascimento: dataHaAnos(121) })
      .includes('data_nascimento: idade maxima e 120 anos')
  );
});

test('borda possui_cnh: precisa ser boolean, "sim" e invalido', () => {
  assert.ok(
    validar({ ...pessoaValida(), possui_cnh: 'sim' }).includes('possui_cnh: informe true ou false')
  );
});

test('fronteira 18 anos: exatamente 18 anos com possui_cnh=true e valido', () => {
  const pessoa = { ...pessoaValida(), data_nascimento: dataHaAnos(18), possui_cnh: true };
  assert.deepStrictEqual(validar(pessoa), []);
});

test('fronteira 18 anos: um dia antes de completar 18 com possui_cnh=true e invalido', () => {
  const pessoa = { ...pessoaValida(), data_nascimento: dataHaAnos(18, 1), possui_cnh: true };
  assert.ok(validar(pessoa).includes('possui_cnh: so a partir de 18 anos'));
});

test('varios erros juntos: nome, cpf e email invalidos ao mesmo tempo', () => {
  const erros = validar({ ...pessoaValida(), nome: 'X', cpf: '123', email: 'invalido' });
  assert.ok(erros.includes('nome: informe nome e sobrenome'));
  assert.ok(erros.includes('cpf: invalido'));
  assert.ok(erros.includes('email: invalido'));
});

test('garantirValido lanca PessoaInvalidaError com a lista de erros', () => {
  assert.throws(() => garantirValido({ ...pessoaValida(), nome: 'X' }), PessoaInvalidaError);
});

test('garantirValido nao lanca excecao quando a pessoa e valida', () => {
  assert.doesNotThrow(() => garantirValido(pessoaValida()));
});