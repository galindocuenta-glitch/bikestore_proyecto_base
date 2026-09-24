const authService = require('../services/auth.service');
async function register(req, res, next) {
    try {
        const { id_usuario} = await authService.registerUser(req.body);

        return res.status(201).json({
            ok:true,
            message: 'Usuario registrado',
            id_usuario
        });
    } catch (eror) {
        next(eror);
    }
}

async function login(req, res, next) {
    try {
        const { user, token} = await authService.loginUser(req.body);
        return res.json({ ok: true, user, token});
    } catch(error) {
        next(eror);
    }
       
}

module.exports = { register, login};