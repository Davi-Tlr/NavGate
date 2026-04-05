import { MetarRaw, TafRaw } from '../types';
import { parsearMetar } from './metarParser';

const REDEMET_KEY = process.env.EXPO_PUBLIC_REDEMET_KEY;
const BASE_URL = 'https://api-redemet.decea.mil.br';

// Dados simulados para desenvolvimento sem chave de API
// Representam um METAR real típico de Guarulhos
const MOCK_METARS: Record<string, string> = {
    SBGR: 'SBGR 051200Z 09010KT 9999 FEW020 28/18 Q1013 NOSIG',
    SBBE: 'SBBE 051200Z 06008KT 8000 SCT018 BKN025 29/25 Q1010 NOSIG',
    SBSP: 'SBSP 051200Z 24012G18KT 6000 BKN008 22/20 Q1015 NOSIG',
    SBCT: 'SBCT 051200Z 35006KT CAVOK 18/12 Q1018 NOSIG',
    SBRF: 'SBRF 051200Z VRB03KT 9999 FEW015 31/26 Q1011 NOSIG',
};

function getMockMetar(icao: string): string {
    // Usa um METAR específico se existir, senão gera um genérico
    return MOCK_METARS[icao] ??
        `${icao} 051200Z 18005KT 9999 SKC 25/15 Q1013 NOSIG`;
}

export async function buscarMetar(icao: string) {
    // Sem chave: usa mock e avisa no console
    if (!REDEMET_KEY) {
        console.log(`[METAR] Sem chave API — usando dados simulados para ${icao}`);
        const rawMock = getMockMetar(icao);
        return {
            processado: parsearMetar(rawMock, icao),
            raw: rawMock,
            isMock: true,
        };
    }

    // Com chave: busca dados reais da REDEMET
    const url = `${BASE_URL}/mensagens/metar/${icao}?api_key=${REDEMET_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`REDEMET retornou status ${response.status}`);
    }

    const data = await response.json() as { data: { data: MetarRaw[] } };
    const metarRaw = data?.data?.data?.[0];

    if (!metarRaw) {
        throw new Error('Nenhum METAR disponível para este aeródromo');
    }

    return {
        processado: parsearMetar(metarRaw.mens, icao),
        raw: metarRaw.mens,
        isMock: false,
    };
}

export async function buscarTaf(icao: string): Promise<string | null> {
    if (!REDEMET_KEY) {
        return `TAF ${icao} 051100Z 0512/0618 09008KT 9999 FEW020 ` +
            `TEMPO 0514/0518 4000 SHRA BKN015 ` +
            `BECMG 0518/0520 18006KT`;
    }

    const url = `${BASE_URL}/mensagens/taf/${icao}?api_key=${REDEMET_KEY}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json() as { data: { data: TafRaw[] } };
    return data?.data?.data?.[0]?.mens ?? null;
}