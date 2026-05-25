import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '@/features/favoritos/hooks/useFavoritos';
import { MeteorologiaCard } from '@/features/metar/components/MeteorologiaCard';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';

function CardSemEstacao({ icao, nome }: { icao: string; nome: string }) {
  return (
    <View style={styles.cardSemEstacao}>
      <View style={styles.cardSemEstacaoLeft}>
        <Text style={styles.cardSemEstacaoIcao}>{icao}</Text>
        <Text style={styles.cardSemEstacaoNome} numberOfLines={1}>{nome}</Text>
      </View>
      <View style={styles.cardSemEstacaoBadge}>
        <Ionicons name="cloud-offline-outline" size={14} color={colors.textMuted} />
        <Text style={styles.cardSemEstacaoTexto}>Sem estação</Text>
      </View>
    </View>
  );
}

export default function MeteorologiaScreen() {
  const { favoritos, fetchFavoritos } = useFavoritos();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Meteorologia</Text>
        <TouchableOpacity
          onPress={() => fetchFavoritos()}
          style={styles.botaoRecarregar}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitulo}>Status dos seus favoritos</Text>

      {favoritos.length > 0 ? (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => `metar-${item.icao}`}
          renderItem={({ item }) =>
            item.icao.startsWith('SB') ? (
              <MeteorologiaCard icao={item.icao} nome={item.nome} />
            ) : (
              <CardSemEstacao icao={item.icao} nome={item.nome} />
            )
          }
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.vazio}>
          <Ionicons name="cloud-offline-outline" size={64} color={colors.surface} />
          <Text style={styles.vazioTitulo}>Sem aeródromos</Text>
          <Text style={styles.vazioTexto}>
            Favorite aeródromos para acompanhar a meteorologia em tempo real nesta aba.
          </Text>
          <TouchableOpacity
            style={styles.botaoVazio}
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <Ionicons name="search" size={18} color={colors.background} />
            <Text style={styles.botaoVazioTexto}>Buscar aeródromo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  botaoRecarregar: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  lista: {
    paddingBottom: 20,
  },
  cardSemEstacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    opacity: 0.6,
  },
  cardSemEstacaoLeft: {
    flex: 1,
  },
  cardSemEstacaoIcao: {
    color: colors.textMuted,
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardSemEstacaoNome: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cardSemEstacaoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardSemEstacaoTexto: {
    color: colors.textMuted,
    fontSize: 12,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  vazioTitulo: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  vazioTexto: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  botaoVazio: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoVazioTexto: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
