import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Aerodromo } from '@/features/aerodromos/types';

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

const PANEL_HEIGHT = 230;

interface AerodromoPanelProps {
  aerodromo: Aerodromo;
  onFechar: () => void;
}

export function AerodromoPanel({ aerodromo, onFechar }: AerodromoPanelProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fechar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: PANEL_HEIGHT,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onFechar());
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={fechar}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.painel, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        <View style={styles.cabecalho}>
          <Text style={styles.emoji}>{TIPO_EMOJI[aerodromo.tipo] ?? '✈️'}</Text>
          <View style={styles.cabecalhoInfo}>
            <Text style={styles.icao}>{aerodromo.icao}</Text>
            <Text style={styles.tipo}>{TIPO_LABEL[aerodromo.tipo] ?? 'Aeródromo'}</Text>
          </View>
          <Pressable onPress={fechar} style={styles.botaoFechar} hitSlop={8}>
            <Ionicons name="close" size={22} color="#6B7280" />
          </Pressable>
        </View>

        <Text style={styles.nome} numberOfLines={2}>{aerodromo.nome}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={14} color="#4A9EFF" />
            <Text style={styles.infoTexto}>
              {aerodromo.municipio} · {aerodromo.regiao.replace('BR-', '')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="trending-up" size={14} color="#4A9EFF" />
            <Text style={styles.infoTexto}>{aerodromo.altitude_ft} ft</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botaoDetalhes}
          activeOpacity={0.8}
          onPress={() => {
            fechar();
            router.push(`/aerodromo/${aerodromo.icao}`);
          }}
        >
          <Text style={styles.botaoDetalhesTexto}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={18} color="#0a0f1e" />
        </TouchableOpacity>
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
    paddingBottom: 36,
    height: PANEL_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#6B7280',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
    opacity: 0.5,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  cabecalhoInfo: {
    flex: 1,
  },
  icao: {
    color: '#4A9EFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  tipo: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 1,
  },
  botaoFechar: {
    padding: 4,
  },
  nome: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.85,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoTexto: {
    color: '#6B7280',
    fontSize: 13,
  },
  botaoDetalhes: {
    backgroundColor: '#4A9EFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  botaoDetalhesTexto: {
    color: '#0a0f1e',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
