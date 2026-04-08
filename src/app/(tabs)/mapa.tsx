import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapaBase } from '@/features/mapa/components/MapaBase';
import { AerodromoPanel } from '@/features/mapa/components/AerodromoPanel';
import { useMapa } from '@/features/mapa/hooks/useMapa';
import { buscarPorIcao } from '@/features/aerodromos/services/aerodromoService';
import { Aerodromo } from '@/features/aerodromos/types';

export default function MapaScreen() {
  const { aerodromos, espacosAereos } = useMapa();
  const [selecionado, setSelecionado] = useState<Aerodromo | null>(null);

  const handlePressAerodromo = (icao: string) => {
    const aerodromo = buscarPorIcao(icao);
    if (aerodromo) setSelecionado(aerodromo);
  };

  return (
    <View style={styles.container}>
      <MapaBase
        center={[-46.6333, -23.5505]}
        zoom={6}
        aerodromos={aerodromos}
        espacosAereos={espacosAereos}
        onPressAerodromo={handlePressAerodromo}
      />
      {selecionado && (
        <AerodromoPanel
          aerodromo={selecionado}
          onFechar={() => setSelecionado(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
});