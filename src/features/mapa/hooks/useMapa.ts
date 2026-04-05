import { useState, useEffect, useCallback } from 'react';
import { mapaService } from '../services/mapaService';

export function useMapa() {
  const [aerodromos, setAerodromos] = useState<any>(null);
  const [espacosAereos, setEspacosAereos] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDadosMapa = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Carrega aeródromos (local instantâneo)
      const aeroGeoJSON = mapaService.getAerodromosGeoJSON();
      setAerodromos(aeroGeoJSON);

      // 2. Tenta buscar espaços aéreos (rede opcional)
      const airspaces = await mapaService.buscarEspacosAereos();
      if (airspaces) {
        setEspacosAereos(airspaces);
      }
    } catch (err) {
      console.error('[USE_MAPA] Falha ao carregar dados:', err);
      setError('Não foi possível carregar alguns dados do mapa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosMapa();
  }, [carregarDadosMapa]);

  return {
    aerodromos,
    espacosAereos,
    loading,
    error,
    recarregar: carregarDadosMapa
  };
}
