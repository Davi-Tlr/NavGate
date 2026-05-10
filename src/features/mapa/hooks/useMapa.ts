import { useState, useEffect, useCallback } from 'react';
import { mapaService } from '../services/mapaService';

export function useMapa() {
  const [aerodromos, setAerodromos] = useState<any>(null);
  const [aerodromosComHeliportos, setAerodromosComHeliportos] = useState<any>(null);
  const [espacosAereos, setEspacosAereos] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDadosMapa = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Sem heliportos (padrão)
      const aeroSemHeli = mapaService.getAerodromosGeoJSON(false);
      setAerodromos(aeroSemHeli);

      // Com heliportos
      const aeroComHeli = mapaService.getAerodromosGeoJSON(true);
      setAerodromosComHeliportos(aeroComHeli);

      const airspaces = await mapaService.buscarEspacosAereos();
      if (airspaces) setEspacosAereos(airspaces);
    } catch (err) {
      setError('Não foi possível carregar alguns dados do mapa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosMapa();
  }, [carregarDadosMapa]);

  return { aerodromos, aerodromosComHeliportos, espacosAereos, loading, error, recarregar: carregarDadosMapa };
}