export interface Aerodromo {
    icao: string;
    iata?: string;
    nome: string;
    tipo: string;
    municipio: string;
    regiao: string;
    latitude: number;
    longitude: number;
    altitude_ft: number;
}