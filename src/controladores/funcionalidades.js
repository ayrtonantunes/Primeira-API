const { contas, saques, depositos, transferencias } = require('../bancodedados');
const { format } = require('date-fns');

let contador = 0;
const cadastrar = (req, res) => {
    const {nome, cpf, data_nascimento, telefone, email, senha} = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'O preenchimnento dos dados está incompleto.'});
    }

    const verificarCpfEmail = contas.some((conta) => {
        return conta.usuario.cpf === cpf || conta.usuario.email === email
    })

    if (verificarCpfEmail) {
        return res.status(400).json({ mensagem: 'O email ou CPF já existem em outra conta.'})
    }

    contador++;

    const novaConta = {
        numero: String(contador),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }

    }

    contas.push(novaConta);

    return res.status(201).json('Sua conta foi criada com sucesso!');
}

const listar = (req, res) => {
    return res.status(200).json(contas);
}

const atualizar = (req, res) => {
    const { numeroConta } = req.params;
    const {nome, cpf, data_nascimento, telefone, email, senha} = req.body;

    if (!nome && !cpf && !data_nascimento && !telefone && !email && !senha) {
        return res.status(400).json({ mensagem: 'Você deve preencher ao menos um campo.'});
    }

    const verificarCpfEmail = contas.some((conta) => {
        return conta.usuario.cpf === cpf || conta.usuario.email === email
    })

    if (verificarCpfEmail) {
        return res.status(400).json({ mensagem: 'O email ou CPF já existem em outra conta.'})
    }

    const contaIndex = contas.findIndex((conta) => {
        return conta.numero === numeroConta;
    });

    if (!contas[contaIndex]) {
        return res.status(404).json({ mensagem: 'Esta conta não existe.'});
    }


    if (nome) {
        contas[contaIndex].usuario.nome = nome;
    }

    if (cpf) {
        contas[contaIndex].usuario.cpf = cpf;
    }
    if (email) {
        contas[contaIndex].usuario.email = email;
    }
    if (data_nascimento) {
        contas[contaIndex].usuario.data_nascimento = data_nascimento;
    }
    if (telefone) {
        contas[contaIndex].usuario.telefone = telefone;
    }
    if (senha) {
        contas[contaIndex].usuario.senha = senha;
    }

    return res.status(200).json({ mensagem: 'Conta atualizada com sucesso.'});
}

const excluir = (req, res) => {
    const { numeroConta } = req.params;

    const contaIndex = contas.findIndex((conta) => {
        return conta.numero === numeroConta;
    });

    if (!contas[contaIndex]) {
        return res.status(404).json({ mensagem: 'Esta conta não existe.' })
    }

    if (contas[contaIndex].saldo !== 0) {
        return res.status(400).json({ mensagem: 'Erro ao excluir a conta. Saldo deve ser igual a 0.'});
    }

    contas.splice(contaIndex, 1);

    return res.status(200).json({ mensagem: 'Conta excluída com sucesso.'});
}

const depositar = (req, res) => {
    const { valor, numero_conta } = req.body;

    const contaIndex = contas.findIndex((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contas[contaIndex]) {
        return res.status(404).json({ mensagem: 'Esta conta não existe.'});
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Não é possível realizar esta operação. O valor de depósito deve ser maior que 0.'});  
    }

    contas[contaIndex].saldo += valor;

    const datasDepositos = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const depositosRealizados = {
        data: datasDepositos,
        numero_conta,
        valor
    }

    depositos.push(depositosRealizados);

    return res.status(200).json({ mensagem: 'O depósito foi realizado com sucesso.'});
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    const contaIndex = contas.findIndex((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contas[contaIndex]) {
        return res.status(404).json({ mensagem: 'Esta conta não existe.'});
    }
    
    if (contas[contaIndex].usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha inválida.'});
    }

    if (contas[contaIndex].saldo < valor) {
        return res.status(400).json({ mensagem: 'Não é possível realizar esta operação. Saldo insuficiente.'});  
    }

    contas[contaIndex].saldo -= valor;

    const datasSaques = format(new Date(), "yyyy-MM-dd HH:mm:ss");


    const saquesRealizados = {
        data: datasSaques,
        numero_conta,
        valor
    }

    saques.push(saquesRealizados);

    return res.status(200).json({ mensagem: 'O saque foi realizado com sucesso.'});
}

const transferir = (req, res) => {
    const {numero_conta_origem, numero_conta_destino, valor, senha} = req.body;

    const contaIndex1 = contas.findIndex((conta) => {
        return conta.numero === numero_conta_origem;
    });

    const contaIndex2 = contas.findIndex((conta) => {
        return conta.numero === numero_conta_destino;
    });

    if (!contas[contaIndex1] || !contas[contaIndex2]) {
        return res.status(404).json({ mensagem: 'A conta de origem ou destino não existem.'});
    }

    if (contas[contaIndex1].usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha inválida.'});
    }

    if (contas[contaIndex1].saldo < valor) {
        return res.status(400).json({ mensagem: 'Não é possível realizar esta operação. Saldo insuficiente.'});  
    }
 
    contas[contaIndex1].saldo -= valor;

    contas[contaIndex2].saldo += valor;

    const datasTransferencias = format(new Date(), "yyyy-MM-dd HH:mm:ss");


    const transferenciasRealizados = {
        data: datasTransferencias,
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    transferencias.push(transferenciasRealizados);

    return res.status(200).json({ mensagem: 'A transferência foi realizada com sucesso'});
}

const consultar = (req, res) => {
    const { numero_conta, senha} = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'Dados incompletos. Por favor insira número da conta e senha.'});
    }

    const contaIndex = contas.findIndex((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contas[contaIndex]) {
        return res.status(404).json({ mensagem: 'Esta conta não existe.'});
    }

    if (contas[contaIndex].usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha inválida.'});
    }

    res.status(200).json({ saldo: contas[contaIndex].saldo});
}

const extrato = (req, res) => {
    const { numero_conta, senha} = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'Dados incompletos. Por favor insira número da conta e senha.'});
    }

    const contaIndex = contas.findIndex((conta) => {
        return conta.numero === numero_conta;
    });

    if (!contas[contaIndex]) {
        return res.status(404).json({ mensagem: 'Esta conta não existe.'});
    }

    if (contas[contaIndex].usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha inválida.'});
    }

    const transferenciasEnviadas = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === numero_conta;
    });

    const transferenciasRecebidas = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_destino === numero_conta;
    });


    res.status(200).json({ depositos, saques, transferenciasEnviadas, transferenciasRecebidas });
}

module.exports = {
    cadastrar,
    listar,
    atualizar,
    excluir,
    depositar,
    sacar,
    transferir,
    consultar,
    extrato
}