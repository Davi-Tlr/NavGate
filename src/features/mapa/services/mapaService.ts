import { apiRequest } from '@/services/api/apiClient';
import aerodromosData from '@/../assets/data/aerodromos_br.json';
import { Aerodromo } from '../../aerodromos/types';

export interface AirspaceFeature {
  type: 'Feature';
  properties: {
    name: string;
    type: string;
  };
  geometry: { type: string; coordinates: unknown };
}

interface OpenAIPAirspace {
  name?: string;
  type?: string;
  geometry?: { type: string; coordinates: unknown } | null;
}

interface OpenAIPResponse {
  items?: OpenAIPAirspace[];
}

export const mapaService = {
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

  async buscarEspacosAereos() {
    const OPENAIP_KEY = process.env.EXPO_PUBLIC_OPENAIP_KEY;
    if (!OPENAIP_KEY) return null;

    try {
      const data = await apiRequest<OpenAIPResponse>('OPENAIP', '/airspaces', {
        country: 'BR',
        limit: '100',
      });

      const items = data?.items ?? [];

      if (!Array.isArray(items) || items.length === 0) return null;

      // O MapLibre exige GeoJSON no formato FeatureCollection para ShapeSource.
      // A API OpenAIP retorna um array de objetos próprios, portanto a conversão é obrigatória.
      const featureCollection = {
        type: 'FeatureCollection',
        features: items
          .filter(item => item.geometry != null)
          .map(item => ({
            type: 'Feature' as const,
            properties: {
              name: item.name ?? '',
              type: item.type ?? '',
            },
            geometry: item.geometry as { type: string; coordinates: unknown },
          })),
      };

      return featureCollection;
    } catch (error) {
      console.error('[MAPA_SERVICE] Erro ao buscar espaços aéreos:', error);
      return null;
    }
  }
};
