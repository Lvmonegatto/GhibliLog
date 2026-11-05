import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Film } from "@/services/films";

type FilmCardProps = {
  film: Film;
  onPress: () => void;
};

export function FilmCard({ film, onPress }: FilmCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${film.title}, filme de ${film.release_date}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
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
});
