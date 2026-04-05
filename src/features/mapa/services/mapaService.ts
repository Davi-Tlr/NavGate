import { apiRequest } from '@/services/api/apiClient';
import aerodromosData from '@/../assets/data/aerodromos_br.json';
import { Aerodromo } from '../../aerodromos/types';

export interface AirspaceFeature {
  type: 'Feature';
  properties: {
    name: string;
    type: string;
    lowerLimit: string;
    upperLimit: string;
  };
  geometry: any;
}

export const mapaService = {
  /**
   * Retorna os aeródromos formatados para o mapa (GeoJSON)
   */
  getAerodromosGeoJSON() {
    const features = (aerodromosData as Aerodromo[]).map(a => ({
      type: 'Feature',
      properties: {
        icao: a.icao,
        nome: a.nome,
        tipo: a.tipo,
      },
      geometry: {
        type: 'Point',
        coordinates: [a.longitude, a.latitude],
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  },

  /**
   * Busca espaços aéreos do OpenAIP
   * Nota: Idealmente, salvar o resultado em cache para uso offline
   */
  async buscarEspacosAereos() {
    try {
      // Endpoint exemplo do OpenAIP para espaços aéreos
      // Documentação: https://docs.openaip.net/
      const data = await apiRequest<any>('OPENAIP', '/airspaces', {
        country: 'BR',
        limit: '100',
      });
      return data;
    } catch (error) {
      console.error('[MAPA_SERVICE] Erro ao buscar espaços aéreos:', error);
      return null;
    }
  }
};
