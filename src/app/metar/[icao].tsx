import { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { MapaBase } from '@/features/mapa/components/MapaBase';
import { AerodromoPanel } from '@/features/mapa/components/AerodromoPanel';
import { PainelCamadas, ConfigCamadas } from '@/features/mapa/components/PainelCamadas';
import { PainelRota } from '@/features/rota/components/PainelRota';
import { PerfilTerreno } from '@/features/rota/components/PerfilTerreno';
import { useRota } from '@/features/rota/hooks/useRotaStore';
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
    satelite: false,
};

export default function MapaScreen() {
    const [espacosAereos, setEspacosAereos] = useState<any>(null);
    const [selecionado, setSelecionado] = useState<Aerodromo | null>(null);
    const [center, setCenter] = useState<[number, number]>([-51.9253, -14.2350]);
    const [zoom, setZoom] = useState(4);
    const [localizando, setLocalizando] = useState(false);
    const [gpsNegado, setGpsNegado] = useState(false);
    const [painelAberto, setPainelAberto] = useState(false);
    const [painelRotaAberto, setPainelRotaAberto] = useState(false);
    const [perfilAberto, setPerfilAberto] = useState(false);
    const [config, setConfig] = useState<ConfigCamadas>(CONFIG_PADRAO);
    const [mapHeight, setMapHeight] = useState(0);
    const tooltipOpacity = useRef(new Animated.Value(0)).current;

    const {
        waypoints, rota, linhaGeoJSON, modoRota,
        adicionarAerodromo, adicionarPontoLivre,
        removerWaypoint, limparRota, setModoRota,
        onboardingVisto, marcarOnboardingVisto,
        reordenarWaypoints, renomearWaypoint,
    } = useRota();

    const params = useLocalSearchParams<{ lat?: string; lng?: string; icao?: string }>();

    const aerodromosFiltrados = useMemo(
        () => mapaService.getAerodromosGeoJSON({
            aeroportos: config.aeroportos,
            aerodromos: config.aerodromos,
            heliportos: config.heliportos,
            hidroavioes: config.hidroavioes,
        }),
        [config.aeroportos, config.aerodromos, config.heliportos, config.hidroavioes]
    );

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

    useEffect(() => {
        if (modoRota && !onboardingVisto) {
            Animated.sequence([
                Animated.timing(tooltipOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(3000),
                Animated.timing(tooltipOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => marcarOnboardingVisto());
        }
    }, [modoRota]);

    const handlePressAerodromo = (icao: string) => {
        const aerodromo = buscarPorIcao(icao);
        if (!aerodromo) return;

        if (modoRota) {
            // Bloqueia duplicado consecutivo com feedback
            const ultimo = waypoints[waypoints.length - 1];
            if (ultimo?.aerodromo?.icao === icao) {
                Alert.alert(
                    'Já adicionado',
                    `${icao} já é o último ponto da rota. Adicione um destino diferente.`
                );
                return;
            }
            adicionarAerodromo(aerodromo);
            setPainelRotaAberto(true);
            return;
        }

        setSelecionado(aerodromo);
    };

    const handleLongPressAerodromo = (icao: string) => {
        if (!modoRota) return;
        const aerodromo = buscarPorIcao(icao);
        if (aerodromo) {
            const ultimo = waypoints[waypoints.length - 1];
            if (ultimo?.aerodromo?.icao === icao) return;
            adicionarAerodromo(aerodromo);
            setPainelRotaAberto(true);
        }
    };

    const handleLongPressMapa = (coords: [number, number]) => {
        if (!modoRota) return;
        adicionarPontoLivre(coords);
        setPainelRotaAberto(true);
    };

    const handleVerNoMapa = (coords: [number, number]) => {
        setPainelRotaAberto(false);
        setCenter(coords);
        setZoom(13);
    };

    const irParaMinhaLocalizacao = async () => {
        if (gpsNegado) {
            Alert.alert(
                'Permissão negada',
                'Vá em Configurações > Aplicativos > NavGate > Permissões e ative a localização.'
            );
            return;
        }

        setLocalizando(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setGpsNegado(true);
                return;
            }
            setGpsNegado(false);
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

    const toggleModoRota = () => {
        if (modoRota) {
            setPainelRotaAberto(true);
        } else {
            setModoRota(true);
            setSelecionado(null);
            setPainelRotaAberto(true);
        }
    };

    return (
        <View
            style={styles.container}
            onLayout={e => setMapHeight(e.nativeEvent.layout.height)}
        >
            <MapaBase
                center={center}
                zoom={zoom}
                aerodromos={aerodromosFiltrados}
                espacosAereos={espacosAereos}
                linhaRota={linhaGeoJSON}
                mostrarEspacosAereos={config.espacosAereos}
                mostrarWac={config.wac}
                mostrarRea={config.rea}
                satelite={config.satelite}
                onPressAerodromo={handlePressAerodromo}
                onLongPressAerodromo={handleLongPressAerodromo}
                onLongPressMapa={handleLongPressMapa}
            />

            {modoRota && (
                <Animated.View style={[styles.tooltip, { opacity: tooltipOpacity }]}>
                    <Ionicons name="hand-left-outline" size={16} color="#22C55E" />
                    <Text style={styles.tooltipTexto}>
                        Toque em um aeródromo ou segure no mapa para adicionar à rota
                    </Text>
                </Animated.View>
            )}

            {modoRota && (
                <TouchableOpacity
                    style={styles.botaoDesativarRota}
                    onPress={() => setModoRota(false)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close" size={16} color="#EF4444" />
                    <Text style={styles.botaoDesativarRotaTexto}>Sair da Rota</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.botaoRota, modoRota && styles.botaoRotaAtivo]}
                onPress={toggleModoRota}
                activeOpacity={0.8}
            >
                <Ionicons name="git-branch" size={22} color={modoRota ? '#0a0f1e' : '#22C55E'} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoCamadas}
                onPress={() => setPainelAberto(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="layers" size={22} color="#4A9EFF" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.botaoGps, gpsNegado && styles.botaoGpsNegado]}
                onPress={irParaMinhaLocalizacao}
                activeOpacity={0.8}
                disabled={localizando}
            >
                {localizando ? (
                    <ActivityIndicator size="small" color="#4A9EFF" />
                ) : (
                    <Ionicons
                        name={gpsNegado ? 'locate-outline' : 'locate'}
                        size={22}
                        color={gpsNegado ? '#EF4444' : '#4A9EFF'}
                    />
                )}
            </TouchableOpacity>

            {selecionado && !modoRota && (
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

            {painelRotaAberto && mapHeight > 0 && (
                <PainelRota
                    waypoints={waypoints}
                    rota={rota}
                    mapHeight={mapHeight}
                    onRemover={removerWaypoint}
                    onLimpar={limparRota}
                    onFechar={() => setPainelRotaAberto(false)}
                    onReordenar={reordenarWaypoints}
                    onRenomear={renomearWaypoint}
                    onVerPerfil={() => {
                        setPainelRotaAberto(false);
                        setPerfilAberto(true);
                    }}
                    onVerNoMapa={handleVerNoMapa}
                />
            )}

            {perfilAberto && waypoints.length >= 2 && (
                <PerfilTerreno
                    waypoints={waypoints}
                    onFechar={() => setPerfilAberto(false)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0f1e' },
    tooltip: {
        position: 'absolute',
        top: 16, left: 16, right: 72,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#0a2010',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#22C55E',
    },
    tooltipTexto: { color: '#22C55E', fontSize: 13, flex: 1, lineHeight: 18 },
    botaoDesativarRota: {
        position: 'absolute',
        top: 16, right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#1a0505',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    botaoDesativarRotaTexto: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
    botaoRota: {
        position: 'absolute',
        bottom: 220, right: 16,
        width: 48, height: 48,
        borderRadius: 24,
        backgroundColor: '#1a2035',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#22C55E',
        elevation: 4,
    },
    botaoRotaAtivo: { backgroundColor: '#22C55E' },
    botaoCamadas: {
        position: 'absolute',
        bottom: 160, right: 16,
        width: 48, height: 48,
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
        bottom: 100, right: 16,
        width: 48, height: 48,
        borderRadius: 24,
        backgroundColor: '#1a2035',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#4A9EFF',
        elevation: 4,
    },
    botaoGpsNegado: {
        borderColor: '#EF4444',
    },
});