import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Animated,
    TouchableWithoutFeedback, Switch, ScrollView, Pressable
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
    const slideAnim = useRef(new Animated.Value(500)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 3 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    }, []);

    const fechar = () => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 500, duration: 200, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onFechar());
    };

    const set = (key: keyof ConfigCamadas) => (value: boolean) => {
        onChange({ ...config, [key]: value });
    };

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <TouchableWithoutFeedback onPress={fechar}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
            </TouchableWithoutFeedback>

            <Animated.View style={[styles.painel, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.handle} />

                <View style={styles.cabecalho}>
                    <Text style={styles.titulo}>Camadas do Mapa</Text>
                    <Pressable onPress={fechar} hitSlop={8}>
                        <Ionicons name="close" size={22} color="#6B7280" />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

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
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1a2035',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '75%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#6B7280',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
        opacity: 0.5,
    },
    cabecalho: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titulo: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secaoTitulo: {
        color: '#6B7280',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 4,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    itemLabel: {
        color: '#ffffff',
        fontSize: 15,
    },
    separador: {
        height: 1,
        backgroundColor: '#2a3045',
        marginVertical: 12,
    },
});