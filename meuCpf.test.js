const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validarCPF } = require('./pessoaFisica');

test('teste proposital que falha', () => {
  assert.equal(validarCPF('123'), true); // sabemos que isso é false, então vai falhar
});