export type AerodromoTipo =
    | 'large_airport'
    | 'medium_airport'
    | 'small_airport'
    | 'heliport'
    | 'seaplane_base';

export interface Aerodromo {
    icao: string;
    iata?: string;
    nome: string;
    tipo: AerodromoTipo;
    municipio: string;
    regiao: string;
    latitude: number;
    longitude: number;
    altitude_ft: number;
}
