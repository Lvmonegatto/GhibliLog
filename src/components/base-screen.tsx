import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type BaseScreenProps = {
  section: string;
  title: string;
  description: string;
  detail?: string;
};

export function BaseScreen({ section, title, description, detail }: BaseScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>{section.toLocaleUpperCase("pt-BR")}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estrutura inicial</Text>
          <Text style={styles.cardText}>
            Esta tela já tem uma rota própria. Os dados e as ações desta seção serão
            implementados na próxima etapa.
          </Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F4ED" },
  content: { flexGrow: 1, padding: 24, gap: 12 },
  section: { color: "#62745B", fontSize: 12, fontWeight: "700", letterSpacing: 1.5 },
  title: { color: "#26352A", fontSize: 30, fontWeight: "700" },
  description: { color: "#536052", fontSize: 16, lineHeight: 24 },
  card: {
    marginTop: 12,
    padding: 20,
    gap: 8,
    borderRadius: 18,
    backgroundColor: "#E9EDE3",
  },
  cardTitle: { color: "#26352A", fontSize: 17, fontWeight: "700" },
  cardText: { color: "#536052", fontSize: 14, lineHeight: 21 },
  detail: { color: "#62745B", fontSize: 13, fontWeight: "600", marginTop: 4 },
});
