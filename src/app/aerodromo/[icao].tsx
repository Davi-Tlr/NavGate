import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { buscarPorIcao } from '@/features/aerodromos/services/aerodromoService';
import { useFavoritos } from '@/features/favoritos/hooks/useFavoritos';

const TIPO_LABEL: Record<string, string> = {
    large_airport: 'Aeroporto Internacional',
    medium_airport: 'Aeroporto Regional',
    small_airport: 'Aeródromo',
    heliport: 'Heliporto',
    seaplane_base: 'Base de Hidroaviões',
};

const TIPO_EMOJI: Record<string, string> = {
    large_airport: '✈️',
    medium_airport: '🛫',
    small_airport: '🛩️',
    heliport: '🚁',
    seaplane_base: '🛥️',
};

// Componente reutilizável para cada linha de informação
function LinhaInfo({ icone, label, valor }: {
    icone: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    valor: string;
}) {
    return (
        <View style={styles.linhaInfo}>
            <Ionicons name={icone} size={18} color="#4A9EFF" style={styles.linhaIcone} />
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
    const favoritado = isFavorito(icao ?? '');

    const toggleFavorito = () => {
        if (!aerodromo) return;
        if (favoritado) {
            removerFavorito(aerodromo.icao);
        } else {
            adicionarFavorito(aerodromo);
        }
    };

    // Aeródromo não encontrado — não deve acontecer, mas tratamos o caso
    if (!aerodromo) {
        return (
            <View style={styles.erro}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.erroTexto}>Aeródromo não encontrado</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
                    <Text style={styles.botaoVoltarTexto}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Formata coordenadas para exibição legível
    const latStr = `${Math.abs(aerodromo.latitude).toFixed(4)}° ${aerodromo.latitude >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(aerodromo.longitude).toFixed(4)}° ${aerodromo.longitude >= 0 ? 'L' : 'O'}`;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>

            {/* Cabeçalho com ICAO e tipo */}
            <View style={styles.cabecalho}>
                <Text style={styles.emoji}>{TIPO_EMOJI[aerodromo.tipo] ?? '✈️'}</Text>
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
                                color={favoritado ? "#EF4444" : "#6B7280"} 
                            />
                        </Pressable>
                    </View>
                    <Text style={styles.tipo}>{TIPO_LABEL[aerodromo.tipo] ?? 'Aeródromo'}</Text>
                </View>
            </View>

            {/* Nome completo */}
            <Text style={styles.nome}>{aerodromo.nome}</Text>

            {/* Seção de informações */}
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
            </View>

            {/* Botão METAR/TAF */}
            <TouchableOpacity
                style={styles.botaoMetar}
                activeOpacity={0.8}
                onPress={() => router.push(`/metar/${aerodromo.icao}`)}
            >
                <Ionicons name="partly-sunny" size={20} color="#0a0f1e" />
                <Text style={styles.botaoMetarTexto}>Ver METAR / TAF</Text>
            </TouchableOpacity>

            {/* Botão Ver no Mapa — vai ser ativado quando o mapa estiver pronto */}
            <TouchableOpacity style={styles.botaoMapa} activeOpacity={0.8}>
                <Ionicons name="map" size={20} color="#4A9EFF" />
                <Text style={styles.botaoMapaTexto}>Ver no Mapa</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1e',
    },
    conteudo: {
        padding: 20,
        paddingBottom: 40,
    },
    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    emoji: {
        fontSize: 40,
        marginRight: 16,
    },
    cabecalhoInfo: {
        flex: 1,
    },
    cabecalhoTopo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    icao: {
        color: '#4A9EFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    iataBadge: {
        backgroundColor: '#1a2035',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    iataTexto: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '600',
    },
    tipo: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 2,
    },
    botaoFavorito: {
        padding: 4,
    },
    nome: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 24,
        lineHeight: 24,
    },
    secao: {
        backgroundColor: '#1a2035',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    secaoTitulo: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    linhaInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    linhaIcone: {
        marginRight: 12,
        marginTop: 1,
    },
    linhaTexto: {
        flex: 1,
    },
    linhaLabel: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 2,
    },
    linhaValor: {
        color: '#ffffff',
        fontSize: 15,
    },
    botaoMetar: {
        backgroundColor: '#4A9EFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        marginTop: 12,
    },
    botaoMetarTexto: {
        color: '#0a0f1e',
        fontSize: 16,
        fontWeight: 'bold',
    },
    botaoMapa: {
        backgroundColor: '#1a2035',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#4A9EFF',
    },
    botaoMapaTexto: {
        color: '#4A9EFF',
        fontSize: 16,
        fontWeight: '600',
    },
    erro: {
        flex: 1,
        backgroundColor: '#0a0f1e',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    erroTexto: {
        color: '#ffffff',
        fontSize: 16,
    },
    botaoVoltar: {
        backgroundColor: '#1a2035',
        borderRadius: 10,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    botaoVoltarTexto: {
        color: '#4A9EFF',
        fontSize: 15,
    },
});