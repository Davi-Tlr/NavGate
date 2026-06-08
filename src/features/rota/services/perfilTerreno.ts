// Busca o perfil de elevação do terreno ao longo da rota usando a API Open-Topo-Data (SRTM 90m).
import { Waypoint } from '../types';
import { getCoordsWaypoint } from '../utils';
import { calcularDistanciaNM } from './rotaService';

const OPEN_TOPO_URL = 'https://api.opentopodata.org/v1/srtm90m';
const PONTOS_POR_TRECHO = 20;

function interpolarPontos(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
    n: number
): { lat: number; lng: number }[] {
    const pontos = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        pontos.push({
            lat: lat1 + (lat2 - lat1) * t,
            lng: lng1 + (lng2 - lng1) * t,
        });
    }
    return pontos;
}

export interface PontoElevacao {
    distancia: number; // NM acumulado
    altitude: number;  // metros
    label: string;
}

export async function buscarPerfilTerreno(waypoints: Waypoint[]): Promise<PontoElevacao[]> {
    if (waypoints.length < 2) return [];

    const pontos: { lat: number; lng: number; distAcum: number }[] = [];
    let distTotal = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
        const [lat1, lng1] = getCoordsWaypoint(waypoints[i]);
        const [lat2, lng2] = getCoordsWaypoint(waypoints[i + 1]);

        const interpolados = interpolarPontos(lat1, lng1, lat2, lng2, PONTOS_POR_TRECHO);

        for (let j = i === 0 ? 0 : 1; j < interpolados.length; j++) {
            const p = interpolados[j];
            const prevLat = j > 0 ? interpolados[j - 1].lat : lat1;
            const prevLng = j > 0 ? interpolados[j - 1].lng : lng1;
            distTotal += calcularDistanciaNM(prevLat, prevLng, p.lat, p.lng);
            pontos.push({ lat: p.lat, lng: p.lng, distAcum: distTotal });
        }
    }

    // A API limita a 100 pontos por requisição; a amostragem uniforme preserva a forma do perfil.
    const passo = Math.ceil(pontos.length / 100);
    const pontosFiltrados = pontos.filter((_, i) => i % passo === 0).slice(0, 100);

    const locationsStr = pontosFiltrados
        .map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`)
        .join('|');

    const response = await fetch(`${OPEN_TOPO_URL}?locations=${locationsStr}`);
    const data = await response.json();

    if (data.status !== 'OK') throw new Error('Erro ao buscar elevação');

    return data.results.map((r: { elevation: number | null }, i: number) => ({
        distancia: parseFloat(pontosFiltrados[i].distAcum.toFixed(1)),
        altitude: r.elevation ?? 0,
        label: `${pontosFiltrados[i].distAcum.toFixed(0)} NM`,
    }));
}
