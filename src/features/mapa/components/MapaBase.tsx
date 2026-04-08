import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

MapLibreGL.setAccessToken(null);

// tileSize 512 melhora nitidez em telas de alta densidade (retina/OLED)
const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 512,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

interface MapaBaseProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  aerodromos?: any | null;
  espacosAereos?: any | null;
  onPressAerodromo?: (icao: string) => void;
}

export function MapaBase({
  center = [-46.6333, -23.5505],
  zoom = 5,
  aerodromos,
  espacosAereos,
  onPressAerodromo,
}: MapaBaseProps) {
  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <MapLibreGL.Camera
          centerCoordinate={center}
          zoomLevel={zoom}
          animationDuration={0}
        />

        {espacosAereos && (
          <MapLibreGL.ShapeSource id="airspaces" shape={espacosAereos}>
            <MapLibreGL.FillLayer
              id="airspaces-fill"
              style={{
                fillColor: '#00bfff',
                fillOpacity: 0.08,
              }}
            />
            <MapLibreGL.LineLayer
              id="airspaces-line"
              style={{
                lineColor: '#00bfff',
                lineWidth: 1.5,
                lineOpacity: 0.6,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

        {aerodromos && (
          <MapLibreGL.ShapeSource
            id="aerodromos"
            shape={aerodromos}
            onPress={(e) => {
              const icao = e.features[0]?.properties?.icao;
              if (icao && onPressAerodromo) onPressAerodromo(icao);
            }}
          >
            <MapLibreGL.CircleLayer
              id="aerodromos-circle"
              style={{
                circleRadius: ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 5, 14, 9] as any,
                circleColor: '#00e5ff',
                circleOpacity: 0.9,
                circleStrokeWidth: 1,
                circleStrokeColor: '#ffffff',
                circleStrokeOpacity: 0.4,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});