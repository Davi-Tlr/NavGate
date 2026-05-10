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

  getAerodromosGeoJSON(filtros: {
    aeroportos: boolean;
    aerodromos: boolean;
    heliportos: boolean;
    hidroavioes: boolean;
  } = { aeroportos: true, aerodromos: true, heliportos: false, hidroavioes: false }) {
    const features = (aerodromosData as Aerodromo[])
      .filter(a => {
        if (a.tipo === 'large_airport' || a.tipo === 'medium_airport') return filtros.aeroportos;
        if (a.tipo === 'small_airport') return filtros.aerodromos;
        if (a.tipo === 'heliport') return filtros.heliportos;
        if (a.tipo === 'seaplane_base') return filtros.hidroavioes;
        return false;
      })
      .map(a => ({
        type: 'Feature',
        properties: { icao: a.icao, nome: a.nome, tipo: a.tipo },
        geometry: { type: 'Point', coordinates: [a.longitude, a.latitude] },
      }));

    return { type: 'FeatureCollection', features };
  },

  /**
   * Busca espaços aéreos do OpenAIP
   * Nota: Idealmente, salvar o resultado em cache para uso offline
   */
  async buscarEspacosAereos() {
    const OPENAIP_KEY = process.env.EXPO_PUBLIC_OPENAIP_KEY;
    if (!OPENAIP_KEY) return null;

    try {
      const data = await apiRequest<any>('OPENAIP', '/airspaces', {
        country: 'BR',
        limit: '100',
      });

      // OpenAIP retorna { items: [...] } — precisa converter para FeatureCollection
      const items = data?.items ?? data ?? [];

      if (!Array.isArray(items) || items.length === 0) return null;

      const featureCollection = {
        type: 'FeatureCollection',
        features: items.map((item: any) => ({
          type: 'Feature',
          properties: {
            name: item.name ?? '',
            type: item.type ?? '',
          },
          geometry: item.geometry,
        })).filter((f: any) => f.geometry != null),
      };

      return featureCollection;
    } catch (error) {
      console.error('[MAPA_SERVICE] Erro ao buscar espaços aéreos:', error);
      return null;
    }
  }
};

