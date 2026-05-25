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
import { TIPO_ICONE } from '@/features/aerodromos/constants';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';

function CardAerodromo({ item }: { item: Aerodromo }) {
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
      <Text style={styles.altitude}>{item.altitude_ft} ft</Text>
    </TouchableOpacity>
  );
}

export default function BuscaScreen() {
  const { termo, resultados, buscar, limpar, temResultados } = useAerodromos();

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ICAO, nome ou cidade..."
          placeholderTextColor={colors.textMuted}
          value={termo}
          onChangeText={buscar}
          autoCorrect={false}
          returnKeyType="search"
        />
        {termo.length > 0 && (
          <TouchableOpacity onPress={limpar}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {temResultados ? (
        <FlatList
          data={resultados}
          keyExtractor={item => item.icao}
          renderItem={({ item }) => <CardAerodromo item={item} />}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
        />
      ) : termo.length >= 2 ? (
        <View style={styles.vazio}>
          <Ionicons name="search-outline" size={48} color={colors.surface} />
          <Text style={styles.vazioTitulo}>Nenhum resultado</Text>
          <Text style={styles.vazioTexto}>
            Não encontramos aeródromo para{'\n'}
            <Text style={styles.vazioTermoDest}>"{termo}"</Text>
          </Text>
          <Text style={styles.vazioSugestao}>
            Tente o código ICAO (ex: SIXE) ou o nome da cidade
          </Text>
        </View>
      ) : (
        <View style={styles.vazio}>
          <Ionicons name="airplane" size={48} color={colors.surface} />
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
    backgroundColor: colors.background,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  lista: { paddingBottom: 16 },
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
  altitude: { color: colors.textMuted, fontSize: 12 },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  vazioTitulo: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  vazioTexto: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  vazioTermoDest: {
    color: colors.primary,
    fontWeight: '600',
  },
  vazioSugestao: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
