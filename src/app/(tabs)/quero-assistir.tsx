import { SavedFilmsScreen } from "@/components/saved-films-screen";

export default function WatchlistScreen() {
  return (
    <SavedFilmsScreen
      listName="watchlist"
      title="Quero Assistir"
      description="Guarde os filmes que estão na sua lista para ver depois."
      emptyMessage="Abra um filme no catálogo e toque em Quero Assistir para adicioná-lo."
    />
  );
}
