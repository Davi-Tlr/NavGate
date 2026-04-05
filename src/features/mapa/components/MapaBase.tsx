import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ADAPTER PATTERN: Este componente isola a biblioteca de mapas.
 * Como o MapLibre exige Development Build, este adapter permite que o app
 * continue funcionando no Expo Go com um fallback visual.
 */

interface MapaBaseProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
}

export function MapaBase({ center = [-46.6333, -23.5505], zoom = 10 }: MapaBaseProps) {
  // TODO: Quando tiver o Development Build, importar e usar o MapLibre aqui.
  // import MapLibreGL from '@maplibre/maplibre-react-native';

  const isDevelopmentBuild = false; // Detectar dinamicamente no futuro

  if (!isDevelopmentBuild) {
    return (
      <View style={styles.container}>
        <View style={styles.fallback}>
          <Ionicons name="map-outline" size={64} color="#1a2035" />
          <Text style={styles.titulo}>Mapa em modo de espera</Text>
          <Text style={styles.texto}>
            O mapa requer um Development Build para funcionar.
            No Expo Go, esta área mostra apenas o esqueleto da interface.
          </Text>
          <View style={styles.coordenadas}>
            <Text style={styles.coordTexto}>Centro: {center[1].toFixed(4)}, {center[0].toFixed(4)}</Text>
            <Text style={styles.coordTexto}>Zoom: {zoom}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Exemplo de como será a implementação real:
  /*
  return (
    <MapLibreGL.MapView style={styles.map}>
      <MapLibreGL.Camera centerCoordinate={center} zoomLevel={zoom} />
      <MapLibreGL.RasterSource id="opentopo" tileUrlTemplates={['https://tile.opentopomap.org/{z}/{x}/{y}.png']}>
        <MapLibreGL.RasterLayer id="opentopoLayer" sourceID="opentopo" />
      </MapLibreGL.RasterSource>
    </MapLibreGL.MapView>
  );
  */
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  titulo: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  texto: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  coordenadas: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#1a2035',
    borderRadius: 8,
    width: '100%',
  },
  coordTexto: {
    color: '#4A9EFF',
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  map: {
    flex: 1,
  }
});
