import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SavedFilmEntry } from "@/services/user-film-lists";

type FilmCardProps = {
  film: Pick<SavedFilmEntry, "id" | "title" | "image" | "release_date" | "director">;
  onPress: () => void;
  onRemove?: () => void;
};

export function FilmCard({ film, onPress, onRemove }: FilmCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${film.title}, filme de ${film.release_date}`}
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.posterFrame}>
          {film.image && !imageFailed ? (
            <Image
              source={{ uri: film.image }}
              style={styles.poster}
              contentFit="cover"
              transition={180}
              accessibilityLabel={`Pôster do filme ${film.title}`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={[styles.poster, styles.missingPoster]}>
              <Text style={styles.missingText}>Imagem indisponível</Text>
            </View>
          )}
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {film.title}
        </Text>
        <Text numberOfLines={1} style={styles.metadata}>
          {film.release_date} · {film.director}
        </Text>
      </Pressable>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${film.title} da lista`}
          onPress={onRemove}
          style={styles.removeButton}
        >
          <Text style={styles.removeLabel}>Remover</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, maxWidth: "48%", marginBottom: 20 },
  pressed: { opacity: 0.78 },
  posterFrame: {
    aspectRatio: 0.72,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#E5E7DF",
  },
  poster: { width: "100%", height: "100%" },
  missingPoster: { alignItems: "center", justifyContent: "center", padding: 16 },
  missingText: { color: "#536052", fontSize: 13, textAlign: "center" },
  title: { color: "#26352A", fontSize: 15, fontWeight: "700", marginTop: 9, lineHeight: 20 },
  metadata: { color: "#697366", fontSize: 12, marginTop: 4 },
  removeButton: { alignSelf: "flex-start", marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: "#E9EDE3" },
  removeLabel: { color: "#536052", fontSize: 12, fontWeight: "600" },
});
