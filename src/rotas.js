const express = require('express');
const funcionalidades = require('./controladores/funcionalidades');
const validacoes = require('./intermediarios/validacoes');

const rotas = express();

rotas.get('/contas', validacoes.validarSenhaGerente, funcionalidades.listar);
rotas.post('/cadastro', funcionalidades.cadastrar);
rotas.put('/contas/:numeroConta/usuario', funcionalidades.atualizar);
rotas.delete('/contas/:numeroConta', funcionalidades.excluir);
rotas.post('/transacoes/depositar', funcionalidades.depositar);
rotas.post('/transacoes/sacar', funcionalidades.sacar);
rotas.post('/transacoes/transferir', funcionalidades.transferir);
rotas.get('/contas/saldo', funcionalidades.consultar);
rotas.get('/contas/extrato', funcionalidades.extrato);

module.exports = rotas;