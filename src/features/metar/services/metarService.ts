import { parsearMetar } from './metarParser';

const BASE_URL = 'https://aviationweather.gov/api/data';

interface NoaaMetarResponse {
  icaoId: string;
  rawOb: string;
}

interface NoaaTafResponse {
  icaoId: string;
  rawTAF: string;
}

export async function buscarMetar(icao: string) {
  const url = `${BASE_URL}/metar?ids=${icao}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NOAA retornou status ${response.status}`);
  }

  // Lê como texto primeiro — resposta pode ser vazia ou não-JSON
  const texto = await response.text();
  if (!texto || texto.trim() === '' || texto.trim() === '[]') {
    throw new Error('Nenhum METAR disponível para este aeródromo');
  }

  let data: NoaaMetarResponse[];
  try {
    data = JSON.parse(texto);
  } catch {
    throw new Error('Nenhum METAR disponível para este aeródromo');
  }

  const rawOb = data?.[0]?.rawOb;
  if (!rawOb) {
    throw new Error('Nenhum METAR disponível para este aeródromo');
  }

  return {
    processado: parsearMetar(rawOb, icao),
    raw: rawOb,
    isMock: false,
  };
}

export async function buscarTaf(icao: string): Promise<string | null> {
  const url = `${BASE_URL}/taf?ids=${icao}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const texto = await response.text();
    if (!texto || texto.trim() === '' || texto.trim() === '[]') return null;

    const data = JSON.parse(texto) as NoaaTafResponse[];
    return data?.[0]?.rawTAF ?? null;
  } catch {
    return null;
  }
}