const OPENAIP_KEY = process.env.EXPO_PUBLIC_OPENAIP_KEY;

export const API_BASES = {
  OPENAIP: 'https://api.core.openaip.net/api',
};

export async function apiRequest<T>(
  base: keyof typeof API_BASES,
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const baseUrl = API_BASES[base];
  const queryParams = new URLSearchParams(params);
  const url = `${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryParams.toString()}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(base === 'OPENAIP' && OPENAIP_KEY ? { 'x-openaip-api-key': OPENAIP_KEY } : {}),
  };

  try {
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`Erro na API ${base}: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`[API ERROR] ${base} ${endpoint}:`, error);
    throw error;
  }
}
