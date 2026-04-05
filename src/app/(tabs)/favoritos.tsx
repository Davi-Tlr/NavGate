import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '@/features/favoritos/hooks/useFavoritos';
import { Aerodromo } from '@/features/aerodromos/types';
import { useRouter } from 'expo-router';

const TIPO_EMOJI: Record<string, string> = {
  large_airport: '✈️',
  medium_airport: '🛫',
  small_airport: '🛩️',
  heliport: '🚁',
  seaplane_base: '🛥️',
};

function CardFavorito({ item }: { item: Aerodromo }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/aerodromo/${item.icao}`)}
    >
      <Text style={styles.tipoIcon}>{TIPO_EMOJI[item.tipo] ?? '✈️'}</Text>
      <View style={styles.cardInfo}>
        <View style={styles.cardTopo}>
          <Text style={styles.icao}>{item.icao}</Text>
          {item.iata ? <Text style={styles.iata}>{item.iata}</Text> : null}
        </View>
        <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.municipio}>
          {item.municipio} · {item.regiao.replace('BR-', '')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#6B7280" />
    </TouchableOpacity>
  );
}

export default function FavoritosScreen() {
  const { favoritos, isLoading } = useFavoritos();

  if (isLoading && favoritos.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#4A9EFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Favoritos</Text>

      {favoritos.length > 0 ? (
        <FlatList
          data={favoritos}
          keyExtractor={item => item.icao}
          renderItem={({ item }) => <CardFavorito item={item} />}
          contentContainerStyle={styles.lista}
        />
      ) : (
        <View style={styles.vazio}>
          <Ionicons name="heart-dislike" size={64} color="#1a2035" />
          <Text style={styles.vazioTitulo}>Lista Vazia</Text>
          <Text style={styles.vazioTexto}>
            Toque no coração na tela de detalhes{'\n'}de um aeródromo para salvá-lo aqui.
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
  titulo: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 8,
  },
  centro: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: { paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2035',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipoIcon: { fontSize: 24, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icao: { color: '#4A9EFF', fontWeight: 'bold', fontSize: 16 },
  iata: { color: '#6B7280', fontSize: 12 },
  nome: { color: '#ffffff', fontSize: 14, marginTop: 2 },
  municipio: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 100,
  },
  vazioTitulo: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vazioTexto: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
