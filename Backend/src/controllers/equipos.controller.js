const equiposService = require ('../services/equipos.service');

async function list(req, res, next) {
    try {
        const data = await equiposService.listEquipos();
        res.json({ ok: true, data});
    } catch (error) {
        next(eror);
    }
    
}

async function getById(req, res, next) {
    try {
        const data = await equiposService.getById(req.params.id);
        res.json({ ok: true, data});
    } catch(error){
        next(eror);
    }   
}

async function create(req, res, next) { 
    try {
        const data = await equiposService.createEquipo(req.body, req.file?.filename);
        res.status(201).json({ ok: true, data});
    } catch(error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const data = await equiposService.updateEquipo(req.params.id, req.body, req.file?.filename);
        res.json({ ok: true, message:'Equipo actualizado'});
    } catch(error){
        next(error);
    }
    
}

async function remove
(req, res, next) {
    try {
        const data = await equiposService.deleteEquipo(req.params.id);
        res.json({ ok: true, message:'Equipo elimando'});
    } catch(eror){
        next(error)
    }
    
}

module.exports = { list, getById, create, update, remove};