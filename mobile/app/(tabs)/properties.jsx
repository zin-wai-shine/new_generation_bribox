import { View, Text, StyleSheet } from 'react-native';

export default function PropertiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Properties</Text>
      <Text style={styles.subtitle}>Connect to API to load property listings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#064E3B' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
});
