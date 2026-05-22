import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet,
    TouchableOpacity, Pressable, TextInput, Modal,
    Animated, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Rota, Waypoint } from '../types';
import { CalculoVoo } from './CalculoVoo';

interface PainelRotaProps {
    waypoints: Waypoint[];
    rota: Rota | null;
    mapHeight: number;
    onRemover: (id: string) => void;
    onLimpar: () => void;
    onFechar: () => void;
    onReordenar: (waypoints: Waypoint[]) => void;
    onRenomear: (id: string, novoLabel: string) => void;
    onVerPerfil: () => void;
    onVerNoMapa: (coords: [number, number]) => void;
}

export function PainelRota({
    waypoints, rota, mapHeight, onRemover, onLimpar, onFechar,
    onReordenar, onRenomear, onVerPerfil, onVerNoMapa
}: PainelRotaProps) {
    const [editando, setEditando] = useState<string | null>(null);
    const [novoNome, setNovoNome] = useState('');
    const [calculoAberto, setCalculoAberto] = useState(false);

    const SNAP_COLLAPSED = mapHeight > 0 ? mapHeight * 0.60 : 400;
    const SNAP_EXPANDED = mapHeight > 0 ? mapHeight * 0.88 : 600;
    const CLOSE_THRESHOLD = mapHeight > 0 ? mapHeight * 0.28 : 180;

    const snappedHeight = useRef(SNAP_COLLAPSED);
    const heightAnim = useRef(new Animated.Value(SNAP_COLLAPSED)).current;

    React.useEffect(() => {
        if (mapHeight > 0) {
            const v = mapHeight * 0.60;
            snappedHeight.current = v;
            heightAnim.setValue(v);
        }
    }, [mapHeight]);

    const snapTo = (target: number) => {
        snappedHeight.current = target;
        Animated.spring(heightAnim, {
            toValue: target,
            useNativeDriver: false,
            bounciness: 3,
            speed: 14,
        }).start();
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,

            onPanResponderGrant: () => {
                heightAnim.stopAnimation(val => {
                    snappedHeight.current = val;
                });
            },

            onPanResponderMove: (_, g) => {
                const next = snappedHeight.current - g.dy;
                const clamped = Math.max(CLOSE_THRESHOLD, Math.min(SNAP_EXPANDED, next));
                heightAnim.setValue(clamped);
            },

            onPanResponderRelease: (_, g) => {
                const finalHeight = snappedHeight.current - g.dy;
                const velocidadeParaBaixo = g.vy > 0.8;

                if (finalHeight < CLOSE_THRESHOLD || velocidadeParaBaixo) {
                    // Fecha diretamente — sem animar até 0 para evitar flicker
                    onFechar();
                } else if (finalHeight < (SNAP_COLLAPSED + SNAP_EXPANDED) / 2) {
                    snapTo(SNAP_COLLAPSED);
                } else {
                    snapTo(SNAP_EXPANDED);
                }
            },
        })
    ).current;

    const abrirRenomear = (wp: Waypoint) => {
        setEditando(wp.id);
        setNovoNome(wp.label);
    };

    const confirmarRenomear = () => {
        if (editando && novoNome.trim()) {
            onRenomear(editando, novoNome.trim());
        }
        setEditando(null);
    };

    const getCoords = (wp: Waypoint): [number, number] | null => {
        if (wp.aerodromo) return [wp.aerodromo.longitude, wp.aerodromo.latitude];
        if (wp.coordenadas) return wp.coordenadas;
        return null;
    };

    const renderItem = ({ item: wp, drag, isActive, getIndex }: RenderItemParams<Waypoint>) => {
        const index = getIndex() ?? 0;
        const isOrigem = index === 0;
        const isDestino = index === waypoints.length - 1;
        const coords = getCoords(wp);

        return (
            <ScaleDecorator>
                <View style={[styles.waypointRow, isActive && styles.waypointAtivo]}>
                    <View style={styles.waypointIndicador}>
                        <View style={[
                            styles.waypointDot,
                            isOrigem && styles.dotOrigem,
                            isDestino && styles.dotDestino,
                        ]} />
                        {!isDestino && <View style={styles.waypointLinha} />}
                    </View>

                    <View style={styles.waypointInfo}>
                        <TouchableOpacity onLongPress={abrirRenomear.bind(null, wp)}>
                            <Text style={styles.waypointIcao}>{wp.label}</Text>
                        </TouchableOpacity>
                        <Text style={styles.waypointNome} numberOfLines={1}>
                            {wp.aerodromo
                                ? `${wp.aerodromo.municipio} · ${wp.aerodromo.regiao.replace('BR-', '')}`
                                : 'Ponto livre'}
                        </Text>
                        {rota && index < waypoints.length - 1 && (
                            <View style={styles.trechoInfo}>
                                <Ionicons name="navigate" size={12} color="#4A9EFF" />
                                <Text style={styles.trechoTexto}>
                                    {rota.trechos[index].rumoVerdadeiro.toFixed(0).padStart(3, '0')}° RV
                                    {' · '}
                                    {rota.trechos[index].distanciaNM.toFixed(1)} NM
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.acoes}>
                        {coords && (
                            <TouchableOpacity onPress={() => onVerNoMapa(coords)} hitSlop={8}>
                                <Ionicons name="locate" size={18} color="#4A9EFF" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => onRemover(wp.id)} hitSlop={8}>
                            <Ionicons name="close-circle" size={20} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity onLongPress={drag} hitSlop={8} style={styles.dragHandle}>
                            <Ionicons name="reorder-three" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScaleDecorator>
        );
    };

    return (
        <Animated.View style={[styles.container, { height: heightAnim }]}>
            <Modal visible={editando !== null} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitulo}>Renomear ponto</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={novoNome}
                            onChangeText={setNovoNome}
                            autoFocus
                            selectTextOnFocus
                            maxLength={20}
                            placeholderTextColor="#6B7280"
                        />
                        <View style={styles.modalBotoes}>
                            <TouchableOpacity style={styles.modalBotaoCancelar} onPress={() => setEditando(null)}>
                                <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBotaoConfirmar} onPress={confirmarRenomear}>
                                <Text style={styles.modalBotaoConfirmarTexto}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {rota && (
                <CalculoVoo
                    rota={rota}
                    visible={calculoAberto}
                    onFechar={() => setCalculoAberto(false)}
                />
            )}

            <View style={styles.handleArea} {...panResponder.panHandlers}>
                <View style={styles.handle} />
                <View style={styles.headerRow}>
                    <Text style={styles.titulo}>Planejamento de Rota</Text>
                    <View style={styles.headerBotoes}>
                        {waypoints.length > 0 && (
                            <TouchableOpacity onPress={onLimpar} style={styles.botaoLimpar}>
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        )}
                        <Pressable onPress={onFechar} hitSlop={8}>
                            <Ionicons name="close" size={22} color="#6B7280" />
                        </Pressable>
                    </View>
                </View>
            </View>

            {waypoints.length === 0 ? (
                <View style={styles.vazio}>
                    <Ionicons name="navigate-outline" size={48} color="#2a3045" />
                    <Text style={styles.vazioTitulo}>Nenhum ponto adicionado</Text>
                    <Text style={styles.vazioTexto}>
                        Toque em um aeródromo ou segure{'\n'}no mapa para adicionar à rota
                    </Text>
                </View>
            ) : (
                <View style={styles.conteudo}>
                    <DraggableFlatList
                        data={waypoints}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        onDragEnd={({ data }) => onReordenar(data)}
                        containerStyle={styles.lista}
                    />

                    {rota ? (
                        <View style={styles.rodape}>
                            <View style={styles.total}>
                                <Text style={styles.totalLabel}>DISTÂNCIA TOTAL</Text>
                                <Text style={styles.totalValor}>
                                    {rota.distanciaTotalNM.toFixed(1)} NM
                                </Text>
                            </View>
                            <View style={styles.botoesAcao}>
                                <TouchableOpacity
                                    style={styles.botaoAcao}
                                    onPress={() => setCalculoAberto(true)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="calculator-outline" size={16} color="#22C55E" />
                                    <Text style={[styles.botaoAcaoTexto, { color: '#22C55E' }]}>Calcular Voo</Text>
                                </TouchableOpacity>
                                <View style={styles.botaoDivisor} />
                                <TouchableOpacity
                                    style={styles.botaoAcao}
                                    onPress={onVerPerfil}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="trending-up" size={16} color="#4A9EFF" />
                                    <Text style={[styles.botaoAcaoTexto, { color: '#4A9EFF' }]}>Perfil de Terreno</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.rodape}>
                            <Text style={styles.dica}>Adicione mais um ponto para calcular a rota</Text>
                        </View>
                    )}
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#1a2035',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        elevation: 8,
    },
    handleArea: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    handle: {
        width: 40, height: 4, backgroundColor: '#6B7280',
        borderRadius: 2, alignSelf: 'center', marginBottom: 12, opacity: 0.5,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titulo: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
    headerBotoes: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    botaoLimpar: { padding: 4 },
    conteudo: { flex: 1 },
    lista: { flex: 1, paddingHorizontal: 20 },
    vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
    vazioTitulo: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    vazioTexto: { color: '#6B7280', fontSize: 14, textAlign: 'center', lineHeight: 20 },
    waypointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, borderRadius: 8, paddingVertical: 4 },
    waypointAtivo: { backgroundColor: '#0a2010' },
    waypointIndicador: { alignItems: 'center', width: 24, marginRight: 12, marginTop: 4 },
    waypointDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4A9EFF', borderWidth: 2, borderColor: '#ffffff' },
    dotOrigem: { backgroundColor: '#22C55E' },
    dotDestino: { backgroundColor: '#EF4444' },
    waypointLinha: { width: 2, height: 40, backgroundColor: '#4A9EFF', opacity: 0.4, marginTop: 2 },
    waypointInfo: { flex: 1, paddingBottom: 8 },
    waypointIcao: { color: '#4A9EFF', fontSize: 16, fontWeight: 'bold' },
    waypointNome: { color: '#6B7280', fontSize: 13, marginTop: 2 },
    trechoInfo: {
        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
        backgroundColor: '#0a0f1e', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
    },
    trechoTexto: { color: '#4A9EFF', fontSize: 13, fontWeight: '600' },
    acoes: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 2 },
    dragHandle: { padding: 4 },
    rodape: { borderTopWidth: 1, borderTopColor: '#2a3045', paddingHorizontal: 20, paddingBottom: 32 },
    total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    totalLabel: { color: '#6B7280', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
    totalValor: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
    botoesAcao: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2a3045' },
    botaoAcao: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
    botaoDivisor: { width: 1, backgroundColor: '#2a3045', marginVertical: 8 },
    botaoAcaoTexto: { fontSize: 13, fontWeight: '600' },
    dica: { color: '#6B7280', fontSize: 13, textAlign: 'center', paddingVertical: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: '#1a2035', borderRadius: 16, padding: 24, width: '80%', gap: 16 },
    modalTitulo: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
    modalInput: { backgroundColor: '#0a0f1e', borderRadius: 10, padding: 12, color: '#ffffff', fontSize: 16, borderWidth: 1, borderColor: '#2a3045' },
    modalBotoes: { flexDirection: 'row', gap: 12 },
    modalBotaoCancelar: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#2a3045', alignItems: 'center' },
    modalBotaoCancelarTexto: { color: '#6B7280', fontWeight: '600' },
    modalBotaoConfirmar: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#22C55E', alignItems: 'center' },
    modalBotaoConfirmarTexto: { color: '#0a0f1e', fontWeight: 'bold' },
});