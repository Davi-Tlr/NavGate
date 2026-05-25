import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { buscarPorIcao } from '@/features/aerodromos/services/aerodromoService';
import { useFavoritos } from '@/features/favoritos/hooks/useFavoritos';
import { useRotaStore } from '@/features/rota/hooks/useRotaStore';
import { TIPO_LABEL, TIPO_ICONE } from '@/features/aerodromos/constants';
import { colors } from '@/constants/theme';

function tipoOperacao(tipo: string): string {
    if (tipo === 'large_airport' || tipo === 'medium_airport') return 'VFR / IFR';
    return 'VFR';
}

function provavelmenteTemMetar(icao: string): boolean {
    return icao.startsWith('SB');
}

function LinhaInfo({ icone, label, valor }: {
    icone: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    valor: string;
}) {
    return (
        <View style={styles.linhaInfo}>
            <Ionicons name={icone} size={18} color={colors.primary} style={styles.linhaIcone} />
            <View style={styles.linhaTexto}>
                <Text style={styles.linhaLabel}>{label}</Text>
                <Text style={styles.linhaValor}>{valor}</Text>
            </View>
        </View>
    );
}

export default function DetalheAerodromoScreen() {
    const { icao } = useLocalSearchParams<{ icao: string }>();
    const router = useRouter();
    const aerodromo = buscarPorIcao(icao ?? '');
    const { isFavorito, adicionarFavorito, removerFavorito } = useFavoritos();
    const { modoRota, adicionarAerodromo, setModoRota } = useRotaStore();

    const favoritado = isFavorito(icao ?? '');
    const temMetar = provavelmenteTemMetar(icao ?? '');

    const toggleFavorito = () => {
        if (!aerodromo) return;
        if (favoritado) removerFavorito(aerodromo.icao);
        else adicionarFavorito(aerodromo);
    };

    const verNoMapa = () => {
        if (!aerodromo) return;
        router.push({
            pathname: '/(tabs)/mapa',
            params: {
                lat: String(aerodromo.latitude),
                lng: String(aerodromo.longitude),
                icao: aerodromo.icao,
            },
        });
    };

    if (!aerodromo) {
        return (
            <View style={styles.erro}>
                <Ionicons name="alert-circle" size={48} color={colors.danger} />
                <Text style={styles.erroTexto}>Aeródromo não encontrado</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
                    <Text style={styles.botaoVoltarTexto}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const verCartas = () => {
        Linking.openURL(`https://aisweb.decea.mil.br/?i=cartas&icao=${aerodromo.icao}`);
    };

    const latStr = `${Math.abs(aerodromo.latitude).toFixed(4)}° ${aerodromo.latitude >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(aerodromo.longitude).toFixed(4)}° ${aerodromo.longitude >= 0 ? 'L' : 'O'}`;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>

            <View style={styles.cabecalho}>
                <Ionicons name={TIPO_ICONE[aerodromo.tipo]} size={40} color={colors.primary} style={styles.tipoIcone} />
                <View style={styles.cabecalhoInfo}>
                    <View style={styles.cabecalhoTopo}>
                        <Text style={styles.icao}>{aerodromo.icao}</Text>
                        {aerodromo.iata ? (
                            <View style={styles.iataBadge}>
                                <Text style={styles.iataTexto}>{aerodromo.iata}</Text>
                            </View>
                        ) : null}
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={toggleFavorito} style={styles.botaoFavorito}>
                            <Ionicons
                                name={favoritado ? "heart" : "heart-outline"}
                                size={28}
                                color={favoritado ? colors.danger : colors.textMuted}
                            />
                        </Pressable>
                    </View>
                    <Text style={styles.tipo}>{TIPO_LABEL[aerodromo.tipo]}</Text>
                </View>
            </View>

            <Text style={styles.nome}>{aerodromo.nome}</Text>

            <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Localização</Text>
                <LinhaInfo
                    icone="location"
                    label="Município"
                    valor={`${aerodromo.municipio} — ${aerodromo.regiao.replace('BR-', '')}`}
                />
                <LinhaInfo
                    icone="navigate"
                    label="Coordenadas"
                    valor={`${latStr}  ${lonStr}`}
                />
                <LinhaInfo
                    icone="trending-up"
                    label="Altitude"
                    valor={`${aerodromo.altitude_ft} ft  (${Math.round(aerodromo.altitude_ft * 0.3048)} m)`}
                />
                <LinhaInfo
                    icone="airplane"
                    label="Operação"
                    valor={tipoOperacao(aerodromo.tipo)}
                />
            </View>

            <TouchableOpacity
                style={[styles.botaoMetar, !temMetar && styles.botaoDesabilitado]}
                activeOpacity={temMetar ? 0.8 : 1}
                onPress={() => temMetar && router.push(`/metar/${aerodromo.icao}`)}
            >
                <Ionicons
                    name="partly-sunny"
                    size={20}
                    color={temMetar ? colors.background : colors.textMuted}
                />
                <Text style={[styles.botaoMetarTexto, !temMetar && styles.textoBloqueado]}>
                    {temMetar ? 'Ver METAR / TAF' : 'Sem estação meteorológica'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoMapa} activeOpacity={0.8} onPress={verNoMapa}>
                <Ionicons name="map" size={20} color={colors.primary} />
                <Text style={styles.botaoMapaTexto}>Ver no Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoAdicionarRota}
                activeOpacity={0.8}
                onPress={() => {
                    if (!modoRota) setModoRota(true);
                    adicionarAerodromo(aerodromo);
                    router.push('/(tabs)/mapa');
                }}
            >
                <Ionicons name="git-branch" size={20} color={colors.success} />
                <Text style={styles.botaoAdicionarRotaTexto}>Adicionar a Rota</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoCartas}
                activeOpacity={0.8}
                onPress={verCartas}
            >
                <Ionicons name="document-text" size={20} color={colors.textMuted} />
                <Text style={styles.botaoCartasTexto}>Ver Cartas no AISWEB</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    conteudo: { padding: 20, paddingBottom: 40 },
    cabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    tipoIcone: { marginRight: 16 },
    cabecalhoInfo: { flex: 1 },
    cabecalhoTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    icao: { color: colors.primary, fontSize: 28, fontWeight: 'bold' },
    iataBadge: { backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    iataTexto: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
    tipo: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
    botaoFavorito: { padding: 4 },
    nome: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 24, lineHeight: 24 },
    secao: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12 },
    secaoTitulo: { color: colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    linhaInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    linhaIcone: { marginRight: 12, marginTop: 1 },
    linhaTexto: { flex: 1 },
    linhaLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
    linhaValor: { color: colors.textPrimary, fontSize: 15 },
    botaoMetar: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        marginTop: 12,
    },
    botaoDesabilitado: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    botaoMetarTexto: { color: colors.background, fontSize: 16, fontWeight: 'bold' },
    textoBloqueado: { color: colors.textMuted },
    botaoMapa: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    botaoMapaTexto: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    erro: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
    erroTexto: { color: colors.textPrimary, fontSize: 16 },
    botaoVoltar: { backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
    botaoVoltarTexto: { color: colors.primary, fontSize: 15 },
    botaoCartas: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    botaoCartasTexto: {
        color: colors.textMuted,
        fontSize: 16,
        fontWeight: '600',
    },
    botaoAdicionarRota: {
        backgroundColor: colors.overlayGreen,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.success,
    },
    botaoAdicionarRotaTexto: {
        color: colors.success,
        fontSize: 16,
        fontWeight: '600',
    },
});
