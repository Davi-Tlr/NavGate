import aerodromosData from '../../../../assets/data/aerodromos_br.json';
import { Aerodromo } from '../types';

const AERODROMOS: Aerodromo[] = aerodromosData as Aerodromo[];

const MAX_RESULTADOS = 20;

export function buscarAerodromos(termo: string): Aerodromo[] {
    if (!termo || termo.trim().length < 2) return [];

    const busca = termo.trim().toUpperCase();

    return AERODROMOS.filter(a =>
        a.icao.includes(busca) ||
        a.nome.toUpperCase().includes(busca) ||
        a.municipio.toUpperCase().includes(busca)
    ).slice(0, MAX_RESULTADOS);
}

export function buscarPorIcao(icao: string): Aerodromo | undefined {
    return AERODROMOS.find(a => a.icao === icao.toUpperCase());
}

export function totalAerodromos(): number {
    return AERODROMOS.length;
}