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

import { fetchFilmById, type Film } from "@/services/films";
import {
  removeFilmFromList,
  saveFilmToList,
  subscribeToFilmInList,
  type FilmListName,
  type SavedFilm,
} from "@/services/user-film-lists";

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [savingList, setSavingList] = useState<FilmListName | null>(null);
  const [listActionError, setListActionError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    if (!id) return () => controller.abort();

    fetchFilmById(id, controller.signal)
      .then(setFilm)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os dados do filme.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id, loadAttempt]);

  useEffect(() => {
    if (!id) return;

    const handleListError = (listError: Error) => setListActionError(listError.message);
    const unsubscribeFavorites = subscribeToFilmInList(
      "favorites",
      id,
      setIsFavorite,
      handleListError,
    );
    const unsubscribeWatchlist = subscribeToFilmInList(
      "watchlist",
      id,
      setIsOnWatchlist,
      handleListError,
    );

    return () => {
      unsubscribeFavorites();
      unsubscribeWatchlist();
    };
  }, [id]);

  function retryLoading() {
    setError("");
    setLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function toggleFilmList(listName: FilmListName, isSaved: boolean) {
    if (!film || savingList) return;

    setSavingList(listName);
    setListActionError("");

    try {
      if (isSaved) {
        await removeFilmFromList(listName, film.id);
      } else {
        const savedFilm: SavedFilm = {
          title: film.title,
          image: film.image,
          release_date: film.release_date,
          director: film.director,
          savedAt: new Date().toISOString(),
        };
        await saveFilmToList(listName, film.id, savedFilm);
      }
    } catch (actionError) {
      setListActionError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível atualizar sua lista.",
      );
    } finally {
      setSavingList(null);
    }
  }

  if (!id) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateTitle}>Identificador do filme ausente</Text>
        <Text style={styles.stateText}>Volte ao catálogo e escolha um filme para ver os detalhes.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backLabel}>Voltar ao catálogo</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <ActivityIndicator size="large" color="#62745B" />
        <Text style={styles.stateText}>Carregando filme…</Text>
      </SafeAreaView>
    );
  }

  if (error || !film) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateTitle}>Não foi possível abrir este filme</Text>
        <Text style={styles.stateText}>{error || "Tente voltar ao catálogo e escolher outro filme."}</Text>
        <Pressable accessibilityRole="button" onPress={retryLoading} style={styles.retryButton}>
          <Text style={styles.retryLabel}>Tentar novamente</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backLabel}>Voltar ao catálogo</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const banner = film.movie_banner || film.image;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar ao catálogo"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backLabel}>‹  Catálogo</Text>
        </Pressable>

        <View style={styles.bannerFrame}>
        {banner && !bannerFailed ? (
            <Image
              source={{ uri: banner }}
              style={styles.banner}
              contentFit="cover"
              transition={220}
              accessibilityLabel={`Imagem de ${film.title}`}
              onError={() => setBannerFailed(true)}
            />
          ) : (
            <View style={[styles.banner, styles.bannerFallback]} />
          )}
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>FILME GHIBLI · {film.release_date}</Text>
          <Text style={styles.title}>{film.title}</Text>
          <Text style={styles.romanisedTitle}>{film.original_title_romanised}</Text>
        </View>

        <View style={styles.facts}>
          <View style={styles.fact}>
            <Text style={styles.factValue}>{film.running_time} min</Text>
            <Text style={styles.factLabel}>Duração</Text>
          </View>
          <View style={styles.factDivider} />
          <View style={styles.fact}>
            <Text style={styles.factValue}>{film.rt_score}%</Text>
            <Text style={styles.factLabel}>Nota RT</Text>
          </View>
        </View>

        <View style={styles.listActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite, disabled: savingList !== null }}
            disabled={savingList !== null}
            onPress={() => void toggleFilmList("favorites", isFavorite)}
            style={[styles.listButton, isFavorite && styles.listButtonSelected, savingList !== null && styles.disabledButton]}
          >
            <Text style={[styles.listButtonText, isFavorite && styles.listButtonTextSelected]}>
              {savingList === "favorites"
                ? "Salvando…"
                : isFavorite
                  ? "✓ Está nos Favoritos"
                  : "♡ Adicionar aos Favoritos"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isOnWatchlist, disabled: savingList !== null }}
            disabled={savingList !== null}
            onPress={() => void toggleFilmList("watchlist", isOnWatchlist)}
            style={[styles.listButton, isOnWatchlist && styles.listButtonSelected, savingList !== null && styles.disabledButton]}
          >
            <Text style={[styles.listButtonText, isOnWatchlist && styles.listButtonTextSelected]}>
              {savingList === "watchlist"
                ? "Salvando…"
                : isOnWatchlist
                  ? "✓ Está em Quero Assistir"
                  : "＋ Quero Assistir"}
            </Text>
          </Pressable>
        </View>
        {listActionError ? (
          <Text accessibilityRole="alert" style={styles.listActionError}>
            {listActionError}
          </Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.description}>{film.description}</Text>
        </View>

        <View style={styles.credits}>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Direção</Text>
            <Text style={styles.creditValue}>{film.director}</Text>
          </View>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Produção</Text>
            <Text style={styles.creditValue}>{film.producer}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F4ED" },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  backButton: { alignSelf: "flex-start", paddingVertical: 10, paddingRight: 14 },
  backLabel: { color: "#536052", fontSize: 15, fontWeight: "700" },
  bannerFrame: {
    width: "100%",
    aspectRatio: 1.62,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#E5E7DF",
  },
  banner: { width: "100%", height: "100%" },
  bannerFallback: { backgroundColor: "#DDE4D6" },
  heading: { marginTop: 22, gap: 5 },
  eyebrow: { color: "#62745B", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#26352A", fontSize: 30, lineHeight: 36, fontWeight: "700" },
  romanisedTitle: { color: "#697366", fontSize: 14 },
  facts: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#E9EDE3",
  },
  fact: { gap: 3 },
  factValue: { color: "#26352A", fontSize: 16, fontWeight: "700" },
  factLabel: { color: "#697366", fontSize: 12 },
  factDivider: { width: 1, height: 34, backgroundColor: "#CFD7C8" },
  listActions: { gap: 9, marginTop: 14 },
  listButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, borderRadius: 14, backgroundColor: "#E9EDE3" },
  listButtonSelected: { backgroundColor: "#62745B" },
  listButtonText: { color: "#536052", fontSize: 14, fontWeight: "700", textAlign: "center" },
  listButtonTextSelected: { color: "#FFFFFF" },
  disabledButton: { opacity: 0.65 },
  listActionError: { color: "#8A4635", fontSize: 13, lineHeight: 19, marginTop: 8 },
  section: { marginTop: 24, gap: 8 },
  sectionTitle: { color: "#26352A", fontSize: 19, fontWeight: "700" },
  description: { color: "#536052", fontSize: 15, lineHeight: 23 },
  credits: { marginTop: 24, padding: 16, gap: 14, borderRadius: 16, backgroundColor: "#E9EDE3" },
  creditRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  creditLabel: { color: "#697366", fontSize: 13 },
  creditValue: { flexShrink: 1, color: "#26352A", fontSize: 13, fontWeight: "700", textAlign: "right" },
  stateScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 28, backgroundColor: "#F7F4ED" },
  stateTitle: { color: "#26352A", fontSize: 19, fontWeight: "700", textAlign: "center" },
  stateText: { color: "#536052", fontSize: 14, lineHeight: 21, textAlign: "center" },
  retryButton: { marginTop: 6, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: "#62745B" },
  retryLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
