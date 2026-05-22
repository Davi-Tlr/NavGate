import { useEffect } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    StyleSheet, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMetar } from '@/features/metar/hooks/useMetar';

function grausParaDirecao(graus: number): string {
    if (graus === 0) return 'Variável';
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE',
        'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    return dirs[Math.round(graus / 22.5) % 16];
}

function LinhaDetalhe({ icone, label, valor, cor }: {
    icone: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    valor: string;
    cor?: string;
}) {
    return (
        <View style={styles.linhaDetalhe}>
            <Ionicons name={icone} size={18} color="#4A9EFF" style={styles.linhaIcone} />
            <View style={styles.linhaTexto}>
                <Text style={styles.linhaLabel}>{label}</Text>
                <Text style={[styles.linhaValor, cor ? { color: cor } : undefined]}>
                    {valor}
                </Text>
            </View>
        </View>
    );
}

export default function MetarScreen() {
    const { icao } = useLocalSearchParams<{ icao: string }>();
    const { loading, metar, taf, erro, buscar } = useMetar();

    useEffect(() => {
        if (icao) buscar(icao);
    }, [icao]);

    if (loading) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color="#4A9EFF" />
                <Text style={styles.carregandoTexto}>Buscando METAR...</Text>
            </View>
        );
    }

    if (erro) {
        const semConexao = erro.toLowerCase().includes('network') ||
            erro.toLowerCase().includes('fetch') ||
            erro.toLowerCase().includes('connection');

        return (
            <View style={styles.centro}>
                <Ionicons
                    name={semConexao ? 'wifi-outline' : 'cloud-offline'}
                    size={48}
                    color="#EF4444"
                />
                <Text style={styles.erroTexto}>
                    {semConexao
                        ? 'Sem conexão com a internet'
                        : 'Nenhum METAR disponível para este aeródromo'}
                </Text>
                <Text style={styles.erroSub}>
                    {semConexao
                        ? 'Verifique sua conexão e tente novamente'
                        : 'Este aeródromo pode não ter estação meteorológica ativa'}
                </Text>
                {semConexao && (
                    <TouchableOpacity
                        style={styles.botaoRetry}
                        onPress={() => icao && buscar(icao)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="refresh" size={16} color="#0a0f1e" />
                        <Text style={styles.botaoRetryTexto}>Tentar novamente</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (!metar) {
        return <View style={{ flex: 1, backgroundColor: '#0a0f1e' }} />;
    }

    const ventoTexto = metar.vento_velocidade === 0
        ? 'Calmaria'
        : `${grausParaDirecao(metar.vento_direcao)} (${metar.vento_direcao}°) — ${metar.vento_velocidade} kt${metar.vento_rajada ? ` (rajadas ${metar.vento_rajada} kt)` : ''}`;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
            <View style={[styles.condicaoCard, { borderColor: metar.cor_condicao }]}>
                <View style={[styles.condicaoBadge, { backgroundColor: metar.cor_condicao }]}>
                    <Text style={styles.condicaoTexto}>{metar.condicao}</Text>
                </View>
                <Text style={styles.condicaoIcao}>{metar.icao}</Text>
                <Text style={styles.condicaoHora}>Atualizado às {metar.hora}</Text>
            </View>

            <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Condições Atuais</Text>
                <LinhaDetalhe icone="navigate" label="Vento" valor={ventoTexto} />
                <LinhaDetalhe icone="eye" label="Visibilidade" valor={metar.visibilidade} />
                <LinhaDetalhe icone="cloud" label="Nuvens" valor={metar.nuvens} />
                <LinhaDetalhe
                    icone="thermometer"
                    label="Temperatura / Orvalho"
                    valor={`${metar.temperatura}°C / ${metar.ponto_orvalho}°C`}
                />
                <LinhaDetalhe icone="speedometer" label="QNH" valor={`${metar.qnh} hPa`} />
            </View>

            <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Mensagem Original</Text>
                <View style={styles.rawContainer}>
                    <Text style={styles.rawTexto}>{metar.raw}</Text>
                </View>
            </View>

            {taf && (
                <View style={styles.secao}>
                    <Text style={styles.secaoTitulo}>TAF — Previsão</Text>
                    <View style={styles.rawContainer}>
                        <Text style={styles.rawTexto}>{taf}</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0f1e' },
    conteudo: { padding: 20, paddingBottom: 40 },
    centro: {
        flex: 1,
        backgroundColor: '#0a0f1e',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
    },
    carregandoTexto: { color: '#6B7280', fontSize: 14 },
    erroTexto: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
    erroSub: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
    botaoRetry: {
        marginTop: 8,
        backgroundColor: '#4A9EFF',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    botaoRetryTexto: { color: '#0a0f1e', fontSize: 14, fontWeight: '700' },
    condicaoCard: {
        borderRadius: 14,
        borderWidth: 2,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#1a2035',
    },
    condicaoBadge: {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 8,
    },
    condicaoTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
    condicaoIcao: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
    condicaoHora: { color: '#6B7280', fontSize: 13, marginTop: 4 },
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
    linhaDetalhe: { flexDirection: 'row', marginBottom: 12 },
    linhaIcone: { marginRight: 12, marginTop: 1 },
    linhaTexto: { flex: 1 },
    linhaLabel: { color: '#6B7280', fontSize: 12, marginBottom: 2 },
    linhaValor: { color: '#ffffff', fontSize: 15 },
    rawContainer: { backgroundColor: '#0a0f1e', borderRadius: 8, padding: 12 },
    rawTexto: { color: '#4A9EFF', fontSize: 13, fontFamily: 'monospace', lineHeight: 20 },
});