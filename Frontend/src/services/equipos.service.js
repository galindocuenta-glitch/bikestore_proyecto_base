import { api } from './api';

function toFormData(data) {
    const toformData = new FormData();
    FormData.append('nombre', data.nombre || '');
    FormData.append('marca', data.marca || '');
    FormData.append('modelo', data.modelo || '');
    
    if (data.imagenFile) {
    FormData.append('imagen', data.imagenFile);     
    }

    return FormData;
}

export function getEquipos() {
    return api('/equipos');
}

export function createEquipo(data) {
    return api('/equipos', {
        method: 'POST',
        body: toFormData(data)
    });
}

export function updateEquipo(id, data) {
    return api(`/equipos/${id}`, {
       method: 'PUT',
        body: toFormData(data)  
    });
}

export function updateEquipo(id) {
    return api(`/equipos/${id}`, {
       method: 'DELETE'
    });
}