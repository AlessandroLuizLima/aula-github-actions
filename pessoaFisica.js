(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.PessoaFisica = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function apenasDigitos(valor) {
    return String(valor).replace(/\D/g, '');
  }

  function validarNome(nome) {
    if (typeof nome !== 'string') return false;
    const valor = nome.trim();
    if (valor !== nome) return false;
    if (valor.length < 3 || valor.length > 80) return false;
    const regexCaracteres = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
    if (!regexCaracteres.test(valor)) return false;
    const palavras = valor.split(/\s+/).filter((p) => p.replace(/['-]/g, '').length >= 2);
    return palavras.length >= 2;
  }

  function validarCPF(cpf) {
    if (typeof cpf !== 'string' && typeof cpf !== 'number') return false;
    const digitos = apenasDigitos(cpf);
    if (digitos.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digitos)) return false;

    const calcularDigito = (base) => {
      let soma = 0;
      let peso = base.length + 1;
      for (const d of base) {
        soma += Number(d) * peso;
        peso -= 1;
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const nove = digitos.slice(0, 9);
    const d1 = calcularDigito(nove);
    const d2 = calcularDigito(nove + d1);
    return digitos === nove + String(d1) + String(d2);
  }

  function validarEmail(email) {
    if (typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function parseDataISO(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
    const [ano, mes, dia] = valor.split('-').map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    if (
      data.getUTCFullYear() !== ano ||
      data.getUTCMonth() !== mes - 1 ||
      data.getUTCDate() !== dia
    ) {
      return null;
    }
    return data;
  }

  function calcularIdade(dataNascimento, hoje) {
    hoje = hoje || new Date();
    let idade = hoje.getUTCFullYear() - dataNascimento.getUTCFullYear();
    const aindaNaoFezAniversario =
      hoje.getUTCMonth() < dataNascimento.getUTCMonth() ||
      (hoje.getUTCMonth() === dataNascimento.getUTCMonth() &&
        hoje.getUTCDate() < dataNascimento.getUTCDate());
    if (aindaNaoFezAniversario) idade -= 1;
    return idade;
  }

  function validar(pessoa) {
    pessoa = pessoa || {};
    const erros = [];
    const hoje = new Date();

    if (!validarNome(pessoa.nome)) {
      erros.push('nome: informe nome e sobrenome');
    }

    if (!validarCPF(pessoa.cpf)) {
      erros.push('cpf: invalido');
    }

    if (!validarEmail(pessoa.email)) {
      erros.push('email: invalido');
    }

    const dataNascimento = parseDataISO(pessoa.data_nascimento);
    let idade = null;
    if (!dataNascimento) {
      erros.push('data_nascimento: invalido');
    } else if (dataNascimento.getTime() > hoje.getTime()) {
      erros.push('data_nascimento: nao pode estar no futuro');
    } else {
      idade = calcularIdade(dataNascimento, hoje);
      if (idade > 120) {
        erros.push('data_nascimento: idade maxima e 120 anos');
      }
    }

    if (typeof pessoa.possui_cnh !== 'boolean') {
      erros.push('possui_cnh: informe true ou false');
    } else if (pessoa.possui_cnh === true) {
      if (idade === null || idade < 18) {
        erros.push('possui_cnh: so a partir de 18 anos');
      }
    }

    return erros;
  }

  class PessoaInvalidaError extends Error {
    constructor(erros) {
      super('Pessoa invalida: ' + erros.join('; '));
      this.name = 'PessoaInvalidaError';
      this.erros = erros;
    }
  }

  function garantirValido(pessoa) {
    const erros = validar(pessoa);
    if (erros.length > 0) {
      throw new PessoaInvalidaError(erros);
    }
  }

  return {
    validar: validar,
    garantirValido: garantirValido,
    PessoaInvalidaError: PessoaInvalidaError,
    validarCPF: validarCPF,
    calcularIdade: calcularIdade,
  };
});