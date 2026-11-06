import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { deleteReview, getReviewById, type ReviewEntry } from "@/services/reviews";

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}

export default function ReviewDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [review, setReview] = useState<ReviewEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadReview() {
      try {
        const savedReview = await getReviewById(id);
        if (!savedReview) throw new Error("Esta resenha não foi encontrada.");
        if (isActive) setReview(savedReview);
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Não foi possível abrir a resenha.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    if (id) void loadReview();
    return () => {
      isActive = false;
    };
  }, [id, attempt]);

  async function removeReview() {
    if (!id) return;

    setDeleting(true);
    setError("");
    try {
      await deleteReview(id);
      router.replace("/(tabs)/diario");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir a resenha.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  function retry() {
    setLoading(true);
    setError("");
    setAttempt((current) => current + 1);
  }

  if (!id) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateTitle}>Resenha sem identificador</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/(tabs)/diario")} style={styles.backButton}>
          <Text style={styles.backLabel}>Voltar ao Diário</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <ActivityIndicator size="large" color="#62745B" />
        <Text style={styles.stateText}>Carregando resenha…</Text>
      </SafeAreaView>
    );
  }

  if (!review) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateTitle}>Não foi possível abrir a resenha</Text>
        <Text style={styles.stateText}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={retry} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>Tentar novamente</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/(tabs)/diario")} style={styles.backButton}>
          <Text style={styles.backLabel}>Voltar ao Diário</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backLabel}>‹  Diário</Text>
        </Pressable>

        {review.filmImage ? (
          <Image source={{ uri: review.filmImage }} style={styles.poster} contentFit="cover" />
        ) : null}
        <Text style={styles.eyebrow}>RESENHA</Text>
        <Text style={styles.title}>{review.filmTitle}</Text>
        <Text style={styles.metadata}>Filme de {review.releaseDate} · Assistido em {formatDate(review.watchedAt)}</Text>
        <Text accessibilityLabel={`Nota ${review.rating} de 5 estrelas`} style={styles.rating}>
          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
        </Text>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewText}>{review.text}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/resenha/[id]/editar", params: { id: review.id } })}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryLabel}>Editar resenha</Text>
          </Pressable>
          {confirmingDelete ? (
            <View style={styles.confirmCard}>
              <Text style={styles.confirmText}>Excluir esta resenha? Esta ação não pode ser desfeita.</Text>
              <View style={styles.confirmActions}>
                <Pressable accessibilityRole="button" onPress={() => setConfirmingDelete(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelLabel}>Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={deleting}
                  onPress={() => void removeReview()}
                  style={[styles.deleteButton, deleting && styles.disabledButton]}
                >
                  <Text style={styles.deleteLabel}>{deleting ? "Excluindo…" : "Excluir"}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => setConfirmingDelete(true)} style={styles.deleteOutline}>
              <Text style={styles.deleteOutlineLabel}>Excluir resenha</Text>
            </Pressable>
          )}
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F4ED" },
  content: { padding: 22, paddingBottom: 42 },
  backButton: { alignSelf: "flex-start", paddingVertical: 9, paddingRight: 14 },
  backLabel: { color: "#536052", fontSize: 15, fontWeight: "700" },
  poster: { width: 94, height: 126, borderRadius: 14, backgroundColor: "#DDE4D6", marginTop: 14, marginBottom: 18 },
  eyebrow: { color: "#62745B", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#26352A", fontSize: 29, lineHeight: 36, fontWeight: "700", marginTop: 5 },
  metadata: { color: "#697366", fontSize: 13, lineHeight: 20, marginTop: 5 },
  rating: { color: "#D39A3D", fontSize: 24, marginTop: 11 },
  reviewCard: { marginTop: 20, padding: 18, borderRadius: 16, backgroundColor: "#E9EDE3" },
  reviewText: { color: "#354334", fontSize: 15, lineHeight: 24 },
  actions: { gap: 10, marginTop: 24 },
  primaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, borderRadius: 14, backgroundColor: "#62745B" },
  primaryLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  deleteOutline: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#A96B57", borderRadius: 14 },
  deleteOutlineLabel: { color: "#8A4635", fontSize: 14, fontWeight: "700" },
  confirmCard: { padding: 14, borderRadius: 14, backgroundColor: "#F0E4D9", gap: 10 },
  confirmText: { color: "#704F3E", fontSize: 13, lineHeight: 19 },
  confirmActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 14 },
  cancelLabel: { color: "#536052", fontSize: 13, fontWeight: "700" },
  deleteButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#8A4635" },
  deleteLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  disabledButton: { opacity: 0.65 },
  error: { color: "#8A4635", fontSize: 13, lineHeight: 19, marginTop: 12 },
  stateScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 28, backgroundColor: "#F7F4ED" },
  stateTitle: { color: "#26352A", fontSize: 19, fontWeight: "700", textAlign: "center" },
  stateText: { color: "#536052", fontSize: 14, lineHeight: 21, textAlign: "center" },
});
