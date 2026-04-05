import { View, StyleSheet } from 'react-native';
import { MapaBase } from '@/features/mapa/components/MapaBase';

export default function MapaScreen() {
  return (
    <View style={styles.container}>
      <MapaBase 
        center={[-46.6333, -23.5505]} // São Paulo como padrão
        zoom={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
});