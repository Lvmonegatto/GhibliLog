import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FilmCard } from "@/components/film-card";
import { fetchFilms, type Film } from "@/services/films";

const DECADES: { label: string; start: number | null }[] = [
  { label: "Todos", start: null },
  { label: "Anos 1980", start: 1980 },
  { label: "Anos 1990", start: 1990 },
  { label: "Anos 2000", start: 2000 },
  { label: "Anos 2010", start: 2010 },
  { label: "Anos 2020", start: 2020 },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export default function CatalogScreen() {
  const [films, setFilms] = useState<Film[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchFilms(controller.signal)
      .then(setFilms)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "O catálogo não pôde ser carregado.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [loadAttempt]);

  const visibleFilms = useMemo(() => {
    const query = normalize(search.trim());

    return films.filter((film) => {
      const matchesSearch =
        !query ||
        normalize(
          `${film.title} ${film.original_title_romanised} ${film.director} ${film.producer}`,
        ).includes(query);
      const year = Number(film.release_date);
      const matchesDecade =
        selectedDecade === null || (year >= selectedDecade && year < selectedDecade + 10);

      return matchesSearch && matchesDecade;
    });
  }, [films, search, selectedDecade]);

  function retryLoading() {
    setError("");
    setLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  function openFilm(film: Film) {
    router.push({ pathname: "/filme/[id]", params: { id: film.id } });
  }

  function renderEmptyState() {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#62745B" />
          <Text style={styles.emptyTitle}>Carregando filmes…</Text>
        </View>
      );
    }

    if (error && films.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Não foi possível abrir o catálogo</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable onPress={retryLoading} style={styles.retryButton}>
            <Text style={styles.retryLabel}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhum filme encontrado</Text>
        <Text style={styles.emptyText}>Experimente outro título, diretor ou período.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={visibleFilms}
        numColumns={2}
        keyExtractor={(film) => film.id}
        renderItem={({ item }) => <FilmCard film={item} onPress={() => openFilm(item)} />}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading && films.length > 0} onRefresh={retryLoading} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>GHIBLILOG</Text>
            <Text style={styles.title}>Catálogo</Text>
            <Text style={styles.subtitle}>Qual mundo você quer visitar hoje?</Text>

            <View style={styles.searchBox}>
              <Text style={styles.searchGlyph}>⌕</Text>
              <TextInput
                accessibilityLabel="Buscar filmes por título ou equipe"
                value={search}
                onChangeText={setSearch}
                placeholder="Título, diretor ou produtor"
                placeholderTextColor="#7B8277"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {search.length > 0 ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setSearch("")}>
                  <Text style={styles.clearSearch}>Limpar</Text>
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
              accessibilityLabel="Filtrar catálogo por década"
            >
              {DECADES.map((decade) => {
                const selected = selectedDecade === decade.start;

                return (
                  <Pressable
                    key={decade.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedDecade(decade.start)}
                    style={[styles.filterChip, selected && styles.filterChipSelected]}
                  >
                    <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
                      {decade.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {!loading && !error ? (
              <Text style={styles.resultCount}>
                {visibleFilms.length} {visibleFilms.length === 1 ? "filme" : "filmes"}
              </Text>
            ) : null}
            {error && films.length > 0 ? (
              <View style={styles.refreshError}>
                <Text style={styles.refreshErrorText}>Não foi possível atualizar o catálogo.</Text>
                <Pressable onPress={retryLoading}>
                  <Text style={styles.refreshRetry}>Tentar de novo</Text>
                </Pressable>
              </View>
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
  listContent: { flexGrow: 1, width: "100%", maxWidth: 760, alignSelf: "center", paddingHorizontal: 18, paddingBottom: 108 },
  header: { paddingTop: 18, paddingBottom: 16 },
  eyebrow: { color: "#62745B", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#26352A", fontSize: 32, fontWeight: "700", marginTop: 6 },
  subtitle: { color: "#536052", fontSize: 15, marginTop: 5 },
  searchBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#E9EDE3",
  },
  searchGlyph: { color: "#62745B", fontSize: 25, lineHeight: 28 },
  searchInput: { flex: 1, minWidth: 0, color: "#26352A", fontSize: 14, paddingVertical: 12 },
  clearSearch: { color: "#62745B", fontSize: 12, fontWeight: "700", padding: 6 },
  filters: { gap: 8, paddingTop: 14, paddingBottom: 4 },
  filterChip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: "#E9EDE3",
  },
  filterChipSelected: { backgroundColor: "#62745B" },
  filterLabel: { color: "#536052", fontSize: 12, fontWeight: "600" },
  filterLabelSelected: { color: "#FFFFFF" },
  resultCount: { color: "#697366", fontSize: 12, marginTop: 12 },
  row: { justifyContent: "space-between" },
  emptyState: { flex: 1, minHeight: 250, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  emptyTitle: { color: "#26352A", fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptyText: { color: "#536052", fontSize: 14, lineHeight: 20, textAlign: "center" },
  retryButton: { marginTop: 4, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: "#62745B" },
  retryLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  refreshError: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: "#F0E4D9" },
  refreshErrorText: { flex: 1, color: "#704F3E", fontSize: 12 },
  refreshRetry: { color: "#704F3E", fontSize: 12, fontWeight: "700" },
});
