import { Waypoint } from './types';

export function getCoordsWaypoint(wp: Waypoint): [number, number] {
    if (wp.aerodromo) return [wp.aerodromo.latitude, wp.aerodromo.longitude];
    if (wp.coordenadas) return [wp.coordenadas[1], wp.coordenadas[0]];
    return [0, 0];
}
