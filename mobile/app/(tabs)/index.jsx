import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to Brebox</Text>
      <Text style={styles.subtitle}>Your real estate command center</Text>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: '#ecfdf5' }]}>
          <Text style={styles.cardValue}>156</Text>
          <Text style={styles.cardLabel}>Properties</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.cardValue}>12</Text>
          <Text style={styles.cardLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.cardValue}>89</Text>
          <Text style={styles.cardLabel}>Active</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#ede9fe' }]}>
          <Text style={styles.cardValue}>33</Text>
          <Text style={styles.cardLabel}>Sold</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#064E3B', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, borderRadius: 14, padding: 20 },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  cardLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
});
