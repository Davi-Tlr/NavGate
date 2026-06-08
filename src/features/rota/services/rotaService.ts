import { Waypoint, TrechoRota, Rota } from '../types';
import { getCoordsWaypoint } from '../utils';

const RAIO_TERRA_NM = 3440.065;

/**
 * Haversine é usado aqui porque leva em conta a curvatura da Terra, essencial para
 * distâncias aeronáuticas precisas. Fórmulas planas introduzem erro crescente acima de ~50 NM.
 */
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

/**
 * Retorna o rumo verdadeiro (True Course) em graus de 0 a 360.
 * Rumo verdadeiro é o ângulo medido a partir do norte geográfico, sem correção de variação magnética.
 * O piloto aplica a declinação magnética local para obter o rumo magnético a voar.
 */
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

export interface RotaFeature {
    type: 'Feature';
    geometry: { type: 'LineString'; coordinates: number[][] };
    properties: Record<string, never>;
}

export function rotaParaGeoJSON(waypoints: Waypoint[]): RotaFeature | null {
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
