import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchFilmById, type Film } from "@/services/films";
import {
  createReview,
  getReviewById,
  updateReview,
  type ReviewInput,
} from "@/services/reviews";

type ReviewFilm = Pick<Film, "id" | "title" | "image" | "release_date">;

type ReviewFormScreenProps = {
  filmId?: string;
  reviewId?: string;
};

function getToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function ReviewFormScreen({ filmId, reviewId }: ReviewFormScreenProps) {
  const [film, setFilm] = useState<ReviewFilm | null>(null);
  const [rating, setRating] = useState(0);
  const [watchedAt, setWatchedAt] = useState(getToday);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function loadFormData() {
      try {
        if (reviewId) {
          const savedReview = await getReviewById(reviewId);
          if (!savedReview) throw new Error("Esta resenha não foi encontrada.");
          if (!isActive) return;

          setFilm({
            id: savedReview.filmId,
            title: savedReview.filmTitle,
            image: savedReview.filmImage,
            release_date: savedReview.releaseDate,
          });
          setRating(savedReview.rating);
          setWatchedAt(savedReview.watchedAt);
          setText(savedReview.text);
        } else if (filmId) {
          const selectedFilm = await fetchFilmById(filmId, controller.signal);
          if (!isActive) return;

          setFilm({
            id: selectedFilm.id,
            title: selectedFilm.title,
            image: selectedFilm.image,
            release_date: selectedFilm.release_date,
          });
        }
      } catch (loadError) {
        if (isActive && !controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Não foi possível abrir o formulário.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    if (reviewId || filmId) void loadFormData();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [filmId, reviewId, loadAttempt]);

  async function save() {
    if (!film) return;
    if (rating === 0) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    if (!isValidDate(watchedAt)) {
      setError("Informe a data no formato AAAA-MM-DD.");
      return;
    }
    if (!text.trim()) {
      setError("Escreva suas impressões sobre o filme.");
      return;
    }

    const input: ReviewInput = {
      filmId: film.id,
      filmTitle: film.title,
      filmImage: film.image,
      releaseDate: film.release_date,
      rating,
      watchedAt,
      text: text.trim(),
    };

    setSaving(true);
    setError("");

    try {
      const savedId = reviewId ?? (await createReview(input));
      if (reviewId) await updateReview(reviewId, input);
      router.replace({ pathname: "/resenha/[id]", params: { id: savedId } });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a resenha.");
      setSaving(false);
    }
  }

  if (!filmId && !reviewId) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateTitle}>Escolha um filme primeiro</Text>
        <Text style={styles.stateText}>
          Abra um filme no Catálogo e toque em “Escrever resenha” para começar.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/")} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>Abrir catálogo</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <ActivityIndicator size="large" color="#62745B" />
        <Text style={styles.stateText}>Carregando formulário…</Text>
      </SafeAreaView>
    );
  }

  if (!film) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateTitle}>Não foi possível abrir o formulário</Text>
        <Text style={styles.stateText}>{error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setError("");
            setLoading(true);
            setLoadAttempt((attempt) => attempt + 1);
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryLabel}>Tentar novamente</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backLabel}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backLabel}>‹  Voltar</Text>
        </Pressable>
        <Text style={styles.eyebrow}>DIÁRIO</Text>
        <Text style={styles.title}>{reviewId ? "Editar resenha" : "Nova resenha"}</Text>

        <View style={styles.filmCard}>
          {film.image ? (
            <Image source={{ uri: film.image }} style={styles.poster} contentFit="cover" />
          ) : null}
          <View style={styles.filmInfo}>
            <Text style={styles.filmTitle}>{film.title}</Text>
            <Text style={styles.filmYear}>{film.release_date}</Text>
          </View>
        </View>

        <Text style={styles.label}>Sua nota</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
              accessibilityState={{ selected: rating === value }}
              onPress={() => setRating(value)}
              style={styles.starButton}
            >
              <Text style={[styles.star, value <= rating && styles.starSelected]}>★</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Data em que assistiu</Text>
        <TextInput
          accessibilityLabel="Data em que assistiu, no formato ano, mês e dia"
          value={watchedAt}
          onChangeText={setWatchedAt}
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          style={styles.dateInput}
        />

        <Text style={styles.label}>O que você achou?</Text>
        <TextInput
          accessibilityLabel="Texto da resenha"
          value={text}
          onChangeText={setText}
          placeholder="Escreva suas impressões sobre o filme…"
          multiline
          textAlignVertical="top"
          maxLength={2000}
          style={styles.reviewInput}
        />
        <Text style={styles.characterCount}>{text.length}/2000</Text>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => void save()}
          style={[styles.primaryButton, saving && styles.disabledButton]}
        >
          <Text style={styles.primaryLabel}>{saving ? "Salvando…" : "Salvar resenha"}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelLabel}>Cancelar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F4ED" },
  content: { padding: 22, paddingBottom: 40, gap: 9 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8, paddingRight: 14 },
  backLabel: { color: "#536052", fontSize: 15, fontWeight: "700" },
  eyebrow: { color: "#62745B", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginTop: 4 },
  title: { color: "#26352A", fontSize: 29, fontWeight: "700", marginBottom: 8 },
  filmCard: { flexDirection: "row", alignItems: "center", gap: 13, padding: 12, borderRadius: 16, backgroundColor: "#E9EDE3", marginBottom: 10 },
  poster: { width: 54, height: 72, borderRadius: 8, backgroundColor: "#DDE4D6" },
  filmInfo: { flex: 1, gap: 5 },
  filmTitle: { color: "#26352A", fontSize: 16, fontWeight: "700" },
  filmYear: { color: "#697366", fontSize: 13 },
  label: { color: "#26352A", fontSize: 14, fontWeight: "700", marginTop: 7 },
  ratingRow: { flexDirection: "row", gap: 7, alignSelf: "flex-start" },
  starButton: { paddingVertical: 2, paddingRight: 4 },
  star: { color: "#C7CDBF", fontSize: 32 },
  starSelected: { color: "#D39A3D" },
  dateInput: { minHeight: 48, borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#E9EDE3", color: "#26352A", fontSize: 15 },
  reviewInput: { minHeight: 150, borderRadius: 12, padding: 14, backgroundColor: "#E9EDE3", color: "#26352A", fontSize: 15, lineHeight: 22 },
  characterCount: { color: "#697366", fontSize: 11, textAlign: "right" },
  error: { color: "#8A4635", fontSize: 13, lineHeight: 19 },
  primaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, borderRadius: 14, backgroundColor: "#62745B", marginTop: 5 },
  primaryLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  disabledButton: { opacity: 0.65 },
  cancelButton: { minHeight: 42, alignItems: "center", justifyContent: "center" },
  cancelLabel: { color: "#536052", fontSize: 14, fontWeight: "600" },
  stateScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 28, backgroundColor: "#F7F4ED" },
  stateTitle: { color: "#26352A", fontSize: 19, fontWeight: "700", textAlign: "center" },
  stateText: { color: "#536052", fontSize: 14, lineHeight: 21, textAlign: "center" },
});
