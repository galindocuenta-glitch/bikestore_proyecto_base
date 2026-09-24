import { SERVER_URL } from '../config/env';

export function urlImagen(nombreArchivo) {
    return nombreArchivo ? `${SERVER_URL}/uploads/equippos/${nombreArchivo}` : null;
}