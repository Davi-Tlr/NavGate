const KEYS = {
  REDEMET: process.env.EXPO_PUBLIC_REDEMET_KEY,
  AISWEB: process.env.EXPO_PUBLIC_AISWEB_KEY,
  OPENAIP: process.env.EXPO_PUBLIC_OPENAIP_KEY,
};

export const API_BASES = {
  REDEMET: 'https://api-redemet.decea.mil.br',
  AISWEB: 'https://aisweb.decea.mil.br/api',
  OPENAIP: 'https://api.core.openaip.net/api',
};

export async function apiRequest<T>(
  base: keyof typeof API_BASES,
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const key = KEYS[base];
  const baseUrl = API_BASES[base];
  
  // Constrói query string com a API Key
  const queryParams = new URLSearchParams({
    ...params,
    ...(base === 'REDEMET' ? { api_key: key || '' } : {}),
    ...(base === 'AISWEB' ? { api_key: key || '', apiKey: key || '' } : {}),
    ...(base === 'OPENAIP' ? { apiKey: key || '' } : {}),
  });

  const url = `${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API ${base}: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`[API ERROR] ${base} ${endpoint}:`, error);
    throw error;
  }
}
