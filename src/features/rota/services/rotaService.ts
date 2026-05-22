import { Waypoint, TrechoRota, Rota } from '../types';

const RAIO_TERRA_NM = 3440.065;

export function calcularDistanciaNM(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return RAIO_TERRA_NM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcularRumoVerdadeiro(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1R = lat1 * Math.PI / 180;
    const lat2R = lat2 * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2R);
    const x = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

function getCoordsWaypoint(wp: Waypoint): [number, number] {
    if (wp.aerodromo) return [wp.aerodromo.latitude, wp.aerodromo.longitude];
    if (wp.coordenadas) return [wp.coordenadas[1], wp.coordenadas[0]]; // [lat, lng]
    return [0, 0];
}

export function calcularRota(waypoints: Waypoint[]): Rota {
    const trechos: TrechoRota[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
        const origem = waypoints[i];
        const destino = waypoints[i + 1];
        const [oLat, oLng] = getCoordsWaypoint(origem);
        const [dLat, dLng] = getCoordsWaypoint(destino);

        trechos.push({
            origem,
            destino,
            distanciaNM: calcularDistanciaNM(oLat, oLng, dLat, dLng),
            rumoVerdadeiro: calcularRumoVerdadeiro(oLat, oLng, dLat, dLng),
        });
    }

    return {
        waypoints,
        trechos,
        distanciaTotalNM: trechos.reduce((acc, t) => acc + t.distanciaNM, 0),
    };
}

export function rotaParaGeoJSON(waypoints: Waypoint[]) {
    if (waypoints.length < 2) return null;
    return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: waypoints.map(w => {
                if (w.aerodromo) return [w.aerodromo.longitude, w.aerodromo.latitude];
                if (w.coordenadas) return w.coordenadas;
                return [0, 0];
            }),
        },
        properties: {},
    };
}
