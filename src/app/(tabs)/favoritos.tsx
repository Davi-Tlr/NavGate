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
import { TIPO_ICONE } from '@/features/aerodromos/constants';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';

function CardFavorito({ item }: { item: Aerodromo }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/aerodromo/${item.icao}`)}
    >
      <Ionicons name={TIPO_ICONE[item.tipo]} size={24} color={colors.primary} style={styles.tipoIcon} />
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
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function FavoritosScreen() {
  const { favoritos, isLoading } = useFavoritos();
  const router = useRouter();

  if (isLoading && favoritos.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colors.primary} />
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
          <Ionicons name="heart-dislike" size={64} color={colors.surface} />
          <Text style={styles.vazioTitulo}>Lista Vazia</Text>
          <Text style={styles.vazioTexto}>
            Toque no coração na tela de detalhes{'\n'}de um aeródromo para salvá-lo aqui.
          </Text>
          <TouchableOpacity
            style={styles.botaoVazio}
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <Ionicons name="search" size={18} color={colors.background} />
            <Text style={styles.botaoVazioTexto}>Buscar aerodromo</Text>
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
  titulo: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 8,
  },
  centro: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: { paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipoIcon: { marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icao: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
  iata: { color: colors.textMuted, fontSize: 12 },
  nome: { color: colors.textPrimary, fontSize: 14, marginTop: 2 },
  municipio: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 100,
  },
  vazioTitulo: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  vazioTexto: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  botaoVazio: {
    marginTop: 4,
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
