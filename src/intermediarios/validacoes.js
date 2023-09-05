const { banco } = require('../bancodedados');

const validarSenhaGerente = (req, res, next) => {
    const senhaGerente = banco.senha;
    const senhaReq = req.query.senha_banco;

    if (senhaReq !== senhaGerente) {
        return res.status(403).json({ mensagem: 'Você não possui permissão.'});
    }

    next()
}

module.exports = {
    validarSenhaGerente,
}