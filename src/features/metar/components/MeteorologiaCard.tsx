import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMetar } from '../hooks/useMetar';
import { COR_CONDICAO } from '../utils';
import { colors } from '@/constants/theme';

interface MeteorologiaCardProps {
  icao: string;
  nome: string;
}

export function MeteorologiaCard({ icao, nome }: MeteorologiaCardProps) {
  const router = useRouter();
  const { metar, loading, erro, buscar } = useMetar();

  useEffect(() => {
    buscar(icao);
  }, [icao, buscar]);

  const handlePress = () => {
    router.push(`/metar/${icao}`);
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.centro]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (erro || !metar) {
    return (
      <TouchableOpacity style={styles.card} onPress={handlePress}>
        <View style={styles.infoPrincipal}>
          <Text style={styles.icao}>{icao}</Text>
          <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
        </View>
        <View style={styles.statusErro}>
          <Ionicons name="alert-circle" size={16} color={colors.textMuted} />
          <Text style={styles.erroTexto}>N/D</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.infoPrincipal}>
        <View style={styles.topoCard}>
          <Text style={styles.icao}>{metar.icao}</Text>
          <View style={[styles.badge, { backgroundColor: COR_CONDICAO[metar.condicao] }]}>
            <Text style={styles.badgeTexto}>{metar.condicao}</Text>
          </View>
        </View>
        <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
      </View>

      <View style={styles.detalhes}>
        <View style={styles.linhaDetalhe}>
          <Ionicons name="swap-horizontal" size={14} color={colors.textMuted} />
          <Text style={styles.detalheTexto}>
            {metar.vento_direcao}° / {metar.vento_velocidade}kt
          </Text>
        </View>
        <View style={styles.linhaDetalhe}>
          <Ionicons name="cloud" size={14} color={colors.textMuted} />
          <Text style={styles.detalheTexto} numberOfLines={1}>
            {metar.nuvens}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.surface} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    minHeight: 80,
  },
  centro: {
    justifyContent: 'center',
  },
  infoPrincipal: {
    flex: 1,
    marginRight: 8,
  },
  topoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  icao: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  nome: {
    color: colors.textPrimary,
    fontSize: 13,
    opacity: 0.8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeTexto: {
    color: colors.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  detalhes: {
    width: 120,
    gap: 4,
  },
  linhaDetalhe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detalheTexto: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  erroTexto: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
