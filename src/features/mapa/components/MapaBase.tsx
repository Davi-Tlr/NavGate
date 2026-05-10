import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

MapLibreGL.setAccessToken(null);

const WMS_BASE = 'https://geoaisweb.decea.mil.br/geoserver/ICA/wms';

function buildWmsUrl(layers: string): string {
  return `${WMS_BASE}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=${layers}&SRS=EPSG:3857&WIDTH=1024&HEIGHT=1024&BBOX={bbox-epsg-3857}`;
}

// WAC dividido por região — evita URLs longas demais
const WAC_REGIOES = {
  norte: 'WAC_2825_CABO_ORANGE,WAC_2826_MONTE_RORAIMA,WAC_2827_SERRA_PACARAIMA,WAC_2892_PICO_DA_NEBLINA,WAC_2893_BOA_VISTA,WAC_2894_TUMUCUMAQUE,WAC_2895_MACAPA,WAC_2947_SANTAREM,WAC_2948_MANAUS,WAC_2949_SAO_GABRIEL_DA_CACHOEIRA,WAC_3012_CRUZEIRO_DO_SUL,WAC_3013_TABATINGA,WAC_3014_HUMAITA,WAC_3071_PORTO_VELHO,WAC_3072_TARAUACA',
  nordeste: 'WAC_2944_FORTALEZA,WAC_2945_SAO_LUIS,WAC_2946_BELEM,WAC_3015_ITAITUBA,WAC_3016_IMPERATRIZ,WAC_3017_TERESINA,WAC_3018_NATAL,WAC_3019_FERNANDO_DE_NORONHA,WAC_3066_RECIFE,WAC_3067_PETROLINA,WAC_3141_SALVADOR',
  centro: 'WAC_3068_PORTO_NACIONAL,WAC_3069_CACHIMBO,WAC_3070_JI_PARANA,WAC_3137_PRINCIPE_DA_BEIRA,WAC_3138_CUIABA,WAC_3139_ARAGARCAS,WAC_3140_BRASILIA,WAC_3191_RONDONOPOLIS,WAC_3192_CORUMBA,WAC_3260_BELA_VISTA,WAC_3261_CAMPO_GRANDE',
  sudeste: 'WAC_3189_BELO_HORIZONTE,WAC_3190_GOIANIA,WAC_3262_SAO_PAULO,WAC_3263_RIO_DE_JANEIRO',
  sul: 'WAC_3313_CURITIBA,WAC_3314_FOZ_DO_IGUACU,WAC_3383_URUGUAIANA,WAC_3384_PORTO_ALEGRE,WAC_3434_RIO_DA_PRATA',
};

const REA_ALL = 'CCV_REA_CY_CUIABA,CCV_REA_PI-PARINTINS,CCV_REA_WA_TABATINGA,CCV_REA_WB_BELEM,CCV_REA_WF_RECIFE,CCV_REA_WG_CAMPO_GRANDE,CCV_REA_WH_BELO_HORIZONTE,CCV_REA_WJ1_RIO_DE_JANEIRO,CCV_REA_WK_PORTO_SEGURO,CCV_REA_WN2_MANAUS,CCV_REA_WP_PORTO_ALEGRE,CCV_REA_WR_BRASILIA,CCV_REA_WS_SAO_LUIS';

const REA_ALL2 = 'CCV_REA_WX_SANTAREM,CCV_REA_WZ_FORTALEZA,CCV_REA_XF_FLORIANOPOLIS,CCV_REA_XK_MACAPA,CCV_REA_XN-ANAPOLIS,CCV_REA_XP1_SAO_PAULO,CCV_REA_XP2_SAO_PAULO,CCV_REA_XR_VITORIA,CCV_REA_XS_SALVADOR,CCV_REA_XT_NATAL';

function buildMapStyle(mostrarWac: boolean, mostrarRea: boolean) {
  const sources: any = {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  };

  const layers: any[] = [
    { id: 'osm-layer', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 },
  ];

  if (mostrarWac) {
    Object.entries(WAC_REGIOES).forEach(([regiao, layerNames]) => {
      sources[`wac-${regiao}`] = {
        type: 'raster',
        tiles: [buildWmsUrl(layerNames)],
        tileSize: 512,
      }
      layers.push({
        id: `wac-layer-${regiao}`,
        type: 'raster',
        source: `wac-${regiao}`,
        minzoom: 6,
        paint: { 'raster-opacity': 0.85 },
      });
    });
  }

  if (mostrarRea) {
    sources['rea-1'] = {
      type: 'raster',
      tiles: [buildWmsUrl(REA_ALL)],
      tileSize: 256,
    };
    sources['rea-2'] = {
      type: 'raster',
      tiles: [buildWmsUrl(REA_ALL2)],
      tileSize: 256,
    };
    layers.push(
      { id: 'rea-layer-1', type: 'raster', source: 'rea-1', paint: { 'raster-opacity': 0.9 } },
      { id: 'rea-layer-2', type: 'raster', source: 'rea-2', paint: { 'raster-opacity': 0.9 } },
    );
  }

  return { version: 8, sources, layers };
}

interface MapaBaseProps {
  center?: [number, number];
  zoom?: number;
  aerodromos?: any | null;
  espacosAereos?: any | null;
  mostrarEspacosAereos?: boolean;
  mostrarWac?: boolean;
  mostrarRea?: boolean;
  onPressAerodromo?: (icao: string) => void;
}

export function MapaBase({
  center = [-51.9253, -14.2350],
  zoom = 4,
  aerodromos,
  espacosAereos,
  mostrarEspacosAereos = true,
  mostrarWac = false,
  mostrarRea = false,
  onPressAerodromo,
}: MapaBaseProps) {
  const mapStyle = useMemo(
    () => buildMapStyle(mostrarWac, mostrarRea),
    [mostrarWac, mostrarRea]
  );

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={mapStyle}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <MapLibreGL.Camera
          centerCoordinate={center}
          zoomLevel={zoom}
          animationDuration={500}
        />

        {mostrarEspacosAereos && espacosAereos && (
          <MapLibreGL.ShapeSource id="airspaces" shape={espacosAereos}>
            <MapLibreGL.FillLayer
              id="airspaces-fill"
              style={{ fillColor: '#00bfff', fillOpacity: 0.08 }}
            />
            <MapLibreGL.LineLayer
              id="airspaces-line"
              style={{ lineColor: '#00bfff', lineWidth: 1.5, lineOpacity: 0.6 }}
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