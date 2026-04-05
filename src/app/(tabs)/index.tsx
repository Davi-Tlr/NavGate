import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAerodromos } from '@/features/aerodromos/hooks/useAerodromos';
import { Aerodromo } from '@/features/aerodromos/types';
import { useRouter } from 'expo-router';

// Mapa de emojis por tipo de aeródromo
// Fica fora do componente para não ser recriado a cada render
const TIPO_EMOJI: Record<Aerodromo['tipo'], string> = {
  large_airport: '✈️',
  medium_airport: '🛫',
  small_airport: '🛩️',
  heliport: '🚁',
  seaplane_base: '🛥️',
};

function CardAerodromo({ item }: { item: Aerodromo }) {
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
      <Text style={styles.altitude}>{item.altitude_ft} ft</Text>
    </TouchableOpacity>
  );
}

export default function BuscaScreen() {
  const { termo, resultados, buscar, limpar, temResultados } = useAerodromos();

  return (
    <View style={styles.container}>

      {/* Campo de busca */}
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ICAO, nome ou cidade..."
          placeholderTextColor="#6B7280"
          value={termo}
          onChangeText={buscar}
          autoCorrect={false}
          returnKeyType="search"
        />
        {termo.length > 0 && (
          <TouchableOpacity onPress={limpar}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Três estados possíveis da tela */}
      {temResultados ? (
        // Estado 1: há resultados — mostra a lista
        <FlatList
          data={resultados}
          keyExtractor={item => item.icao}
          renderItem={({ item }) => <CardAerodromo item={item} />}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
        />
      ) : termo.length >= 2 ? (
        // Estado 2: buscou mas não encontrou
        <View style={styles.vazio}>
          <Ionicons name="search" size={48} color="#1a2035" />
          <Text style={styles.vazioTexto}>Nenhum aeródromo encontrado</Text>
        </View>
      ) : (
        // Estado 3: ainda não digitou nada
        <View style={styles.vazio}>
          <Ionicons name="airplane" size={48} color="#1a2035" />
          <Text style={styles.vazioTexto}>
            Digite o código ICAO, nome ou cidade
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2035',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  lista: { paddingBottom: 16 },
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
  altitude: { color: '#6B7280', fontSize: 12 },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  vazioTexto: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
});