import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Animated,
    Switch, ScrollView, Pressable, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ConfigCamadas {
    espacosAereos: boolean;
    wac: boolean;
    rea: boolean;
    aeroportos: boolean;
    aerodromos: boolean;
    heliportos: boolean;
    hidroavioes: boolean;
    satelite: boolean;
}

interface PainelCamadasProps {
    config: ConfigCamadas;
    onChange: (nova: ConfigCamadas) => void;
    onFechar: () => void;
}

function ItemToggle({ label, valor, onChange }: {
    label: string;
    valor: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <View style={styles.item}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Switch
                value={valor}
                onValueChange={onChange}
                trackColor={{ false: '#2a3045', true: '#4A9EFF' }}
                thumbColor={valor ? '#ffffff' : '#6B7280'}
            />
        </View>
    );
}

export function PainelCamadas({ config, onChange, onFechar }: PainelCamadasProps) {
    const slideAnim = useRef(new Animated.Value(600)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const dragOffset = useRef(new Animated.Value(0)).current;
    const currentDrag = useRef(0);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 3 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    }, []);

    const fechar = () => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 600, duration: 200, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onFechar());
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,

            onPanResponderGrant: () => {
                dragOffset.setValue(0);
                currentDrag.current = 0;
            },

            onPanResponderMove: (_, g) => {
                // Só permite arrastar pra baixo
                const dy = Math.max(0, g.dy);
                currentDrag.current = dy;
                dragOffset.setValue(dy);
            },

            onPanResponderRelease: (_, g) => {
                const dy = Math.max(0, g.dy);
                const velocidadeParaBaixo = g.vy > 0.8;

                if (dy > 100 || velocidadeParaBaixo) {
                    // Fecha com animação
                    fechar();
                } else {
                    // Volta para posição original
                    Animated.spring(dragOffset, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 4,
                    }).start();
                }
            },
        })
    ).current;

    const set = (key: keyof ConfigCamadas) => (value: boolean) => {
        onChange({ ...config, [key]: value });
    };

    // Combina a animação de entrada com o drag
    const translateY = Animated.add(slideAnim, dragOffset);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} pointerEvents="auto">
                <Pressable style={StyleSheet.absoluteFill} onPress={fechar} />
            </Animated.View>

            {/* Painel */}
            <Animated.View
                style={[styles.painel, { transform: [{ translateY }] }]}
                pointerEvents="auto"
            >
                {/* Handle arrastável */}
                <View style={styles.handleArea} {...panResponder.panHandlers}>
                    <View style={styles.handle} />
                    <View style={styles.cabecalho}>
                        <Text style={styles.titulo}>Camadas do Mapa</Text>
                        <Pressable onPress={fechar} hitSlop={12}>
                            <Ionicons name="close" size={22} color="#6B7280" />
                        </Pressable>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.secaoTitulo}>MAPA BASE</Text>
                    <ItemToggle label="Satélite (Esri)" valor={config.satelite} onChange={set('satelite')} />

                    <View style={styles.separador} />

                    <Text style={styles.secaoTitulo}>CARTAS AERONÁUTICAS</Text>
                    <ItemToggle label="WAC — Carta Mundial" valor={config.wac} onChange={set('wac')} />
                    <ItemToggle label="REA — Corredores Visuais" valor={config.rea} onChange={set('rea')} />

                    <View style={styles.separador} />

                    <Text style={styles.secaoTitulo}>DADOS</Text>
                    <ItemToggle label="Espaços Aéreos" valor={config.espacosAereos} onChange={set('espacosAereos')} />

                    <View style={styles.separador} />

                    <Text style={styles.secaoTitulo}>TIPOS DE AERÓDROMO</Text>
                    <ItemToggle label="Aeroportos (grande/regional)" valor={config.aeroportos} onChange={set('aeroportos')} />
                    <ItemToggle label="Aeródromos (pequeno)" valor={config.aerodromos} onChange={set('aerodromos')} />
                    <ItemToggle label="Heliportos" valor={config.heliportos} onChange={set('heliportos')} />
                    <ItemToggle label="Bases de Hidroaviões" valor={config.hidroavioes} onChange={set('hidroavioes')} />
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    painel: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#1a2035',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '75%',
        paddingBottom: 40,
    },
    handleArea: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 4,
    },
    handle: {
        width: 40, height: 4, backgroundColor: '#6B7280',
        borderRadius: 2, alignSelf: 'center', marginBottom: 12, opacity: 0.5,
    },
    cabecalho: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 8,
    },
    titulo: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 8 },
    secaoTitulo: {
        color: '#6B7280', fontSize: 11, fontWeight: '600',
        letterSpacing: 1, marginBottom: 8, marginTop: 4,
    },
    item: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 12,
    },
    itemLabel: { color: '#ffffff', fontSize: 15 },
    separador: { height: 1, backgroundColor: '#2a3045', marginVertical: 8 },
});