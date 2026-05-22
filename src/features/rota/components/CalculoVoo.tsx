import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, Modal, KeyboardAvoidingView,
    Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rota } from '../types';

interface CalculoVooProps {
    rota: Rota;
    visible: boolean;
    onFechar: () => void;
}

export function CalculoVoo({ rota, visible, onFechar }: CalculoVooProps) {
    const [velocidade, setVelocidade] = useState('');
    const [consumo, setConsumo] = useState('');
    const [horaSaida, setHoraSaida] = useState(() => {
        const agora = new Date();
        return `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
    });

    const velocidadeNum = parseFloat(velocidade);
    const consumoNum = parseFloat(consumo);
    const temVelocidade = velocidadeNum > 0;

    // Calcula tempo total em minutos
    const tempoTotalMin = temVelocidade
        ? (rota.distanciaTotalNM / velocidadeNum) * 60
        : 0;

    // Formata tempo
    const formatarTempo = (minutos: number) => {
        const h = Math.floor(minutos / 60);
        const m = Math.round(minutos % 60);
        if (h === 0) return `${m} min`;
        return `${h}h ${m.toString().padStart(2, '0')}min`;
    };

    // Calcula ETA
    const calcularETA = () => {
        if (!temVelocidade || !horaSaida) return null;
        const [h, m] = horaSaida.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return null;
        const totalMinutos = h * 60 + m + tempoTotalMin;
        const etaH = Math.floor(totalMinutos / 60) % 24;
        const etaM = Math.round(totalMinutos % 60);
        return `${etaH.toString().padStart(2, '0')}:${etaM.toString().padStart(2, '0')}`;
    };

    // Combustível total
    const combustivelTotal = temVelocidade && consumoNum > 0
        ? (tempoTotalMin / 60) * consumoNum
        : null;

    // Tempos por trecho
    const trechosComTempo = temVelocidade
        ? rota.trechos.map(t => ({
            ...t,
            tempoMin: (t.distanciaNM / velocidadeNum) * 60,
        }))
        : [];

    const eta = calcularETA();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onFechar}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} onPress={onFechar} />

                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    <View style={styles.headerRow}>
                        <Text style={styles.titulo}>Calcular Voo</Text>
                        <TouchableOpacity onPress={onFechar} hitSlop={8}>
                            <Ionicons name="close" size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Campos */}
                        <View style={styles.campos}>
                            <View style={styles.campo}>
                                <Text style={styles.campoLabel}>Velocidade de cruzeiro</Text>
                                <View style={styles.campoInput}>
                                    <TextInput
                                        style={styles.input}
                                        value={velocidade}
                                        onChangeText={setVelocidade}
                                        keyboardType="numeric"
                                        placeholder="ex: 90"
                                        placeholderTextColor="#6B7280"
                                        maxLength={4}
                                    />
                                    <Text style={styles.unidade}>kt</Text>
                                </View>
                            </View>

                            <View style={styles.campo}>
                                <Text style={styles.campoLabel}>Consumo  <Text style={styles.opcional}>(opcional)</Text></Text>
                                <View style={styles.campoInput}>
                                    <TextInput
                                        style={styles.input}
                                        value={consumo}
                                        onChangeText={setConsumo}
                                        keyboardType="numeric"
                                        placeholder="ex: 20"
                                        placeholderTextColor="#6B7280"
                                        maxLength={4}
                                    />
                                    <Text style={styles.unidade}>L/h</Text>
                                </View>
                            </View>

                            <View style={styles.campo}>
                                <Text style={styles.campoLabel}>Hora de saída  <Text style={styles.opcional}>(opcional)</Text></Text>
                                <View style={styles.campoInput}>
                                    <TextInput
                                        style={styles.input}
                                        value={horaSaida}
                                        onChangeText={setHoraSaida}
                                        keyboardType="numbers-and-punctuation"
                                        placeholder="09:00"
                                        placeholderTextColor="#6B7280"
                                        maxLength={5}
                                    />
                                    <Text style={styles.unidade}>UTC-3</Text>
                                </View>
                            </View>
                        </View>

                        {/* Resultado */}
                        {temVelocidade && (
                            <>
                                <View style={styles.separador} />

                                <View style={styles.resultado}>
                                    <View style={styles.resultadoItem}>
                                        <Text style={styles.resultadoLabel}>TEMPO TOTAL</Text>
                                        <Text style={styles.resultadoValor}>
                                            {formatarTempo(tempoTotalMin)}
                                        </Text>
                                    </View>

                                    {combustivelTotal !== null && (
                                        <View style={styles.resultadoItem}>
                                            <Text style={styles.resultadoLabel}>COMBUSTÍVEL</Text>
                                            <Text style={styles.resultadoValor}>
                                                {combustivelTotal.toFixed(1)} L
                                            </Text>
                                        </View>
                                    )}

                                    {eta && (
                                        <View style={styles.resultadoItem}>
                                            <Text style={styles.resultadoLabel}>ETA</Text>
                                            <Text style={[styles.resultadoValor, { color: '#22C55E' }]}>
                                                {eta}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Trechos */}
                                {trechosComTempo.length > 0 && (
                                    <>
                                        <View style={styles.separador} />
                                        <Text style={styles.trechosTitulo}>POR TRECHO</Text>
                                        {trechosComTempo.map((t, i) => (
                                            <View key={i} style={styles.trechoRow}>
                                                <View style={styles.trechoIndicador}>
                                                    <Text style={styles.trechoNum}>{i + 1}</Text>
                                                </View>
                                                <View style={styles.trechoInfo}>
                                                    <Text style={styles.trechoRumo}>
                                                        {t.rumoVerdadeiro.toFixed(0).padStart(3, '0')}° RV
                                                    </Text>
                                                    <Text style={styles.trechoDistancia}>
                                                        {t.distanciaNM.toFixed(1)} NM
                                                    </Text>
                                                </View>
                                                <Text style={styles.trechoTempo}>
                                                    {formatarTempo(t.tempoMin)}
                                                </Text>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {!temVelocidade && (
                            <View style={styles.dica}>
                                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                                <Text style={styles.dicaTexto}>
                                    Digite a velocidade de cruzeiro para calcular
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        backgroundColor: '#1a2035',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '85%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#6B7280',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
        opacity: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titulo: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    campos: {
        gap: 16,
    },
    campo: {
        gap: 6,
    },
    campoLabel: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    opcional: {
        color: '#6B7280',
        fontWeight: '400',
        fontSize: 13,
    },
    campoInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0f1e',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2a3045',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 0,
    },
    unidade: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '600',
    },
    separador: {
        height: 1,
        backgroundColor: '#2a3045',
        marginVertical: 20,
    },
    resultado: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    resultadoItem: {
        alignItems: 'center',
        gap: 4,
    },
    resultadoLabel: {
        color: '#6B7280',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
    },
    resultadoValor: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    trechosTitulo: {
        color: '#6B7280',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 12,
    },
    trechoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2a3045',
        gap: 12,
    },
    trechoIndicador: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2a3045',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trechoNum: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: 'bold',
    },
    trechoInfo: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    trechoRumo: {
        color: '#4A9EFF',
        fontSize: 14,
        fontWeight: '600',
    },
    trechoDistancia: {
        color: '#6B7280',
        fontSize: 14,
    },
    trechoTempo: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    dica: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 20,
        justifyContent: 'center',
    },
    dicaTexto: {
        color: '#6B7280',
        fontSize: 13,
    },
});