import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { subscribeToReviews, type ReviewEntry } from "@/services/reviews";

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("pt-BR");
}

export default function DiaryScreen() {
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    return subscribeToReviews(
      (nextReviews) => {
        setReviews(nextReviews);
        setLoading(false);
      },
      (loadError) => {
        setError(loadError.message);
        setLoading(false);
      },
    );
  }, [attempt]);

  function retry() {
    setLoading(true);
    setError("");
    setAttempt((current) => current + 1);
  }

  function renderEmptyState() {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#62745B" />
          <Text style={styles.emptyText}>Carregando seu Diário…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Não foi possível abrir o Diário</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.primaryButton}>
            <Text style={styles.primaryLabel}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Seu Diário ainda está vazio</Text>
        <Text style={styles.emptyText}>
          Escolha um filme no catálogo e registre sua nota e suas impressões.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.push("/")} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>Abrir catálogo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={reviews}
        keyExtractor={(review) => review.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir resenha de ${item.filmTitle}`}
            onPress={() => router.push({ pathname: "/resenha/[id]", params: { id: item.id } })}
            style={({ pressed }) => [styles.reviewCard, pressed && styles.pressed]}
          >
            {item.filmImage ? (
              <Image source={{ uri: item.filmImage }} style={styles.poster} contentFit="cover" />
            ) : (
              <View style={[styles.poster, styles.posterFallback]} />
            )}
            <View style={styles.reviewInfo}>
              <Text numberOfLines={1} style={styles.filmTitle}>{item.filmTitle}</Text>
              <Text style={styles.rating}>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</Text>
              <Text style={styles.reviewDate}>Assistido em {formatDate(item.watchedAt)}</Text>
              <Text numberOfLines={2} style={styles.reviewText}>{item.text}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>SUAS HISTÓRIAS</Text>
            <Text style={styles.title}>Diário</Text>
            <Text style={styles.description}>Registre suas impressões e memórias sobre cada filme.</Text>
            {error && reviews.length > 0 ? (
              <Text accessibilityRole="alert" style={styles.inlineError}>{error}</Text>
            ) : null}
            {!loading && !error ? (
              <Text style={styles.count}>
                {reviews.length} {reviews.length === 1 ? "resenha" : "resenhas"}
              </Text>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => router.push("/")} style={styles.catalogButton}>
              <Text style={styles.catalogButtonLabel}>＋  Escolher filme no catálogo</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F4ED" },
  listContent: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 108 },
  header: { paddingBottom: 20 },
  eyebrow: { color: "#62745B", fontSize: 12, fontWeight: "700", letterSpacing: 1.5 },
  title: { color: "#26352A", fontSize: 30, fontWeight: "700", marginTop: 12 },
  description: { color: "#536052", fontSize: 16, lineHeight: 24, marginTop: 12 },
  count: { color: "#697366", fontSize: 12, marginTop: 12 },
  inlineError: { color: "#8A4635", fontSize: 13, marginTop: 10 },
  catalogButton: { alignSelf: "flex-start", marginTop: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: "#E9EDE3" },
  catalogButtonLabel: { color: "#536052", fontSize: 13, fontWeight: "700" },
  reviewCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, backgroundColor: "#E9EDE3" },
  pressed: { opacity: 0.75 },
  poster: { width: 64, height: 86, borderRadius: 9, backgroundColor: "#DDE4D6" },
  posterFallback: { backgroundColor: "#DDE4D6" },
  reviewInfo: { flex: 1, gap: 4 },
  filmTitle: { color: "#26352A", fontSize: 15, fontWeight: "700" },
  rating: { color: "#D39A3D", fontSize: 14 },
  reviewDate: { color: "#697366", fontSize: 11 },
  reviewText: { color: "#536052", fontSize: 12, lineHeight: 17, marginTop: 2 },
  chevron: { color: "#8A9681", fontSize: 24, marginLeft: 2 },
  separator: { height: 10 },
  emptyState: { flex: 1, minHeight: 260, alignItems: "center", justifyContent: "center", gap: 11, padding: 24 },
  emptyTitle: { color: "#26352A", fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyText: { color: "#536052", fontSize: 14, lineHeight: 21, textAlign: "center" },
  primaryButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 18, borderRadius: 14, backgroundColor: "#62745B", marginTop: 5 },
  primaryLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
