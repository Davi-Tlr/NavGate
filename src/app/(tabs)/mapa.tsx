import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { MapaBase } from '@/features/mapa/components/MapaBase';
import { AerodromoPanel } from '@/features/mapa/components/AerodromoPanel';
import { PainelCamadas, ConfigCamadas } from '@/features/mapa/components/PainelCamadas';
import { mapaService } from '@/features/mapa/services/mapaService';
import { buscarPorIcao } from '@/features/aerodromos/services/aerodromoService';
import { Aerodromo } from '@/features/aerodromos/types';

const CONFIG_PADRAO: ConfigCamadas = {
  espacosAereos: true,
  wac: false,
  rea: false,
  aeroportos: true,
  aerodromos: true,
  heliportos: false,
  hidroavioes: false,
};

export default function MapaScreen() {
  const [espacosAereos, setEspacosAereos] = useState<any>(null);
  const [selecionado, setSelecionado] = useState<Aerodromo | null>(null);
  const [center, setCenter] = useState<[number, number]>([-51.9253, -14.2350]);
  const [zoom, setZoom] = useState(4);
  const [localizando, setLocalizando] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);
  const [config, setConfig] = useState<ConfigCamadas>(CONFIG_PADRAO);

  const params = useLocalSearchParams<{ lat?: string; lng?: string; icao?: string }>();

  // GeoJSON filtrado pelos tipos selecionados
  const aerodromos = mapaService.getAerodromosGeoJSON({
    aeroportos: config.aeroportos,
    aerodromos: config.aerodromos,
    heliportos: config.heliportos,
    hidroavioes: config.hidroavioes,
  });

  useEffect(() => {
    mapaService.buscarEspacosAereos().then(data => {
      if (data) setEspacosAereos(data);
    });
  }, []);

  useEffect(() => {
    if (params.lat && params.lng) {
      const lat = parseFloat(params.lat);
      const lng = parseFloat(params.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCenter([lng, lat]);
        setZoom(13);
        if (params.icao) {
          const aerodromo = buscarPorIcao(params.icao);
          if (aerodromo) setSelecionado(aerodromo);
        }
      }
    }
  }, [params.lat, params.lng, params.icao]);

  const handlePressAerodromo = (icao: string) => {
    const aerodromo = buscarPorIcao(icao);
    if (aerodromo) setSelecionado(aerodromo);
  };

  const irParaMinhaLocalizacao = async () => {
    setLocalizando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative a localização nas configurações.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCenter([location.coords.longitude, location.coords.latitude]);
      setZoom(13);
    } catch {
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
    } finally {
      setLocalizando(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapaBase
        center={center}
        zoom={zoom}
        aerodromos={aerodromos}
        espacosAereos={espacosAereos}
        mostrarEspacosAereos={config.espacosAereos}
        mostrarWac={config.wac}
        mostrarRea={config.rea}
        onPressAerodromo={handlePressAerodromo}
      />

      {/* Botão camadas */}
      <TouchableOpacity
        style={styles.botaoCamadas}
        onPress={() => setPainelAberto(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="layers" size={22} color="#4A9EFF" />
      </TouchableOpacity>

      {/* Botão GPS */}
      <TouchableOpacity
        style={styles.botaoGps}
        onPress={irParaMinhaLocalizacao}
        activeOpacity={0.8}
        disabled={localizando}
      >
        {localizando
          ? <ActivityIndicator size="small" color="#4A9EFF" />
          : <Ionicons name="locate" size={22} color="#4A9EFF" />
        }
      </TouchableOpacity>

      {selecionado && (
        <AerodromoPanel
          aerodromo={selecionado}
          onFechar={() => setSelecionado(null)}
        />
      )}

      {painelAberto && (
        <PainelCamadas
          config={config}
          onChange={setConfig}
          onFechar={() => setPainelAberto(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  botaoCamadas: {
    position: 'absolute',
    bottom: 160,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a2035',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A9EFF',
    elevation: 4,
  },
  botaoGps: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a2035',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A9EFF',
    elevation: 4,
  },
});