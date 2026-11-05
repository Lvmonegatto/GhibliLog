import { onValue, ref, remove, set } from "firebase/database";

import { auth, database } from "./firebase";

export type FilmListName = "favorites" | "watchlist";

/** Campos mínimos para mostrar um filme salvo sem copiar o catálogo para o Firebase. */
export type SavedFilm = {
  title: string;
  image: string;
  release_date: string;
  director: string;
  savedAt: string;
};

export type SavedFilmEntry = SavedFilm & { id: string };

function getUserId() {
  const user = auth.currentUser;
  if (!user) throw new Error("Entre na sua conta para acessar suas listas.");
  return user.uid;
}

function getListPath(listName: FilmListName, filmId?: string) {
  const userId = getUserId();
  return filmId
    ? `users/${userId}/${listName}/${filmId}`
    : `users/${userId}/${listName}`;
}

export function subscribeToFilmList(
  listName: FilmListName,
  onChange: (films: SavedFilmEntry[]) => void,
  onError: (error: Error) => void,
) {
  try {
    const listRef = ref(database, getListPath(listName));

    return onValue(
      listRef,
      (snapshot) => {
        const savedFilms = snapshot.val() as Record<string, SavedFilm> | null;
        const entries = Object.entries(savedFilms ?? {}).map(([id, film]) => ({ id, ...film }));
        entries.sort((first, second) => second.savedAt.localeCompare(first.savedAt));
        onChange(entries);
      },
      onError,
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Não foi possível abrir esta lista."));
    return () => {};
  }
}

export function subscribeToFilmInList(
  listName: FilmListName,
  filmId: string,
  onChange: (saved: boolean) => void,
  onError: (error: Error) => void,
) {
  try {
    const filmRef = ref(database, getListPath(listName, filmId));
    return onValue(filmRef, (snapshot) => onChange(snapshot.exists()), onError);
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Não foi possível ler sua lista."));
    return () => {};
  }
}

export async function saveFilmToList(listName: FilmListName, filmId: string, film: SavedFilm) {
  await set(ref(database, getListPath(listName, filmId)), film);
}

export async function removeFilmFromList(listName: FilmListName, filmId: string) {
  await remove(ref(database, getListPath(listName, filmId)));
}
