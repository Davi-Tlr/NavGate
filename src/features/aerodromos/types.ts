export interface Aerodromo {
    icao: string;
    nome: string;
    tipo: 'large_airport' | 'medium_airport' | 'small_airport' | 'heliport' | 'seaplane_base';
    latitude: number;
    longitude: number;
    altitude_ft: number;
    municipio: string;
    regiao: string;
    iata: string;
}