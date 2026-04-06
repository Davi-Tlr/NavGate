import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

MapLibreGL.setAccessToken(null);

interface MapaBaseProps {
  center?: [number, number];
  zoom?: number;
}

export function MapaBase({ center = [-46.6333, -23.5505], zoom = 10 }: MapaBaseProps) {
  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle="https://tile.opentopomap.org/{z}/{x}/{y}.png"
        logoEnabled={false}
        attributionEnabled={true}
      >
        <MapLibreGL.Camera
          centerCoordinate={center}
          zoomLevel={zoom}
          animationDuration={0}
        />
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});