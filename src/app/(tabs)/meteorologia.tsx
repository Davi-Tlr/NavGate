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

export default function MeteorologiaScreen() {
  const { favoritos, fetchFavoritos } = useFavoritos();

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
          renderItem={({ item }) => (
            <MeteorologiaCard icao={item.icao} nome={item.nome} />
          )}
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
});
