import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator,
    TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryLine } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import { Waypoint } from '../types';
import { buscarPerfilTerreno, PontoElevacao } from '../services/perfilTerreno';

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
                        <Ionicons name="close" size={22} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading && (
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color="#4A9EFF" />
                    <Text style={styles.loadingTexto}>Calculando perfil...</Text>
                </View>
            )}

            {erro && (
                <View style={styles.centro}>
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text style={styles.erroTexto}>{erro}</Text>
                </View>
            )}

            {!loading && !erro && dados.length > 0 && (
                <ScrollView keyboardShouldPersistTaps="handled">
                    {/* Stats */}
                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ALT. MÁX. TERRENO</Text>
                            <Text style={styles.statValor}>{altMaxPes} ft</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>ALT. MÍN. SEGURA</Text>
                            <Text style={[styles.statValor, { color: '#22C55E' }]}>{altSeguraPes} ft</Text>
                        </View>
                    </View>

                    {/* Campo altitude planejada */}
                    <View style={styles.altitudePlaneadaContainer}>
                        <View style={styles.altitudePlaneadaRow}>
                            <View style={styles.altitudePlaneadaInfo}>
                                <Text style={styles.altitudePlaneadaLabel}>Altitude de cruzeiro planejada</Text>
                                <Text style={styles.altitudePlaneadaHint}>
                                    {altPlanejadaValida
                                        ? vooSeguro
                                            ? '✓ Seguro — acima do terreno + 1000 ft'
                                            : `⚠ Abaixo da altitude segura (${altSeguraPes} ft)`
                                        : 'Digite sua altitude de cruzeiro'
                                    }
                                </Text>
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
                                    placeholderTextColor="#6B7280"
                                />
                                <Text style={styles.ftLabel}>ft</Text>
                            </View>
                        </View>
                    </View>

                    {/* Gráfico */}
                    <VictoryChart
                        height={220}
                        padding={{ top: 20, bottom: 40, left: 60, right: 20 }}
                        domain={{
                            y: [Math.max(0, altMinPes - 50), domainMax],
                        }}
                    >
                        <VictoryAxis
                            style={{
                                axis: { stroke: '#2a3045' },
                                tickLabels: { fill: '#6B7280', fontSize: 10 },
                                grid: { stroke: 'transparent' },
                            }}
                            tickCount={5}
                        />
                        <VictoryAxis
                            dependentAxis
                            style={{
                                axis: { stroke: '#2a3045' },
                                tickLabels: { fill: '#6B7280', fontSize: 10 },
                                grid: { stroke: '#2a3045', strokeDasharray: '4,4' },
                            }}
                            tickFormat={(t: number) => `${t}ft`}
                        />

                        {/* Linha altitude mínima segura */}
                        <VictoryLine
                            data={[
                                { x: distMin, y: altSeguraPes },
                                { x: distMax, y: altSeguraPes },
                            ]}
                            style={{
                                data: {
                                    stroke: '#22C55E',
                                    strokeWidth: 1.5,
                                    strokeDasharray: '5,5',
                                },
                            }}
                        />

                        {/* Linha altitude planejada */}
                        {altPlanejadaValida && (
                            <VictoryLine
                                data={[
                                    { x: distMin, y: altPlanejadaNum },
                                    { x: distMax, y: altPlanejadaNum },
                                ]}
                                style={{
                                    data: {
                                        stroke: vooSeguro ? '#4A9EFF' : '#EF4444',
                                        strokeWidth: 2,
                                    },
                                }}
                            />
                        )}

                        {/* Terreno */}
                        <VictoryArea
                            data={dadosEmPes}
                            x="distancia"
                            y="altitude"
                            style={{
                                data: {
                                    fill: '#4A9EFF',
                                    fillOpacity: 0.3,
                                    stroke: '#4A9EFF',
                                    strokeWidth: 2,
                                },
                            }}
                        />
                    </VictoryChart>

                    {/* Legenda */}
                    <View style={styles.legendaContainer}>
                        <Text style={styles.legenda}>Distância em NM · Altitude em pés (MSL)</Text>
                        <View style={styles.legendaLinha}>
                            <Text style={styles.legendaVerde}>— — </Text>
                            <Text style={styles.legendaTexto}>Alt. mínima segura (+1000 ft)</Text>
                        </View>
                        {altPlanejadaValida && (
                            <View style={styles.legendaLinha}>
                                <Text style={[styles.legendaVerde, { color: vooSeguro ? '#4A9EFF' : '#EF4444' }]}>——— </Text>
                                <Text style={styles.legendaTexto}>Altitude planejada ({altPlanejadaNum} ft)</Text>
                            </View>
                        )}
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
        backgroundColor: '#1a2035',
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
        backgroundColor: '#6B7280',
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
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    centro: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    loadingTexto: { color: '#6B7280', fontSize: 14 },
    erroTexto: {
        color: '#EF4444',
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
        borderBottomColor: '#2a3045',
    },
    statItem: { alignItems: 'center' },
    statLabel: {
        color: '#6B7280',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
    },
    statValor: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    altitudePlaneadaContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a3045',
    },
    altitudePlaneadaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    altitudePlaneadaInfo: { flex: 1 },
    altitudePlaneadaLabel: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    altitudePlaneadaHint: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 2,
    },
    altitudePlaneadaInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    altitudePlaneadaInput: {
        backgroundColor: '#0a0f1e',
        borderRadius: 8,
        padding: 10,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#2a3045',
        width: 80,
        textAlign: 'center',
    },
    inputSeguro: { borderColor: '#4A9EFF' },
    inputPerigo: { borderColor: '#EF4444' },
    ftLabel: { color: '#6B7280', fontSize: 12 },
    legendaContainer: {
        alignItems: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    legenda: {
        color: '#6B7280',
        fontSize: 11,
        textAlign: 'center',
    },
    legendaLinha: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendaVerde: {
        color: '#22C55E',
        fontSize: 11,
        fontWeight: 'bold',
    },
    legendaTexto: {
        color: '#6B7280',
        fontSize: 11,
    },
});