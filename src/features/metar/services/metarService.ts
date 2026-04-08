import { parsearMetar } from './metarParser';

// NOAA Aviation Weather Center — gratuito, sem chave, cobertura mundial
// Documentação: https://aviationweather.gov/data/api/
const BASE_URL = 'https://aviationweather.gov/api/data';

interface NoaaMetarResponse {
  icaoId: string;
  rawOb: string; // string METAR bruta — ex: "SBSP 061200Z 09010KT 9999 FEW030 25/18 Q1013"
}

interface NoaaTafResponse {
  icaoId: string;
  rawTAF: string; // string TAF bruta
}

export async function buscarMetar(icao: string) {
  const url = `${BASE_URL}/metar?ids=${icao}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NOAA retornou status ${response.status}`);
  }

  const data = await response.json() as NoaaMetarResponse[];
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

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json() as NoaaTafResponse[];
  return data?.[0]?.rawTAF ?? null;
}
