import { Aerodromo } from '../aerodromos/types';

export interface Waypoint {
    id: string;
    aerodromo?: Aerodromo;
    coordenadas?: [number, number];
    label: string;
}

export interface TrechoRota {
    origem: Waypoint;
    destino: Waypoint;
    distanciaNM: number;
    rumoVerdadeiro: number;
}

export interface Rota {
    waypoints: Waypoint[];
    trechos: TrechoRota[];
    distanciaTotalNM: number;
}
