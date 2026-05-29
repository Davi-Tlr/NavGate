import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator,
    TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryLine } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import { Waypoint } from '../types';
import { buscarPerfilTerreno, PontoElevacao } from '../services/perfilTerreno';
import { colors } from '@/constants/theme';

interface PerfilTerrenoProps {
    waypoints: Waypoint[];
    onFechar: () => void;
}

const metrosParaPes = (m: number) => Math.round(m * 3.28084);

export function PerfilTerreno({ waypoints, onFechar }: PerfilTerrenoProps) {
    const [dados, setDados] = useState<PontoElevacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [altitudePlaneada, setAltitudePlaneada] = useState('1000');

    useEffect(() => {
        buscarPerfilTerreno(waypoints)
            .then(setDados)
            .catch(() => setErro('Não foi possível carregar o perfil de terreno.'))
            .finally(() => setLoading(false));
    }, []);

    const altMax = dados.length > 0 ? Math.max(...dados.map(d => d.altitude)) : 0;
    const altMin = dados.length > 0 ? Math.min(...dados.map(d => d.altitude)) : 0;
    const altMaxPes = metrosParaPes(altMax);
    const altMinPes = metrosParaPes(altMin);
    const altSeguraPes = altMaxPes + 1000;

    const altPlanejadaNum = parseInt(altitudePlaneada, 10) || 0;
    const altPlanejadaValida = altPlanejadaNum > 0;
    const vooSeguro = altPlanejadaValida && altPlanejadaNum >= altSeguraPes;

    const dadosEmPes = dados.map(d => ({ ...d, altitude: metrosParaPes(d.altitude) }));
    const distMin = dadosEmPes[0]?.distancia ?? 0;
    const distMax = dadosEmPes[dadosEmPes.length - 1]?.distancia ?? 20;

    const domainMax = Math.max(
        altSeguraPes + 100,
        altPlanejadaValida ? altPlanejadaNum + 100 : 0
    );

    const hintIcone = vooSeguro ? 'checkmark-circle' : 'warning';
    const hintCor = vooSeguro ? colors.success : colors.danger;
    const hintTexto = vooSeguro
        ? 'Seguro — acima do terreno + 1000 ft'
        : `Abaixo da altitude segura (${altSeguraPes} ft)`;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.handle} />
                <View style={styles.headerRow}>
                    <Text style={styles.titulo}>Perfil de Terreno</Text>
                    <TouchableOpacity onPress={onFechar} hitSlop={8}>
                        <Ionicons name="close" size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading && (
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingTexto}>Calculando perfil...</Text>
                </View>
            )}

            {erro && (
                <View style={styles.centro}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                    <Text style={styles.erroTexto}>{erro}</Text>
                </View>
            )}

            {!loading && !erro && dados.length > 0 && (
                <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ALT. MÁX. TERRENO</Text>
                            <Text style={styles.statValor}>{altMaxPes} ft</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ALT. MÍN. SEGURA</Text>
                            <Text style={[styles.statValor, { color: colors.success }]}>{altSeguraPes} ft</Text>
                        </View>
                    </View>

                    <View style={styles.altitudePlaneadaContainer}>
                        <View style={styles.altitudePlaneadaRow}>
                            <View style={styles.altitudePlaneadaInfo}>
                                <Text style={styles.altitudePlaneadaLabel}>Altitude de cruzeiro planejada</Text>
                                {altPlanejadaValida ? (
                                    <View style={styles.hintRow}>
                                        <Ionicons name={hintIcone} size={13} color={hintCor} />
                                        <Text style={[styles.altitudePlaneadaHint, { color: hintCor }]}>
                                            {hintTexto}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.altitudePlaneadaHint}>
                                        Digite sua altitude de cruzeiro
                                    </Text>
                                )}
                            </View>
                            <View style={styles.altitudePlaneadaInputContainer}>
                                <TextInput
                                    style={[
                                        styles.altitudePlaneadaInput,
                                        altPlanejadaValida && (vooSeguro
                                            ? styles.inputSeguro
                                            : styles.inputPerigo)
                                    ]}
                                    value={altitudePlaneada}
                                    onChangeText={setAltitudePlaneada}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    placeholder="ft"
                                    placeholderTextColor={colors.textMuted}
                                />
                                <Text style={styles.ftLabel}>ft</Text>
                            </View>
                        </View>
                    </View>

                    <VictoryChart
                        height={220}
                        padding={{ top: 20, bottom: 40, left: 60, right: 20 }}
                        domain={{
                            y: [Math.max(0, altMinPes - 50), domainMax],
                        }}
                    >
                        <VictoryAxis
                            style={{
                                axis: { stroke: colors.border },
                                tickLabels: { fill: colors.textMuted, fontSize: 10 },
                                grid: { stroke: 'transparent' },
                            }}
                            tickCount={5}
                        />
                        <VictoryAxis
                            dependentAxis
                            style={{
                                axis: { stroke: colors.border },
                                tickLabels: { fill: colors.textMuted, fontSize: 10 },
                                grid: { stroke: colors.border, strokeDasharray: '4,4' },
                            }}
                            tickFormat={(t: number) => `${t}ft`}
                        />

                        <VictoryLine
                            data={[
                                { x: distMin, y: altSeguraPes },
                                { x: distMax, y: altSeguraPes },
                            ]}
                            style={{
                                data: {
                                    stroke: colors.success,
                                    strokeWidth: 1.5,
                                    strokeDasharray: '5,5',
                                },
                            }}
                        />

                        {altPlanejadaValida && (
                            <VictoryLine
                                data={[
                                    { x: distMin, y: altPlanejadaNum },
                                    { x: distMax, y: altPlanejadaNum },
                                ]}
                                style={{
                                    data: {
                                        stroke: vooSeguro ? colors.primary : colors.danger,
                                        strokeWidth: 2,
                                    },
                                }}
                            />
                        )}

                        <VictoryArea
                            data={dadosEmPes}
                            x="distancia"
                            y="altitude"
                            style={{
                                data: {
                                    fill: colors.primary,
                                    fillOpacity: 0.3,
                                    stroke: colors.primary,
                                    strokeWidth: 2,
                                },
                            }}
                        />
                    </VictoryChart>

                    <View style={styles.legendaContainer}>
                        <Text style={styles.legenda}>Distância em NM · Altitude em pés (MSL)</Text>
                        <View style={styles.legendaLinha}>
                            <Text style={styles.legendaVerde}>— — </Text>
                            <Text style={styles.legendaTexto}>Alt. mínima segura (+1000 ft)</Text>
                        </View>
                        {altPlanejadaValida && (
                            <View style={styles.legendaLinha}>
                                <Text style={[styles.legendaVerde, { color: vooSeguro ? colors.primary : colors.danger }]}>——— </Text>
                                <Text style={styles.legendaTexto}>Altitude planejada ({altPlanejadaNum} ft)</Text>
                            </View>
                        )}
                        <Text style={styles.legendaNota}>
                            Margem de +1.000 ft — padrão geral para voo VFR em área não montanhosa
                        </Text>
                    </View>
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 32,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: colors.textMuted,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
        opacity: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titulo: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: 'bold',
    },
    centro: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    loadingTexto: { color: colors.textMuted, fontSize: 14 },
    erroTexto: {
        color: colors.danger,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statItem: { alignItems: 'center' },
    statLabel: {
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
    },
    statValor: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    altitudePlaneadaContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    altitudePlaneadaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    altitudePlaneadaInfo: { flex: 1 },
    altitudePlaneadaLabel: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    altitudePlaneadaHint: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    altitudePlaneadaInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    altitudePlaneadaInput: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: colors.border,
        width: 80,
        textAlign: 'center',
    },
    inputSeguro: { borderColor: colors.primary },
    inputPerigo: { borderColor: colors.danger },
    ftLabel: { color: colors.textMuted, fontSize: 12 },
    legendaContainer: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        gap: 4,
    },
    legenda: {
        color: colors.textMuted,
        fontSize: 11,
        textAlign: 'center',
    },
    legendaLinha: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendaVerde: {
        color: colors.success,
        fontSize: 11,
        fontWeight: 'bold',
    },
    legendaTexto: {
        color: colors.textMuted,
        fontSize: 11,
    },
    legendaNota: {
        color: colors.textMuted,
        fontSize: 11,
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 4,
    },
});