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

import { FilmCard } from "@/components/film-card";
import {
  removeFilmFromList,
  subscribeToFilmList,
  type FilmListName,
  type SavedFilmEntry,
} from "@/services/user-film-lists";

type SavedFilmsScreenProps = {
  listName: FilmListName;
  title: string;
  description: string;
  emptyMessage: string;
};

export function SavedFilmsScreen({
  listName,
  title,
  description,
  emptyMessage,
}: SavedFilmsScreenProps) {
  const [films, setFilms] = useState<SavedFilmEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    return subscribeToFilmList(
      listName,
      (nextFilms) => {
        setFilms(nextFilms);
        setLoading(false);
      },
      (loadError) => {
        setError(loadError.message);
        setLoading(false);
      },
    );
  }, [listName, attempt]);

  async function removeFilm(filmId: string) {
    setError("");

    try {
      await removeFilmFromList(listName, filmId);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Não foi possível remover este filme.",
      );
    }
  }

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
          <Text style={styles.emptyText}>Carregando sua lista…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>A lista não pôde ser carregada</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryLabel}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Sua lista está vazia</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={films}
        numColumns={2}
        keyExtractor={(film) => film.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FilmCard
            film={item}
            onPress={() =>
              router.push({ pathname: "/filme/[id]", params: { id: item.id } })
            }
            onRemove={() => void removeFilm(item.id)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>SUA COLEÇÃO</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {error && films.length > 0 ? (
              <Text accessibilityRole="alert" style={styles.inlineError}>
                {error}
              </Text>
            ) : null}
            {!loading && !error ? (
              <Text style={styles.count}>
                {films.length}{" "}
                {films.length === 1 ? "filme salvo" : "filmes salvos"}
              </Text>
            ) : null}
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
  listContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 108,
  },
  header: { paddingBottom: 18 },
  eyebrow: {
    color: "#62745B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.7,
  },
  title: { color: "#26352A", fontSize: 30, fontWeight: "700", marginTop: 6 },
  description: { color: "#536052", fontSize: 14, lineHeight: 21, marginTop: 5 },
  count: { color: "#697366", fontSize: 12, marginTop: 12 },
  inlineError: { color: "#8A4635", fontSize: 13, marginTop: 12 },
  row: { justifyContent: "space-between" },
  emptyState: {
    flex: 1,
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24,
  },
  emptyTitle: {
    color: "#26352A",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    color: "#536052",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#62745B",
  },
  retryLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
