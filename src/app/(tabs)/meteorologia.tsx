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

function CardSemEstacao({ icao, nome }: { icao: string; nome: string }) {
  return (
    <View style={styles.cardSemEstacao}>
      <View style={styles.cardSemEstacaoLeft}>
        <Text style={styles.cardSemEstacaoIcao}>{icao}</Text>
        <Text style={styles.cardSemEstacaoNome} numberOfLines={1}>{nome}</Text>
      </View>
      <View style={styles.cardSemEstacaoBadge}>
        <Ionicons name="cloud-offline-outline" size={14} color="#6B7280" />
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
          <Ionicons name="refresh" size={20} color="#4A9EFF" />
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
          <Ionicons name="cloud-offline-outline" size={64} color="#1a2035" />
          <Text style={styles.vazioTitulo}>Sem aeródromos</Text>
          <Text style={styles.vazioTexto}>
            Favorite aeródromos para acompanhar a meteorologia em tempo real nesta aba.
          </Text>
          <TouchableOpacity
            style={styles.botaoVazio}
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <Ionicons name="search" size={18} color="#0a0f1e" />
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
    backgroundColor: '#0a0f1e',
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
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
  },
  botaoRecarregar: {
    padding: 8,
    backgroundColor: '#1a2035',
    borderRadius: 8,
  },
  lista: {
    paddingBottom: 20,
  },
  cardSemEstacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a2035',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    opacity: 0.6,
  },
  cardSemEstacaoLeft: {
    flex: 1,
  },
  cardSemEstacaoIcao: {
    color: '#6B7280',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardSemEstacaoNome: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  cardSemEstacaoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0a0f1e',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardSemEstacaoTexto: {
    color: '#6B7280',
    fontSize: 12,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  vazioTitulo: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  vazioTexto: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  botaoVazio: {
    marginTop: 16,
    backgroundColor: '#4A9EFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoVazioTexto: {
    color: '#0a0f1e',
    fontSize: 14,
    fontWeight: '700',
  },
});