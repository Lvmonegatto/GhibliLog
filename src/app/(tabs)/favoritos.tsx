import { SavedFilmsScreen } from "@/components/saved-films-screen";

export default function FavoritesScreen() {
  return (
    <SavedFilmsScreen
      listName="favorites"
      title="Favoritos"
      description="Reúna aqui os filmes que você mais gosta."
      emptyMessage="Abra um filme no catálogo e toque em Favoritos para guardá-lo aqui."
    />
  );
}
